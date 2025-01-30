describe('Passes', () => {
  beforeEach(() => {
    cy.visit('/portal/edge-esmeralda/passes', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', Cypress.env('tokenAuth'));
      },
    });
  })

  it('should display correct total price when selecting a ticket', () => {
    // Obtener el primer ticket semanal
    cy.get('button[data-category="week"]').first().as('weekTicket');
    
    // Obtener el precio del ticket semanal usando data-price
    cy.get('@weekTicket').invoke('attr', 'data-price').then((ticketPrice) => {
      // Seleccionar el ticket
      cy.get('@weekTicket').click();
      
      // Verificar que el total muestre el mismo precio
      cy.get('[data-total]')
        .should('be.visible')
        .invoke('attr', 'data-total')
        .then((totalPrice) => {
          expect(totalPrice).to.equal(Number(ticketPrice).toFixed(2));
        });
    });
  })

  it('should set ticket price to 0 when patron pass is selected and restore original price when deselected', () => {
    // Obtener el ticket patreon y semanal
    cy.get('button[data-category="patreon"]').first().as('patronTicket');
    cy.get('button[data-category="week"]').first().as('weekTicket');

    // Guardar el precio original del ticket semanal
    cy.get('@weekTicket').invoke('attr', 'data-price').then((originalPrice) => {
      // Seleccionar el ticket patreon
      cy.get('@patronTicket').click();

      // Verificar que el ticket semanal tenga precio 0
      cy.get('@weekTicket')
        .should('have.attr', 'data-price', '0');

      // Deseleccionar el ticket patreon
      cy.get('@patronTicket')
        .should('have.attr', 'data-selected', 'true')
        .click();

      // Verificar que el precio del ticket semanal vuelva al original
      cy.get('@weekTicket')
        .should('have.attr', 'data-price', originalPrice);
    });
  })

  it('should auto-select week tickets when selecting month ticket for spouse category', () => {
    // Seleccionar el ticket mensual para spouse
    cy.get('button[data-category="month"][data-attCategory="spouse"]')
      .first()
      .click();

    // Verificar que todos los tickets semanales para spouse estén seleccionados
    cy.get('button[data-category="week"][data-attCategory="spouse"]')
      .each(($ticket) => {
        cy.wrap($ticket)
          .should('have.attr', 'data-selected', 'true');
      });
  });
})