# Ejemplos de páginas web — catálogo de venta

**En vivo:** https://ejemplos-paginas-web.vercel.app

Página para mostrarle a un cliente la diferencia entre los tres niveles de página web
que ofrezco, con ejemplos **reales y navegables** en vez de explicaciones.

Pensada para compartir pantalla en una videollamada: el cliente ve, oprime y entiende
solo por qué una cuesta $600.000 y otra $2.000.000.

## Qué contiene

| Archivo | Qué muestra |
|---|---|
| `index.html` | El catálogo: los tres niveles, la tabla comparativa y lo que va aparte |
| `demos/carpinteria-basica.html` | **Nivel 1** — una sola página, botón de WhatsApp |
| `demos/carpinteria-completa.html` | **Nivel 2** — menú, galería filtrable, formulario, testimonios |
| `demos/carpinteria-premium.html` | **Nivel 3** — cotizador automático, agenda de visitas y panel del dueño |
| `demos/pasteleria-completa.html` | **Nivel 2** en otro rubro (otra paleta, otra forma) |
| `demos/pasteleria-premium.html` | **Nivel 3** — carrito, fecha de entrega y panel de pedidos |

## Cómo usarla en la reunión

1. Abrir `index.html` y explicar los tres niveles con la tabla comparativa.
2. Abrir el **nivel 1** — se ve digno pero simple. "Esto informa."
3. Abrir el **nivel 2** — filtrar la galería, llenar el formulario. "Esto ya trabaja un poco."
4. Abrir el **nivel 3** y hacer esto en vivo, que es lo que vende:
   - mover el cotizador y que vean el precio cambiar solo
   - oprimir **Enviar esta cotización**
   - agendar una visita
   - oprimir **🔐 Ver el panel del dueño** — y ahí está todo lo que acaban de hacer
5. Cerrar con la pastelería, para dejar claro que no es una plantilla repetida.

Cada demo tiene arriba una barra negra con **← Volver al catálogo** y un botón para
ocultarla, por si se quiere mostrar la página limpia.

## Notas técnicas

- HTML, CSS y JavaScript puros. Sin dependencias, sin compilación, sin servidor.
- Las fotos vienen de Unsplash y se reemplazan por las del negocio real.
- Los datos de los paneles son de mentira, en memoria. Al recargar vuelven al inicio.
- Los negocios, precios y testimonios son ficticios; está advertido en el pie de cada página.
