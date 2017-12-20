import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

describe('the write page', () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    createTestDocument(cy)
    createTestChapter(cy)
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/write')
    cy.get('select.file-dropdown').select('test')
    cy.get('.editor-wrap').find('div.ql-editor').as('chapterEditor')
    cy.get('.editor-wrap').find('.tabs').find('.add-button').as('addButton')
    cy.get('.editor-wrap').find('.tabs').find('.add-tab').as('addTab')
  })

  const chapterTab = cy => cy.get('.editor-wrap').find('.tabs').find('button.button-tab:not(.add-button)')

  const selectChapter = (cy, chapterNumber) => {
    chapterTab(cy).contains(chapterNumber.toString()).click()
  }

  const typeChapter = (cy, chapterNumber, content) => {
    const clock = cy.clock()
    selectChapter(cy, chapterNumber)
    cy.get('@chapterEditor').clear()
    cy.get('@chapterEditor').type(content)
    cy.get('@chapterEditor').should('contain', content)
    clock.tick(1000)
  }

  it('has a text editor with tabs', () => {
    cy.get('.editor-wrap').find('.tabs')
    cy.get('.editor-wrap').find('div[contenteditable="true"]').should('be.visible')
  })

  it('saves what you write', () => {
    const content = 'This is a test story'
    typeChapter(cy, 1, content)
    cy.reload()
    cy.get('@chapterEditor').should('contain', content)
  })

  it('saves multiple chapters correctly', () => {
    const content1 = 'Test chap 1'
    const content2 = 'Test chap 2'
    const content3 = 'Test chap 3, testing'

    typeChapter(cy, 3, content3)
    typeChapter(cy, 1, content1)
    typeChapter(cy, 2, content2)
    cy.reload()

    selectChapter(cy, 1)
    cy.get('@chapterEditor').should('contain', content1)

    selectChapter(cy, 2)
    cy.get('@chapterEditor').should('contain', content2)

    selectChapter(cy, 3)
    cy.get('@chapterEditor').should('contain', content3)

    selectChapter(cy, 1)
    cy.get('@chapterEditor').should('contain', content1)
  })

  it('allows cancelling adding a chapter in line', () => {
    cy.get('@addButton').find('svg').click()
    cy.get('@addTab').find('input.tab-input').type('test chapter A')
    cy.get('@addTab').find('button.button-red').click()
    cy.get('@addTab').should('not.be.visible')
    chapterTab(cy).should('have.length', 3)
  })

  it('allows adding a chapter in line', () => {
    const chapterName = 'test chapter 4'
    cy.get('@addButton').find('svg').click()
    cy.get('@addTab').find('input.tab-input').type(chapterName)
    cy.get('@addTab').find('button.button-green').click()
    cy.get('.editor-wrap').find('.tabs').find('button.button-tab').contains(chapterName).click()

    typeChapter(cy, 4, chapterName)
    cy.reload()
    selectChapter(cy, 4)
    cy.get('@chapterEditor').should('contain', chapterName)
  })
})
