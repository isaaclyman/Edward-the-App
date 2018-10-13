describe('the landing page', () => {
  before(() => {
    cy.clearCookie('connect.sid')
  })

  beforeEach(() => {
    cy.visit('/')
  })

  it('includes a hook image', () => {
    cy.get('.hook-img img').should('exist').should('be.visible')
  })

  it('includes an explanation of what Edward is', () => {
    cy.contains('Edward is a')
  })

  it('includes at least 1 link to the login page', () => {
    const authLinks = cy.get('a[href="/auth#/signup"]')
    authLinks.should('be.visible')
    authLinks.should('have.length.above', 0)
  })

  it('links to the login page', () => {
    cy.get('a').contains('Log in').click()
    cy.url().should('contain', '/auth')
  })
})
