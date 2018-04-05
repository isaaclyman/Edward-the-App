import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  createTestOutline, createTestPlan, createTestWorkshop,
  seed
} from '../scripts/_util'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

const tests = isPremium => () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()

      if (isPremium) {
        makeTestUserPremium()
        createTestDocument(isPremium)
        createTestChapter(isPremium)
        createTestOutline(isPremium)
        createTestPlan(isPremium)
        createTestWorkshop()
      }
    })

    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(isPremium).then(docId => {
        createTestChapter(isPremium, docId)
        createTestOutline(isPremium, docId)
        createTestPlan(isPremium, docId)
      })
    }
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.menu').find('button').contains('Download').click()
    cy.url().should('contain', '/export')
    cy.window().then(window => { window._integration = true })
  })

  afterEach(() => {
    cy.window().then(window => { window._pdfSuccess = false })
  })

  it('lets you download chapters as a PDF', () => {
    cy.get('.export-button').contains('chapters').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
  })

  it('lets you download chapters (including archived) as a PDF', () => {
    cy.get('.export-checkbox input').check()
    cy.get('.export-button').contains('chapters').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
    cy.get('.export-checkbox input').uncheck()
  })

  it('lets you download plans as a PDF', () => {
    cy.get('.export-button').contains('plans').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
  })

  it('lets you download outlines as a PDF', () => {
    cy.get('.export-button').contains('outlines').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
  })

  it('lets you download workshops as a PDF', () => {
    if (!isPremium) {
      cy.get('.export-button').contains('workshops').should('not.exist')
      return
    }

    cy.get('.export-button').contains('workshops').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
  })

  it('lets you export the entire document', () => {
    cy.get('.export-button').contains('entire document').click()
    cy.get('.v-spinner').should('not.exist')
    cy.window().its('_pdfSuccess').should('be.true')
  })

  it('lets you import an entire document and loads all the content', () => {
    
  })
}

describe('the export page (limited)', tests(false))
describe('the export page (premium)', tests(true))
