import { user } from '../../test/_util'
import {
  createTestUser, deleteTestUser, logIn, makeTestUserPremium,
  seed
} from '../scripts/_util'

const tests = (userType) => () => {
  before(() => {
    switch (userType) {
      case 'demo':
        break
      case 'limited':
        seed(cy, () => {
          deleteTestUser()
          createTestUser()
        })
        break
      case 'premium':
        seed(cy, () => {
          deleteTestUser()
          createTestUser()
          makeTestUserPremium()
        })
        break
    }
  })

  beforeEach(() => {
    if (userType !== 'demo') {
      cy.visit('/auth.html#/login')
      cy.get('button').contains('demo').click()
      cy.url().should('contain', '/app')
    } else {
      logIn(cy, user.email, user.password)
    }

    cy.visit('/app.html')
  })

  function selectTemplate (template) {
    cy.get('button.type').contains(template).click()
  }

  function setTitle (title) {
    cy.get('div.title').find('input').type(title)
  }

  function create () {
    cy.get('div.actions').find('button.button-green').click()
  }

  function goToWrite () {
    cy.get('div.main-menu').find('a').contains('Write').click()
  }

  function showOutline () {
    cy.get('button.switch-label').contains('Outline').click()
  }

  function showPlans () {
    cy.get('button.switch-label').contains('Plans').click()    
  }

  it('has a wizard', () => {
    cy.contains('Welcome')
    cy.get('a').contains('video')
    selectTemplate('Novel')
    selectTemplate('Blank')
  })

  it('allows creating a novel', () => {
    selectTemplate('Novel')
    setTitle('Test Novel')
    create()
    goToWrite()

    cy.get('div.editor-wrap').find('div.tabs').find('button.button-tab')
      .should('have.length.above', 1)

    showOutline()
    cy.get('div.topic-list-wrap').find('div.topic')
      .should('have.length.above', 1)

    showPlans()
    cy.get('div.plans-wrap').find('div.tabs').find('button.button-tab')
      .should('have.length.above', 1)
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
}

describe('the wizard page (demo)', tests('demo'))
describe('the wizard page (limited)', tests('limited'))
describe('the wizard page (premium)', tests('premium'))
