const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
//const User = require('../models/user')
const jwt = require('jsonwebtoken')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 }).populate('comments')
    response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
    const body = request.body
    const user = request.user
    console.log(body)
    if(!body.title || !body.url){
        return response.status(400).json({ error: 'blog data cannot be added to the server | URL or title information is missing' })
    }

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes === undefined ? 0 : body.likes,
        user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog.toJSON())
})

blogsRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 }).populate('comments')
    if (blog) {
        response.json(blog.toJSON())
    } else {
        response.status(404).end()
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {

    const token = request.token

    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!token || !decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }

    const blog = await Blog.findById(request.params.id)
    const user = request.user

    if ( blog.user.toString() === user._id.toString() ) {
        await Blog.findByIdAndRemove(request.params.id)
        response
            .status(204)
            .end()
    } else {
        response.status(404).end()
    }
})

blogsRouter.patch('/:id', async (request, response) => {
    const likesToUpdate = request.body.likes

    if (likesToUpdate) {
        const blog = { likes: likesToUpdate }
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
        response.status(201).json(updatedBlog.toJSON())
    } else {
        response.status(400).send({ error: 'no likes information in the updated data' })
    }
})

blogsRouter.put('/:id', async (request, response) => {
    const likesToUpdate = request.body.likes

    if (likesToUpdate) {
        const blog = { likes: likesToUpdate }
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true } )
        response.status(201).json(updatedBlog.toJSON())
    } else {
        response.status(400).send({ error: 'no likes information in the updated data' })
    }
})


module.exports = blogsRouter