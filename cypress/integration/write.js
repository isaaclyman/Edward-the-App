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
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/write')
    cy.get('select.file-dropdown').select('test')
    cy.get('.editor-wrap').get('div.ql-editor').as('chapterEditor')
  })

  it('has a text editor with tabs', () => {
    cy.get('.editor-wrap').get('.tabs')
    cy.get('.editor-wrap').get('div[contenteditable="true"]').should('be.visible')
  })

  it('saves what you write', () => {
    const clock = cy.clock()
    const content = 'This is a test story'
    cy.get('@chapterEditor').type(content)
    cy.get('@chapterEditor').should('contain', content)
    clock.tick(1000)
    cy.reload()
    cy.get('@chapterEditor').should('contain', content)
  })
})
