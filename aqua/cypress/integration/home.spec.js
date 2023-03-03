const apiBaseUrl = "http://localhost:8000"

const user = {
  username: "john",
  email: "john@example.com",
  password: "secretpassword",
}

describe('Home page', () => {
  before(() => {
    cy.visit('/login')

    cy.get('#username')
      .type(user.username)
      .should('have.value', user.username)

    cy.get('#password')
      .type(user.password)
      .should('have.value', user.password)

    cy.get('.MuiButton-label').click()
    cy.wait(2000)

    // Choose default project
    cy.contains('Default').click()

    cy.location('pathname', { timeout: 60000 })
      .should('include', '/home');
  })

  it('allows the user to visit different modules from the sidebar', () => {
    // Files
    cy.contains("Files").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/files');

    // Tasks
    cy.contains("Tasks").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/tasks');

    // Viewer
    cy.contains("Viewer").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/maps');

    // API Keys
    cy.contains("API Keys").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/keys');

    // Credits
    cy.contains("Credits").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/credits');

    // Profile
    cy.contains("Profile").click()
    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home/profile');
  })

  it("allows the user to see their username and logout by clicking the profile button", () => {
    cy.get('.profile-btn').click();
    cy.contains('john');
    cy.contains('Logout').click();

    cy.location('pathname', { timeout: 10000 })
      .should('include', '/login');
  })
})
