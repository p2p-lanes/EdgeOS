describe('Application Form', () => {
  beforeEach(() => {
    cy.visit('/portal/edge-esmeralda/passes', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', Cypress.env('tokenAuth'));
      },
    });
  })

  it('should display correct total price when selecting a ticket', () => {
    // Esperar a que los tickets estén visibles
    cy.get('button').contains('$').first().as('firstTicket');
    
    // Obtener el precio del primer ticket
    cy.get('@firstTicket').invoke('text').then((priceText) => {
      // Limpiar el texto del precio para obtener solo el número
      const ticketPrice = priceText.replace('$', '').trim();
      
      // Seleccionar el ticket
      cy.get('@firstTicket').click();
      
      // Verificar que el total muestre el mismo precio
      cy.get('[data-testid="total-price"]')
        .should('be.visible')
        .invoke('text')
        .then((totalText) => {
          const totalPrice = totalText.replace('$', '').trim();
          expect(totalPrice).to.equal(ticketPrice);
        });
    });
  })

  it('should set ticket price to 0 when patron pass is selected and restore original price when deselected', () => {
    // Guardar referencia al patron pass
    cy.get('[data-testid="patron-pass"]').as('patronPass');
    
    // Seleccionar un ticket random y guardar su precio original
    cy.get('button').contains('$').first().as('randomTicket');
    let originalPrice: string;
    
    cy.get('@randomTicket').invoke('text').then((priceText) => {
      originalPrice = priceText.replace('$', '').trim();
      
      // Hacer click en patron pass
      cy.get('@patronPass').click();
      
      // Verificar que el patron pass esté seleccionado
      cy.get('@patronPass').should('have.class', 'bg-[#D5F7CC]');
      
      // Verificar que el precio del ticket random sea 0
      cy.get('@randomTicket')
        .invoke('text')
        .then((newPriceText) => {
          const newPrice = newPriceText.replace('$', '').trim();
          expect(newPrice).to.equal('0');
        });

      // Desseleccionar patron pass
      cy.get('@patronPass').click();
      cy.get('@patronPass').click();

      cy.get('@patronPass').should('not.have.class', 'bg-[#D5F7CC]');

      // Verificar que el precio vuelva al original
      cy.get('@randomTicket')
        .invoke('text')
        .then((restoredPriceText) => {
          const restoredPrice = restoredPriceText.replace('$', '').trim();
          expect(restoredPrice).to.equal(originalPrice);
        });
    });
  })

  it('should display correct total price when selecting multiple tickets', () => {
    // Array para almacenar los precios
    const selectedPrices: number[] = [];
    
    // Seleccionar los primeros 3 tickets que contengan precio
    cy.get('button').contains('$').as('tickets');
    
    // Seleccionar y sumar los precios de los primeros 3 tickets
    cy.get('@tickets').each(($ticket, index) => {
      if (index < 3) {
        // Obtener y limpiar el precio del ticket
        const priceText = $ticket.text();
        const price = Number(priceText.replace('$', '').trim());
        selectedPrices.push(price);
        
        // Hacer click en el ticket
        cy.wrap($ticket).click();
        
        // Verificar que el total sea la suma acumulada
        const expectedTotal = selectedPrices.reduce((sum, price) => sum + price, 0);
        
        cy.get('[data-testid="total-price"]')
          .should('be.visible')
          .invoke('text')
          .then((totalText) => {
            const actualTotal = Number(totalText.replace('$', '').trim());
            expect(actualTotal).to.equal(expectedTotal);
          });
      }
    });
  });
})