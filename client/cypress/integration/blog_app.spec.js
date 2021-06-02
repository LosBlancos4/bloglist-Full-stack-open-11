describe('Blog app', function() {
    beforeEach(function() {
        cy.request('POST', 'http://localhost:3001/api/testing/reset')
        cy.addUser({ username: 'Andy H', name: 'Arto Halkio', password: 'serc3et' })
        cy.addUser({ username: 'Tester', name: 'Test Guy', password: 'test123' })
    })

    it('Login form is shown', function() {
        cy.visit('http://localhost:3000')
        cy.contains('log in').click()
    })

    it('login form can be opened', function() {
        cy.contains('log in').click()
    })

    describe('Login',function() {
        it('succeeds with correct credentials', function() {
            cy.contains('log in').click()
            cy.get('#username').type('Andy H')
            cy.get('#password').type('serc3et')
            cy.get('#login-button').click()

            cy.contains('Arto Halkio logged in')
        })

        it('fails with wrong credentials', function() {
            cy.contains('log in').click()
            cy.get('#username').type('Andy H')
            cy.get('#password').type('GladaVappen')
            cy.get('#login-button').click()

            cy.get('.error')
                .should('contain', 'wrong username or password')
                .and('have.css', 'color', 'rgb(173, 26, 26)')
        })
    })

    describe('When logged in', function() {
        beforeEach(function() {
            cy.login({ username: 'Andy H', password: 'serc3et' })
            cy.addBlog({ title: 'Kubernetes for everybody', author: 'Andy H', url: 'www.kube4all.io' })
            cy.addBlog({ title: 'DevOps For Newbies', author: 'AK', url: 'www.dev4newb.io' })
        })

        it('A blog can be created', function() {
            cy.contains('create new blog').click()
            cy.get('#title').type('Soccer for everybody')
            cy.get('#author').type('Andy H')
            cy.get('#url').type('www.soccerfreaks.net')
            cy.get('#create-button').click()

            cy.get('.info')
                .should('contain', 'a new blog Soccer for everybody by Andy H added')
                .and('have.css', 'color', 'rgb(7, 7, 7)')
        })

        it('A like can be added', function() {
            cy.get('#view-button').click()
            cy.get('#like-button').click()
            cy.get('.info')
                .should('contain', 'One like added to blog Kubernetes for everybody by Andy H')
        })

        it('A user who has created a blog can remove his/her blogs as well', function() {
            cy.get('#view-button').click()
            cy.get('#remove-button').click()
            cy.get('.info')
                .should('contain', 'blog Kubernetes for everybody by Andy H removed')
        })

        it('A user who has NOT created a blog can NOT remove other creators blogs', function() {
            cy.login({ username: 'Tester', password: 'test123' })
            cy.get('#view-button').click()
            cy.get('#remove-button').click()
            cy.get('.error')
                .should('contain', 'No credentials for removing blog')
                .and('have.css', 'color', 'rgb(173, 26, 26)')
        })

        it('the most liked blog is in the top of the list', function() {
            cy.contains('DevOps For Newbies').parent().find('#view-button').click()
            cy.contains('DevOps For Newbies').parent().find('#like-button').click()

            cy.contains('Kubernetes for everybody').parent().find('#view-button').click()

            cy.contains('Kubernetes for everybody').parent().find('#like-button').as('theLikeButton')
            cy.get('@theLikeButton').click()
            cy.get('@theLikeButton').click()

            cy.get('button:contains("hide")').click({ multiple: true })
            cy.get('button:contains("view")').click({ multiple: true })

            cy.get('.likes').then(likes => {
                let likesFirstBlog = parseInt(likes.eq(0).text().substring(6, 7))
                let likesSecondBlog = parseInt(likes.eq(1).text().substring(6, 7))
                expect(likesFirstBlog).to.be.equal(2)
                expect(likesSecondBlog).to.be.equal(1)
            })
        })
    })
})

