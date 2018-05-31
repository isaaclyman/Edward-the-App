import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'
import localForage from 'localforage'
localForage.setDriver(localForage.INDEXEDDB)

const tests = isPremium => () => {
  before(() => {
    return seed(cy, () => {
      deleteTestUser()
      createTestUser()

      if (isPremium) {
        makeTestUserPremium()
        createTestDocument(isPremium)
      }
    })
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(isPremium)
    }

    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.menu').find('button').contains('Edit').click()
    cy.url().should('contain', '/documentEdit')
  })

  it('should allow renaming the document', () => {
    cy.get('.title').should('contain', 'test')
    cy.get('#documentNameInput').clear().type('test updated')
    cy.get('.actions button').contains('Save').click()
    cy.get('.title').should('contain', 'test updated')
    cy.get('.menu select.document-dropdown').select('test updated')

    cy.get('#documentNameInput').clear().type('test')
    cy.get('.actions button').contains('Save').click()
    cy.get('.title').should('contain', 'test')
    cy.get('.menu select.document-dropdown').select('test')
  })

  it('should allow deleting the document', () => {
    cy.get('.document button').contains('Delete Document').click()
    cy.get('.swal-button').contains('OK').click()
    cy.get('button.type').contains('Novel')
  })
}

describe('the document edit page (limited)', tests(false))
describe('the document edit page (premium)', tests(true))
