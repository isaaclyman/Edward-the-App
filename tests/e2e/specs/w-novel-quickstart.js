import { user, workshopGuids } from '../../test_util'
import {
  createTestChapter, createTestDocument, createTestWorkshop, createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'
import writingWorkshops from '../../../models/writingWorkshop'

describe('the novel quickstart workshop (restricted)', () => {
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

  it('should not allow a Limited user to access the Novel Quickstart workshop via the workshops modal', () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains('Novel Quickstart').should('not.be.visible')
  })

  it('should not allow a Limited user to visit the Novel Quickstart workshop directly', () => {
    cy.visit('/app.html#/workshop/novel-quickstart')
    cy.url().should('not.contain', '/workshop')
  })
})

describe('the novel quickstart workshop (navigation)', () => {
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

  it('should navigate to the novel quickstart workshop from the workshops modal', () => {
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.main-menu').find('.main-menu--button').contains('Workshop').click()
    cy.get('.swal-modal').find('.workshop').contains('Novel Quickstart').click()
    cy.url().should('contain', '/workshop/novel-quickstart')
  })
})

describe('the novel quickstart workshop (new workshop)', () => {
  beforeEach(() => {
    cy.clearLocalStorage()
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/workshop/novel-quickstart')
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

  it('should indicate that the workshop was deleted if no content was entered', () => {
    typeContent(cy, '.title .ql-editor', '') // Intentionally empty
    const clock = cy.clock()
    cy.get('.button-green.done').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Deleted')
  })

  it('should edit the same workshop if the page is returned to', () => {
    const testContent = 'Test content for refresh '
    typeContent(cy, '.title .ql-editor', testContent + 'title')
    typeContent(cy, '.tagline .ql-editor', testContent + 'tagline')
    typeContent(cy, '.summary .ql-editor', testContent + 'summary')
    typeContent(cy, '.theme .ql-editor', testContent + 'theme')
    typeContent(cy, '.jacket .ql-editor', testContent + 'jacket')
    typeContent(cy, '.report .ql-editor', testContent + 'report')
    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/novel-quickstart')
    cy.get('.title .ql-editor').should('contain', testContent + 'title')
    cy.get('.tagline .ql-editor').should('contain', testContent + 'tagline')
    cy.get('.summary .ql-editor').should('contain', testContent + 'summary')
    cy.get('.theme .ql-editor').should('contain', testContent + 'theme')
    cy.get('.jacket .ql-editor').should('contain', testContent + 'jacket')
    cy.get('.report .ql-editor').should('contain', testContent + 'report')
  })

  it('should show a new workshop if the workshop is completed', () => {
    const clock = cy.clock()

    const testContent = 'Test content for refresh '
    typeContent(cy, '.title .ql-editor', testContent + 'title')
    typeContent(cy, '.tagline .ql-editor', testContent + 'tagline')
    typeContent(cy, '.summary .ql-editor', testContent + 'summary')
    typeContent(cy, '.theme .ql-editor', testContent + 'theme')
    typeContent(cy, '.jacket .ql-editor', testContent + 'jacket')
    typeContent(cy, '.report .ql-editor', testContent + 'report')
    cy.get('.button-green.done').click()
    clock.tick(2000)
    cy.get('.ql-editor').should('not.be.visible')
    cy.get('.finished').should('contain', 'Saved')

    cy.visit('/app.html#/write')
    cy.visit('/app.html#/workshop/novel-quickstart')
    cy.url().should('contain', '/novel-quickstart')
    cy.get('.ql-editor').should('have.text', '').then(function () { this.clock.restore() })

    cy.visit('/app.html#/write')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').click()
    cy.get('.workshops-wrap .button-tab').contains(`Novel Quickstart`).click()
    cy.get('.workshop-select').find('select option').contains(`Novel Quickstart`)
  })
})

describe('the novel quickstart workshop (compose page)', () => {
  before(() => {
    seed(cy, () => {
      deleteTestUser()
      createTestUser()
      makeTestUserPremium()
      createTestDocument(true)
      createTestChapter(true)
      createTestWorkshop(writingWorkshops.NOVEL_QUICKSTART.name)
    })
    logIn(cy, user.email, user.password)
    cy.visit('/app.html#/write')
    cy.get('select.document-dropdown').select('test')
    cy.get('.plan-switch').find('.switch-label').contains('Workshops').click()
    cy.get('.workshops-wrap .button-tab').contains('Novel Quickstart').click()
  })

  it('should show completed workshops on the Workshops column of the composer', () => {
    cy.get('.workshop-select').find('select').select(workshopGuids[0])
    cy.get('.workshop').find('.workshop-content').should('contain', 'test workshop 1 content')
    cy.get('.workshop-select').find('select').select(workshopGuids[1])
    cy.get('.workshop').find('.workshop-content').should('contain', 'test workshop 2 content')
  })

  it('should allow archiving and restoring a workshop from the compose page', () => {
    // Archive
    cy.get('.workshop-select').find('select').select(workshopGuids[0])
    cy.get('.workshop-action').contains('Archive').click()

    // Make sure it's archived
    cy.get('.workshop-select').find('select').select(workshopGuids[1])
    cy.get('.workshop-select option').first().should('not.have.value', workshopGuids[0])    

    // Show archived
    cy.get('.archived-filter input').check()
    cy.get('.workshop-select option').first().should('have.value', workshopGuids[0])

    // Restore
    cy.get('.workshop-select').find('select').select(workshopGuids[0])
    cy.get('.workshop-action').contains('Restore').click()

    // Make sure it's restored
    cy.get('.workshop-select').find('select').select(workshopGuids[1])
    cy.get('.workshop-select option').first().should('have.value', workshopGuids[0])
  })

  it('should allow deleting a workshop forever from the compose page', () => {
    // Archive
    cy.get('.workshop-select').find('select').select(workshopGuids[0])
    cy.get('.workshop-action').contains('Archive').click()

    // Delete
    cy.get('.workshop-action').contains('Delete').click()
    cy.get('.swal-modal').find('button').contains('OK').click()

    cy.get('.workshop-select option').first().should('not.have.value', workshopGuids[0])
  })
})
