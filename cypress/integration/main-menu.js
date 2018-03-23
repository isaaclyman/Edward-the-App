import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

describe('the main menu', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    createTestDocument(cy, false)
  })
  
  beforeEach(() => {
    logIn(cy, user.email, user.password)

    cy.clock()
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').should('exist')    
  })

  it('should visit each page in turn', () => {
    cy.get('.main-menu').find('.main-menu--button').contains('Plan').click()
    cy.url().should('contain', '/plan')
    cy.get('.main-menu').find('.main-menu--button').contains('Outline').click()
    cy.url().should('contain', '/outline')
    cy.get('.main-menu').find('.main-menu--button').contains('Write').click()
    cy.url().should('contain', '/write')
    cy.get('.main-menu').find('.main-menu--button').contains('Analyze').click()
    cy.url().should('contain', '/analyze')
    const clock = cy.clock()
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    clock.tick(2000)
    cy.get('.swal-modal').find('.workshops').should('exist')
    cy.get('.swal-modal').find('button').contains('Cancel').click()
  })
})
