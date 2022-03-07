const apiBaseUrl = "http://localhost:8000"

const user = {
  username: "john",
  email: "john@example.com",
  password: "secretpassword",
}

describe('Login', () => {
  it('shows a login form asking for username and password', () => {
    cy.visit('/login')

    cy.get('#username')
      .type(user.username)
      .should('have.value', user.username)

    cy.get('#password')
      .type(user.password)
      .should('have.value', user.password)

    cy.get('.MuiButton-label').click()

    cy.location('pathname', { timeout: 60000 })
      .should('include', '/home');
  })
})