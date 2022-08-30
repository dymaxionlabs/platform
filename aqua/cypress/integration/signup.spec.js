const apiBaseUrl = "http://localhost:8000"

const user = {
  username: "ana",
  email: "ana@example.com",
  password: "secretpassword",
}

describe('Sign up', () => {
  it('registers a user and logs in', () => {
    cy.visit('/signup')

    cy.get('#username')
      .type(user.username)
      .should('have.value', user.username)

    cy.get('#email')
      .type(user.email)
      .should('have.value', user.email)

    cy.get('#password1')
      .type(user.password)
      .should('have.value', user.password)

    cy.get('#password2')
      .type(user.password)
      .should('have.value', user.password)

    // Click the submit button
    cy.get(':nth-child(2) > .MuiButtonBase-root > .MuiButton-label').click()

    cy.location('pathname', { timeout: 60000 })
      .should('include', '/home');
  })
})