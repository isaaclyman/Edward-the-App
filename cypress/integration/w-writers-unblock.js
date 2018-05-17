import { user } from '../../test/_util'
import {
  createTestChapter, createTestDocument, createTestWorkshop, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'
import writingWorkshops from '../../models/writingWorkshop'

describe(`the Writer's Unblock workshop (restricted)`, () => {
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

  it(`should not allow a Limited user to access the Writer's Unblock workshop via the workshops modal`, () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains(`Writer's Unblock`).should('not.be.visible')
  })

  it(`should not allow a Limited user to visit the Writer's Unblock workshop directly`, () => {
    cy.visit('/app.html#/workshop/unblock')
    cy.url().should('contain', '/write')
  })
})

describe(`the Writer's Unblock workshop (navigation)`, () => {
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

  it(`should navigate to the Writer's Unblock workshop from the workshops modal`, () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains(`Writer's Unblock`).click()
    cy.url().should('contain', '/workshop/unblock')
  })
})

describe(`the Writer's Unblock workshop (new workshop)`, () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/workshop/unblock')
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

  it('should allow entering content and save it', () => {
    cy.get('.begin.button-green').click()
    typeContent(cy, '.ql-editor', 'Testing content')
    const clock = cy.clock()
    cy.get('.done.button-green').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Saved')

    cy.visit('/app.html#/write')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').click()
    cy.get('.workshops-wrap .button-tab').contains(`Writer's Unblock`).click()
    cy.get('.workshop-select').find('select option').contains(`Writer's Unblock`)
  })

  it('should indicate that the workshop was deleted if no content was entered', () => {
    cy.get('.begin.button-green').click()
    typeContent(cy, '.ql-editor', '') // Intentionally empty
    const clock = cy.clock()
    cy.get('.done.button-green').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Deleted')
  })

  it('should edit the same workshop if the page is returned to', () => {
    cy.get('.begin.button-green').click()
    const testContent = 'Test content for refresh'
    typeContent(cy, '.ql-editor', testContent)
    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/unblock')
    cy.get('.ql-editor').should('contain', testContent)
  })

  it('should show a new workshop if the workshop is completed', () => {
    cy.get('.begin.button-green').click()
    const testContent = 'Test content for refresh'
    typeContent(cy, '.ql-editor', testContent)
    const clock = cy.clock()
    cy.get('.done.button-green').click()
    clock.tick(2000)
    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/unblock')
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
      createTestWorkshop(writingWorkshops.WRITERS_UNBLOCK.name)
    })
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').click()
    cy.get('.workshops-wrap .button-tab').contains(`Writer's Unblock`).click()
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