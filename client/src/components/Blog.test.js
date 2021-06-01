import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, fireEvent } from '@testing-library/react'
import Blog from './Blog'

describe('blog components', () => {
    const blog = {
        title: 'The best blog ever',
        author: 'Matti Meikälainen',
        url: 'blog.fi',
        likes: 1001,
        user: {
            name: 'Matti Meikälainen',
            username: 'MM',
            id: '111'
        }
    }

    let component
    let mockHandleUpdateLike
    let mockHandleRemoveBlog

    beforeEach(() => {
        mockHandleUpdateLike = jest.fn()
        mockHandleRemoveBlog = jest.fn()
        component = render(
            <Blog
                blog={blog}
                updateLikeHandler={mockHandleUpdateLike}
                removeBlogHandler={mockHandleRemoveBlog}
            />
        )
    })

    test('renders title and author, not url and likes', () => {
        expect(component.container).toHaveTextContent(blog.title)
        expect(component.container).toHaveTextContent(blog.author)
        expect(component.queryByText(blog.url)).not.toBeInTheDocument()
        expect(component.queryByText(blog.likes)).not.toBeInTheDocument()
    })

    test('renders title and author, url and likes when view button has been clicked', () => {
        const button = component.getByText('view')
        fireEvent.click(button)

        expect(component.container).toHaveTextContent(blog.title)
        expect(component.container).toHaveTextContent(blog.author)
        expect(component.container).toHaveTextContent(blog.url)
        expect(component.container).toHaveTextContent(blog.likes)
    })

    test('when likes button has been clicked twice, the evenHandler of like adding has been called twice too', () => {
        const buttonView = component.getByText('view')
        fireEvent.click(buttonView)

        const buttonLike = component.getByText('like')
        fireEvent.click(buttonLike)
        fireEvent.click(buttonLike)

        expect(mockHandleUpdateLike.mock.calls).toHaveLength(2)
    })
})