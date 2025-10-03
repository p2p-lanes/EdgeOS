# Passes Test Suite

Esta carpeta contiene todos los tests E2E para la funcionalidad de Passes usando Playwright.

## 📁 Estructura de Carpetas

```
tests/passes/
├── navigation/          # Tests de navegación y tabs
├── product-selection/   # Tests de selección de productos
├── purchase-flow/       # Tests del flujo de compra
├── discount-codes/      # Tests de códigos de descuento
├── responsive/          # Tests de diseño responsivo
├── utils/              # Utilidades y helpers específicos
├── screenshots/        # Screenshots generados por tests
├── fixtures.ts         # Configuración y fixtures globales
└── README.md           # Este archivo
```

## 🧪 Tipos de Tests

### Navigation Tests (`navigation/`)
- **tabs.spec.ts**: Navegación entre tabs, carga de componentes

### Product Selection Tests (`product-selection/`)
- **attendee-tickets.spec.ts**: Selección de productos, expansión de grupos

### Purchase Flow Tests (`purchase-flow/`)
- **total-and-checkout.spec.ts**: Cálculos, totales, finalización de compra

### Discount Code Tests (`discount-codes/`)
- **coupon-application.spec.ts**: Aplicación de cupones, validación

### Responsive Tests (`responsive/`)
- **viewport-tests.spec.ts**: Comportamiento en diferentes tamaños de pantalla

## 🚀 Ejecución de Tests

```bash
# Ejecutar todos los tests de passes
npm run test tests/passes

# Ejecutar un archivo específico
npm run test tests/passes/navigation/tabs.spec.ts

# Ejecutar en modo UI
npm run test:ui tests/passes

# Ejecutar en modo debug
npm run test:debug tests/passes/navigation/tabs.spec.ts

# Ejecutar con browsers específicos
npm run test tests/passes -- --project=chromium
npm run test tests/passes -- --project="Mobile Chrome"
```

## 🛠️ Selectores y Utilidades

Los tests utilizan selectores centralizados definidos en `/tests/utils/passes-selectors.ts`:

```typescript
import { PassesSelectors, PassesTestHelpers } from '../utils';

// Uso de selectores
await page.locator(PassesSelectors.tabs.buyPassesTab).click();

// Uso de helpers
const discountFlow = PassesTestHelpers.getDiscountFlow();
await page.locator(discountFlow.input).fill('TESTCODE');
```

## 📊 Fixtures y Configuración

### Fixtures Personalizados
Los tests pueden usar fixtures personalizados definidos en `fixtures.ts`:

```typescript
import { test } from './fixtures';

test('should test passes functionality', async ({ passesPage }) => {
  await passesPage.navigateWithAuth(TOKEN);
  await passesPage.goToBuyPasses();
});
```

### Test Helpers
Utilidades disponibles en `utils/test-helpers.ts`:

- `PassesPage`: Clase para navegación de páginas
- `TestTokens`: Tokens de autenticación para tests  
- `TestData`: Datos de prueba (códigos de descuento, IDs, etc.)
- `TestHelpers`: Funciones utilitarias

## 🎯 Patrones de Testing

### Test Robusto
Los tests están diseñados para ser robustos usando:

```typescript
// Verificar si elemento existe antes de interactuar
if (await element.count() > 0) {
  await expect(element).toBeVisible();
  await element.click();
}

// Usar helpers para verificación de existencia
const exists = await TestHelpers.elementExists(page, selector);
if (exists) {
  await TestHelpers.clickIfExists(page, selector);
}
```

### Manejo de Estados Dinámicos
Los tests manejan diferentes estados de la aplicación:

```typescript
// Verificar si hay productos seleccionados
const purchaseSection = page.locator(PassesSelectors.purchase.staticSection);
if (await purchaseSection.count() > 0) {
  // Ejecutar flujo de compra
}

// Verificar si hay descuentos disponibles
const discountTrigger = page.locator(PassesSelectors.discountCode.haveCouponTrigger);
if (await discountTrigger.count() > 0) {
  // Probar funcionalidad de descuentos
}
```

## 📸 Screenshots y Debugging

### Screenshots Automáticos
Los tests toman screenshots automáticamente en:
- Fallos de tests
- Tests de responsive design
- Puntos críticos del flujo

### Debugging
Para debuggear tests:

```bash
# Modo debug con breakpoints
npm run test:debug tests/passes/navigation/tabs.spec.ts

# Modo headed (ver browser)
npm run test:headed tests/passes

# Ver trace de tests fallidos
npx playwright show-trace test-results/trace.zip
```

## 🔧 Configuración de Viewport

Los tests responsive verifican estos viewports:

- **Mobile**: 375x667 (iPhone)
- **Tablet**: 768x1024 (iPad)  
- **Desktop**: 1280x800 (Laptop)
- **Large Desktop**: 1920x1080 (Monitor)

## 📝 Convenciones

### Nomenclatura de Tests
- Usar `describe` para agrupar funcionalidades relacionadas
- Usar `test` descriptivos: `'should display total when products selected'`
- Prefijo de archivos: `*.spec.ts`

### Selectores
- Usar data-testid para elementos de test
- Nomenclatura consistente: `component-action-element`
- Agrupar por componente en PassesSelectors

### Assertions
- Usar `toBeVisible()` para elementos que deben estar visibles
- Usar `toContainText()` para verificar contenido
- Usar `toBeEnabled()/toBeDisabled()` para estado de elementos

## 🐛 Troubleshooting

### Tests Intermitentes
Si encuentras tests intermitentes:

1. Agregar `waitForTimeout()` o `waitForLoadState()`
2. Verificar selectores con `count() > 0` antes de interactuar
3. Usar `waitFor()` en elementos dinámicos

### Elementos No Encontrados
1. Verificar que data-testid esté correctamente implementado
2. Usar inspector de Playwright: `npx playwright codegen`
3. Verificar que el elemento esté visible en el momento del test

### Autenticación
1. Verificar que token de test sea válido
2. Comprobar que la navegación a `/portal` sea exitosa
3. Verificar permisos del usuario de test
