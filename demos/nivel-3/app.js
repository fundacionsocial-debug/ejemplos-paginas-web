/* Guayacán · nivel 3. Todo corre en el navegador: el diseñador de muebles, la calculadora de
   obra, la agenda y el seguimiento. Lo que la persona hace cae en el panel del dueño (panel.js). */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var IMG = "../assets/img/";
  var POCO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FINO = window.matchMedia("(pointer: fine)").matches;
  var EMBEBIDA = document.documentElement.classList.contains("en-catalogo");
  var P = window.Panel, D = window.Dibujos;
  var pesos = P.pesos;

  /* ─────────── Barra de demostración y entrada ─────────── */
  function altoBarra() {
    var b = $("#demobar"), h = b && getComputedStyle(b).display !== "none" ? b.offsetHeight : 0;
    document.documentElement.style.setProperty("--alto-barra", h + "px");
  }
  altoBarra(); window.addEventListener("resize", altoBarra);

  window.__ocupado = true;
  var intro = $("#intro"), cuenta = $("#intro-n");
  (function () {
    var t0 = null, dur = POCO ? 200 : 1700;
    requestAnimationFrame(function paso(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      cuenta.textContent = Math.round(100 * (1 - Math.pow(1 - p, 3)));
      if (p < 1) return requestAnimationFrame(paso);
      setTimeout(function () {
        intro.classList.add("abre");
        document.body.classList.remove("intro-activa");
        document.body.classList.add("lista");
        setTimeout(function () { intro.style.display = "none"; window.__ocupado = false; }, 1200);
      }, POCO ? 0 : 250);
    });
    // red de seguridad: si la pestaña estaba escondida, requestAnimationFrame no corre
    setTimeout(function () { if (!document.body.classList.contains("lista")) { intro.classList.add("abre"); document.body.classList.remove("intro-activa"); document.body.classList.add("lista"); window.__ocupado = false; setTimeout(function () { intro.style.display = "none"; }, 1200); } }, 4500);
  })();
  /* El catálogo la llama cuando la vuelve a mostrar: repite la entrada del titular. */
  window.alMostrarse = function () {
    if (!document.body.classList.contains("lista")) return;
    document.body.classList.remove("lista"); void document.body.offsetWidth; document.body.classList.add("lista");
  };

  /* ─────────── Luz del cursor, botones magnéticos, menú ─────────── */
  var luz = $("#luz-cursor");
  if (FINO) window.addEventListener("pointermove", function (e) { luz.style.setProperty("--x", e.clientX + "px"); luz.style.setProperty("--y", e.clientY + "px"); }, { passive: true });
  if (FINO && !POCO) $$(".magnetico").forEach(function (b) {
    b.addEventListener("pointermove", function (e) { var r = b.getBoundingClientRect(); b.style.transform = "translate(" + ((e.clientX - r.left - r.width / 2) * 0.18) + "px," + ((e.clientY - r.top - r.height / 2) * 0.3) + "px)"; });
    b.addEventListener("pointerleave", function () { b.style.transform = ""; });
  });
  var nav = $("#nav"), ultimoY = 0;
  function alBajar() {
    var y = window.scrollY;
    nav.classList.toggle("solida", y > 40);
    nav.classList.toggle("oculta", y > innerHeight && y > ultimoY + 4 && !P.abierto());
    if (y < ultimoY - 4) nav.classList.remove("oculta");
    ultimoY = y;
    plano();
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(alBajar); }, { passive: true });

  /* Lo que dice el aviso «en vivo» de la portada */
  var VIVO = ["3 obras en curso · 7 visitas esta semana", "Última cotización: hace 12 minutos, desde Cajicá", "La visita de medición no tiene costo"], iv = 0;
  setInterval(function () {
    var t = $("#vivo-texto"); t.style.transition = "opacity .4s"; t.style.opacity = 0;
    setTimeout(function () { iv = (iv + 1) % VIVO.length; t.textContent = VIVO[iv]; t.style.opacity = 1; }, 420);
  }, 4200);

  /* Cinta de servicios */
  var anillo = '<svg viewBox="-12 -12 24 24"><circle r="3"/><circle r="7"/><circle r="10.5"/></svg>';
  var cosas = ["Camas", "Closets", "Cocinas", "<em>Escaleras</em>", "Puertas", "Decks", "<em>Cabañas</em>", "Casas completas"];
  var tramo = cosas.map(function (c) { return "<span>" + c + anillo + "</span>"; }).join("");
  $("#cinta").innerHTML = tramo + tramo;

  /* Aparecer al bajar */
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.1 });
  $$(".rev").forEach(function (el) { io.observe(el); });

  /* ─────────── Del plano a la obra ─────────── */
  var pSec = $("#plano"), pSvg = $("#plano-svg"), pLienzo = $(".plano-lienzo"), pTrazos = [], pasoActual = -1;
  pSvg.innerHTML = D.plano();
  $$("path, rect, line", pSvg).forEach(function (el) {
    var L = el.getTotalLength ? el.getTotalLength() : 1000;
    el.style.strokeDasharray = L; el.style.strokeDashoffset = L; pTrazos.push([el, L]);
  });
  var pTextos = $$("text", pSvg);
  function limite(v) { return Math.max(0, Math.min(1, v)); }
  function plano() {
    var r = pSec.getBoundingClientRect(), total = pSec.offsetHeight - innerHeight;
    if (r.bottom < -100 || r.top > innerHeight + 100) return;
    var p = limite(-r.top / total);
    var dibujo = limite(p / 0.5);
    pTrazos.forEach(function (t, i) { var d = limite(dibujo * 1.25 - i / pTrazos.length * 0.25); t[0].style.strokeDashoffset = t[1] * (1 - d); });
    pTextos.forEach(function (t) { t.style.opacity = limite((dibujo - 0.6) / 0.3); });
    var foto = limite((p - 0.5) / 0.3);
    pLienzo.style.setProperty("--foto", foto);
    pLienzo.style.setProperty("--rejilla", 1 - foto);
    pLienzo.style.setProperty("--lineas", 1 - limite((p - 0.72) / 0.2) * 0.9);
    $("#plano-pct").textContent = Math.round(limite(p / 0.86) * 100);
    var paso = p < 0.33 ? 0 : p < 0.64 ? 1 : 2;
    if (paso !== pasoActual) { pasoActual = paso; $$(".plano-paso").forEach(function (x, i) { x.classList.toggle("on", i === paso); }); }
  }
  plano();

  /* ─────────── Diseñador de muebles ─────────── */
  var ICONOS = {
    cama: '<svg viewBox="0 0 40 40"><path d="M5 31V12M35 31V21M5 25h30M5 21h30M8 21v-4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v4"/></svg>',
    closet: '<svg viewBox="0 0 40 40"><rect x="8" y="5" width="24" height="30" rx="1.5"/><path d="M20 5v30M17 18v5M23 18v5"/></svg>',
    comedor: '<svg viewBox="0 0 40 40"><path d="M4 16h32M8 16v17M32 16v17M14 16V8M26 16V8"/></svg>',
    cocina: '<svg viewBox="0 0 40 40"><rect x="4" y="20" width="32" height="14" rx="1"/><rect x="4" y="5" width="32" height="9" rx="1"/><path d="M15 20v14M25 20v14M3 20h34"/></svg>'
  };
  var PIEZAS = {
    cama: { nombre: "Cama", medida: { tipo: "seg", ops: [["sencilla", "Sencilla", "1,00 m"], ["semidoble", "Semidoble", "1,20 m"], ["doble", "Doble", "1,40 m"], ["queen", "Queen", "1,60 m"], ["king", "King", "2,00 m"]], def: "doble" },
      extras: [["tapizado", "Cabecero tapizado", 420000], ["cajones", "Cajones bajo la cama", 580000], ["mesitas", "Par de mesas de noche", 690000], ["led", "Luz cálida en el cabecero", 180000]],
      base: function (c) { return { sencilla: 1150000, semidoble: 1300000, doble: 1450000, queen: 1650000, king: 1950000 }[c.medida]; }, semanas: 3,
      titulo: function (c) { return "Cama " + c.medida; } },
    closet: { nombre: "Closet", medida: { tipo: "rango", min: 1, max: 4, paso: 0.1, def: 2.4, unidad: "m de ancho" },
      extras: [["corredizas", "Puertas corredizas", 380000], ["espejo", "Puerta con espejo", 260000], ["altillo", "Maletero arriba", function (c) { return Math.round(c.medida * 160000 / 1e4) * 1e4; }], ["led", "Luz por dentro", 240000]],
      base: function (c) { return c.medida * 1050000; }, semanas: function (c) { return c.medida > 3 ? 4 : 3; },
      titulo: function (c) { return "Closet de " + String(c.medida.toFixed(1)).replace(".", ",") + " m"; } },
    comedor: { nombre: "Comedor", medida: { tipo: "seg", ops: [[4, "4", "puestos"], [6, "6", "puestos"], [8, "8", "puestos"], [10, "10", "puestos"]], def: 6 },
      extras: [["sillas", "Sillas a juego", function (c) { return 290000 * c.medida; }], ["borde", "Borde natural del árbol", 450000], ["metalica", "Base en hierro negro", 520000], ["vidrio", "Vidrio protector", 310000]],
      base: function (c) { return { 4: 1250000, 6: 1650000, 8: 2100000, 10: 2600000 }[c.medida]; }, semanas: 3,
      titulo: function (c) { return "Comedor de " + c.medida + " puestos"; } },
    cocina: { nombre: "Cocina", medida: { tipo: "rango", min: 2, max: 6, paso: 0.2, def: 3.6, unidad: "m lineales" },
      extras: [["cuarzo", "Mesón en cuarzo blanco", function (c) { return Math.round(c.medida * 330000 / 1e4) * 1e4; }], ["techo", "Alacenas hasta el techo", function (c) { return Math.round(c.medida * 160000 / 1e4) * 1e4; }], ["luz", "Luz bajo las alacenas", 240000], ["cajones", "Cajones con cierre lento", 350000]],
      base: function (c) { return c.medida * 1350000; }, semanas: 5,
      titulo: function (c) { return "Cocina de " + String(c.medida.toFixed(1)).replace(".", ",") + " m"; } }
  };
  var MADERAS = { pino: { n: "Pino", f: 1, nota: "económica, clara" }, cedro: { n: "Cedro", f: 1.25, nota: "rojiza y aromática" }, roble: { n: "Roble", f: 1.55, nota: "resistente, color miel" }, nogal: { n: "Nogal", f: 1.85, nota: "oscura y fina" }, guayacan: { n: "Guayacán", f: 2.15, nota: "la más dura de todas" } };
  var ACABADOS = { natural: { n: "Aceite natural", s: "realza la veta", f: 1 }, mate: { n: "Laca mate", s: "no brilla", f: 1.08 }, laca: { n: "Laca brillante", s: "brillo de espejo", f: 1.16 } };
  var cfg = { pieza: "cama", madera: "nogal", acabado: "natural", medida: "doble", extras: { led: true } };
  var memoria = {};   // lo que la persona había escogido en cada pieza

  var svgM = $("#mueble-svg");
  svgM.innerHTML = D.defs() + '<defs><clipPath id="corte-barrido"><rect id="corte-rect" x="0" y="0" width="0" height="560"/></clipPath></defs><g id="capa-mueble"></g><line id="linea-barrido" x1="0" y1="20" x2="0" y2="540" stroke="#f2cf8f" stroke-width="2" opacity="0"/>';
  var capaM = $("#capa-mueble");

  function valorExtra(e, c) { return typeof e[2] === "function" ? e[2](c) : e[2]; }
  function precio(c) {
    var p = PIEZAS[c.pieza], t = p.base(c) * MADERAS[c.madera].f;
    p.extras.forEach(function (e) { if (c.extras[e[0]]) t += valorExtra(e, c); });
    return Math.round(t * ACABADOS[c.acabado].f / 1e4) * 1e4;
  }
  function semanas(c) {
    var p = PIEZAS[c.pieza], s = typeof p.semanas === "function" ? p.semanas(c) : p.semanas;
    return s + (c.madera === "guayacan" || c.madera === "nogal" ? 1 : 0);
  }
  function titulo(c) { return PIEZAS[c.pieza].titulo(c) + " en " + MADERAS[c.madera].n.toLowerCase(); }

  /* Los controles */
  $("#piezas").innerHTML = Object.keys(PIEZAS).map(function (k) { return '<button class="pieza" data-pieza="' + k + '">' + ICONOS[k] + PIEZAS[k].nombre + "</button>"; }).join("");
  $("#maderas").innerHTML = Object.keys(MADERAS).map(function (k) { return '<button class="madera" data-madera="' + k + '" title="' + MADERAS[k].nota + '"><i style="background-image:url(' + IMG + "madera-" + k + '-512.webp)"></i>' + MADERAS[k].n + "</button>"; }).join("");
  $("#acabados").innerHTML = Object.keys(ACABADOS).map(function (k) { return '<button class="acabado" data-acabado="' + k + '">' + ACABADOS[k].n + "<small>" + ACABADOS[k].s + "</small></button>"; }).join("");

  function pintarMedida() {
    var m = PIEZAS[cfg.pieza].medida, caja = $("#medida");
    if (m.tipo === "seg") {
      caja.innerHTML = '<div class="segmentos">' + m.ops.map(function (o) { return '<button data-medida="' + o[0] + '">' + o[1] + "</button>"; }).join("") + "</div>";
      $$("[data-medida]", caja).forEach(function (b) { b.addEventListener("click", function () { cfg.medida = isNaN(+b.dataset.medida) ? b.dataset.medida : +b.dataset.medida; actualizar("medida"); }); });
    } else {
      caja.innerHTML = '<input type="range" class="deslizador" min="' + m.min + '" max="' + m.max + '" step="' + m.paso + '" value="' + cfg.medida + '"><div class="deslizador-marcas"><span>' + m.min + " m</span><span>" + m.max + " m</span></div>";
      var r = $("input", caja);
      r.addEventListener("input", function () { cfg.medida = +r.value; actualizar("medida"); });
    }
  }
  function pintarExtras() {
    $("#extras").innerHTML = PIEZAS[cfg.pieza].extras.map(function (e) {
      return '<button class="extra" data-extra="' + e[0] + '"><span class="interruptor"></span>' + e[1] + '<span class="mas" data-mas="' + e[0] + '"></span></button>';
    }).join("");
    $$("[data-extra]").forEach(function (b) { b.addEventListener("click", function () { cfg.extras[b.dataset.extra] = !cfg.extras[b.dataset.extra]; actualizar("extra"); }); });
  }
  $$("[data-pieza]").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.dataset.pieza === cfg.pieza) return;
      memoria[cfg.pieza] = { medida: cfg.medida, extras: cfg.extras };
      cfg.pieza = b.dataset.pieza;
      var m = memoria[cfg.pieza];
      cfg.medida = m ? m.medida : PIEZAS[cfg.pieza].medida.def;
      cfg.extras = m ? m.extras : {};
      pintarMedida(); pintarExtras(); actualizar("pieza");
    });
  });
  $$("[data-madera]").forEach(function (b) { b.addEventListener("click", function () { if (cfg.madera === b.dataset.madera) return; cfg.madera = b.dataset.madera; actualizar("madera"); }); });
  $$("[data-acabado]").forEach(function (b) { b.addEventListener("click", function () { cfg.acabado = b.dataset.acabado; actualizar("acabado"); }); });

  /* El precio no salta: cuenta hasta el valor nuevo */
  var precioMostrado = 0, animPrecio = null;
  function mostrarPrecio(fin) {
    var ini = precioMostrado, t0 = null;
    cancelAnimationFrame(animPrecio);
    animPrecio = requestAnimationFrame(function paso(t) {
      if (!t0) t0 = t;
      var p = POCO ? 1 : Math.min(1, (t - t0) / 650), v = ini + (fin - ini) * (1 - Math.pow(1 - p, 3));
      precioMostrado = v;
      $("#total").textContent = pesos(Math.round(v / 1000) * 1000);
      $("#precio-escenario").textContent = pesos(Math.round(v / 1000) * 1000);
      if (p < 1) animPrecio = requestAnimationFrame(paso);
    });
  }

  /* La madera nueva entra como una chapa que se pega de izquierda a derecha */
  var barriendo = null;
  function dibujar(motivo) {
    var html = D.mueble(cfg);
    if (motivo === "madera" && !POCO && capaM.firstChild) {
      cancelAnimationFrame(barriendo);
      $$(".capa-vieja", capaM).forEach(function (g) { g.remove(); });
      var vieja = capaM.firstElementChild; if (vieja) vieja.setAttribute("class", "capa-vieja");
      var g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.innerHTML = html; g.setAttribute("clip-path", "url(#corte-barrido)");
      capaM.appendChild(g);
      var rect = $("#corte-rect"), lin = $("#linea-barrido"), t0 = null;
      lin.setAttribute("opacity", ".9");
      barriendo = requestAnimationFrame(function paso(t) {
        if (!t0) t0 = t;
        var p = Math.min(1, (t - t0) / 750), e = 1 - Math.pow(1 - p, 3), x = 120 + e * 680;
        rect.setAttribute("width", p >= 1 ? 900 : x);
        lin.setAttribute("x1", x); lin.setAttribute("x2", x); lin.setAttribute("opacity", p >= 1 ? 0 : 0.9 * (1 - p * 0.6));
        if (p < 1) barriendo = requestAnimationFrame(paso);
        else { if (vieja && vieja.parentNode) vieja.remove(); g.removeAttribute("clip-path"); }
      });
    } else {
      capaM.innerHTML = '<g class="' + (motivo === "medida" ? "" : "capa-nueva") + '">' + html + "</g>";
    }
  }

  function actualizar(motivo) {
    $$("[data-pieza]").forEach(function (b) { b.classList.toggle("on", b.dataset.pieza === cfg.pieza); });
    $$("[data-madera]").forEach(function (b) { b.classList.toggle("on", b.dataset.madera === cfg.madera); });
    $$("[data-acabado]").forEach(function (b) { b.classList.toggle("on", b.dataset.acabado === cfg.acabado); });
    $$("[data-medida]").forEach(function (b) { b.classList.toggle("on", String(b.dataset.medida) === String(cfg.medida)); });
    $$("[data-extra]").forEach(function (b) { b.classList.toggle("on", !!cfg.extras[b.dataset.extra]); });
    PIEZAS[cfg.pieza].extras.forEach(function (e) { var s = $('[data-mas="' + e[0] + '"]'); if (s) s.textContent = "+" + pesos(valorExtra(e, cfg)); });
    var m = PIEZAS[cfg.pieza].medida, r = $("#medida input");
    if (m.tipo === "rango") {
      $("#medida-valor").textContent = String(cfg.medida.toFixed(1)).replace(".", ",") + " " + m.unidad;
      if (r) r.style.setProperty("--p", ((cfg.medida - m.min) / (m.max - m.min) * 100) + "%");
    } else {
      var op = m.ops.filter(function (o) { return String(o[0]) === String(cfg.medida); })[0];
      $("#medida-valor").textContent = op[1] === String(op[0]) ? op[0] + " " + op[2] : op[2];
    }
    $("#madera-nota").textContent = MADERAS[cfg.madera].nota;
    $("#ficha").textContent = PIEZAS[cfg.pieza].titulo(cfg) + " · " + MADERAS[cfg.madera].n + " · " + ACABADOS[cfg.acabado].n;
    var s = semanas(cfg);
    $("#semanas-escenario").textContent = "Listo en " + s + " semanas";
    $("#total-nota").textContent = "Listo en " + s + " semanas · se confirma en la visita de medición";
    dibujar(motivo);
    mostrarPrecio(precio(cfg));
  }
  pintarMedida(); pintarExtras(); actualizar("inicio");

  /* Enviar la cotización */
  var veloC = $("#velo-cotizar");
  $("#enviar-cotizacion").addEventListener("click", function () {
    $("#vc-titulo").textContent = titulo(cfg);
    $("#vc-precio").textContent = pesos(precio(cfg));
    abrirVelo(veloC);
    setTimeout(function () { $("#c-nombre").focus(); }, 350);
  });
  $("#form-cotizar").addEventListener("submit", function (e) {
    e.preventDefault();
    var nombre = $("#c-nombre").value.trim() || "Cliente de la demostración", cel = $("#c-cel").value.trim() || "300 000 0000";
    var extras = PIEZAS[cfg.pieza].extras.filter(function (x) { return cfg.extras[x[0]]; }).map(function (x) { return x[1].toLowerCase(); });
    P.agregarCotizacion({ cliente: nombre, cel: cel, item: PIEZAS[cfg.pieza].titulo(cfg) + " · " + MADERAS[cfg.madera].n.toLowerCase() + " · " + ACABADOS[cfg.acabado].n.toLowerCase() + (extras.length ? " · " + extras.join(", ") : ""), valor: precio(cfg) });
    cerrarVelo(veloC);
    aviso("Cotización enviada", "Don Jairo ya la tiene en su panel, con el mueble, la madera y el precio. Nadie tuvo que contestar el teléfono.", true);
  });

  /* ─────────── Calculadora de obra ─────────── */
  var TIPOS = {
    casa: { n: "Casa nueva", s: "en madera, llave en mano", m2: { basico: 1650000, estandar: 2100000, premium: 2900000 }, sem: function (a) { return 8 + a / 6; },
      fases: [["Diseño y licencias", 0.12, ["f-plano"]], ["Cimientos", 0.13, ["f-cimientos"]], ["Estructura", 0.22, ["f-estructura"]], ["Techo", 0.12, ["f-techo"]], ["Cerramiento", 0.14, ["f-muros"]], ["Acabados", 0.21, ["f-ventanas"]], ["Entrega", 0.06, ["f-entrega"]]],
      icono: '<svg viewBox="0 0 32 32"><path d="M3 15 16 4l13 11M7 12v16h18V12M13 28v-8h6v8"/></svg>' },
    cabana: { n: "Cabaña", s: "campestre, en madera", m2: { basico: 1400000, estandar: 1800000, premium: 2400000 }, sem: function (a) { return 5 + a / 9; },
      fases: [["Diseño y licencias", 0.12, ["f-plano"]], ["Cimientos", 0.12, ["f-cimientos"]], ["Estructura", 0.24, ["f-estructura"]], ["Techo", 0.14, ["f-techo"]], ["Cerramiento", 0.13, ["f-muros"]], ["Acabados", 0.19, ["f-ventanas"]], ["Entrega", 0.06, ["f-entrega"]]],
      icono: '<svg viewBox="0 0 32 32"><path d="M16 3 4 28h24zM12 28v-7h8v7M16 11v4"/></svg>' },
    segundo: { n: "Segundo piso", s: "sobre la casa que ya tiene", m2: { basico: 1500000, estandar: 1950000, premium: 2600000 }, sem: function (a) { return 6 + a / 8; },
      fases: [["Diseño y licencias", 0.14, ["f-plano"]], ["Refuerzo de placa", 0.1, ["f-cimientos"]], ["Estructura", 0.24, ["f-estructura"]], ["Techo", 0.12, ["f-techo"]], ["Cerramiento", 0.13, ["f-muros"]], ["Acabados", 0.21, ["f-ventanas"]], ["Entrega", 0.06, ["f-entrega"]]],
      icono: '<svg viewBox="0 0 32 32"><path d="M5 28V18h22v10M5 18V9l11-6 11 6v9M12 13h8" /></svg>' },
    remodelacion: { n: "Remodelación", s: "cocinas, baños, pisos", m2: { basico: 650000, estandar: 900000, premium: 1300000 }, sem: function (a) { return 2 + a / 15; },
      fases: [["Diseño", 0.15, ["f-plano"]], ["Demolición", 0.12, ["f-cimientos", "f-estructura", "f-muros", "f-techo"]], ["Obra gris", 0.25, ["f-ventanas"]], ["Instalaciones", 0.18, []], ["Acabados", 0.24, []], ["Entrega", 0.06, ["f-entrega"]]],
      icono: '<svg viewBox="0 0 32 32"><path d="M20 4l8 8-14 14H6v-8zM16 8l8 8"/></svg>' }
  };
  var obra = { tipo: "casa", area: 120, pisos: 2, acabado: "estandar" };
  var casaSvg = $("#casa-svg"), escena = $(".casa-escena"), construyendo = false;
  $("#tipos").innerHTML = Object.keys(TIPOS).map(function (k) { return '<button class="tipo" data-tipo="' + k + '">' + TIPOS[k].icono + "<b>" + TIPOS[k].n + "</b><small>" + TIPOS[k].s + "</small></button>"; }).join("");
  $$("[data-tipo]").forEach(function (b) { b.addEventListener("click", function () { obra.tipo = b.dataset.tipo; calcular(); }); });
  var area = $("#area");
  area.addEventListener("input", function () { obra.area = +area.value; calcular(); });
  $$("#pisos button").forEach(function (b) { b.addEventListener("click", function () { obra.pisos = +b.dataset.v; calcular(); }); });
  $$("#nivel-acabado button").forEach(function (b) { b.addEventListener("click", function () { obra.acabado = b.dataset.v; calcular(); }); });

  function millones(n) { var m = n / 1e6; return "$" + (m >= 100 ? Math.round(m).toLocaleString("es-CO") : m.toFixed(1).replace(".", ",")) + " millones"; }
  function semanasObra() { var t = TIPOS[obra.tipo]; return Math.round(t.sem(obra.area) * (obra.acabado === "premium" ? 1.15 : obra.acabado === "basico" ? 0.92 : 1)); }
  function calcular() {
    if (construyendo) pararConstruccion();
    var t = TIPOS[obra.tipo];
    $$("[data-tipo]").forEach(function (b) { b.classList.toggle("on", b.dataset.tipo === obra.tipo); });
    $$("#pisos button").forEach(function (b) { b.classList.toggle("on", +b.dataset.v === obra.pisos); b.disabled = obra.tipo === "segundo" && +b.dataset.v === 1; });
    if (obra.tipo === "segundo" && obra.pisos === 1) { obra.pisos = 2; $$("#pisos button").forEach(function (b) { b.classList.toggle("on", +b.dataset.v === 2); }); }
    $$("#nivel-acabado button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === obra.acabado); });
    $("#area-valor").textContent = obra.area + " m²";
    area.style.setProperty("--p", ((obra.area - 20) / 280 * 100) + "%");
    var total = obra.area * t.m2[obra.acabado], sem = semanasObra();
    $("#obra-precio").textContent = millones(total);
    $("#obra-rango").textContent = "entre " + millones(total * 0.92).replace(" millones", "") + " y " + millones(total * 1.08);
    $("#obra-semanas").textContent = sem + " semanas";
    $("#obra-meses").textContent = "unos " + Math.max(1, Math.round(sem / 4.3)) + (Math.round(sem / 4.3) === 1 ? " mes" : " meses") + " de obra";
    casaSvg.innerHTML = D.casa(obra);
    escena.classList.remove("noche");
    var ini = 0;
    $("#cronograma").innerHTML = t.fases.map(function (f, i) {
      var w = f[1] * 100, l = ini * 100; ini += f[1] * (i < t.fases.length - 1 ? 0.92 : 1);
      return '<div class="crono-fila" data-fase="' + i + '"><span>' + f[0] + '</span><span class="crono-pista"><i class="crono-barra" style="left:' + Math.min(l, 100 - w) + "%;width:" + w + '%"></i></span><span>' + Math.max(1, Math.round(sem * f[1])) + " sem</span></div>";
    }).join("");
  }
  calcular();

  var reloj = [];
  function pararConstruccion() {
    reloj.forEach(clearTimeout); reloj = [];
    construyendo = false; casaSvg.classList.remove("construyendo");
    $$(".crono-fila").forEach(function (f) { f.classList.remove("activa"); });
    $("#casa-etapa").classList.remove("on");
    $("#ver-construir").innerHTML = '<svg viewBox="0 0 24 24"><path d="M7 4v16l13-8z"/></svg> Ver cómo se construye';
  }
  $("#ver-construir").addEventListener("click", function () {
    if (construyendo) { pararConstruccion(); casaSvg.innerHTML = D.casa(obra); return; }
    construyendo = true;
    casaSvg.innerHTML = D.casa(obra);
    escena.classList.remove("noche");
    casaSvg.classList.add("construyendo");
    $("#ver-construir").innerHTML = '<svg viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg> Detener';
    var fases = TIPOS[obra.tipo].fases, et = $("#casa-etapa"), paso = POCO ? 300 : 1050;
    fases.forEach(function (f, i) {
      reloj.push(setTimeout(function () {
        $$(".crono-fila").forEach(function (x, k) { x.classList.toggle("activa", k === i); });
        et.textContent = "Etapa " + (i + 1) + " de " + fases.length + " · " + f[0]; et.classList.add("on");
        f[2].forEach(function (cl) { $$("." + cl, casaSvg).forEach(function (g) { g.classList.add("visible"); }); });
        $$("[data-solo]", casaSvg).forEach(function (g) { if (i > 0) g.classList.remove("visible"); });
        if (i > 1) $$(".f-varillas", casaSvg).forEach(function (g) { g.style.opacity = 0; });
        if (f[2].indexOf("f-estructura") > -1) $$(".estructura line, .estructura path", casaSvg).forEach(function (l, k) {
          var L = l.getTotalLength ? l.getTotalLength() : 100;
          l.style.strokeDasharray = L; l.style.strokeDashoffset = L;
          l.style.transition = "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1) " + (k * 0.012) + "s";
          requestAnimationFrame(function () { requestAnimationFrame(function () { l.style.strokeDashoffset = 0; }); });
        });
      }, 250 + i * paso));
    });
    reloj.push(setTimeout(function () {
      casaSvg.classList.remove("construyendo");
      escena.classList.add("noche");
      $$(".ventanal", casaSvg).forEach(function (v, k) { setTimeout(function () { v.classList.add("luz"); }, k * 90); });
      et.textContent = "¡Obra entregada!";
      $$(".crono-fila").forEach(function (x) { x.classList.add("activa"); });
      reloj.push(setTimeout(function () { pararConstruccion(); }, 2600));
    }, 250 + fases.length * paso));
  });
  var visitaDeObra = null;
  $("#quiero-obra").addEventListener("click", function () {
    var t = TIPOS[obra.tipo];
    visitaDeObra = t.n + " · " + obra.area + " m² · " + obra.pisos + (obra.pisos > 1 ? " pisos" : " piso");
    elegirTipoVisita("Visita de obra");
  });

  /* ─────────── Agenda ─────────── */
  var HORAS = [[8, 0], [9, 30], [11, 0], [14, 0], [15, 30], [17, 0]];
  var hoy = P.hoy, selDia = null, selHora = null, tipoVisita = "Medición de mueble";
  function claveDia(d) { return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); }
  function ocupada(d, h) {
    var k = claveDia(d) * 7 + h[0] * 3 + h[1], x = Math.sin(k) * 10000; x = x - Math.floor(x);
    if (P.ocupadas(d).indexOf(h[0] * 60 + h[1]) > -1) return true;
    if (d.getDay() === 6 && h[0] >= 14) return true;
    var ahora = new Date();
    if (d.toDateString() === ahora.toDateString() && h[0] * 60 + h[1] < ahora.getHours() * 60 + ahora.getMinutes() + 120) return true;
    return x < 0.36;
  }
  function libres(d) { return HORAS.filter(function (h) { return !ocupada(d, h); }).length; }
  function pintarDias() {
    // Dos semanas desde el lunes de la semana de mañana: si hoy es domingo, la que empieza.
    var manana = new Date(hoy); manana.setDate(hoy.getDate() + 1);
    var lunes = new Date(manana); lunes.setDate(manana.getDate() - ((manana.getDay() + 6) % 7));
    var celdas = ["L", "M", "M", "J", "V", "S", "D"].map(function (d) { return '<span class="cab">' + d + "</span>"; });
    for (var i = 0; i < 14; i++) {
      var d = new Date(lunes); d.setDate(lunes.getDate() + i);
      var pasado = d < hoy, domingo = d.getDay() === 0, l = (!pasado && !domingo) ? libres(d) : 0;
      var ok = !pasado && !domingo && l > 0;
      celdas.push('<button class="dia' + (d.getTime() === hoy.getTime() ? " hoy" : "") + (ok ? "" : " lleno") + (selDia && d.getTime() === selDia.getTime() ? " on" : "") + '" data-dia="' + d.getTime() + '"' + (ok ? "" : " disabled") + ">" + d.getDate() + "<small>" + (pasado || domingo ? "" : l ? l + " libres" : "lleno") + "</small></button>");
    }
    $("#agenda-dias").innerHTML = celdas.join("");
    var mes = lunes.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
    mes = mes.charAt(0).toUpperCase() + mes.slice(1);
    $("#agenda-mes").innerHTML = "<b>" + mes + "</b><span>Lunes a sábado · visitas en Chía, Cajicá, Sopó y el norte de Bogotá</span>";
    $$("[data-dia]").forEach(function (b) { b.addEventListener("click", function () { selDia = new Date(+b.dataset.dia); selHora = null; pintarDias(); pintarHoras(); boton(); }); });
  }
  function textoHora(h) { var d = new Date(hoy); d.setHours(h[0], h[1]); return P.hora(d); }
  function pintarHoras() {
    if (!selDia) return;
    $("#agenda-horas").innerHTML = HORAS.map(function (h, i) {
      var oc = ocupada(selDia, h), on = selHora && selHora[0] === h[0] && selHora[1] === h[1];
      return '<button type="button" class="hora' + (on ? " on" : "") + '" data-h="' + i + '" style="animation-delay:' + (i * 0.05) + 's"' + (oc ? " disabled" : "") + ">" + textoHora(h) + "</button>";
    }).join("");
    $$("[data-h]").forEach(function (b) { b.addEventListener("click", function () { selHora = HORAS[+b.dataset.h]; $$(".hora").forEach(function (x) { x.classList.toggle("on", x === b); }); boton(); }); });
  }
  function boton() {
    var b = $("#agendar"), ok = selDia && selHora;
    b.disabled = !ok;
    $("#agendar-texto").textContent = ok ? "Agendar el " + selDia.toLocaleDateString("es-CO", { weekday: "long", day: "numeric" }) + " a las " + textoHora(selHora) : "Escoja día y hora";
  }
  function elegirTipoVisita(t) { tipoVisita = t; $$("#tipo-visita button").forEach(function (b) { b.classList.toggle("on", b.dataset.v === t); }); }
  $$("#tipo-visita button").forEach(function (b) { b.addEventListener("click", function () { elegirTipoVisita(b.dataset.v); if (b.dataset.v !== "Visita de obra") visitaDeObra = null; }); });
  $("#agenda-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!selDia || !selHora) return;
    var nombre = $("#a-nombre").value.trim() || "Cliente de la demostración", cel = $("#a-cel").value.trim() || "300 000 0000", dir = $("#a-dir").value.trim() || "Dirección de ejemplo, Chía";
    var f = new Date(selDia); f.setHours(selHora[0], selHora[1], 0, 0);
    P.agregarVisita({ cliente: nombre, cel: cel, dir: dir, tipo: tipoVisita, fecha: f, nota: tipoVisita === "Visita de obra" ? visitaDeObra : null });
    $("#al-mes").textContent = f.toLocaleDateString("es-CO", { month: "short" }).replace(".", "").toUpperCase();
    $("#al-dia").textContent = f.getDate();
    $("#al-hora").textContent = textoHora(selHora);
    var b = $("#al-burbuja");
    b.textContent = "Hola " + nombre.split(" ")[0] + " 👋 Su visita con Guayacán quedó para el " + P.fechaLarga(f) + " a las " + textoHora(selHora) + ". El maestro Jairo llega a " + dir + ". Si necesita cambiarla, responda a este mensaje.";
    b.setAttribute("data-hora", P.hora(new Date()));
    $("#agenda-listo").classList.add("on");
    aviso("Visita agendada", "Quedó en la agenda del taller y la hora ya aparece ocupada para los demás.", true);
    pintarDias();
  });
  pintarDias();

  /* ─────────── Siga su obra ─────────── */
  var seg = $("#seguimiento"), segHecho = false;
  function proximoSabado() { var d = new Date(hoy); d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7)); d.setHours(10, 0); return d; }
  function pintarSeguimiento() {
    var inicio = P.dia(-118), check = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';
    var ET = [
      ["Diseño y licencias", "terminado · " + fechaCorta(P.dia(-118)), "hecha"],
      ["Cimientos", "terminado · " + fechaCorta(P.dia(-86)), "hecha", "obra-cimientos"],
      ["Estructura en madera", "terminado · " + fechaCorta(P.dia(-31)), "hecha", "obra-estructura"],
      ["Techo", "en curso · 70 %", "ahora", "obra-techo"],
      ["Instalaciones", "empieza en 2 semanas", ""],
      ["Acabados", "", ""],
      ["Entrega", "estimada: " + fechaCorta(P.dia(74)), ""]
    ];
    seg.innerHTML = '<div class="seg"><svg width="0" height="0" style="position:absolute"><defs><linearGradient id="grad-anillo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f2cf8f"/><stop offset="1" stop-color="#c98f3f"/></linearGradient></defs></svg>' +
      '<div class="seg-cab"><span>Mi obra</span><b>GY-2417</b></div>' +
      "<h4>Casa Familia Rojas</h4><span class=\"lugar\">Vereda Meusa, Sopó · 160 m² · 2 pisos</span>" +
      '<div class="anillo-avance"><svg viewBox="0 0 86 86"><circle class="fondo-anillo" cx="43" cy="43" r="36"/><circle class="valor-anillo" cx="43" cy="43" r="36"/></svg><div><span class="num">62%</span><small>Semana 17 de 28<br>Vamos a tiempo</small></div></div>' +
      '<ul class="etapas">' + ET.map(function (e, i) {
        return '<li class="etapa ' + e[2] + '" style="transition-delay:' + (0.15 + i * 0.07) + 's"><span class="bolita">' + (e[2] === "hecha" ? check : "") + "</span><span><b>" + e[0] + "</b><span>" + e[1] + "</span></span>" + (e[3] ? '<img src="' + IMG + e[3] + '-800.webp" alt="">' : "<i></i>") + "</li>";
      }).join("") + "</ul>" +
      '<div class="novedad"><img src="' + IMG + 'obra-techo-800.webp" alt="Cerchas del techo instaladas"><div><b>HOY · ING. CAMILA DUARTE, RESIDENTE DE OBRA</b>Terminamos de montar las cerchas del techo del ala norte. Mañana empieza la teja. ¡Vamos a tiempo!</div></div>' +
      '<div class="prox"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><span>Su próxima visita a la obra: <b>' + P.fechaLarga(proximoSabado()) + ", 10:00 a. m.</b></span></div>" +
      "</div>";
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      $(".seg", seg).classList.add("lista");
      $(".valor-anillo", seg).style.strokeDashoffset = 226 * (1 - 0.62);
    }); });
  }
  function fechaCorta(d) { return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", ""); }
  function buscarObra(codigo) {
    var c = codigo.trim().toUpperCase().replace(/\s/g, "");
    if (c !== "GY-2417" && c !== "GY2417" && c !== "2417") {
      var f = $("#codigo-form");
      f.animate([{ transform: "translateX(0)" }, { transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-5px)" }, { transform: "translateX(0)" }], { duration: 380 });
      $(".pista").innerHTML = "No encontramos ese código. Pruebe con <b>GY-2417</b>";
      return;
    }
    segHecho = true;
    seg.insertAdjacentHTML("beforeend", '<div class="cargando-seg"><svg viewBox="-40 -40 80 80" class="anillos-logo"><circle r="6"/><circle r="14"/><circle r="22"/><circle r="30" class="tenue"/></svg></div>');
    setTimeout(function () { pintarSeguimiento(); }, POCO ? 0 : 900);
  }
  $("#codigo-form").addEventListener("submit", function (e) { e.preventDefault(); buscarObra($("#codigo").value); });
  /* Si nadie escribe, la página se demuestra sola: teclea el código de ejemplo */
  var ioSeg = new IntersectionObserver(function (es) {
    if (!es[0].isIntersecting || segHecho) return;
    ioSeg.disconnect();
    var inp = $("#codigo"), txt = "GY-2417", k = 0;
    if (inp.value) return;
    (function teclea() {
      if (segHecho || document.activeElement === inp) return;
      inp.value = txt.slice(0, ++k);
      if (k < txt.length) setTimeout(teclea, 120); else setTimeout(function () { if (!segHecho) buscarObra(txt); }, 450);
    })();
  }, { threshold: 0.55 });
  ioSeg.observe($(".telefono"));

  /* ─────────── Proyectos ─────────── */
  var PROY = [
    ["casa-montana", "Casa", "Casa de campo en ladera", "La Calera · 180 m² · estructura en madera"],
    ["cocina", "Cocina", "Cocina abierta en roble", "Sopó · roble y cuarzo · 5 semanas"],
    ["cabana", "Cabaña", "Cabaña en el bosque", "San Francisco · pino inmunizado"],
    ["cama-nogal", "Alcoba", "Alcoba principal en nogal", "Bogotá · nogal · 3 semanas"],
    ["sala", "Mueble", "Biblioteca de pared", "Chicó · roble · 3 semanas"],
    ["deck", "Exterior", "Deck y pérgola", "Tabio · teca · 4 semanas"],
    ["escalera", "Escalera", "Escalera flotante", "Cajicá · roble macizo"],
    ["comedor", "Comedor", "Comedor de borde natural", "Chía · cedro · 3 semanas"]
  ];
  var pf = $("#portafolio");
  pf.innerHTML = PROY.map(function (p) { return '<article class="proyecto"><img src="' + IMG + p[0] + '-800.webp" srcset="' + IMG + p[0] + "-800.webp 800w, " + IMG + p[0] + '-1600.webp 1600w" sizes="520px" alt="' + p[2] + '" loading="lazy" draggable="false"><div class="dentro"><span>' + p[1] + "</span><h3>" + p[2] + "</h3><p>" + p[3] + "</p></div></article>"; }).join("");
  function avancePf() { var max = pf.scrollWidth - pf.clientWidth, a = $("#pf-avance"); a.style.width = (pf.clientWidth / pf.scrollWidth * 100) + "%"; a.style.transform = "translateX(" + (max ? pf.scrollLeft / max * (pf.scrollWidth / pf.clientWidth - 1) * 100 : 0) + "%)"; }
  pf.addEventListener("scroll", avancePf, { passive: true }); avancePf();
  $("#pf-der").addEventListener("click", function () { pf.scrollBy({ left: 540, behavior: "smooth" }); });
  $("#pf-izq").addEventListener("click", function () { pf.scrollBy({ left: -540, behavior: "smooth" }); });
  var arr = null;
  pf.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; arr = { x: e.clientX, s: pf.scrollLeft }; pf.classList.add("arrastrando"); });
  window.addEventListener("pointermove", function (e) { if (arr) pf.scrollLeft = arr.s - (e.clientX - arr.x); });
  window.addEventListener("pointerup", function () { if (arr) { arr = null; pf.classList.remove("arrastrando"); } });

  /* ─────────── Ventanas, WhatsApp, avisos ─────────── */
  function abrirVelo(v) { v.classList.add("on"); document.body.classList.add("velo-abierto"); }
  function cerrarVelo(v) { v.classList.remove("on"); if (!$(".velo.on")) document.body.classList.remove("velo-abierto"); }
  $$(".velo").forEach(function (v) {
    v.addEventListener("click", function (e) { if (e.target === v) cerrarVelo(v); });
    $$("[data-cerrar]", v).forEach(function (b) { b.addEventListener("click", function () { cerrarVelo(v); }); });
  });
  $$("[data-wa]").forEach(function (b) { b.addEventListener("click", function () { abrirVelo($("#wa")); }); });
  $$("[data-abrir-panel]").forEach(function (b) { b.addEventListener("click", function () { P.abrir(); }); });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    var v = $(".velo.on");
    if (v) return cerrarVelo(v);
    if (P.abierto()) return P.cerrar();
    if (EMBEBIDA) try { window.parent.postMessage({ tipo: "salir" }, location.origin); } catch (x) {}
  });
  function aviso(titulo, texto, conPanel) {
    var a = document.createElement("div");
    a.className = "aviso";
    a.innerHTML = '<span class="ic"><svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg></span><div><b>' + titulo + "</b><p>" + texto + "</p>" + (conPanel ? "<button>Ver el panel del dueño →</button>" : "") + "</div>";
    $("#avisos").appendChild(a);
    var b = $("button", a); if (b) b.addEventListener("click", function () { P.abrir(); quitar(); });
    var t = setTimeout(quitar, 9000);
    function quitar() { clearTimeout(t); a.classList.add("sale"); setTimeout(function () { a.remove(); }, 450); }
  }
})();
