import { user } from '../../test/_util'
import { createTestChapter, createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

const tests = isPremium => () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)

    if (isPremium) {
      makeTestUserPremium(cy)
      createTestDocument(cy, isPremium)
      createTestChapter(cy, isPremium)
    }
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      const docId = createTestDocument(cy, isPremium)
      createTestChapter(cy, isPremium, docId)
    }

    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.editor-wrap').find('div.ql-editor').as('chapterEditor')
    cy.get('.editor-wrap').find('.ql-toolbar').find('button.ql-fullscreen').as('fullscreen')
  })

  const typeContent = (cy, identifier, content) => {
    const clock = cy.clock()
    cy.get(identifier).clear()
    cy.get(identifier).type(content)
    cy.get(identifier).should('contain', content)
    clock.tick(1000)
  }

  it('allows switching between book-width and wide mode', () => {
    cy.get('@fullscreen').click()
    cy.get('.full-screen').find('.actions').find('button.wide-view').click()
    cy.get('.full-screen').find('.container').invoke('width').should('be.above', 500)
    cy.get('.full-screen').find('.actions').find('button.narrow-view').click()
    cy.get('.full-screen').find('.container').invoke('width').should('not.be.above', 500)
  })

  it('has continuity from the normal composer to the full screen view', () => {
    const content = 'Testing the full screen editor'
    const content2 = 'Now we are testing different content'

    typeContent(cy, '@chapterEditor', content)
    cy.get('@fullscreen').click()
    cy.get('.full-screen').find('div.ql-editor').as('fullscreenEditor')
    cy.get('@fullscreenEditor').should('contain', content)

    typeContent(cy, '@fullscreenEditor', content2)
    cy.get('.full-screen').find('.actions').find('button.close').click()
    cy.get('@chapterEditor').should('contain', content2)
  })
}

describe('the full screen composer (limited)', tests(false))
describe('the full screen composer (premium)', tests(true))
