import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

describe('the page idle watcher (limited)', () => {
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

  it('should not appear after 30 minutes on a limited account', () => {
    cy.tick(60 * 60 * 1000)
    cy.get('.idle-page').should('not.exist')
  })
})

describe('the page idle watcher (premium)', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    createTestDocument(cy, true)    
  })
  
  beforeEach(() => {
    logIn(cy, user.email, user.password)

    cy.clock()
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').should('exist')    
  })

  it('should not appear after 30 minutes if actions have occurred', () => {
    cy.tick(15 * 60 * 1000)
    cy.get('.main-menu').find('button').contains('Write').click()
    cy.tick(15 * 60 * 1000)
    cy.get('.main-menu').find('button').contains('Write').click()
    cy.tick(15 * 60 * 1000)
    cy.get('.idle-page').should('not.exist')    
  })

  it('should not appear before 30 minutes have passed', () => {
    cy.tick(28 * 60 * 1000)
    cy.get('.idle-page').should('not.exist')
  })

  it('should appear after 30 minutes of idle time', () => {
    cy.tick(45 * 60 * 1000)
    cy.get('.idle-page').should('exist')
  })

  it('should reload the page when the reload button is clicked', () => {
    let reloaded = false
    window.onbeforeunload = () => { reloaded = true }
    cy.tick(45 * 60 * 1000)
    cy.wait(500)
    cy.get('.idle-page').find('.reload-button').should('be.visible')
    cy.get('.idle-page').find('.reload-button').click()
    cy.wrap(reloaded).should('be', true)
  })

  it('should go back to the app when the "back to app" button is clicked', () => {
    let reloaded = false
    window.onbeforeunload = () => { reloaded = true }
    cy.tick(45 * 60 * 1000)
    cy.wait(500)
    cy.get('.idle-page').find('.cancel-button').should('be.visible')
    cy.get('.idle-page').find('.cancel-button').click()
    cy.get('.idle-page').should('not.exist')
    cy.get('.main-menu').should('exist')
    cy.wrap(reloaded).should('be', false)
  })
})