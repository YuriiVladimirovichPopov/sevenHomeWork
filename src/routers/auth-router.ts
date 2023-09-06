import { Response, Router } from "express";
import { QueryUserRepository } from "../query repozitory/queryUserRepository";
import { sendStatus } from './send-status';
import { LoginInputType } from '../models/users/loginInputModel';
import { RequestWithBody, RequestWithUser } from '../types';
import { jwtService } from "../application/jwt-service";
import { authMiddleware } from '../middlewares/validations/auth.validation';
import { UserViewModel } from '../models/users/userViewModel';

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

authRouter.get('/me', authMiddleware, async(req: RequestWithUser<UserViewModel>, res: Response) => {    // RequestWithParams
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