# Application Form Test Selectors

Este archivo contiene todos los selectores de test para el formulario de aplicación, organizados por secciones para facilitar su uso y mantenimiento.

## Estructura

Los selectores están organizados jerárquicamente por secciones del formulario:

- **page**: Elementos principales de la página
- **header**: Encabezado del formulario con información de la ciudad
- **existingApplicationCard**: Modal para importar aplicaciones previas
- **personalInformation**: Formulario de información personal
- **professionalDetails**: Formulario de detalles profesionales
- **participation**: Formulario de participación
- **childrenPlusOnes**: Formulario para cónyuges e hijos
- **scholarship**: Formulario de becas
- **accommodation**: Formulario de alojamiento
- **patagoniaResidencies**: Formulario específico para residencias de Patagonia
- **progressBar**: Barra de progreso del formulario
- **actions**: Botones de acción (guardar borrador, enviar)

## Uso en Tests

### Importación

```typescript
import { applicationSelectors, getDynamicSelectors } from '../selectors/applicationSelectors';
```

### Ejemplos de Uso

#### Seleccionar elementos básicos
```typescript
// Página principal
cy.get(applicationSelectors.page.container);

// Formulario
cy.get(applicationSelectors.page.form);

// Botones de acción
cy.get(applicationSelectors.actions.submitButton);
cy.get(applicationSelectors.actions.saveDraftButton);
```

#### Llenar información personal
```typescript
// Campos básicos
cy.get(applicationSelectors.personalInformation.firstName).type('John');
cy.get(applicationSelectors.personalInformation.lastName).type('Doe');
cy.get(applicationSelectors.personalInformation.email).type('john@example.com');

// Selectores
cy.get(applicationSelectors.personalInformation.gender).select('Male');
cy.get(applicationSelectors.personalInformation.age).select('25-30');
```

#### Manejar elementos dinámicos
```typescript
// Elementos con IDs dinámicos (como niños en la lista)
const kidId = 'kid-123';
cy.get(getDynamicSelectors.kidItem(kidId));
cy.get(getDynamicSelectors.kidRemoveButton(kidId)).click();

// Errores de campos específicos
cy.get(getDynamicSelectors.fieldError('first_name')).should('contain', 'Required field');
```

#### Trabajar con modales y formularios complejos
```typescript
// Modal de aplicación existente
cy.get(applicationSelectors.existingApplicationCard.modal).should('be.visible');
cy.get(applicationSelectors.existingApplicationCard.importButton).click();

// Modal de agregar niño
cy.get(applicationSelectors.childrenPlusOnes.addKidButton).click();
cy.get(applicationSelectors.childrenPlusOnes.kidModalNameInput).type('Jane');
cy.get(applicationSelectors.childrenPlusOnes.kidModalAgeSelect).select('5');
cy.get(applicationSelectors.childrenPlusOnes.kidModalAddButton).click();
```

#### Validar estado del formulario
```typescript
// Verificar progreso
cy.get(applicationSelectors.progressBar.container).should('be.visible');
cy.get(applicationSelectors.progressBar.percentage).should('contain', '75%');

// Verificar secciones completadas
cy.get(applicationSelectors.personalInformation.section).should('be.visible');
cy.get(applicationSelectors.professionalDetails.section).should('be.visible');
```

## Convenciones de Nomenclatura

### Estructura de IDs
- **Sección**: `{section-name}-section`
- **Input/Campo**: `{section-name}-{field-name}-input`
- **Select**: `{section-name}-{field-name}-select`
- **Checkbox**: `{section-name}-{field-name}-checkbox`
- **Textarea**: `{section-name}-{field-name}-textarea`
- **Botón**: `{section-name}-{action}-btn`

### Ejemplos:
- `personal-info-first-name-input`
- `participation-duration-radio-group`
- `children-spouse-checkbox`
- `scholarship-request-checkbox`

## Selectores Dinámicos

Algunos elementos tienen IDs dinámicos que se generan en tiempo de ejecución:

### Funciones Helper Disponibles:
- `getDynamicSelectors.kidItem(kidId)`: Para elementos de niños en la lista
- `getDynamicSelectors.kidRemoveButton(kidId)`: Para botones de remover niños
- `getDynamicSelectors.fieldError(fieldName)`: Para mensajes de error específicos
- `getDynamicSelectors.formSection(sectionName)`: Para secciones del formulario

## Mantenimiento

Al agregar nuevos campos al formulario:

1. **Agregar data-testid** al componente usando la convención de nomenclatura
2. **Actualizar el archivo de selectores** en la sección correspondiente
3. **Documentar** nuevos patrones o funciones helper si es necesario
4. **Actualizar tests** existentes que puedan verse afectados

## Notas Importantes

- Todos los `data-testid` siguen una convención consistente para facilitar el mantenimiento
- Los selectores están organizados por secciones del formulario para reflejar la estructura de la UI
- Se incluyen tanto elementos estáticos como dinámicos
- Los errores de campos tienen selectores específicos para validación
- Los modales y overlays tienen sus propios selectores para interacciones complejas

Este sistema de selectores permite escribir tests robustos y mantenibles para todo el flujo de aplicación.
