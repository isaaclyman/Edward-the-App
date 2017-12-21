import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

describe('the outline page', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    createTestDocument(cy)
    createTestChapter(cy)
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/outline')
    cy.get('select.file-dropdown').select('test')
  })

  it('has a chapters list', () => {
    cy.get('h3').contains('Chapters')
    cy.get('div.chip').contains('test')
  })

  it('has a topics list', () => {
    cy.get('h3').contains('Topics')
  })

  it('has an outline section', () => {
    cy.get('h3').contains('Outline')
  })

  it('has an outline view with tabs', () => {
    cy.get('div.chapters').find('div.tabs').find('button.button-tab')
    cy.get('div.chapters').find('div.chapter').contains('test')
  })
})
