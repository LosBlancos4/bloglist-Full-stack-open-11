const listHelper = require('../utils/list_helper')
const helper = require('./test_helper.js')

test('dummy returns one', () => {
    const blogs = []

    const result = listHelper.dummy(blogs)
    expect(result).toBe(1)
})

describe('total likes', () => {

    test('when list has only one blog equals the likes of that', () => {
        const result = listHelper.totalLikes(helper.listWithOneBlog)
        expect(result).toBe(5)
    })

    test('of empty list is zero', () => {
        const result = listHelper.totalLikes([])
        expect(result).toBe(0)
    })

    test('of a bigger list is calculated right', () => {
        const result = listHelper.totalLikes(helper.initialBlogs)
        expect(result).toBe(36)
    })
})

describe('favorite blog', () => {

    const favoriteBlog = {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0
    }

    test('name is Canonical string reduction authored by Edsger W. Dijsktra', () => {
        const result = listHelper.favoriteBlog(helper.initialBlogs)
        expect(result).toEqual(favoriteBlog)
    })
})

describe('most blogs is authored by', () => {

    const recordNumberBlogs = {
        author: 'Robert C. Martin',
        blogs: 3
    }

    test('Robert C. Martin who has three blogs', () => {
        const result = listHelper.mostBlogs(helper.initialBlogs)
        expect(result).toEqual(recordNumberBlogs)
    })
})

describe('favorite author', () => {
    const favoriteAuthor = {
        author: 'Edsger W. Dijkstra',
        likes: 17
    }

    test('is Edsger W. Dijkstra who has 17 likes', () => {
        const result = listHelper.favoriteAuthor(helper.initialBlogs)
        expect(result).toEqual(favoriteAuthor)
    })
})