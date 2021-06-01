const _ = require('lodash')

const dummy = (blogs) => {
    return blogs.length === 0
        ? 1
        : blogs.length / blogs.length
}

const totalLikes = (blogs) => {
    const reducer = (sum, item) => {
        return sum + item
    }
    return blogs.length === 0
        ? 0
        : blogs.map(blog => blog.likes).reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const maxLikes = blogs.map(blog => blog.likes).reduce((a, b) => a > b ? a : b)
    return blogs.filter(blog => blog.likes === maxLikes)[0]
}

const mostBlogs = (blogs) => {
    const blogByAuthor = _(blogs)
        .groupBy('author')
        .map(function(items,author) {
            return { 'author': author, 'blogs': items.length }
        }).value()
    return blogByAuthor[blogByAuthor.length-1]
}

const favoriteAuthor = (blogs) => {

    const reducer = (sum, item) => {
        return sum + item
    }

    function GetSortOrder(prop) {
        return function(a, b) {
            if (a[prop] > b[prop]) {
                return 1
            } else if (a[prop] < b[prop]) {
                return -1
            }
            return 0
        }
    }

    const likesByAuthor = _(blogs)
        .groupBy('author')
        .map(function(items,author) {
            const blogLikes = items.map(item => item.likes).reduce(reducer, 0)
            return { 'author': author, 'likes': blogLikes }
        }).value().sort(GetSortOrder('likes'))

    return likesByAuthor[likesByAuthor.length-1]
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    favoriteAuthor
}