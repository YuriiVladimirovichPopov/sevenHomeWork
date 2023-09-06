import request  from "supertest"
import { app } from '../settings';
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { sendStatus } from "../routers/send-status";
import { UserViewModel } from "../models/users/userViewModel";
import { UserInputModel } from "../models/users/userInputModel";
import { createUser } from "../__tests__/user-test-helpers";
import { usersCollection } from '../db/db';
import { RouterPaths } from "../routerPaths";


const getRequest = () => {
    return request(app)
}
describe('tests for /users', () => {
    beforeAll(async () => {
        await getRequest()
        .delete('/testing/all-data')
    })
      
    beforeAll(async () => {
        authorizationValidation 
    })
    
    it("should return 200 and user", async () => {
        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200)
    })
    
    it ("should return 404 for not existing user", async () => {
        await getRequest()
                .get(`${RouterPaths.users}/999999`)
                .expect(sendStatus.NOT_FOUND_404)
    })

    it ("shouldn't create a new user without auth", async () => {
        await getRequest().post(RouterPaths.users).send({}).expect(sendStatus.UNAUTHORIZED_401)

        await getRequest().post(RouterPaths.users).auth('login', 'password').send({}).expect(sendStatus.UNAUTHORIZED_401)  
    })

    it ("shouldn't create a new user with incorrect input data", async () => {
        const data: UserViewModel = {
            id: '',
            login: '',
            email: '',
            createdAt: ''
        }
            
        await getRequest()
                .post(RouterPaths.users)
                .send(data)
                .expect(sendStatus.UNAUTHORIZED_401)
        
        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200)
    })

    let createdUser1: UserViewModel

    it ("should create a new user with correct input data", async () => {
        const countOfUsersBefore = await usersCollection.countDocuments()   
        expect(countOfUsersBefore).toBe(0)
        const inputModel: UserInputModel = {
            login: 'new user',
            email: 'blabla@email.com',
            password: 'www.youtube.com',
        }

        const createResponse = await createUser(inputModel)

        expect(createResponse.status).toBe(sendStatus.CREATED_201)

        const createdUser: UserViewModel = createResponse.body
        expect(createdUser).toEqual({
            id: expect.any(String),
            login: inputModel.login,
            email: inputModel.email,
            createdAt: expect.any(String),
        })
            
        const countOfUsersAfter = await usersCollection.countDocuments()
        expect(countOfUsersAfter).toBe(1)
    
        const getByIdRes = await getRequest().get(`${RouterPaths.users}/${createdUser.id}`)
            
        expect(getByIdRes.status).toBe(sendStatus.OK_200)
        expect(getByIdRes.body).toEqual(createdUser)
        
        createdUser1 = createdUser
        expect.setState({ user1: createdUser})
    })
    
    it ("should create one more user with correct input data", async () => {
        const inputModel: UserInputModel = {
            login: 'new user',
            email: 'new user@example.com',
            password: 'new user pass'
        }

        const createResponse = await createUser(inputModel)

        expect.setState({ user2: createResponse.body})
    })

    it ("shouldn't update a new user with incorrect input data", async () => {
        const {user1} = expect.getState()

        const emptyData: UserInputModel = {
            login: '',
            email: '',
            password: ''
        }

        const errors = {
            errorsMessages: expect.arrayContaining([
                {message: expect.any(String), field: 'login'},//
                {message: expect.any(String), field: 'email'},//

        ])}

        const updateRes1 = await getRequest()
                .put(`${RouterPaths.users}/${user1}`)   
                .auth('admin', 'qwerty')
                .send({})

        expect(updateRes1.status).toBe(sendStatus.BAD_REQUEST_400)
        expect(updateRes1.body).toStrictEqual(errors)


        const updateRes2 = await getRequest()
                .put(`${RouterPaths.users}/${user1}`)   
                .auth('admin', 'qwerty')
                .send(emptyData)

        expect(updateRes2.status).toBe(sendStatus.BAD_REQUEST_400)
        expect(updateRes2.body).toStrictEqual(errors)

    })

    it ("shouldn't update user that not exist", async () => {
        const data: UserViewModel = {
            id: '34456',
            login: 'new login',
            email: 'new email',
            createdAt: '30.06.2014',
            
        }
        await getRequest()
                .put(`${RouterPaths.users}/${-234}`)
                .auth('admin', 'qwerty')
                .send(data)
                .expect(sendStatus.NOT_FOUND_404)
    })
        
    it ("should update a new user with correct input data", async () => {
        const {user1} = expect.getState()

        const inputModel: UserInputModel = {//
            login: 'updated user',//
            email: 'upd description',//
            password: 'updwww.youtube.com',//
        }

        await getRequest()
                .put(`${RouterPaths.blogs}/${user1}`)  //be blog1.id
                .auth('admin', 'qwerty')
                .send(inputModel)
                .expect(sendStatus.NO_CONTENT_204)

        const updatedUser = await getRequest().get(`${RouterPaths.blogs}/${user1.id}`)
                
        
        expect(updatedUser.status).toBe(sendStatus.OK_200)
        expect(updatedUser.body).not.toBe(user1)
        expect(updatedUser.body).toEqual({
            id: user1.id,
            login: inputModel.login,
            email: inputModel.email,
            password: inputModel.password,
            createdAt: user1.createdAt,
        })
    })

    it ("should delete both users", async () => {
        const {user1} = expect.getState()
        const {user2} = expect.getState()

        await getRequest()
                .delete(`${RouterPaths.users}/${user1.id}`)   
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204)

        await getRequest()
                .get(`${RouterPaths.users}/${user1.id}`)
                .expect(sendStatus.NOT_FOUND_404)

        await getRequest()
                .delete(`${RouterPaths.users}/${user2.id}`)
                .auth('admin', 'qwerty')
                .expect(sendStatus.NO_CONTENT_204)
        
        await getRequest()
                .get(`${RouterPaths.users}/${user2.id}`)
                .expect(sendStatus.NOT_FOUND_404)

        await getRequest()
                .get(RouterPaths.users)
                .expect(sendStatus.OK_200, [])
    })
})
    
    

        