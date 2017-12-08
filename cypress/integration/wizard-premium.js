import { user } from '../../test/_util'
import { createTestUser, deleteTestUser, logIn, makeTestUserPremium } from '../scripts/_util'

describe('the wizard page', () => {
  beforeEach(() => {
    deleteTestUser(cy)
    createTestUser(cy)
    makeTestUserPremium(cy)
    logIn(cy, user.email, user.password)
    cy.visit('/app.html')
  })

  function selectTemplate (template) {
    cy.get('button.type').contains(template).click()
  }

  function setTitle (title) {
    cy.get('div.title').get('input').type(title)
  }

  function create () {
    cy.get('div.actions').get('button.button-green').click()
  }

  function goToWrite () {
    cy.get('div.main-menu').get('a').contains('Write').click()
  }

  function showOutline () {
    cy.get('button.switch-label').contains('Outline').click()
  }

  function showPlans () {
    cy.get('button.switch-label').contains('Plans').click()    
  }

  it('has a wizard', () => {
    cy.contains('Welcome')
    cy.get('a').contains('documentation')
    selectTemplate('Novel')
    selectTemplate('Blank')
  })

  it('allows creating a novel', () => {
    selectTemplate('Novel')
    setTitle('Test Novel')
    create()
    goToWrite()

    cy.get('div.editor-wrap').get('div.tabs').get('button.button-tab').then(tabs => {
      expect(tabs).to.have.length.greaterThan(1)
    })

    showOutline()
    cy.get('div.topic-list-wrap').get('div.topic').then(topics => {
      expect(topics).to.have.length.greaterThan(1)
    })

    showPlans()
    cy.get('div.plans-wrap').get('div.tabs').get('button.button-tab').then(tabs => {
      expect(tabs).to.have.length.greaterThan(1)
    })
  })

  it('allow creating a blank document', () => {
    selectTemplate('Blank')
    setTitle('Test Blank')
    create()
    goToWrite()

    showOutline()
    cy.get('div.sidebar-content').contains('No outline')

    showPlans()
    cy.get('div.sidebar-content').contains('No plans')
  })
})
