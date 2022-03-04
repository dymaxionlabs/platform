// login.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

describe('Login', () => {
  it('shows a login form asking for username and password', () => {
    cy.visit('http://localhost:3000/login')

    cy.get('#username')
      .type('john@example.com')
      .should('have.value', 'john@example.com')

    cy.get('#password')
      .type('secretpassword')
      .should('have.value', 'secretpassword')

    expect(true).to.equal(true)
  })
})