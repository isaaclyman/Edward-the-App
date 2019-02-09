import { user } from '../../test_util'
import {
  createTestChapter,
  createTestDocument,
  createTestOutline,
  createTestPlan,
  createTestUser,
  deleteTestUser,
  logIn,
  makeTestUserPremium,
  seed,
  createTestWorkshop
} from '../scripts/_util'
import writingWorkshops from '../../../compiled/writingWorkshop'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

const tests = isPremium => () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()

      if (isPremium) {
        makeTestUserPremium()
        createTestDocument(true)
        createTestChapter(true)
        createTestOutline(true)
        createTestPlan(true)
        createTestWorkshop(writingWorkshops.FREE_WRITE.name)
      }
    })
  })

  const query = 'search'

  function search() {
    cy.clock()
    cy.get('.search-input').type(query)
    cy.get('.button-green').contains('Search').click()
    cy.tick(1000)
  }
  
  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(false)
        .then(docId => createTestChapter(false, docId).then(() => docId))
        .then(docId => createTestOutline(false, docId).then(() => docId))
        .then(docId => createTestPlan(false, docId))
    }
    cy.visit('/app.html#/search')
    cy.get('select.document-dropdown').select('test')
    search()
  })

  it('shows search results for chapters, outlines, plans and workshops', () => {
    cy.get('.results').should('exist')
    cy.get('.result-set').should('exist')
    cy.get('.result-set').contains('Chapters')
    cy.get('.result-set').contains('Outlines')
    cy.get('.result-set').contains('Plans')
    if (isPremium) {
      cy.get('.result-set').contains('Workshops')
    }
  })

  it('links to chapters', () => {
    cy.get('.chapter-results .result .link-out').first().click()
    cy.url().should('contain', '/write')
    cy.get('.editor-wrap .ql-editor').contains(query)
  })

  it('links to outlines', () => {
    cy.get('.outline-results .result .link-out').first().click()
    cy.url().should('contain', '/outline')
    cy.get('.content-static').contains(query)
  })

  it('links to plans', () => {
    cy.get('.plan-results .result .link-out').first().click()
    cy.url().should('contain', '/plan')
    cy.get('.section-content').contains(query)
  })

  if (isPremium) {
    it('links to workshops', () => {
      cy.get('.workshop-results .result .link-out').first().click()
      cy.url().should('contain', '/write')
      cy.get('.sidebar-content .workshop-content').contains(query)
    })
  }
}

describe('the search page (limited)', tests(false))
describe('the search page (premium)', tests(true))
