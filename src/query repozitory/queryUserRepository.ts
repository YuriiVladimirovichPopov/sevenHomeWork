import { PaginatedType } from "../routers/helpers/pagination";
import { UserViewModel } from "../models/users/userViewModel";
import { usersRepository } from "../repositories/users-repository";
import { PaginatedUser } from "../models/users/paginatedQueryUser";
import  bcrypt  from "bcrypt";
import { ObjectId } from "mongodb";
import {UsersMongoDbType } from "../types";
import { error } from "console";
import { v4 as uuidv4 } from "uuid";
import add from "date-fns/add"
import { emailManager } from "../managers/email-manager";
import { settings } from "../settings";
import  Jwt  from "jsonwebtoken";


export const QueryUserRepository = {
    
    async findAllUsers(pagination: PaginatedType): Promise<PaginatedUser<UserViewModel[]>> {     //tyt nado dobavit functions
        
        return await usersRepository.findAllUsers(pagination)
    },

    async createUser (login: string, email: string, password: string): Promise<UserViewModel | null> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: UsersMongoDbType = {
            _id: new ObjectId(),
            login,
            email,
            passwordHash, 
            passwordSalt,
            createdAt: new Date().toISOString(),
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 5
                }),
                isConfirmed: false
            }
        }

        const createResult = usersRepository.createUser(newUser)
        try {
        await emailManager.sendPasswordRecoveryMessage(newUser)
        } catch {
            console.error(error)
            await usersRepository.deleteUser(newUser._id.toString())
            return null
        }
        return createResult
    },

    async findUserById (id: ObjectId): Promise<UserViewModel | null> {
        return usersRepository.findUserById(id)

    },

    async checkCredentials (loginOrEmail: string, password: string) {
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) return false
        if (!user.emailConfirmation.isConfirmed) return null
        
        const passwordHash = await this._generateHash(password, user.passwordSalt)
        if (user.passwordHash !== passwordHash) {
            return false
        }
        return user
    },

    async confirmEmail(code: string): Promise<UserViewModel | boolean> {
        let user = await usersRepository.findByLoginOrEmail(code)
        if (!user) return false
        if (user.emailConfirmation.isConfirmed) return false
        if (user.emailConfirmation.confirmationCode !== code) return false
        if (user.emailConfirmation.expirationDate < new Date()) return false
            
        let result = await usersRepository.createUser(user)
            return result
    },

    async checkAndFindUserByToken(token: string) {
        try {
            const result: any = Jwt.verify(token, settings.JWT_SECRET)
            const user  = await usersRepository.findUserById(new ObjectId(result.userId))
            return user
        } catch (error) {
            return null
        }
    },

    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt)
        return hash
    },

    async deleteUserById(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
        }

}