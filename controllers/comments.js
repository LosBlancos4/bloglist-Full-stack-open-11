const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const middleware = require('../utils/middleware')

commentsRouter.get('/', async (request, response) => {
    const comments = await Comment
        .find({}).populate('blog', { title: 1, author: 1 })
    response.json(comments.map(comment => comment.toJSON()))
})

commentsRouter.post('/', middleware.blogExtractor, async (request, response) => {
    const body = request.body
    const blog = request.blog
    console.log(body)
    console.log(blog)

    if(!body.content){
        return response.status(400).json({ error: 'comment data cannot be added to the server | URL or title information is missing' })
    }

    const comment = new Comment({
        content: body.content,
        blog: blog._id
    })

    const savedComment = await comment.save()
    blog.comments = blog.comments.concat(savedComment._id)
    await blog.save()

    response.status(201).json(savedComment.toJSON())
})

commentsRouter.get('/:id', async (request, response) => {
    const comment = await Comment.findById(request.params.id).populate('blog', { title: 1, author: 1 })
    if (comment) {
        response.json(comment.toJSON())
    } else {
        response.status(404).end()
    }
})

module.exports = commentsRouter