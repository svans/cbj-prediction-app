// client/cypress/e2e/full_user_flow.cy.js

describe('Full User Flow Test', () => {
  it('allows a user to sign up, make a prediction, and log out', () => {
    // Generate a unique username and email for each test run
    const uniqueId = Date.now();
    const username = `testuser_${uniqueId}`;
    const email = `test_${uniqueId}@example.com`;
    const password = 'password123';

    // --- 1. Sign Up ---
    cy.visit('/login');
    cy.contains('Sign up').click();
    
    cy.get('input[placeholder="Username"]').type(username);
    cy.get('input[placeholder="Email address"]').type(email);
    cy.get('input[placeholder="Password"]').type(password);
    
    cy.contains('button', 'Sign Up').click();

    // --- 2. Make a Prediction ---
    // After signing up, the user should be on the homepage
    cy.url().should('eq', 'http://localhost:5173/');
    cy.contains('Next Game').should('be.visible');

    // Find the first "Make Your Predictions" button and click it
    cy.contains('button', 'Make Your Predictions').first().click();

    // Fill out the prediction form
    cy.get('select').eq(0).select(1); // Select the first team
    
    // Wait for the roster to load before selecting a player
    cy.get('select').eq(1).should('not.be.disabled');
    cy.get('select').eq(1).select(1); // Select the first player

    cy.get('input[type="number"]').eq(0).clear().type('3'); // Away score
    cy.get('input[type="number"]').eq(1).clear().type('4'); // Home score
    cy.get('input[type="number"]').eq(2).clear().type('65'); // Total shots

    // Save the prediction
    cy.contains('button', 'Save Predictions').click();

    // Check for the success animation
    cy.contains('Prediction Saved!').should('be.visible');

    // --- 3. Verify the Prediction is Saved ---
    // After the form closes, the button should now say "Edit Your Predictions"
    cy.contains('button', 'Edit Your Predictions').should('be.visible');

    // --- 4. Log Out ---
    cy.contains('button', 'Logout').click();
    cy.contains('button', 'Login').should('be.visible');
  });
});
