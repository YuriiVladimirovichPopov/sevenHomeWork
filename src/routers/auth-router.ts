import { Response, Router } from "express";
import { QueryUserRepository } from "../query repozitory/queryUserRepository";
import { sendStatus } from './send-status';
import { LoginInputType } from '../models/users/loginInputModel';
import { RequestWithBody, RequestWithUser } from '../types';
import { jwtService } from "../application/jwt-service";
import { authMiddleware } from '../middlewares/validations/auth.validation';
import { UserViewModel } from '../models/users/userViewModel';
import { UserInputModel } from "../models/users/userInputModel";
import { usersRepository } from "../repositories/users-repository";

import { CodeType } from "../models/code";


export const authRouter = Router ({})

authRouter.post('/login', async(req: RequestWithBody<LoginInputType>, res: Response) => {
    
    const user = await QueryUserRepository.checkCredentials(req.body.loginOrEmail, req.body.password)
    if (user) {
        const token = await jwtService.createJWT(user)
        return res.status(sendStatus.OK_200).send({accessToken: token})
    } else {
        return res.sendStatus(sendStatus.UNAUTHORIZED_401)
    }
})

authRouter.get('/me', authMiddleware, async(req: RequestWithUser<UserViewModel>, res: Response) => {    
    if(!req.user){
        return res.sendStatus(sendStatus.UNAUTHORIZED_401)
    } else {
        return res.status(sendStatus.OK_200).send({
            email: req.user.email,
            login: req.user.login,
            userId: req.user.id
        })
    }
})
//todo
authRouter.post('/registration-confirmation', async(req: RequestWithBody<CodeType>, res: Response) => {
    const result = await QueryUserRepository.confirmEmail(req.body.code)
    if(result) {
        return res.status(sendStatus.NO_CONTENT_204).send()
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})

authRouter.post('/registration', async(req: RequestWithBody<UserInputModel>, res: Response) => {
    const user = await QueryUserRepository.createUser(req.body.login, req.body.email, req.body.password)
    if (user) {
        return res.status(sendStatus.NO_CONTENT_204).send(user)
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})
//todo
authRouter.post('/registration-email-resending', async(req: RequestWithBody<UserInputModel>, res: Response) => {
    const user = await usersRepository.updateConfirmEmailByUser(req.body.email)
    if (user) {
        return res.status(sendStatus.NO_CONTENT_204).send(user)
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})