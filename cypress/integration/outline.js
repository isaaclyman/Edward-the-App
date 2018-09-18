import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestUser, createTestOutline, deleteTestUser, logIn, makeTestUserPremium,
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
        createTestOutline(isPremium)
      }
    })

  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(isPremium)
        .then(docId => createTestChapter(isPremium, docId).then(() => docId))
        .then(docId => createTestOutline(isPremium, docId))
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
    cy.get('div.chapters').find('div.chapter').contains('test chapter 1')
  })

  it('allows deleting and recreating a chapter', () => {
    cy.get('#showArchivedCheckbox').check()
    cy.get('.button-tab').contains('test chapter 3').click()
    cy.get('button.chapter-action').contains('Archive').click()
    cy.get('button.chapter-action').contains('Delete').click()
    cy.get('.swal-button').contains('OK').click()
    cy.contains('test chapter 3').should('not.exist')
    cy.get('.chapter-chips .chip-input').type('test chapter 3')
    cy.get('.chapter-chips .chip-add-button').click()
    cy.contains('test chapter 3').should('exist')
  })

  it('allows deleting a topic', () => {
    cy.get('#showArchivedCheckbox').check()
    cy.get('.topic-action').contains('Archive').click()
    cy.get('.topic-action').contains('Delete').click()
    cy.get('.swal-button').contains('OK').click()
    cy.contains('test topic 1').should('not.exist')
  })

  it('allows archiving all chapters, then returning to the Composer', () => {
    cy.get('.button-tab').contains('test chapter 1').click()
    cy.get('button.chapter-action').contains('Archive').click()
    cy.get('.button-tab').contains('test chapter 2').click()
    cy.get('button.chapter-action').contains('Archive').click()    
    cy.get('.button-tab').contains('test chapter 3').click()
    cy.get('button.chapter-action').contains('Archive').click()
    cy.visit('app.html#/write')
    cy.get('.composer-wrap').contains('No chapters yet').should('exist')
  })
}

describe('the outline page (limited)', tests(false))
describe('the outline page (premium)', tests(true))
