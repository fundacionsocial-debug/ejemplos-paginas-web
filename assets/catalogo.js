/* Catálogo «Tres formas de tener tu página».
   Las tres páginas de ejemplo corren de verdad dentro del recuadro (iframes de este mismo
   sitio). Al entrar, ese mismo recuadro crece hasta llenar la pantalla: no se recarga
   nada, solo se mueve con transformaciones, por eso se ve fluido. */
(function () {
  "use strict";

  var NIVELES = {
    1: {
      num: "01", nombre: "Sencilla", precio: "$600.000", nota: "pago único", cinta: "Nivel 1",
      desc: "Una sola página. La gente te conoce y te escribe. Es la tarjeta de presentación digital.",
      rasgos: ["Quiénes son y qué hacen", "Fotos de los trabajos", "Botón que abre WhatsApp", "Se ve bien en el celular"],
      prueba: ["Bájale hasta abajo: todo cabe en una sola página.",
               "Oprime el botón verde: abre WhatsApp con el mensaje ya escrito.",
               "Mírala como se ve en un celular, con el botón de arriba."],
      url: "demos/nivel-1-sencilla.html", dominio: "guayacan.com.co"
    },
    2: {
      num: "02", nombre: "Completa", precio: "$1.200.000", nota: "pago único", cinta: "Nivel 2 · la más pedida", caliente: true,
      desc: "Varias secciones, galería de trabajos y un formulario. Ya no solo informa: empieza a traer clientes.",
      rasgos: [{ mas: "Todo lo del nivel 1, y además:" }, "Menú con varias secciones", "Galería que se puede filtrar",
               "Formulario que te llega a ti", "Testimonios de clientes"],
      prueba: ["Filtra los proyectos y abre una foto en grande.",
               "Arrastra la raya del boceto: aparece la obra terminada.",
               "Llena el formulario y mira cómo le llega al dueño."],
      url: "demos/nivel-2-completa.html", dominio: "guayacan.com.co"
    },
    3: {
      num: "03", nombre: "Con sistema", precio: "desde $2.000.000", nota: "según lo que lleve", cinta: "Nivel 3",
      desc: "Una herramienta que trabaja sola: cotiza, agenda, registra y te guarda todo en un panel.",
      rasgos: [{ mas: "Todo lo del nivel 2, y además:" }, "Cotizador automático", "Agenda de citas o visitas",
               { b: "Panel para ver todo lo que entra" }, "Base de datos de clientes"],
      prueba: ["Diseña un mueble: cambia la madera y mira el precio moverse.",
               "Calcula una casa y oprime «Ver cómo se construye».",
               "Agenda una visita de medición.",
               "Abre el panel del dueño: ahí está todo lo que acabas de hacer."],
      url: "demos/nivel-3-con-sistema.html", dominio: "guayacan.com.co", panel: true
    }
  };

  var FILAS = [
    ["Te conocen y te encuentran", "", [1, 1, 1]],
    ["Se ve bien en el celular", "", [1, 1, 1]],
    ["Botón directo a WhatsApp", "", [1, 1, 1]],
    ["Varias secciones con menú", "Inicio, servicios, galería, contacto…", [0, 1, 1]],
    ["Galería que se puede filtrar", "", [0, 1, 1]],
    ["Formulario de contacto", "", [0, 1, 1]],
    ["Cotiza sola, sin que usted conteste", "El cliente arma su pedido y ve el precio", [0, 0, 1]],
    ["Agenda citas o visitas", "", [0, 0, 1]],
    ["Guarda los datos de cada cliente", "", [0, 0, 1]],
    ["Panel privado para ver todo", "Quién escribió, qué pidió, para cuándo", [0, 0, 1]],
    ["El cliente sigue su obra desde el celular", "Fotos y avance de cada etapa", [0, 0, 1]]
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esperar = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var POCO_MOVIMIENTO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ES_CELULAR = window.matchMedia("(max-width: 720px)").matches;
  var CHULO = '<svg viewBox="0 0 24 24"><path d="M20 6 9 17l-5-5"/></svg>';

  /* ─────────── Anillos de tronco (el motivo del catálogo) ─────────── */
  function azar(semilla) {
    return function () {
      semilla |= 0; semilla = semilla + 0x6D2B79F5 | 0;
      var t = Math.imul(semilla ^ semilla >>> 15, 1 | semilla);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  /* Curva cerrada y suave por los puntos (Catmull-Rom pasado a Bézier). */
  function curvaCerrada(p) {
    var n = p.length, d = "M" + p[0][0].toFixed(1) + " " + p[0][1].toFixed(1);
    for (var i = 0; i < n; i++) {
      var p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
      d += "C" + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + " " + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + " " +
           (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + " " + (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + " " +
           p2[0].toFixed(1) + " " + p2[1].toFixed(1);
    }
    return d + "Z";
  }
  /* Un tronco crece más hacia un lado y cada año deja un anillo un poco torcido. */
  function anillos(svg, cuantos, radio, semilla, medula) {
    var r = azar(semilla), fases = [r() * 6.28, r() * 6.28, r() * 6.28], ns = "http://www.w3.org/2000/svg";
    var paso = radio / cuantos, out = [];
    for (var i = 1; i <= cuantos; i++) {
      var R = paso * i * (0.9 + r() * 0.2), pts = [], k = 28;
      var dx = Math.cos(fases[0]) * R * 0.08, dy = Math.sin(fases[0]) * R * 0.06;
      for (var j = 0; j < k; j++) {
        var a = j / k * Math.PI * 2;
        var ondula = 1 + 0.035 * Math.sin(3 * a + fases[1] + i * 0.15) + 0.025 * Math.sin(5 * a + fases[2] - i * 0.1) + (r() - 0.5) * 0.018;
        pts.push([dx + Math.cos(a) * R * ondula, dy + Math.sin(a) * R * ondula * 0.97]);
      }
      var el = document.createElementNS(ns, "path");
      el.setAttribute("d", curvaCerrada(pts));
      el.setAttribute("class", "anillo");
      svg.appendChild(el); out.push(el);
    }
    if (medula) {
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("r", Math.max(2, paso * 0.35)); c.setAttribute("class", "medula");
      svg.appendChild(c);
    }
    return out;
  }

  /* ─────────── Pantalla de carga ─────────── */
  var yaVino = false;
  try { yaVino = sessionStorage.getItem("vino-catalogo") === "1"; sessionStorage.setItem("vino-catalogo", "1"); } catch (e) {}
  var anillosCarga = anillos($("#carga-anillos"), 13, 100, 7, true);
  anillosCarga.forEach(function (el, i) {
    var L = el.getTotalLength();
    el.style.strokeDasharray = L; el.style.strokeDashoffset = L;
    if (el.animate) el.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
      { duration: yaVino ? 400 : 1100, delay: (yaVino ? 30 : 85) * i, easing: "cubic-bezier(.22,1,.36,1)", fill: "forwards" });
    else el.style.strokeDashoffset = 0;
  });
  anillos($("#tronco"), 38, 480, 11, false);
  anillos($("#mini-anillos"), 6, 34, 3, false).forEach(function (p) { p.removeAttribute("class"); });

  var primeraCarga;
  var listoCarga = new Promise(function (r) { primeraCarga = r; });
  Promise.all([
    Promise.race([Promise.all([listoCarga, document.fonts ? document.fonts.ready : null]), esperar(3800)]),
    esperar(yaVino ? 450 : 1650)
  ]).then(function () {
    $("#carga").classList.add("fuera");
    document.body.classList.remove("cargando");
    document.body.classList.add("listo");
    observarRevelados();
    setTimeout(function () { var c = $("#carga"); if (c) c.remove(); }, 1200);
  });

  /* ─────────── Luz que sigue al puntero ─────────── */
  var luz = $("#luz");
  window.addEventListener("pointermove", function (e) {
    luz.style.setProperty("--px", e.clientX + "px");
    luz.style.setProperty("--py", e.clientY + "px");
    luz.classList.add("on");
  }, { passive: true });
  document.addEventListener("pointerleave", function () { luz.classList.remove("on"); });
  $$(".marco, .tarjeta").forEach(function (el) {
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ─────────── Aparecer al bajar ─────────── */
  function observarRevelados() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".revela, #tabla-zona").forEach(function (el, i) {
      if (el.closest(".portada")) el.style.transitionDelay = (0.25 + i * 0.09) + "s";
      io.observe(el);
    });
    setTimeout(function () { $$(".revela").forEach(function (el) { el.classList.add("in"); }); }, 6000);
  }

  /* ─────────── Lado a lado ─────────── */
  $("#tabla-cuerpo").innerHTML = FILAS.map(function (f, i) {
    return "<tr><td class=\"fila-nombre\">" + f[0] + (f[1] ? "<small>" + f[1] + "</small>" : "") + "</td>" +
      f[2].map(function (v) {
        return "<td class=\"c\">" + (v ? "<span class=\"si\" style=\"--d:" + i + "\">" + CHULO + "</span>" : "<span class=\"no\">—</span>") + "</td>";
      }).join("") + "</tr>";
  }).join("");
  $$("#tabla-cuerpo .si path").forEach(function (p) {
    p.style.transitionDelay = (parseInt(p.closest(".si").style.getPropertyValue("--d"), 10) * 0.07 + 0.1) + "s";
  });
  $$("#tabla th button").forEach(function (b) {
    b.addEventListener("click", function () {
      seleccionar(+b.dataset.ir);
      $("#niveles").scrollIntoView({ behavior: POCO_MOVIMIENTO ? "auto" : "smooth" });
    });
  });

  /* ─────────── El recuadro con la página en vivo ─────────── */
  var vista = $("#marco-vista"), hueco = $("#marco-hueco"), zona = $(".marco-zona");
  var lienzos = {};            // url -> { el, iframe, cargado }
  var lienzoActivo = null;

  function medir() {
    var vw = window.innerWidth, vh = window.innerHeight;
    var ancho = Math.min(zona.clientWidth || vw, 1000);
    var maxAlto = ES_CELULAR ? Math.min(vh * 0.6, 540) : Math.min(vh * 0.68, 600);
    var k = Math.min(ancho / vw, maxAlto / vh);
    vista.style.setProperty("--vw", vw + "px");
    vista.style.setProperty("--vh", vh + "px");
    vista.style.setProperty("--k", k);
    vista.style.setProperty("--marco-w", Math.round(vw * k) + "px");
    vista.style.setProperty("--marco-h", Math.round(vh * k) + "px");
    if (equipo === "cel" && lienzoActivo) ponerCelular(lienzoActivo, false);
  }

  function crearLienzo(url, titulo) {
    if (lienzos[url]) return lienzos[url];
    var el = document.createElement("div");
    el.className = "lienzo";
    var ifr = document.createElement("iframe");
    ifr.title = titulo || "Página de ejemplo";
    ifr.src = url;
    el.appendChild(ifr);
    vista.insertBefore(el, $("#marco-entrar"));
    var obj = { el: el, iframe: ifr, url: url, listo: false };
    obj.cargado = new Promise(function (r) {
      ifr.addEventListener("load", function () { obj.listo = true; r(); }, { once: true });
      setTimeout(r, 9000);
    });
    lienzos[url] = obj;
    return obj;
  }

  function activarLienzo(url, titulo) {
    var l = crearLienzo(url, titulo);
    if (lienzoActivo === l) return l;
    if (lienzoActivo) {
      lienzoActivo.el.classList.remove("activo");
      lienzoActivo.el.classList.remove("celular");
    }
    lienzoActivo = l;
    var cargando = $("#marco-cargando");
    cargando.classList.toggle("listo", l.listo);
    l.cargado.then(function () {
      if (lienzoActivo !== l) return;
      cargando.classList.add("listo");
      l.el.classList.add("activo");
      try { var w = l.iframe.contentWindow; if (w && w.alMostrarse) w.alMostrarse(); } catch (e) {}
      if (equipo === "cel" && visorAbierto) ponerCelular(l, false);
      reiniciarRecorrido();
    });
    var b = $("#barrido"); b.classList.remove("va"); void b.offsetWidth; b.classList.add("va");
    return l;
  }

  /* ─────────── Pestañas ─────────── */
  var nivelActual = 0;
  var textoNivel = $("#nivel-texto");
  var pestanas = $$(".pestana");

  function moverIndicador() {
    var b = $(".pestana[aria-selected=\"true\"]"); if (!b) return;
    var ind = $("#indicador");
    ind.style.width = b.offsetWidth + "px";
    ind.style.transform = "translateX(" + b.offsetLeft + "px)";
  }

  function htmlNivel(n) {
    var d = NIVELES[n];
    return "<h3>" + d.nombre + "</h3>" +
      (d.caliente ? "<p class=\"pedida\">La más pedida</p>" : "") +
      "<div class=\"precio\"><span class=\"texto-oro\">" + d.precio + "</span><small>" + d.nota + "</small></div>" +
      "<div class=\"medidor\"><span class=\"barras\">" + [1, 2, 3].map(function (i) { return "<i class=\"" + (i <= n ? "on" : "") + "\"></i>"; }).join("") +
      "</span> Trabajo que hace la página por usted</div>" +
      "<p class=\"desc\">" + d.desc + "</p>" +
      "<ul class=\"rasgos\">" + d.rasgos.map(function (r) {
        if (r.mas) return "<li class=\"mas\">" + CHULO + " " + r.mas + "</li>";
        if (r.b) return "<li>" + CHULO + " <b>" + r.b + "</b></li>";
        return "<li>" + CHULO + " " + r + "</li>";
      }).join("") + "</ul>" +
      "<div class=\"acciones\"><button class=\"boton-oro\" data-entrar><svg viewBox=\"0 0 24 24\"><path d=\"M15 3h6v6M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5\"/></svg> Ver el ejemplo</button>" +
      (n < 3 ? "<button class=\"boton-suave\" data-sig>Siguiente nivel →</button>" : "") + "</div>" +
      "<div class=\"prueba\"><span class=\"etiqueta\">Pruébalo así</span><ol>" + d.prueba.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ol></div>";
  }

  function seleccionar(n, sinAnimar) {
    n = Math.max(1, Math.min(3, n | 0));
    if (n === nivelActual) return;
    var antes = nivelActual;
    nivelActual = n;
    pestanas.forEach(function (b) {
      var on = +b.dataset.nivel === n;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    moverIndicador();
    $("#tabla").setAttribute("data-activo", n);
    $("#marco-url").textContent = NIVELES[n].dominio;

    var poner = function () {
      textoNivel.innerHTML = htmlNivel(n);
      $("[data-entrar]", textoNivel).addEventListener("click", function () { abrirVisor(); });
      var sig = $("[data-sig]", textoNivel);
      if (sig) sig.addEventListener("click", function () { seleccionar(n + 1); });
      if (!sinAnimar && !POCO_MOVIMIENTO) {
        textoNivel.classList.add("entrando");
        $$(":scope > *", textoNivel).forEach(function (el, i) { el.style.transitionDelay = (i * 0.05) + "s"; });
        requestAnimationFrame(function () { requestAnimationFrame(function () { textoNivel.classList.remove("entrando"); }); });
      }
    };
    if (!antes || sinAnimar || POCO_MOVIMIENTO) poner();
    else {
      $$(":scope > *", textoNivel).forEach(function (el) { el.style.transitionDelay = "0s"; });
      textoNivel.classList.add("saliendo");
      setTimeout(function () { textoNivel.classList.remove("saliendo"); poner(); }, 320);
    }

    activarLienzo(NIVELES[n].url, "Ejemplo nivel " + n + ": " + NIVELES[n].nombre);
    if (!visorAbierto && location.hash !== "#nivel-" + n && antes) history.replaceState(null, "", "#nivel-" + n);
  }

  pestanas.forEach(function (b) {
    b.addEventListener("click", function () { seleccionar(+b.dataset.nivel); });
    b.addEventListener("keydown", function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      var n = ((nivelActual - 1 + d + 3) % 3) + 1;
      seleccionar(n); $("#pestana-" + n).focus();
    });
  });

  /* ─────────── El recorrido solo (la vista previa baja despacio por la página) ─────────── */
  var recorrido = { y: 0, pausa: 0, fase: "espera", t: 0 }, encima = false, marcoVisible = true;
  $("#marco").addEventListener("pointerenter", function () { encima = true; });
  $("#marco").addEventListener("pointerleave", function () { encima = false; });
  new IntersectionObserver(function (es) { marcoVisible = es[0].isIntersecting; }, { threshold: 0.2 }).observe($("#marco"));
  function reiniciarRecorrido() {
    recorrido.y = 0; recorrido.fase = "espera"; recorrido.pausa = 2600;
    try { lienzoActivo.iframe.contentWindow.scrollTo({ top: 0, behavior: "instant" }); } catch (e) {}
  }
  function pasoRecorrido(t) {
    var dt = Math.min(64, t - (recorrido.t || t)); recorrido.t = t;
    requestAnimationFrame(pasoRecorrido);
    if (POCO_MOVIMIENTO || visorAbierto || encima || !marcoVisible || document.hidden || !lienzoActivo || !lienzoActivo.listo) return;
    var w; try { w = lienzoActivo.iframe.contentWindow; if (!w || !w.document) return; } catch (e) { return; }
    if (w.__ocupado) return;                     // la página está mostrando su propia entrada
    if (recorrido.pausa > 0) { recorrido.pausa -= dt; return; }
    var doc = w.document.scrollingElement || w.document.documentElement;
    var max = doc.scrollHeight - w.innerHeight;
    if (recorrido.fase === "espera") { recorrido.fase = "baja"; recorrido.y = doc.scrollTop; }
    if (recorrido.fase === "baja") {
      recorrido.y += dt * 0.055 * (w.innerHeight / 800);
      if (recorrido.y >= max - 2) { recorrido.y = max; recorrido.fase = "sube"; recorrido.pausa = 2200; }
      w.scrollTo({ top: recorrido.y, behavior: "instant" });
    } else if (recorrido.fase === "sube") {
      w.scrollTo({ top: 0, behavior: "smooth" });
      recorrido.fase = "espera"; recorrido.pausa = 3200; recorrido.y = 0;
    }
  }
  requestAnimationFrame(pasoRecorrido);

  /* ─────────── El visor a pantalla completa ─────────── */
  var visorAbierto = false, ocupado = false, equipo = "pc", actualVisor = null;
  var fondo = $("#visor-fondo"), barra = $("#visor-barra"), asa = $("#visor-asa"), telon = $("#telon");

  function datosDe(url) {
    for (var n in NIVELES) if (NIVELES[n].url === url) return { url: url, num: NIVELES[n].num, nombre: NIVELES[n].nombre, precio: NIVELES[n].precio, panel: !!NIVELES[n].panel, nivel: +n, dominio: NIVELES[n].dominio };
    var a = $("[data-abrir=\"" + url + "\"]");
    return { url: url, num: a.dataset.num, nombre: a.dataset.titulo, precio: a.dataset.precio, panel: !!a.dataset.panel, nivel: 0, dominio: a.dataset.dominio };
  }

  function pintarBarra(d) {
    $$("#vb-niveles .vb").forEach(function (b) { b.classList.toggle("on", +b.dataset.nivel === d.nivel); });
    $("#vb-panel").style.display = d.panel ? "" : "none";
    $("#vb-globo").classList.remove("on"); globos = 0;
  }

  function rectVisible(r) { return r.bottom > 40 && r.top < window.innerHeight - 40 && r.width > 10; }

  function abrirVisor(opc) {
    opc = opc || {};
    if (visorAbierto || ocupado) return;
    var url = opc.url || NIVELES[nivelActual].url;
    var d = datosDe(url);
    var r = vista.getBoundingClientRect();
    var conTelon = opc.conTelon || !rectVisible(r) || url !== (lienzoActivo && lienzoActivo.url);
    visorAbierto = true; ocupado = true; actualVisor = d;
    pintarBarra(d);
    if (!opc.desdeHistoria) history.pushState({ visor: true }, "", d.nivel ? "#nivel-" + d.nivel + "/ver" : "#ver");

    hueco.style.width = r.width + "px"; hueco.style.height = r.height + "px";
    hueco.classList.add("on");
    document.documentElement.style.overflow = "hidden";
    document.documentElement.classList.add("visor-arriba", "visor-on");

    if (conTelon) {
      return taparCon(d).then(function () {
        vista.classList.add("abierta");
        fondo.classList.add("on");
        var l = activarLienzo(url, d.nombre);
        return l.cargado.then(function () { return esperar(450); });
      }).then(function () {
        destapar();
        barra.classList.add("on");
        ocupado = false; enfocar();
      });
    }

    try { lienzoActivo.iframe.contentWindow.scrollTo({ top: 0, behavior: "smooth" }); } catch (e) {}
    var s = r.width / window.innerWidth;
    vista.classList.add("abierta");
    vista.style.transform = "translate(" + r.left + "px," + r.top + "px) scale(" + s + ")";
    vista.style.borderRadius = "0 0 " + (17 / s) + "px " + (17 / s) + "px";
    void vista.offsetWidth;
    vista.classList.add("animando");
    fondo.classList.add("on");
    requestAnimationFrame(function () {
      vista.style.transform = "translate(0,0) scale(1)";
      vista.style.borderRadius = "0px";
    });
    setTimeout(function () { barra.classList.add("on"); }, 380);
    alTerminar(vista, 900, function () {
      vista.classList.remove("animando");
      vista.style.transform = ""; vista.style.borderRadius = "";
      ocupado = false; enfocar();
    });
  }

  function cerrarVisor(desdeHistoria) {
    if (!visorAbierto || ocupado) return;
    ocupado = true;
    if (!desdeHistoria && history.state && history.state.visor) { history.back(); ocupado = false; return; }
    barra.classList.remove("on", "escondida"); asa.classList.remove("on");
    if (lienzoActivo) lienzoActivo.el.classList.remove("celular", "cambiando-tamano");
    document.documentElement.classList.remove("visor-on");
    try { var wp = lienzoActivo.iframe.contentWindow; if (wp.Panel && wp.Panel.abierto()) wp.Panel.cerrar(); } catch (e) {}
    var volverA = NIVELES[nivelActual].url;
    var r = hueco.getBoundingClientRect();
    var fin = function () {
      document.documentElement.classList.remove("visor-arriba");
      vista.classList.remove("abierta", "animando");
      vista.style.transform = ""; vista.style.borderRadius = ""; vista.style.opacity = "";
      hueco.classList.remove("on");
      document.documentElement.style.overflow = "";
      visorAbierto = false; ocupado = false;
      if (equipo === "cel") ponerEquipo("pc");
      if (!lienzoActivo || lienzoActivo.url !== volverA) activarLienzo(volverA);
      else reiniciarRecorrido();
      if (!location.hash.match(/^#nivel-\d$/)) history.replaceState(null, "", "#nivel-" + nivelActual);
    };
    if (!rectVisible(r) || (lienzoActivo && lienzoActivo.url !== volverA)) {
      vista.style.transition = "opacity .45s ease"; vista.style.opacity = "0";
      fondo.classList.remove("on");
      setTimeout(function () { vista.style.transition = ""; fin(); }, 470);
      return;
    }
    var s = r.width / window.innerWidth;
    vista.classList.add("animando");
    vista.style.transform = "translate(" + r.left + "px," + r.top + "px) scale(" + s + ")";
    vista.style.borderRadius = "0 0 " + (17 / s) + "px " + (17 / s) + "px";
    fondo.classList.remove("on");
    alTerminar(vista, 900, fin);
  }

  function alTerminar(el, maximo, fn) {
    var hecho = false;
    var f = function (e) { if (e && e.target !== el) return; if (hecho) return; hecho = true; el.removeEventListener("transitionend", f); fn(); };
    el.addEventListener("transitionend", f);
    setTimeout(f, maximo);
  }

  function enfocar() { try { lienzoActivo.iframe.focus(); } catch (e) {} }

  function taparCon(d) {
    $("#telon-num").textContent = d.num;
    $("#telon-nom").textContent = d.nombre;
    $("#telon-pre").textContent = d.precio;
    telon.classList.remove("destapa");
    void telon.offsetWidth;
    telon.classList.add("cubre");
    return esperar(POCO_MOVIMIENTO ? 50 : 760);
  }
  function destapar() {
    telon.classList.remove("cubre");
    telon.classList.add("destapa");
    setTimeout(function () { telon.classList.remove("destapa"); }, 820);
  }

  function cambiarEnVisor(url) {
    if (ocupado || (lienzoActivo && lienzoActivo.url === url)) return;
    ocupado = true;
    var d = datosDe(url);
    actualVisor = d;
    taparCon(d).then(function () {
      pintarBarra(d);
      if (d.nivel) {
        nivelActual = 0; seleccionar(d.nivel, true);   // la pestaña de abajo queda en el mismo nivel
        history.replaceState({ visor: true }, "", "#nivel-" + d.nivel + "/ver");
      }
      var l = activarLienzo(url, d.nombre);
      try { l.iframe.contentWindow.scrollTo({ top: 0, behavior: "instant" }); } catch (e) {}
      return Promise.all([l.cargado, esperar(380)]);
    }).then(function () {
      destapar(); ocupado = false; enfocar();
    });
  }

  $("#marco-entrar").addEventListener("click", function () { abrirVisor(); });
  $("#vb-volver").addEventListener("click", function () { cerrarVisor(); });
  $$("#vb-niveles .vb").forEach(function (b) { b.addEventListener("click", function () { cambiarEnVisor(NIVELES[+b.dataset.nivel].url); }); });
  $$("[data-abrir]").forEach(function (a) {
    a.addEventListener("click", function (e) { e.preventDefault(); abrirVisor({ url: a.dataset.abrir, conTelon: true }); });
  });
  $("#vb-ocultar").addEventListener("click", function () { barra.classList.add("escondida"); asa.classList.add("on"); });
  asa.addEventListener("click", function () { barra.classList.remove("escondida"); asa.classList.remove("on"); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && visorAbierto) cerrarVisor(); });

  /* Computador o celular, dentro del visor. */
  function ponerCelular(l, animar) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var cs = Math.min(1, (vh - 104) / 844, (vw - 40) / 390);
    l.el.style.setProperty("--cs", cs);
    l.el.style.setProperty("--cx", ((vw - 390 * cs) / 2) + "px");
    l.el.style.setProperty("--cy", Math.max(18, (vh - 844 * cs) / 2 - 30) + "px");
    if (animar) l.el.classList.add("cambiando-tamano");
    l.el.classList.add("celular");
  }
  function ponerEquipo(eq) {
    equipo = eq;
    $$("#vb-equipo .vb").forEach(function (b) { b.classList.toggle("on", b.dataset.equipo === eq); });
    if (!lienzoActivo) return;
    var l = lienzoActivo;
    if (eq === "cel") ponerCelular(l, true);
    else { l.el.classList.add("cambiando-tamano"); l.el.classList.remove("celular"); }
    setTimeout(function () { l.el.classList.remove("cambiando-tamano"); }, 700);
  }
  $$("#vb-equipo .vb").forEach(function (b) { b.addEventListener("click", function () { ponerEquipo(b.dataset.equipo); }); });

  /* El panel del dueño vive dentro de la página de ejemplo; este botón solo lo abre. */
  var globos = 0;
  $("#vb-panel").addEventListener("click", function () {
    try {
      var w = lienzoActivo.iframe.contentWindow;
      if (w.abrirPanel) w.abrirPanel(); else if (w.openAdmin) w.openAdmin();
    } catch (e) {}
    globos = 0; $("#vb-globo").classList.remove("on");
  });
  window.addEventListener("message", function (e) {
    if (e.origin !== location.origin || !e.data) return;
    if (e.data.tipo === "nuevo-registro" && visorAbierto) {
      globos++;
      var g = $("#vb-globo"); g.textContent = globos; g.classList.add("on");
      var p = $("#vb-panel"); p.classList.remove("pulso"); void p.offsetWidth; p.classList.add("pulso");
      barra.classList.remove("escondida"); asa.classList.remove("on");
    } else if (e.data.tipo === "panel-abierto") {
      globos = 0; $("#vb-globo").classList.remove("on");
    } else if (e.data.tipo === "salir" && visorAbierto) {
      cerrarVisor();
    }
  });

  /* Atrás/adelante del navegador abre y cierra el visor. */
  window.addEventListener("popstate", function () {
    var m = location.hash.match(/^#nivel-(\d)(\/ver)?$/);
    if (m && +m[1] !== nivelActual && !visorAbierto) seleccionar(+m[1]);
    var quiereVer = /\/ver$/.test(location.hash) || location.hash === "#ver";
    if (quiereVer && !visorAbierto) abrirVisor({ desdeHistoria: true, url: m ? NIVELES[+m[1]].url : undefined, conTelon: true });
    else if (!quiereVer && visorAbierto) { ocupado = false; cerrarVisor(true); }
  });

  /* ─────────── Arranque ─────────── */
  var inicio = location.hash.match(/^#nivel-(\d)(\/ver)?$/);
  seleccionar(inicio ? +inicio[1] : 1, true);
  medir();
  lienzoActivo.cargado.then(function () {
    primeraCarga();
    // Las otras dos se cargan por detrás, para que cambiar de pestaña sea instantáneo.
    if (!ES_CELULAR) [1, 2, 3].forEach(function (n, i) { setTimeout(function () { crearLienzo(NIVELES[n].url, "Ejemplo nivel " + n); }, 1200 + i * 900); });
    if (inicio && inicio[2]) setTimeout(function () { history.replaceState(null, "", "#nivel-" + nivelActual); abrirVisor({ conTelon: true }); }, 900);
  });
  var tRes;
  window.addEventListener("resize", function () {
    clearTimeout(tRes);
    tRes = setTimeout(function () { medir(); moverIndicador(); }, 120);
  });
  if (document.fonts) document.fonts.ready.then(moverIndicador);
})();
