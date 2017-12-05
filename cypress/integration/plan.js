import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

describe('the plans page', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    createTestDocument(cy)
    createTestChapter(cy)
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/plan')
    cy.get('select.file-dropdown').select('test')
  })

  it('has a plans list', () => {
    cy.get('h3').contains('Plans')
  })
})
