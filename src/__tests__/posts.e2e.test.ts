import request  from "supertest"
import { app } from '../settings';
import { authorizationValidation } from "../middlewares/input-validation-middleware";
import { sendStatus } from "../routers/send-status";
import { PostsViewModel } from "../models/posts/postsViewModel";
import { BlogViewModel } from "../models/blogs/blogsViewModel";
import { randomUUID } from 'crypto';


const getRequest = () => {
    return request(app)
}
describe('tests for /posts', () => {
    beforeAll(async () => {
        await getRequest()
        .delete('/all-data')
        .set('Authorization', 'Basic YWRtaW46cXdlcnR5')
    })
      
    beforeAll(async () => {
        authorizationValidation 
    })
    
    it("should return 200 and post", async () => {
        await getRequest()
                .get('/blogs')
                .expect(sendStatus.OK_200)
    })
    
    it ("should return 404 for not existing post", async () => {
        await getRequest()
                .get('/posts/999999999999999999999999')
                .expect(sendStatus.NOT_FOUND_404)
    })

    it ("shouldn't create a new post with incorrect input data", async () => {
        const data: PostsViewModel = {
            id: '',
            title: '',
            shortDescription: '',
            content: '',
            blogId: '',
            blogName: '',
            createdAt: ''
        }
        await getRequest()
                .post('/posts')
                .send(data)
                .expect(sendStatus.UNAUTHORIZED_401)
    })

    it ("should create a new post with correct input data", async () => {
        const blog: BlogViewModel = {
            id: randomUUID(),
            name: 'Ananasia',
            description: 'blablabla1',
            websiteUrl: 'it-incubator.com',
            createdAt: new Date().toISOString(),
            isMembership: false
        }
        const createResponse = await getRequest()
                .post('/blogs')
                .auth('admin', 'qwerty')
                .send(blog)           
                .expect(sendStatus.CREATED_201)
        
        const data: PostsViewModel = {
            id: '34456',
            title: 'new blog',
            shortDescription: 'blabla',
            content: 'i love you',
            blogId: createResponse.body.id,
            blogName: 'Ananasia',
            createdAt: '30.06.14', 
        }
         await getRequest()
                .post('/posts')
                .auth('admin', 'qwerty')
                .send(data)
                .expect(sendStatus.CREATED_201)
    })

    
})