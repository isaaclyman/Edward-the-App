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
    cy.visit('/app.html#/plan')
    cy.get('select.file-dropdown').select('test')

    if (!isPremium) {
      const docId = createTestDocument(cy, isPremium)
      createTestChapter(cy, isPremium, docId)
    }
  })

  it('has a plans list', () => {
    cy.get('h3').contains('Plans')
  })
}

describe('the plans page (limited)', tests(false))
describe('the plans page (premium)', tests(true))
