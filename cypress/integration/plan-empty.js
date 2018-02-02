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

  const checkPlan = title => {
    cy.get('.plan-chips').within(() => {
      cy.get('.chip-list').should('exist')
      cy.get('.chip').contains(title)
    })
  }

  const checkSection = title => {
    cy.get('.section-chips').within(() => {
      cy.get('.chip-list').should('exist')
      cy.get('.chip').contains(title)
    })

    cy.get('.sections').within(() => {
      cy.get('.section-title').contains(title)
    })
  }

  it('has a plans list and allows adding plans and sections', () => {
    // Make sure there are no plans, then add two
    cy.get('h3').contains('Plans')
    cy.get('.plans-wrap').should('not.be.visible')
    const plans = ['plan 1', 'plan 2']
    addPlan(plans[0])
    addPlan(plans[1])

    const p1section = 'p1 - section 1'
    const p2sections = ['p2 - section 1', 'p2 - section 2']
    cy.get('.plans-wrap').should('be.visible')
    cy.get('.plans-wrap').within(() => {
      cy.get('.button-tab:not(.add-button):not(.add-tab)').as('planTab')

      // Make sure the right number of plan tabs are there, actions are present, there are no sections,
      //  and add a section
      cy.get('.plan').should('be.visible')
      cy.get('.plan-header').should('contain', plans[0])
      cy.get('.plan-actions').find('.plan-action').contains('Archive').should('exist')
      cy.get('@planTab').should('have.length', 2)
      cy.get('.chip-list').find('.chip').should('not.exist')
      addSection(p1section)

      // Check the second plan and add two sections
      cy.get('@planTab').contains(plans[1]).click()
      cy.get('.plan').should('be.visible')
      cy.get('.plan-header').should('contain', plans[1])
      cy.get('.plan-actions').find('.plan-action').contains('Archive').should('exist')
      cy.get('.chip-list').find('.chip').should('not.exist')
      cy.get('.section-chips').find('h3').contains('Sections')
      addSection(p2sections[0])
      addSection(p2sections[1])
    })

    // Reload
    cy.slowReload()

    // Make sure both plans still exist and the first one has a section
    cy.get('@planTab').contains(plans[0]).click()
    cy.get('.plan-header').should('contain', plans[0])
    checkPlan(plans[0])
    checkPlan(plans[1])
    checkSection(p1section)

    // Make sure the second plan has two sections
    cy.get('@planTab').contains(plans[1]).click()
    cy.get('.plan-header').should('contain', plans[1])
    cy.get('.sections').find('.section').should('have.length', 2)
    checkSection(p2sections[0])
    checkSection(p2sections[1])
  })
}

describe('the empty plans page (limited)', tests(false))
describe('the empty plans page (premium)', tests(true))
