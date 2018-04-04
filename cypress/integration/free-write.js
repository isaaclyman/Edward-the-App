import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestWorkshop, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'

describe('the free write workshop (restricted)', () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()
    })
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)
    createTestDocument(false).then(docId => createTestChapter(false, docId))
  })

  it('should not allow a Limited user to access the Free Write workshop via the workshops modal', () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains('Free Writing').should('not.be.visible')
  })

  it('should not allow a Limited user to visit the Free Write workshop directly', () => {
    cy.visit('/app.html#/workshop/free-write')
    cy.url().should('contain', '/write')
  })

  it('should not show the Workshops column on the Write page', () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').should('not.exist')
  })
})

describe('the free write workshop (navigation)', () => {
  before(() => {
    return seed(cy, () => {
      deleteTestUser()
      createTestUser()
      makeTestUserPremium()
      createTestDocument(true)
      createTestChapter(true)
    })
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)
  })

  it('should navigate to the free write workshop from the workshops modal', () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains('Free Writing').click()
    cy.url().should('contain', '/workshop/free-write')
  })
})

describe('the free write workshop (new workshop)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/workshop/free-write')
    cy.get('select.document-dropdown').select('test')
  })

  const typeContent = (cy, identifier, content) => {
    const clock = cy.clock()
    cy.get(identifier).clear()

    if (content) {
      cy.get(identifier).type(content)
    }

    cy.get(identifier).should('contain', content)
    clock.tick(1000)
  }

  it('should allow setting a word limit and track word count', () => {
    cy.get('.limit-option label').contains('word limit').click()
    cy.get('.set-limit input').clear().type('15')
    cy.get('.begin .button-green').click()

    typeContent(cy, '.ql-editor', `Testing word limit.`)
    cy.get('.counter').should('contain', '3 of 15 words written')
    typeContent(cy, '.ql-editor', `la${' la'.repeat(14)}.`)
    cy.get('.counter').should('contain', '15 of 15 words written')
    cy.get('.done .button-green').click()
  })

  it('should allow setting a time limit and track minute count', () => {
    cy.get('.limit-option label').contains('time limit').click()
    cy.get('.set-limit input').clear().type('1')

    const clock = cy.clock()
    cy.get('.begin .button-green').click()
    typeContent(cy, '.ql-editor', 'Testing time limit')
    cy.get('.counter').should('contain', 'minute left')      
    clock.tick(30 * 1000)
    cy.get('.counter').should('contain', 'seconds left')
    clock.tick(31 * 1000)
    cy.get('.counter').should('contain', 'Timer expired')
    cy.get('.done .button-green').click()
  })

  it('should allow continuing without a limit', () => {
    cy.get('.limit-option label').contains('No limit').click()
    cy.get('.begin .button-green').click()
    cy.get('.limit-option').should('not.be.visible')
    cy.get('.counter').should('contain', 'Set a limit')
    typeContent(cy, '.ql-editor', 'Testing no limit')
    const clock = cy.clock()
    cy.get('.done .button-green').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Saved')
  })

  it('should indicate that the workshop was deleted if no content was entered', () => {
    cy.get('.limit-option label').contains('No limit').click()
    cy.get('.begin .button-green').click()
    cy.get('.limit-option').should('not.be.visible')
    cy.get('.counter').should('contain', 'Set a limit')
    typeContent(cy, '.ql-editor', '') // Intentionally empty
    const clock = cy.clock()
    cy.get('.done .button-green').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Deleted')
  })

  it('should edit the same workshop if the page is returned to', () => {
    cy.get('.limit-option label').contains('No limit').click()
    cy.get('.begin .button-green').click()
    const testContent = 'Test content for refresh'
    typeContent(cy, '.ql-editor', testContent)
    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/free-write')
    cy.get('.ql-editor').should('contain', testContent)
  })

  it('should show a new workshop if the workshop is completed', () => {
    cy.get('.limit-option label').contains('No limit').click()
    cy.get('.begin .button-green').click()
    const testContent = 'Test content for refresh'
    typeContent(cy, '.ql-editor', testContent)
    const clock = cy.clock()
    cy.get('.done .button-green').click()
    clock.tick(2000)
    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/free-write')
    cy.get('.ql-editor').should('not.be.visible')
  })
})

describe('the free write workshop (compose page)', () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()
      makeTestUserPremium()
      createTestDocument(true)
      createTestChapter(true)
      createTestWorkshop()
    })
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').click()
  })

  it('should show completed workshops on the Workshops column of the composer', () => {
    cy.get('.workshop-select').find('select').select('test workshop 1')
    cy.get('.workshop').find('.workshop-content').should('contain', 'test workshop 1 content')
    cy.get('.workshop-select').find('select').select('test workshop 2')
    cy.get('.workshop').find('.workshop-content').should('contain', 'test workshop 2 content')
  })

  it('should allow archiving and restoring a workshop from the compose page', () => {
    // Archive
    cy.get('.workshop-select').find('select').select('test workshop 1')
    cy.get('.workshop-action').contains('Archive').click()

    // Make sure it's archived
    cy.get('.workshop-select').find('select').select('test workshop 2')
    cy.get('.workshop-select option').contains('test workshop 1').should('not.exist')

    // Show archived
    cy.get('.archived-filter input').check()
    cy.get('.workshop-select option').contains('test workshop 1').should('exist')

    // Restore
    cy.get('.workshop-select').find('select').select('test workshop 1')
    cy.get('.workshop-action').contains('Restore').click()

    // Make sure it's restored
    cy.get('.workshop-select').find('select').select('test workshop 2')
    cy.get('.workshop-select option').contains('test workshop 1').should('exist')
  })

  it('should allow deleting a workshop forever from the compose page', () => {
    // Archive
    cy.get('.workshop-select').find('select').select('test workshop 1')
    cy.get('.workshop-action').contains('Archive').click()

    // Delete
    cy.get('.workshop-action').contains('Delete').click()
    cy.get('.swal-modal').find('button').contains('OK').click()

    cy.get('.workshop-select option').contains('test workshop 1').should('not.exist')
  })
})
