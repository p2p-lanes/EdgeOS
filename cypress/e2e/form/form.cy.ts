// describe('Application Form', () => {
//   beforeEach(() => {
//     cy.visit('/portal/edge-esmeralda', {
//       onBeforeLoad(win) {
//         win.localStorage.setItem('token', Cypress.env('tokenAuth'));
//       },
//     });

//     // Verificar la request a la API después de cargar la página
//     cy.intercept('GET', `${Cypress.env('apiUrl')}/application?email=*`, {
//       headers: {
//         'Authorization': `Bearer ${Cypress.env('tokenAuth')}`
//       }
//     }).as('getApplication')

//     cy.wait('@getApplication').then((interception) => {
//       expect(interception.response?.statusCode).to.equal(200)
//       // Verificar que el email en la URL coincida con el del token
//       const urlParams = new URLSearchParams(new URL(interception.request.url).search)
//       expect(urlParams.get('email'))
//     })
//   })

//   it('should submit form successfully with required fields', () => {
//     // Personal Information
//     cy.get('[name="first_name"]').type('John')
//     cy.get('[name="last_name"]').type('Doe')
//     cy.get('[name="telegram"]').type('@johndoe')
//     cy.get('select[name="gender"]').select('male') // Asumiendo que 'male' es una opción válida
//     cy.get('select[name="age"]').select('25-34') // Asumiendo que '25-34' es una opción válida
//     cy.get('[name="email"]').type('john.doe@example.com')
//     cy.get('[name="video_url"]').type('testing cypress')


//     // Submit form
//     cy.get('button[type="submit"]').click()

//     // Verificar la respuesta y el toast
//     cy.intercept('POST', '**/api/applications').as('submitApplication')
    
//     cy.wait('@submitApplication').then((interception) => {
//       expect(interception.response?.statusCode).to.be.oneOf([200, 201])
//     })

//     cy.get('.sonner-toast')
//       .should('be.visible')
//       .and('contain.text', 'Your application has been successfully submitted.')
//   })
// })