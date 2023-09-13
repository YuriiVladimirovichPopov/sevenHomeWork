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
import { createUserValidation } from "../middlewares/validations/users.validation";
import { authService } from "../domain/auth-service";


export const authRouter = Router ({})

authRouter.post('/login', async(req: RequestWithBody<LoginInputType>, res: Response) => {
    
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)
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
        return res.status(sendStatus.OK_200)
            .send({
            email: req.user.email,
            login: req.user.login,
            userId: req.user.id
        })
    }
})
//todo
authRouter.post('/registration-confirmation', async(req: RequestWithBody<CodeType>, res: Response) => {
    const result = await authService.confirmEmail(req.body.code)
    if(result) {
        return res.sendStatus(sendStatus.NO_CONTENT_204)
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})

authRouter.post('/registration', createUserValidation, async(req: RequestWithBody<UserInputModel>, res: Response) => {
    const user = await authService.createUser(req.body.login, req.body.email, req.body.password)
    
    if (user) {
        return res.sendStatus(sendStatus.NO_CONTENT_204)
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})
//todo
authRouter.post('/registration-email-resending', async(req: RequestWithBody<UserInputModel>, res: Response) => {
    const user = await authService.updateConfirmEmailByUser(req.body.email)
    if (user) {
        return res.sendStatus(sendStatus.NO_CONTENT_204)
    } else {
        return res.status(sendStatus.BAD_REQUEST_400)
    }
})