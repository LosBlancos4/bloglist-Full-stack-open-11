const bcrypt = require('bcryptjs')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const helper = require('./test_helper.js')

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = helper.initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
})

const createInitUser = async () => {

    const newUser = {
        username: 'testuser',
        password: 'testpw'
    }

    await api
        .post('/api/users')
        .send(newUser)

    const response = await api
        .post('/api/login')
        .send({ username: newUser.username, password: newUser.password })

    return response.body.token
}

describe('when there is initially some notes saved', () => {

    test('blogs are returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are six blogs', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(6)
    })

    test('identifier field is named id', async() => {
        const response = await api.get('/api/blogs')
        expect(response.body[0].id).toBeDefined()
    })
})


describe('addition of a new blog', () => {

    test('a valid blog can be added ', async () => {

        const token = await createInitUser()

        const newBlog = {
            title: 'Test Blog KING',
            author: 'Blog King',
            url: 'https//www.ggKing.no',
            likes: 1111
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

        const titles = blogsAtEnd.map(blog => blog.title)
        expect(titles).toContain(
            'Test Blog KING'
        )
    })

    test('a valid blog with undefined likes will have zero likes', async () => {

        const token = await createInitUser()

        const newBlog = {
            title: 'Blog that nobody likes',
            author: 'Unpopular Blog King',
            url: 'https//www.BlogKing.fi'
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        expect(response.body.likes).toEqual(0)
    })

    test('fails with status code 400 if data invalid', async () => {

        const token = await createInitUser()

        const newBlog = {
            title: 'Blog that nobody likes',
            author: 'Unpopular Blog King',
            likes: 10444
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        expect(response.body.error).toBe('blog data cannot be added to the server | URL or title information is missing')
    })
})

describe('deletion of a blog', () => {
    test('succeeds with status code 204 if id is valid', async () => {

        const token = await createInitUser()

        const newBlog = {
            title: 'Test Blog KING',
            author: 'Blog King',
            url: 'https//www.ggKing.no',
            likes: 1111
        }

        const response = await api
            .post('/api/blogs')
            .set('Authorization', `bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const blogsAfterNewBlog = await helper.blogsInDb()

        await api
            .delete(`/api/blogs/${response.body.id}`)
            .set('Authorization', `bearer ${token}`)
            .expect(204)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(
            blogsAfterNewBlog.length - 1
        )

        const titles = blogsAtEnd.map(r => r.title)

        expect(titles).not.toContain(response.body.title)
    })

    test('succeeds with status code 401 Unauthorized when token not given', async () => {

        const newBlog = {
            title: 'Test Blog KING',
            author: 'Blog King',
            url: 'https//www.ggKing.no',
            likes: 1111
        }

        const response = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)

        expect(response.body.error).toBe('invalid token')
    })
})

describe('updating number of likes to the first the blog of the database', () => {
    test('succeed when updating number of likes for the first blog', async() => {

        const blogsAtStart = await helper.blogsInDb()
        const blogToUpdate = blogsAtStart[0]

        blogToUpdate.likes = 109

        await api
            .patch(`/api/blogs/${blogToUpdate.id}`)
            .send(blogToUpdate)
            .expect(201)

        const blogsAtEnd = await helper.blogsInDb()
        expect(blogsAtEnd).toHaveLength(
            helper.initialBlogs.length
        )
        expect(blogsAtEnd[0].likes).toEqual(109)
    })
})


describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('secredia2%1', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation fails with proper statuscode and message if username already taken', async () => {

        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'root',
            name: 'Superuser',
            password: 'salainen',
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        expect(result.body.error).toContain('User validation failed: username: Error, expected `username` to be unique. Value: `root`')

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })

    test('creation succeeds with a fresh username', async () => {

        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'a Hellaa',
            name: 'Artsi Hellainen',
            password: 'estudenpoMf2',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

})


afterAll(() => {
    mongoose.connection.close()
})