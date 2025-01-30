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
    cy.get('button[data-category="month"][data-attcategory="spouse"]')
      .first()
      .click();

    // Verificar que todos los tickets semanales para spouse estén seleccionados
    cy.get('button[data-category="week"][data-attcategory="spouse"]')
      .each(($ticket) => {
        cy.wrap($ticket)
          .should('have.attr', 'data-selected', 'true');
      });
  });

  it('should successfully purchase weekly tickets and verify API response', () => {
    // Seleccionar algunos tickets semanales
    cy.get('button[data-category="week"]')
      .eq(2)
      .click();
    
    // Obtener el total antes de la compra
    cy.get('[data-total]')
      .invoke('attr', 'data-total')
      .then((totalPrice) => {
        // Hacer clic en el botón de compra
        cy.get('[data-purchase]').click();

        cy.intercept('POST', 'https://portaldev.simplefi.tech/payments/').as('purchaseRequest');

        cy.wait('@purchaseRequest').then((interception) => {
          expect(interception.response?.statusCode).to.equal(200);
          expect(interception.response?.body.amount).to.equal(Number(totalPrice));
        });
      });

    cy.wait(2000);

    cy.origin('https://develop.pagar.simplefi.tech', () => {
      cy.url().should('include', 'develop.pagar.simplefi.tech');
    });
  });
})