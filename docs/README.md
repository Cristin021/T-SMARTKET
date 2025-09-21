# T‑SMARTKET — Market Canasta & Tecnología

Proyecto web estático listo para abrir con doble clic en `index.html`. Incluye catálogo con búsqueda, filtros, ofertas, detalle de producto y botón “Comprar por WhatsApp”.

## Cómo abrir

- **Opción A (recomendada):** Doble clic en `index.html`. Si tu navegador bloquea la carga del JSON local (política de `file://`), la app mostrará un **respaldo mínimo embebido** y verás un mensaje informativo arriba del grid.
- **Opción B:** Usa una extensión tipo *Live Server* (VS Code) o cualquier servidor estático. No es obligatorio, pero permitirá leer `data/productos.json` sin restricciones.

## Estructura de carpetas

```
market-canasta-tecnologia/
├─ index.html
├─ css/
│  └─ styles.css
├─ js/
│  ├─ app.js
│  ├─ filtros.js
│  ├─ ui.js
│  └─ utils.js
├─ data/
│  ├─ productos.json
│  └─ productos.xlsx
├─ assets/
│  ├─ img/
│  │  ├─ canasta/
│  │  └─ tecnologia/
│  └─ logos/
│     └─ logo.png
└─ docs/
   ├─ README.md
   └─ LICENCIA.txt
```

## Logo

Coloca tu logo en `assets/logos/logo.png`. El header también muestra el nombre **T‑SMARTKET** como texto.

## WhatsApp

El botón **Comprar por WhatsApp** abre en una nueva pestaña a `https://wa.me/573114140899` con el mensaje EXACTO:

```
Hola quiero comprar el producto [NOMBRE] de precio [COP] regálame el link de pago muchas gracias
```

Se usa `encodeURIComponent` para el texto y el precio se formatea en COP.

## Catálogo

- ≥ 120 productos (≈ Canasta 60 / Tecnología 60). 
- Campos: `id, nombre, categoria, subcategoria, descripcion, precioCOP, precioAnteriorCOP (opcional), stock, marca, sku, imagen, destacado`.
- Si `stock === 0`: se muestra **Agotado** y el botón de compra queda deshabilitado.
- Hay ≥ 20 productos en **Oferta** (`precioAnteriorCOP` presente).
- `productos.json` y `productos.xlsx` están **alineados** (mismos IDs y columnas).

## Búsqueda, filtros y orden

- Búsqueda en tiempo real por **nombre**, **marca**, **categoría** y **subcategoría**.
- Filtros: Categoría, Subcategoría, Marca, Precio mínimo/máximo, Disponibilidad.
- Orden: Relevancia (destacados primero), Precio ↑/↓, Más vendidos (ficticio).
- Paginación progresiva con botón **Cargar más**.
- **Opcional**: se preserva el estado de filtros en la URL como query params.

## Accesibilidad y responsive

- Etiquetas ARIA básicas, navegación con teclado (Enter abre detalle).
- Diseño responsive: móvil, tablet y escritorio.

## Actualizar el catálogo

1. Edita `data/productos.json` con tus nuevos productos.
2. Abre `data/productos.xlsx` si prefieres editar en Excel y mantén las mismas columnas.
3. Asegúrate de que tus rutas de `imagen` apunten a archivos existentes dentro de `assets/img/...`.

## Licencia

Ver `docs/LICENCIA.txt`.
