describe('Login Portal', () => {
  beforeEach(() => {
    cy.visit(Cypress.env('AuthenticationToken'))
  })

  it('should login successfully and redirect to portal page', () => {
    // Esperamos a que la redirección ocurra y verifique que estamos en la página del portal
    cy.url().should('include', '/portal')
    
    // Verificamos que el componente EventCard existe
    cy.get('section').should('exist')
    cy.get('div.space-y-6').should('exist')
    
    // Verificamos que la página ha cargado completamente
    cy.get('.container').should('be.visible')

    cy.window().then((win) => {
      const token = win.localStorage.getItem('token');
      Cypress.env('tokenAuth', token);
    });
  })
})