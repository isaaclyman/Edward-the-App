describe('the landing page', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('includes a screenshot of the app', () => {
    cy.get('img.screenshot').should('exist').should('be.visible')
  })

  it('includes an explanation of what Edward is', () => {
    cy.contains('Edward is a')
  })

  it('includes at least 2 links to the login page', () => {
    const authLinks = cy.get('a[href="/auth"]')
    authLinks.should('be.visible')
    authLinks.should('have.length.above', 1)
  })

  it('links to the login page', () => {
    cy.get('a').contains('Try it').click()
    cy.url().should('contain', '/auth')
  })
})
