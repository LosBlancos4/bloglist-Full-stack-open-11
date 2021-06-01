import React, { useState } from 'react'

const Blog = ({ blog, updateBlogHandler, removeBlogHandler }) => {
    const blogStyle = {
        paddingTop: 10,
        paddingLeft: 2,
        border: 'solid',
        borderWidth: 2,
        marginBottom: 5
    }

    const [visible, setVisible] = useState(false)

    const hideWhenVisible = { display: visible ? 'none' : '' }
    const showWhenVisible = { display: visible ? '' : 'none' }

    const updateLikes = () => {
        const updatedBlog = {
            title: blog.title,
            author: blog.author,
            url: blog.url,
            likes: blog.likes + 1
        }

        updateBlogHandler(blog.id, updatedBlog)
    }

    const removeBlog = () => {
        removeBlogHandler(blog)
    }

    return (
        <div style={blogStyle}>
            <div style={hideWhenVisible}>
                {blog.title} {blog.author}
                <button id="view-button" onClick={() => setVisible(true)}>view</button>
            </div>
            <div style={showWhenVisible}>
                <div>{blog.title} {blog.author} <button onClick={() => setVisible(false)}>hide</button></div>
                <div>{blog.url} </div>
                <div className='likes'>likes {blog.likes} <button id="like-button" onClick={() => updateLikes()}>like</button></div>
                <div>{blog.user.name} </div>
                <button id="remove-button" onClick={() => removeBlog()}>remove</button>
            </div>
        </div>
    )
}

export default Blog