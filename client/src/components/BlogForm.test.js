import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import BlogForm from './BlogForm'

describe('<BlogForm /> tests', () => {

    const createBlog = jest.fn()
    let component

    beforeEach(() => {
        component = render(
            <BlogForm createBlog={createBlog} />
        )
    })

    test('callback function is called with correct arguments (props) after submitting the form', () => {
        const form = component.container.querySelector('form')
        const inputTitle = component.container.querySelector('#title')
        const inputAuthor = component.container.querySelector('#author')
        const inputUrl = component.container.querySelector('#url')

        fireEvent.change(inputTitle, {
            target: { value: 'DevOps with KubeFlow' }
        })

        fireEvent.change(inputAuthor, {
            target: { value: 'DevOps Guy' }
        })

        fireEvent.change(inputUrl, {
            target: { value: 'kubeflow.io' }
        })

        fireEvent.submit(form)

        expect(createBlog.mock.calls).toHaveLength(1)
        expect(createBlog.mock.calls[0][0].title).toBe('DevOps with KubeFlow')
        expect(createBlog.mock.calls[0][0].author).toBe('DevOps Guy')
        expect(createBlog.mock.calls[0][0].url).toBe('kubeflow.io')
    })
})