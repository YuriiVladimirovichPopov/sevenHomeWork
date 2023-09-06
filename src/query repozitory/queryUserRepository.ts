import { PaginatedType } from "../routers/helpers/pagination";
import { UserViewModel } from "../models/users/userViewModel";
import { usersRepository } from "../repositories/users-repository";
import { PaginatedUser } from "../models/users/paginatedQueryUser";
import  bcrypt  from "bcrypt";
import { ObjectId } from "mongodb";
import {UsersMongoDbType } from "../types";


export const QueryUserRepository = {
    
    async findAllUsers(pagination: PaginatedType): Promise<PaginatedUser<UserViewModel[]>> {     //tyt nado dobavit functions
        
        return await usersRepository.findAllUsers(pagination)
    },

    async createUser (login: string, email: string, password: string): Promise<UserViewModel> {
        const passwordSalt = await bcrypt.genSalt(10)
        const passwordHash = await this._generateHash(password, passwordSalt)

        const newUser: UsersMongoDbType = {
            _id: new ObjectId(),
            login,
            email,
            passwordHash, 
            passwordSalt,
            createdAt: new Date().toISOString(),
         
        }

        return usersRepository.createUser(newUser)
    },

    async findUserById (id: ObjectId): Promise<UserViewModel | null> {
        return usersRepository.findUserById(id)

    },

    async checkCredentials (loginOrEmail: string, password: string) {
        const user = await usersRepository.findByLoginOrEmail(loginOrEmail)
        if (!user) {
            return false
        }

        const passwordHash = await this._generateHash(password, user.passwordSalt)
        if (user.passwordHash !== passwordHash) {
            return false
        }
        return user
    },

    async _generateHash(password: string, salt: string) {
        const hash = await bcrypt.hash(password, salt)
        return hash
    },

    async deleteUserById(id: string): Promise<boolean> {
        return await usersRepository.deleteUser(id)
        }

}