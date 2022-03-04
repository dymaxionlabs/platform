// login.spec.js created with Cypress
//
// Start writing your Cypress tests below!
// If you're unfamiliar with how Cypress works,
// check out the link below and learn how to write your first test:
// https://on.cypress.io/writing-first-test

beforeEach(() => {
  const username = "john"
  const projectUuid = "4d14cbf0-2a73-43cc-aebe-6b4643d0d2c7";
  const project = {
    "collaborators": [username],
    "estimators": [],
    "uuid": projectUuid,
    "name": "Default",
    "description": "",
    "no_images": false,
    "estimators_module": true,
    "dashboards_module": false,
    "created_at": "2022-03-03T19:51:58.918190Z",
    "updated_at": "2022-03-03T19:51:58.918212Z",
    "owner": 1
  };

  cy.intercept(
    { url: "http://localhost:8000/projects/" },
    { "count": 1, "next": null, "previous": null, "results": [project] }
  )

  cy.intercept(
    { url: `http://localhost:8000/projects/${projectUuid}/` },
    project
  )

  cy.intercept(
    { url: "http://localhost:8000/credits/available/" },
    { "available": 10000.0 }
  )

  cy.intercept(
    { url: `http://localhost:8000/quotas/usage/?project=${projectUuid}` },
    {
      "user": { "username": username, "storage": { "used": 0, "available": 26843545600 } },
      "projects": [{ "name": "Default", "uuid": projectUuid, "estimators": { "count": 0, "limit": 100 }, "tasks": 0, "files": 0 }]
    }
  )

  cy.intercept(
    { url: `http://localhost:8000/tasks/?limit=5&project=${projectUuid}` },
    { "count": 0, "next": null, "previous": null, "results": [] }
  )
})

describe('Login', () => {
  it('shows a login form asking for username and password', () => {
    cy.intercept(
      { method: 'POST', url: 'http://localhost:8000/auth/login/' },
      { username: "john", email: "john@example.com", key: "user-token" }
    )

    cy.visit('http://localhost:3000/login')

    cy.get('#username')
      .type('john@example.com')
      .should('have.value', 'john@example.com')

    cy.get('#password')
      .type('secretpassword')
      .should('have.value', 'secretpassword')

    cy.get('.MuiButton-label').click()

    cy.location('pathname', { timeout: 10000 })
      .should('include', '/home');
  })
})