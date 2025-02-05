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
  
  it('should correctly calculate total price with discounts', () => {
    // Seleccionar aleatoriamente entre 1 y 4 tickets
    const numTicketsToSelect = Math.floor(Math.random() * 4) + 1;
    
    // Obtener todos los tickets disponibles y seleccionar algunos al azar
    cy.get('button[data-category]').then($tickets => {
      const tickets = $tickets.toArray();
      const selectedIndexes: number[] = [];
      
      while (selectedIndexes.length < numTicketsToSelect) {
        const randomIndex = Math.floor(Math.random() * tickets.length);
        if (!selectedIndexes.some(index => index === randomIndex)) {
          selectedIndexes.push(randomIndex);
          cy.wrap(tickets[randomIndex]).click();
        }
      }
    });

    // Verificar si hay tickets seleccionados antes de continuar
    cy.get('button[data-selected="true"]').then($selectedTickets => {
      if ($selectedTickets.length > 0) {
        cy.get('[data-cart]').click();
        
        let totalPrice = 0;
        let monthlyDiscounts = 0;
        let additionalDiscounts = 0;

        // Sumar precios de productos
        cy.get('[data-product-price]').each(($price) => {
          const productPrice = parseFloat($price.attr('data-product-price') || '0');
          totalPrice += productPrice;
        });

        // Restar descuentos mensuales
        cy.get('button[data-category="month"]').then($monthTickets => {
          // Verificar si hay tickets mensuales seleccionados
          $monthTickets.each((_, monthTicket) => {
            const isSelected = monthTicket.getAttribute('data-selected') === 'true';
            if (isSelected) {
              cy.get('[data-month-discount]').then($discounts => {
                if ($discounts.length > 0) {
                  $discounts.each((_, discount) => {
                    monthlyDiscounts += parseFloat(discount.getAttribute('data-month-discount') || '0');
                  });
                }
              });
            }
          });
        });

        // Restar descuentos adicionales
        cy.get('[data-discount-amount]').then($discounts => {
          if ($discounts.length > 0) {
            $discounts.each((_, discount) => {
              additionalDiscounts += parseFloat(discount.getAttribute('data-discount-amount') || '0');
            });
          }

          // Calcular total final
          const expectedTotal = (totalPrice - monthlyDiscounts - additionalDiscounts).toFixed(2);

          // Verificar que el total mostrado sea igual al total esperado
          cy.get('[data-total]')
            .should('be.visible')
            .invoke('attr', 'data-total')
            .then((displayedTotal) => {
              expect(displayedTotal).to.equal(expectedTotal);
            });
        });
      }
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