import React, { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import LoginForm from './components/LoginForm'
import BlogForm from './components/BlogForm'
import Notifications from './components/Notification'
import Togglable from './components/Togglable'

import blogService from './services/blogs'
import loginService from './services/login'
import './index.css'

const App = () => {
    const [blogs, setBlogs] = useState([])
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const [user, setUser] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [infoMessage, setInfoMessage] = useState(null)

    const blogFormRef = useRef()

    useEffect(() => {
        blogService.getAll().then(blogs =>
            setBlogs( blogs )
        )
    }, [])

    useEffect(() => {
        const loggedUserJSON = window.localStorage.getItem('loggedBlogappUser')
        if (loggedUserJSON) {
            const user = JSON.parse(loggedUserJSON)
            setUser(user)
            blogService.setToken(user.token)
        }
    }, [])

    const addBlog = async (blogObject) => {
        blogFormRef.current.toggleVisibility()
        try {
            const returnedBlog = await blogService.create(blogObject)
            setBlogs(blogs.concat(returnedBlog))
            setInfoMessage(`a new blog ${blogObject.title} by ${blogObject.author} added`)
            setTimeout(() => {
                setInfoMessage(null)
            }, 5000)
        } catch (exception) {
            console.log(exception)
            setErrorMessage('Something went wrong')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const removeBlog = async (blogObject) => {
        console.log(blogObject)
        if (window.confirm(`Remove blog ${blogObject.title} by ${blogObject.author}?`)) {
            try {
                console.log(user.token)
                await blogService.remove(blogObject.id)
                setBlogs(blogs.filter(n => n.id !== blogObject.id))
                setInfoMessage(`blog ${blogObject.title} by ${blogObject.author} removed`)
                setTimeout(() => {
                    setInfoMessage(null)
                }, 5000)
            } catch (exception) {
                console.log(exception)
                setErrorMessage('No credentials for removing blog')
                setTimeout(() => {
                    setErrorMessage(null)
                }, 5000)
            }
        }
    }

    const updateBlog = async (id, blogObject) => {
        try {
            const returnedBlog = await blogService.update(id, blogObject)
            setBlogs(blogs.map(blog => blog.id !== id ? blog : returnedBlog))
            setInfoMessage(`One like added to blog ${blogObject.title} by ${blogObject.author}`)
            setTimeout(() => {
                setInfoMessage(null)
            }, 5000)
        } catch (exception) {
            console.log(exception)
            setErrorMessage('Something went wrong')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const handleLogin = async (event) => {
        event.preventDefault()
        try {
            const user = await loginService.login({
                username, password,
            })

            window.localStorage.setItem(
                'loggedBlogappUser', JSON.stringify(user)
            )
            blogService.setToken(user.token)
            setUser(user)
            setUsername('')
            setPassword('')
        } catch (exception) {
            setErrorMessage('wrong username or password')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const handleLogout = async (event) => {
        event.preventDefault()
        try {
            window.localStorage.removeItem('loggedBlogappUser')
            setUser(null)
        } catch (exception) {
            setErrorMessage('Something went wrong in logout')
            setTimeout(() => {
                setErrorMessage(null)
            }, 5000)
        }
    }

    const loginForm = () => (
        <Togglable buttonLabel="log in">
            <LoginForm
                username={username}
                password={password}
                handleUsernameChange={({ target }) => setUsername(target.value)}
                handlePasswordChange={({ target }) => setPassword(target.value)}
                handleSubmit={handleLogin}
            />
        </Togglable>
    )

    const blogForm = () => (
        <Togglable buttonLabel="create new blog" ref={blogFormRef}>
            <BlogForm createBlog={addBlog} />
        </Togglable>
    )

    const logOut = () => {
        return (
            <form onSubmit={handleLogout}><button type="submit">logout</button></form>
        )
    }

    function compareNumberObjects(object1, object2, key) {
        const obj1 = object1[key]
        const obj2 = object2[key]
        if (obj1 < obj2) {
            return 1
        }
        if (obj1 > obj2) {
            return -1
        }
        return 0
    }

    return (
        <div>
            <h1>Blogs</h1>
            <Notifications.Notification message={infoMessage} />
            <Notifications.ErrorNotification message={errorMessage} />
            {user === null ?
                loginForm() :
                <div>
                    <p>{user.name} logged in {logOut()}</p>
                    {blogForm()}
                    <br></br>
                    {blogs
                        .sort((a, b) => { return compareNumberObjects(a, b, 'likes') })
                        .map(blog => <Blog key={blog.id} blog={blog} updateBlogHandler={updateBlog} removeBlogHandler={removeBlog} />)
                    }
                </div>
            }
        </div>
    )
}

export default App