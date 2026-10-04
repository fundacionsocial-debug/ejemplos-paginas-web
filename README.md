# Ejemplos de páginas web — catálogo de venta

**En vivo:** https://ejemplos-paginas-web.vercel.app

Página para mostrarle a un cliente la diferencia entre los tres niveles de página web
que ofrezco, con ejemplos **reales y navegables** en vez de explicaciones.

Pensada para compartir pantalla en una videollamada: el cliente ve, oprime y entiende
solo por qué una cuesta $600.000 y otra $2.000.000.

## Qué contiene

Los tres niveles son **el mismo negocio** (Guayacán, un taller ficticio de carpintería y
construcción en madera) hecho a tres presupuestos distintos, para que la diferencia se vea sola.

| Archivo | Qué muestra |
|---|---|
| `index.html` | El catálogo: tres pestañas, la página en vivo en un recuadro, la tabla lado a lado y lo que va aparte |
| `demos/nivel-1-sencilla.html` | **Nivel 1 · $600.000** — una sola página, botón de WhatsApp |
| `demos/nivel-2-completa.html` | **Nivel 2 · $1.200.000** — menú, galería filtrable con foto en grande, boceto que se vuelve obra, testimonios, preguntas, formulario que muestra cómo le llega al dueño |
| `demos/nivel-3-con-sistema.html` | **Nivel 3 · desde $2.000.000** — diseñador de muebles en vivo, calculadora de obra con la casa construyéndose, agenda, seguimiento de obra con código y **panel del dueño** |
| `demos/pasteleria-*.html` | Los niveles 2 y 3 en otro rubro, para mostrar que no es plantilla repetida |
| `demos/carpinteria-*.html` | Solo redirigen a los niveles nuevos (eran los ejemplos de septiembre) |

## Cómo usarla en la reunión

1. Abrir la página. Contar los tres niveles con las pestañas: cada una muestra el precio,
   lo que incluye y la página corriendo en vivo en el recuadro.
2. **Entrar a la página** (botón dorado o clic en el recuadro): el recuadro crece hasta
   llenar la pantalla. Arriba queda una barrita para pasar de un nivel a otro, ver la
   página **en celular** y volver al catálogo (también con la tecla Esc).
3. **Nivel 1** — bajar hasta el final y oprimir el botón verde. "Esto informa."
4. **Nivel 2** — filtrar los proyectos, abrir una foto, arrastrar el boceto, llenar el
   formulario. "Esto ya trabaja un poco."
5. **Nivel 3** — esto es lo que vende, hacerlo en vivo:
   - diseñar un mueble: cambiar la madera (se pega como una chapa) y ver el precio moverse
   - oprimir **Enviar esta cotización**
   - calcular una casa y oprimir **Ver cómo se construye**
   - agendar una visita
   - **Siga su obra** se demuestra solo (teclea el código GY-2417)
   - abrir el **Panel del dueño** (botón dorado de la barrita): ahí está todo lo que se
     acaba de hacer, resaltado en oro con la etiqueta «Usted»
6. Cerrar con la pastelería, para dejar claro que no es una plantilla repetida.

## Notas técnicas

- HTML, CSS y JavaScript puros. Sin dependencias, sin compilación, sin servidor.
- Las páginas de ejemplo corren dentro del catálogo en iframes del mismo sitio; al entrar,
  el mismo recuadro se agranda con transformaciones (no se recarga nada).
- El catálogo usa la letra de los kits de GEMB (League Spartan y Glacial Indifference,
  licencia SIL OFL, en `assets/fuentes/`).
- Las fotos se hicieron con GPT Image 2.5 (Sunburst, calidad alta) en el Azure de la
  fundación el 4 oct 2026: 25 fotos por US$1,10. Las originales en JPG están en
  `_originales/` (fuera de git y de Vercel) con el lote en `lote-fotos.json`; las que usa
  la página están en `assets/img/` en WebP, en 1600 y 800 px.
- Los datos del panel son de mentira y viven en la memoria del navegador: al recargar
  vuelven al inicio, que es justo lo que conviene entre una reunión y otra.
- Los negocios, precios y testimonios son ficticios; está advertido en el pie de cada página.
- Al cambiar un `.css` o `.js`, subir el número `?v=` en el HTML que lo carga, para que el
  navegador no muestre la versión vieja guardada.
