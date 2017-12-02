import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

describe('the write page', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    createTestDocument(cy)
    createTestChapter(cy)
    logIn(cy, user.email, user.password)
    cy.visit('/app.html')
    cy.get('select.file-dropdown').select('test')
  })

  it('has a text editor with tabs', () => {
    cy.get('.editor-wrap').get('.tabs')
    cy.get('.editor-wrap').get('div[contenteditable="true"]').should('be.visible')
  })
})
