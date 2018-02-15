import { user } from '../../test/_util'
import {
  createTestChapter,
  createTestDocument,
  createTestOutline,
  createTestPlan,
  createTestUser,
  deleteTestUser,
  logIn,
  makeTestUserPremium
} from '../scripts/_util'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

// LIMITED > PREMIUM

describe('upgrading as a limited user', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
  })
  
  beforeEach(() => {
    logIn(cy, user.email, user.password)
    createTestDocument(cy, false)
      .then(docId => createTestChapter(cy, false, docId).then(() => docId))
      .then(docId => createTestOutline(cy, false, docId).then(() => docId))
      .then(docId => createTestPlan(cy, false, docId))
    cy.clock()
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.editor-wrap').find('div.ql-editor').as('chapterEditor')
  })

  const testContent = {
    chap: 'Test chapter 1',
    topic: 'Test topic 1',
    section: 'Test section 1'
  }
  it('should allow upgrading to a premium account and keep your content', () => {
    // Add chapter content
    cy.get('@chapterEditor').type(testContent.chap)
    cy.tick(1000)
    cy.tick(1000)

    // Add outline content
    cy.get('.plan-switch').find('button').contains('Outline').click()
    cy.get('.topic-content').find('button').contains('Edit').click()
    cy.get('.topic-content').find('.ql-editor').type(testContent.topic)
    cy.tick(1000)
    cy.tick(1000)
    cy.get('.topic-content').find('button').contains('Done').click()

    // Add plan content
    cy.get('.plan-switch').find('button').contains('Plans').click()
    cy.get('.section-content').find('button').contains('Edit').click()
    cy.get('.section-content').find('.ql-editor').type(testContent.section)
    cy.tick(1000)
    cy.tick(1000)
    cy.get('.section-content').find('button').contains('Done').click()

    // Upgrade account
    cy.get('button').contains('Upgrade').click()
    cy.url().should('contain', '/account')
    cy.get('button').contains('Premium').click()
    
    // Enter payment information
    const stayAhead = text => text.split('').join('{rightarrow}')
    cy.get('iframe[name="stripe_checkout_app"]', { timeout: 20000 }).should(($iframe) => {
      expect($iframe.contents().find('h2.Header-purchaseDescription')).to.exist
    })
    .then(($iframe) => {
      return () => cy.wrap($iframe.contents().find('body'))
    }).then(stripe => {
      stripe().find('input[autocomplete="cc-number"]').type(stayAhead('4242424242424242'))
      stripe().find('input[autocomplete="cc-exp"]').type(stayAhead('01 30'))
      stripe().find('input[placeholder="CVC"]').type(stayAhead('001'))
      stripe().find('input[autocomplete="postal-code"]').type(stayAhead('00001'))
      stripe().find('button[type="submit"]').click()
    })

    // Acknowledge success
    cy.url({ timeout: 15000 }).should('contain', '/success')
    cy.tick(1000)    
    cy.get('button.button-green').click({ force: true })
    cy.url().should('contain', '/app')

    // Check that content was migrated
    cy.get('@chapterEditor').should('contain', testContent.chap)
    cy.get('.plan-switch').find('button').contains('Outline').click()
    cy.get('.topic-content').find('.content-static').should('contain', testContent.topic)
    cy.get('.plan-switch').find('button').contains('Plans').click()
    cy.get('.section-content').find('.content-static').should('contain', testContent.section)
  })
})

// PREMIUM > LIMITED

describe('downgrading as a premium user', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
  })
  
  beforeEach(() => {
    logIn(cy, user.email, user.password)
    createTestDocument(cy, true)
      .then(docId => createTestChapter(cy, true, docId).then(() => docId))
      .then(docId => createTestOutline(cy, true, docId).then(() => docId))
      .then(docId => createTestPlan(cy, true, docId))
    cy.clock()
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.editor-wrap').find('div.ql-editor').as('chapterEditor')
  })

  const testContent = {
    chap: 'Test chapter 1',
    topic: 'Test topic 1',
    section: 'Test section 1'
  }
  it('should allow upgrading to a premium account and keep your content', () => {
    // Add chapter content
    cy.get('@chapterEditor').type(testContent.chap)
    cy.tick(1000)
    cy.tick(1000)

    // Add outline content
    cy.get('.plan-switch').find('button').contains('Outline').click()
    cy.get('.topic-content').find('button').contains('Edit').click()
    cy.get('.topic-content').find('.ql-editor').type(testContent.topic)
    cy.tick(1000)
    cy.tick(1000)
    cy.get('.topic-content').find('button').contains('Done').click()

    // Add plan content
    cy.get('.plan-switch').find('button').contains('Plans').click()
    cy.get('.section-content').find('button').contains('Edit').click()
    cy.get('.section-content').find('.ql-editor').type(testContent.section)
    cy.tick(1000)
    cy.tick(1000)
    cy.get('.section-content').find('button').contains('Done').click()

    // Downgrade account
    cy.get('button').contains('Upgrade').click()
    cy.url().should('contain', '/account')
    cy.get('button').contains('Limited').click()
    cy.tick(1000)
    cy.get('button').contains('OK').click()

    // Acknowledge success
    cy.url({ timeout: 15000 }).should('contain', '/success')
    cy.get('button.button-green').click({ force: true })
    cy.url().should('contain', '/app')

    // Check that content was migrated
    cy.get('select.document-dropdown').select('test')
    cy.get('@chapterEditor').should('contain', testContent.chap)
    cy.get('.plan-switch').find('button').contains('Outline').click()
    cy.get('.topic-content').find('.content-static').should('contain', testContent.topic)
    cy.get('.plan-switch').find('button').contains('Plans').click()
    cy.get('.section-content').find('.content-static').should('contain', testContent.section)
  })
})
