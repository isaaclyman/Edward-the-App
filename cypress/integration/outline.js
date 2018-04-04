import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'

const tests = isPremium => () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()
      
      if (isPremium) {
        makeTestUserPremium()
        createTestDocument(isPremium)
        createTestChapter(isPremium)
      }
    })

  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(isPremium).then(docId => createTestChapter(isPremium, docId))
    }

    cy.visit('/app.html#/outline')
    cy.get('select.document-dropdown').select('test')
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
}

describe('the outline page (limited)', tests(false))
describe('the outline page (premium)', tests(true))
