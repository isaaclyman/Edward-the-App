import {
  user
} from '../../test/_util'

describe('the auth page', () => {
  beforeEach(() => {
    cy.visit('/auth.html')
  })

  describe('the login form', () => {
    beforeEach(() => {
      cy.get('div.username > input').as('username')
      cy.get('div.password > input').as('password')
      cy.get('button').contains('Log In').as('logIn')
    })

    it('has a login form', () => {
      cy.get('@username').should('be.visible')
      cy.get('@password').should('be.visible')
      cy.get('div.captcha iframe').should('be.visible')
      cy.get('@logIn').should('be.visible')
    })

    it('has a sign up link', () => {
      cy.get('button').contains('Sign up')
    })

    it('has a demo link', () => {
      cy.get('button').contains('demo')
    })

    it('allows logging in', () => {
      cy.exec('node cypress/scripts/deleteTestUser.js')
      cy.exec('node cypress/scripts/createTestUser.js')

      cy.get('@username').type(user.email)
      cy.get('@password').type(user.password)
      cy.get('@logIn').click()
      cy.url().should('contain', '/app')
      cy.getCookie('connect.sid').should('exist')
    })
  })

  describe('the demo login', () => {
    it('logs in and redirects to the app', () => {
      cy.get('button').contains('demo').click()
      cy.url().should('contain', '/app')
      cy.getCookie('connect.sid').should('exist')
    })
  })

  // describe('the signup page', () => {

  // })
})
