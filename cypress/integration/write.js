import { user } from '../../test/_util'
import { logIn } from '../scripts/_util'

describe('the write page', () => {
  before(() => {
    logIn(cy, user.email, user.password)
    cy.visit('/app.html')
  })

  it('has a text editor with tabs', () => {
    cy.get('.editor-wrap').get('.tabs')
    cy.get('.editor-wrap').get('div[contenteditable="true"]').should('be.visible')
  })
})
