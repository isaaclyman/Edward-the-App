import { user } from '../../test/_util'
import {
  createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium, createTestPlan,
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
        createTestPlan(isPremium)
      }
    })
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      createTestDocument(isPremium).then(docGuid => createTestPlan(isPremium, docGuid))
    }

    cy.visit('/app.html#/plan')
    cy.get('select.document-dropdown').select('test')
  })

  const addPlan = title => {
    cy.get('.plan-chips').within(() => {
      cy.get('.chip-list').should('exist')
      cy.get('.chip-input').type(title)
      cy.get('.chip-add-button').click()
      cy.get('.chip').contains(title)
    })
  }

  const addSection = title => {
    cy.get('.section-chips').within(() => {
      cy.get('.chip-list').should('exist')
      cy.get('.chip-input').type(title)
      cy.get('.chip-add-button').click()
      cy.get('.chip').contains(title)
    })
  }

  it('allows adding an additional plan and section', () => {
    addPlan('plan 3')
    cy.get('.button-tab:not(.add-button):not(.add-tab)').as('planTab')
    cy.get('@planTab').should('have.length', 3)
    addSection('section 2')
    cy.get('.sections').find('.section').should('have.length', 2)
    cy.get('@planTab').last().click()
    cy.get('.plan-actions').find('.plan-action').contains('Archive').click()
  })

  it('allows archiving and restoring a plan from the chips list', () => {
    cy.get('.plan-chips').within(() => {
      cy.get('.chip').first().find('.action-delete').click()
      cy.get('.chip').contains('1').should('not.be.visible')
    })

    cy.get('.show-archived').check()

    cy.get('.plan-chips').within(() => {
      cy.get('.chip').contains('1').should('be.visible')
      cy.get('.chip').first().find('.action-restore').click()
    })

    cy.get('.show-archived').uncheck()
    cy.get('.plan-chips').find('.chip').contains('1').should('be.visible')
  })

  it('allows renaming a plan from the chips list', () => {
    cy.get('.plan-chips').find('.chip').first().within(() => {
      cy.get('.action-rename').click()
      cy.get('input').type('renamed 1')
      cy.get('button').contains('Cancel').click()
    })

    cy.get('.plan-chips').find('.chip').contains('renamed').should('not.be.visible')

    cy.get('.plan-chips').find('.chip').first().within(() => {
      cy.get('.action-rename').click()
      cy.get('input').type('renamed 1')
      cy.get('button').contains('Save').click()
    })

    cy.get('.plan-chips').find('.chip').contains('renamed').should('be.visible')
  })

  it('allows renaming a section from the chips list', () => {
    cy.get('.section-chips').find('.chip').first().within(() => {
      cy.get('.action-rename').click()
      cy.get('input').type('renamed 1')
      cy.get('button').contains('Cancel').click()
    })

    cy.get('.section-chips').find('.chip').contains('renamed').should('not.be.visible')

    cy.get('.section-chips').find('.chip').first().within(() => {
      cy.get('.action-rename').click()
      cy.get('input').type('renamed 1')
      cy.get('button').contains('Save').click()
    })

    cy.get('.section-chips').find('.chip').contains('renamed').should('be.visible')
  })

  it('allows deleting a plan', () => {
    cy.get('#showArchivedCheckbox').check()
    cy.get('.button-tab').contains('test plan 2').click()
    cy.get('.plan-action').contains('Archive').click()
    cy.get('.plan-action').contains('Delete').click()
    cy.get('.swal-button').contains('OK').click()
    cy.contains('test plan 2').should('not.exist')
  })

  it('allows deleting a section', () => {
    cy.get('#showArchivedCheckbox').check()
    cy.get('.section-action').contains('Archive').click()
    cy.get('.section-action').contains('Delete').click()
    cy.get('.swal-button').contains('OK').click()
    cy.contains('test section 1').should('not.exist')
  })
}

describe('the prefilled plans page (limited)', tests(false))
describe('the prefilled plans page (premium)', tests(true))
