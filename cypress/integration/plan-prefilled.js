import { user } from '../../test/_util'
import { createTestDocument, createTestUser, deleteTestUser, logIn, makeTestUserPremium, createTestPlan } from '../scripts/_util'

const tests = isPremium => () => {
  before(() => {
    deleteTestUser(cy)
    createTestUser(cy)

    if (isPremium) {
      makeTestUserPremium(cy)
      createTestDocument(cy, isPremium)
      createTestPlan(cy, isPremium)
    }
  })

  beforeEach(() => {
    logIn(cy, user.email, user.password)

    if (!isPremium) {
      const docId = createTestDocument(cy, isPremium)
      createTestPlan(cy, isPremium, docId)
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
}

describe('the prefilled plans page (limited)', tests(false))
describe('the prefilled plans page (premium)', tests(true))
