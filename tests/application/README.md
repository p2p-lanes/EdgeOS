# Application Form Tests

Este directorio contiene los tests de Playwright para el formulario de aplicación del portal ciudadano.

## Estructura

```
tests/application/
├── edge-esmeralda-happy-path.spec.ts    # Test del caso feliz para Edge Esmeralda
├── playwright.config.ts                 # Configuración de Playwright
└── README.md                           # Este archivo
```

## Tests Disponibles

### Edge Esmeralda - Happy Path
- **Archivo**: `edge-esmeralda-happy-path.spec.ts`
- **Descripción**: Test que completa todo el formulario de Edge Esmeralda y lo envía exitosamente
- **Cobertura**: 
  - Información personal
  - Detalles profesionales
  - Sección de participación
  - Cónyuges e hijos
  - Solicitud de beca

## Configuración

### Prerrequisitos
1. Node.js instalado
2. Playwright instalado: `npm install -D @playwright/test`
3. Navegadores de Playwright instalados: `npx playwright install`

### Variables de Entorno
El test asume que la aplicación está corriendo en `http://localhost:3000`. Si necesitas cambiar esto, modifica el `baseURL` en `playwright.config.ts`.

## Ejecución

### Ejecutar todos los tests
```bash
npx playwright test
```

### Ejecutar un test específico
```bash
npx playwright test edge-esmeralda-happy-path.spec.ts
```

### Ejecutar en modo headed (con interfaz gráfica)
```bash
npx playwright test --headed
```

### Ejecutar en modo debug
```bash
npx playwright test --debug
```

## Selectores

Los tests utilizan los selectores definidos en `../selectors/applicationSelectors.ts`. Estos selectores están organizados por secciones del formulario y siguen una convención consistente de nomenclatura.

### Ejemplos de uso de selectores:

```typescript
// Información personal
await page.fill(applicationSelectors.personalInformation.firstName, 'John');
await page.selectOption(applicationSelectors.personalInformation.gender, 'Male');

// Detalles profesionales
await page.fill(applicationSelectors.professionalDetails.organization, 'Tech Corp');

// Participación
await page.check(applicationSelectors.participation.builderCheckbox);
```

## Datos de Prueba

El test utiliza datos de prueba realistas pero ficticios:

- **Nombre**: John Doe
- **Email**: john.doe@example.com
- **Organización**: Tech Corp
- **Dirección ETH**: 0x1234567890123456789012345678901234567890

## Mantenimiento

### Agregar nuevos tests
1. Crea un nuevo archivo `.spec.ts` en este directorio
2. Importa los selectores necesarios
3. Sigue la estructura de los tests existentes
4. Documenta el propósito del test en este README

### Actualizar selectores
Si se agregan nuevos campos al formulario:
1. Actualiza `../selectors/applicationSelectors.ts`
2. Actualiza los tests que usen esos selectores
3. Actualiza este README si es necesario

## Troubleshooting

### Test falla con timeout
- Verifica que la aplicación esté corriendo en el puerto correcto
- Aumenta el timeout en la configuración si es necesario
- Verifica que los selectores sean correctos

### Test no encuentra elementos
- Verifica que los `data-testid` estén presentes en los componentes
- Usa `npx playwright test --debug` para inspeccionar la página
- Verifica que la página haya cargado completamente antes de interactuar

### Problemas de navegación
- Verifica que la URL base sea correcta
- Asegúrate de que la ruta `/portal/edge-esmeralda/application` exista
- Verifica que no haya redirecciones inesperadas
