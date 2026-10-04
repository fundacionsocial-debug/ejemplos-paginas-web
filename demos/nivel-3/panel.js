/* El panel privado del dueño. Los datos son de mentira y viven en la memoria del navegador:
   al recargar la página vuelve a empezar, que es justo lo que conviene entre una reunión y otra. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var IMG = "../assets/img/";
  var ahora = new Date();
  var hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
  function dia(n, h, m) { var d = new Date(hoy); d.setDate(d.getDate() + n); if (h != null) d.setHours(h, m || 0, 0, 0); return d; }
  function pesos(n) { return "$" + Math.round(n).toLocaleString("es-CO"); }
  function corto(n) {
    if (n >= 1e6) { var m = n / 1e6; return "$" + (m >= 100 ? Math.round(m) : m.toFixed(1).replace(".", ",")).toLocaleString("es-CO") + " M"; }
    return pesos(n);
  }
  function hora(d) { return d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }).replace("a. m.", "a. m.").replace("p. m.", "p. m."); }
  function fechaLarga(d) { return d.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }); }
  function hace(d) {
    var s = (Date.now() - d.getTime()) / 1000;
    if (s < 60) return "hace un momento";
    if (s < 3600) return "hace " + Math.round(s / 60) + " min";
    if (s < 86400) return "hace " + Math.round(s / 3600) + " h";
    var n = Math.round(s / 86400); return n === 1 ? "ayer" : "hace " + n + " días";
  }

  var DB = {
    cot: [
      { cliente: "Marcela Rodríguez", cel: "310 000 0000", item: "Cocina integral · 3,6 m · roble", valor: 14850000, fecha: dia(0, 7, 42), estado: "nueva" },
      { cliente: "Andrea Gómez", cel: "312 000 0000", item: "Closet · 2,4 m · cedro", valor: 4310000, fecha: dia(-1, 21, 10), estado: "nueva" },
      { cliente: "Hernán Castillo", cel: "315 000 0000", item: "Remodelación de cocina · 14 m² · estándar", valor: 38500000, fecha: dia(-2, 18, 5), estado: "visita" },
      { cliente: "Jorge Buitrago", cel: "320 000 0000", item: "Comedor 8 puestos · nogal", valor: 6420000, fecha: dia(-4, 10, 30), estado: "aprobada" },
      { cliente: "Luz Patricia Mena", cel: "301 000 0000", item: "Cama queen · guayacán", valor: 5880000, fecha: dia(-6, 15, 20), estado: "visita" },
      { cliente: "Camilo Arango", cel: "316 000 0000", item: "Puertas interiores × 6 · roble", valor: 7920000, fecha: dia(-9, 9, 0), estado: "aprobada" },
      { cliente: "Sofía Lozano", cel: "318 000 0000", item: "Biblioteca de pared · roble", valor: 7250000, fecha: dia(-11, 12, 45), estado: "taller" },
      { cliente: "Diego Ramírez", cel: "311 000 0000", item: "Remodelación de baño principal · 6 m²", valor: 18480000, fecha: dia(-13, 17, 15), estado: "taller" }
    ],
    vis: [
      { cliente: "Marcela Rodríguez", cel: "310 000 0000", dir: "Calle 00 # 00-00, Chía", tipo: "Medición en su casa", fecha: dia(1, 9, 30) },
      { cliente: "Hernán Castillo", cel: "315 000 0000", dir: "Carrera 00 # 00-00, Chía", tipo: "Asesoría de diseño", fecha: dia(2, 14, 0) },
      { cliente: "Andrea Gómez", cel: "312 000 0000", dir: "Carrera 00 # 00-00, Cajicá", tipo: "Medición en su casa", fecha: dia(3, 11, 0) },
      { cliente: "Familia Rojas", cel: "314 000 0000", dir: "Obra GY-2417, Cedritos", tipo: "Revisión de avance", fecha: dia(5, 10, 0) }
    ],
    obras: [
      { codigo: "GY-2417", nombre: "Apto Familia Rojas · cocina y 2 baños", lugar: "Cedritos", avance: 62, etapa: "Enchapes", img: "obra-enchape" },
      { codigo: "GY-2388", nombre: "Casa Arango · vestier y puertas", lugar: "Chía", avance: 86, etapa: "Instalación", img: "muebles-taller" },
      { codigo: "GY-2431", nombre: "Apto Ramírez · baño principal", lugar: "Cajicá", avance: 21, etapa: "Demolición", img: "obra-demolicion" }
    ],
    meses: [14, 19, 17, 23, 26]   // cotizaciones de los cinco meses anteriores
  };
  var sinLeer = 0, nuevasCot = 0, nuevasVis = 0, abierto = false, vecesAbierto = 0, vista = "resumen";

  var panel = $("#panel"), candado = $("#candado");

  function svgIcono(t) {
    return t === "cita"
      ? '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
      : '<svg viewBox="0 0 24 24"><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/></svg>';
  }
  function chip(r) { return r.mia ? '<span class="chip-mia">Usted</span>' : ""; }
  function linea(valores) {
    var max = Math.max.apply(null, valores), min = Math.min.apply(null, valores);
    return '<svg viewBox="0 0 84 30"><path d="' + valores.map(function (v, i) { return (i ? "L" : "M") + (i * 84 / (valores.length - 1)).toFixed(1) + " " + (27 - (v - min) / ((max - min) || 1) * 24).toFixed(1); }).join("") + '"/></svg>';
  }

  /* ─── Resumen ─── */
  function pintarResumen() {
    var esteMes = DB.cot.filter(function (c) { return c.fecha.getMonth() === hoy.getMonth(); }).length + 17;
    var abiertas = DB.cot.filter(function (c) { return c.estado !== "taller"; }).reduce(function (s, c) { return s + c.valor; }, 0);
    var semana = DB.vis.filter(function (v) { return v.fecha >= hoy && v.fecha < dia(7); }).length;
    var meses = DB.meses.concat([esteMes]);
    var nombres = meses.map(function (_, i) { var d = new Date(hoy.getFullYear(), hoy.getMonth() - (meses.length - 1 - i), 1); return d.toLocaleDateString("es-CO", { month: "short" }).replace(".", ""); });
    var maxM = Math.max.apply(null, meses);
    var feed = DB.cot.map(function (c) { return { t: "cot", r: c, f: c.fecha }; })
      .concat(DB.vis.map(function (v) { return { t: "cita", r: v, f: v.creada || dia(-3, 9) }; }))
      .sort(function (a, b) { return b.f - a.f; }).slice(0, 6);
    var prox = DB.vis.filter(function (v) { return v.fecha >= hoy; }).sort(function (a, b) { return a.fecha - b.fecha; }).slice(0, 4);
    $("#v-resumen").innerHTML =
      '<div class="kpis">' +
        '<div class="kpi oro"><span>Cotizaciones del mes</span><b data-n="' + esteMes + '">0</b><small>↑ ' + Math.max(1, esteMes - DB.meses[4]) + ' más que el mes pasado</small>' + linea(meses) + "</div>" +
        '<div class="kpi"><span>Valor por cerrar</span><b data-n="' + abiertas + '" data-corto="1">$0</b><small>en cotizaciones abiertas</small>' + linea([3, 5, 4, 6, 7, 9]) + "</div>" +
        '<div class="kpi"><span>Visitas esta semana</span><b data-n="' + semana + '">0</b><small>agendadas solas, desde la página</small>' + linea([2, 4, 3, 5, 4, semana]) + "</div>" +
        '<div class="kpi"><span>Obras en curso</span><b data-n="' + DB.obras.length + '">0</b><small>todas a tiempo</small>' + linea([1, 2, 2, 3, 3, 3]) + "</div>" +
      "</div>" +
      '<div class="rejilla-2"><div>' +
        '<div class="caja"><div class="caja-cab"><b>Cotizaciones por mes</b><span>las hace la gente sola, de día o de noche</span></div><div class="grafica">' +
          meses.map(function (v, i) { return '<div class="barra-mes' + (i === meses.length - 1 ? " actual" : "") + '"><i data-alto="' + (v / maxM * 100) + '" data-v="' + v + '"></i><span>' + nombres[i] + "</span></div>"; }).join("") +
        "</div></div>" +
        '<div class="caja"><div class="caja-cab"><b>Lo último que entró</b><span class="vivo">En vivo</span></div><ul class="feed">' +
          feed.map(function (x) {
            var r = x.r;
            return '<li class="' + (r.mia ? "mia" : "") + '"><span class="ic">' + svgIcono(x.t) + "</span><span><b>" + (x.t === "cot" ? "Cotización · " + r.cliente : "Visita agendada · " + r.cliente) + chip(r) + "</b><small>" +
              (x.t === "cot" ? r.item : r.tipo + " · " + fechaLarga(r.fecha) + ", " + hora(r.fecha)) + " · " + hace(x.f) + "</small></span>" +
              (x.t === "cot" ? '<span class="dinero">' + corto(r.valor) + "</span>" : '<span class="estado e-ok">Confirmada</span>') + "</li>";
          }).join("") +
        "</ul></div>" +
      "</div><div>" +
        '<div class="caja"><div class="caja-cab"><b>Próximas visitas</b><span>' + prox.length + "</span></div>" +
          prox.map(function (v) { return '<div class="cita ' + (v.mia ? "mia" : "") + '"><span class="h">' + hora(v.fecha) + "</span><span><b>" + v.cliente + chip(v) + "</b><small>" + capital(fechaLarga(v.fecha)) + " · " + v.tipo + "</small></span><span class=\"estado e-ok\">✓</span></div>"; }).join("") +
        "</div>" +
        '<div class="caja"><div class="caja-cab"><b>Obras</b><span>avance</span></div>' +
          DB.obras.map(function (o) { return '<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;font-size:.88rem"><b style="font-weight:600">' + o.nombre + '</b><span style="color:var(--oro-claro)">' + o.avance + '%</span></div><div class="progreso"><i data-ancho="' + o.avance + '"></i></div><small style="color:var(--niebla);font-size:.78rem">' + o.codigo + " · " + o.lugar + " · etapa: " + o.etapa + "</small></div>"; }).join("") +
        "</div>" +
      "</div></div>";
  }

  /* ─── Cotizaciones (tablero) ─── */
  var COLS = [["nueva", "Nuevas", "#e8893b"], ["visita", "Visita hecha", "#8fb8e8"], ["aprobada", "Aprobadas", "#8fd1a2"], ["taller", "En taller u obra", "#f2cf8f"]];
  function pintarCotizaciones() {
    var q = ($("#p-buscar").value || "").trim().toLowerCase();
    $("#v-cotizaciones").innerHTML = '<div class="tablero">' + COLS.map(function (col, ci) {
      var items = DB.cot.filter(function (c) { return c.estado === col[0] && (!q || c.cliente.toLowerCase().indexOf(q) > -1); });
      var total = items.reduce(function (s, c) { return s + c.valor; }, 0);
      return '<div class="columna"><div class="columna-cab"><span style="color:var(--crema);font-weight:700"><i style="background:' + col[2] + '"></i>' + col[1] + " · " + items.length + "</span><span>" + corto(total) + "</span></div>" +
        items.map(function (c) {
          var i = DB.cot.indexOf(c);
          return '<div class="ficha ' + (c.mia ? "mia" : "") + '"><b>' + c.cliente + chip(c) + "</b><small>" + c.item + "</small><small>" + capital(hace(c.fecha)) + " · " + c.cel + '</small><div class="fila-ficha"><span class="dinero">' + pesos(c.valor) + "</span>" +
            (ci < COLS.length - 1 ? '<button data-mover="' + i + '">Mover →</button>' : "") + "</div></div>";
        }).join("") + "</div>";
    }).join("") + "</div>";
    $$("[data-mover]").forEach(function (b) {
      b.addEventListener("click", function () {
        var c = DB.cot[+b.dataset.mover], k = COLS.map(function (x) { return x[0]; }).indexOf(c.estado);
        c.estado = COLS[Math.min(COLS.length - 1, k + 1)][0];
        pintarCotizaciones();
      });
    });
  }

  /* ─── Agenda ─── */
  function pintarAgenda() {
    var futuras = DB.vis.filter(function (v) { return v.fecha >= hoy; }).sort(function (a, b) { return a.fecha - b.fecha; });
    var grupos = {};
    futuras.forEach(function (v) { var k = v.fecha.toDateString(); (grupos[k] = grupos[k] || []).push(v); });
    $("#v-agenda").innerHTML = '<div class="lista-dias">' + Object.keys(grupos).map(function (k) {
      var d = grupos[k][0].fecha, dif = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - hoy) / 86400000);
      var nombre = dif === 0 ? "Hoy" : dif === 1 ? "Mañana" : capital(fechaLarga(d));
      return '<div class="dia-agenda"><h4>' + nombre + "</h4>" + grupos[k].map(function (v) {
        return '<div class="cita ' + (v.mia ? "mia" : "") + '"><span class="h">' + hora(v.fecha) + "</span><span><b>" + v.cliente + chip(v) + "</b><small>" + v.tipo + " · " + v.dir + " · " + v.cel + (v.nota ? " · " + v.nota : "") + '</small></span><span class="estado e-ok">Confirmada por WhatsApp</span></div>';
      }).join("") + "</div>";
    }).join("") + "</div>";
  }

  /* ─── Obras ─── */
  function pintarObras() {
    $("#v-obras").innerHTML = '<div class="obras-lista">' + DB.obras.map(function (o) {
      return '<div class="obra-card"><img src="' + IMG + o.img + '-800.webp" alt=""><div><b>' + o.nombre + "</b><small>" + o.codigo + " · " + o.lugar + '</small><div class="progreso"><i data-ancho="' + o.avance + '"></i></div><small>' + o.avance + "% · etapa actual: " + o.etapa + "</small></div></div>";
    }).join("") + "</div>";
  }

  /* ─── Clientes ─── */
  function pintarClientes() {
    var q = ($("#p-buscar").value || "").trim().toLowerCase(), por = {};
    DB.cot.forEach(function (c) { var p = por[c.cliente] = por[c.cliente] || { n: c.cliente, cel: c.cel, ped: 0, total: 0, ult: c.item, f: c.fecha, mia: false }; p.ped++; p.total += c.valor; if (c.fecha >= p.f) { p.ult = c.item; p.f = c.fecha; } p.mia = p.mia || c.mia; });
    DB.vis.forEach(function (v) { var p = por[v.cliente] = por[v.cliente] || { n: v.cliente, cel: v.cel, ped: 0, total: 0, ult: v.tipo, f: v.creada || dia(-3), mia: false }; p.mia = p.mia || v.mia; });
    var filas = Object.keys(por).map(function (k) { return por[k]; }).filter(function (p) { return !q || p.n.toLowerCase().indexOf(q) > -1; }).sort(function (a, b) { return b.f - a.f; });
    $("#v-clientes").innerHTML = '<div class="caja"><div class="caja-cab"><b>Base de clientes</b><span>' + filas.length + ' personas · se llena sola</span></div><div class="desliza"><table class="tabla-p"><thead><tr><th>Cliente</th><th>Celular</th><th>Lo último que pidió</th><th>Cotizaciones</th><th>Total cotizado</th></tr></thead><tbody>' +
      filas.map(function (p) { return '<tr class="' + (p.mia ? "mia" : "") + '"><td><b style="font-weight:600">' + p.n + "</b>" + chip(p) + "</td><td>" + p.cel + "</td><td>" + p.ult + "</td><td>" + p.ped + '</td><td style="font-family:var(--serif);color:var(--oro-claro)">' + (p.total ? pesos(p.total) : "—") + "</td></tr>"; }).join("") +
      "</tbody></table></div></div>";
  }

  function capital(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function pintarTodo() { pintarResumen(); pintarCotizaciones(); pintarAgenda(); pintarObras(); pintarClientes(); pintarCuentas(); }
  function pintarCuentas() {
    var a = $("#cuenta-cot"), b = $("#cuenta-age"), c = $("#p-campana-n");
    a.textContent = nuevasCot; a.classList.toggle("on", nuevasCot > 0);
    b.textContent = nuevasVis; b.classList.toggle("on", nuevasVis > 0);
    c.textContent = sinLeer; c.classList.toggle("on", sinLeer > 0);
  }

  /* Números que cuentan, barras que crecen */
  function animar() {
    $$("#v-resumen [data-n]").forEach(function (el) {
      var fin = +el.dataset.n, c = !!el.dataset.corto, t0 = null;
      requestAnimationFrame(function paso(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1300), v = fin * (1 - Math.pow(1 - p, 4)); el.textContent = c ? corto(v) : Math.round(v); if (p < 1) requestAnimationFrame(paso); });
    });
    requestAnimationFrame(function () {
      $$(".barra-mes i").forEach(function (i, k) { setTimeout(function () { i.style.height = (i.dataset.alto * 1.45) + "px"; }, k * 90); });
      $$(".progreso i").forEach(function (i) { i.style.width = i.dataset.ancho + "%"; });
    });
  }

  function ir(v) {
    vista = v;
    $$("#lado-nav button").forEach(function (b) { b.classList.toggle("on", b.dataset.vista === v); });
    $$(".vista").forEach(function (x) { x.classList.toggle("on", x.dataset.vista === v); });
    if (v === "cotizaciones") { nuevasCot = 0; }
    if (v === "agenda") { nuevasVis = 0; }
    pintarCuentas();
    if (v === "resumen" || v === "obras") requestAnimationFrame(function () { $$(".progreso i").forEach(function (i) { i.style.width = i.dataset.ancho + "%"; }); });
    $(".principal").scrollTop = 0;
  }
  $$("#lado-nav button").forEach(function (b) { b.addEventListener("click", function () { ir(b.dataset.vista); if (b.dataset.vista === "resumen") animar(); }); });
  $("#p-buscar").addEventListener("input", function () { if (vista !== "clientes" && vista !== "cotizaciones") ir("clientes"); pintarClientes(); pintarCotizaciones(); });
  $("#p-campana").addEventListener("click", function () { ir("resumen"); animar(); sinLeer = 0; pintarCuentas(); });

  function abrir() {
    if (abierto) return;
    abierto = true; vecesAbierto++;
    pintarTodo(); ir(nuevasCot ? "resumen" : vista);
    var d = new Date(), h = d.getHours();
    $("#p-saludo").textContent = (h < 12 ? "Buenos días" : h < 19 ? "Buenas tardes" : "Buenas noches") + ", Don Jairo";
    $("#p-fecha").textContent = capital(fechaLarga(d));
    candado.classList.remove("fuera", "abierto");
    $$("#candado-clave i").forEach(function (i) { i.classList.remove("on"); });
    $("#candado-estado").textContent = "Verificando…";
    panel.classList.add("on"); panel.setAttribute("aria-hidden", "false");
    document.body.classList.add("panel-abierto");
    var rapido = vecesAbierto > 1, puntos = $$("#candado-clave i");
    puntos.forEach(function (i, k) { setTimeout(function () { i.classList.add("on"); }, (rapido ? 140 : 380) + k * (rapido ? 35 : 85)); });
    var t = rapido ? 420 : 1050;
    setTimeout(function () { candado.classList.add("abierto"); $("#candado-estado").textContent = "Bienvenido"; }, t);
    setTimeout(function () { candado.classList.add("fuera"); animar(); }, t + (rapido ? 220 : 420));
    try { if (window.parent !== window) window.parent.postMessage({ tipo: "panel-abierto" }, location.origin); } catch (e) {}
    setTimeout(function () { sinLeer = 0; pintarCuentas(); }, 4000);
  }
  function cerrar() {
    if (!abierto) return;
    abierto = false;
    panel.classList.remove("on"); panel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("panel-abierto");
  }
  $("#p-cerrar").addEventListener("click", cerrar);

  function avisarAlCatalogo() {
    try { if (window.parent !== window) window.parent.postMessage({ tipo: "nuevo-registro" }, location.origin); } catch (e) {}
    var c = $("#p-campana"); c.classList.remove("suena"); void c.offsetWidth; c.classList.add("suena");
  }
  function agregarCotizacion(c) {
    c.fecha = new Date(); c.estado = "nueva"; c.mia = true;
    DB.cot.unshift(c); sinLeer++; nuevasCot++; pintarCuentas(); avisarAlCatalogo();
    if (abierto) pintarTodo();
  }
  function agregarVisita(v) {
    v.creada = new Date(); v.mia = true;
    DB.vis.push(v); sinLeer++; nuevasVis++; pintarCuentas(); avisarAlCatalogo();
    if (abierto) pintarTodo();
  }
  function ocupadas(fecha) {
    return DB.vis.filter(function (v) { return v.fecha.toDateString() === fecha.toDateString(); }).map(function (v) { return v.fecha.getHours() * 60 + v.fecha.getMinutes(); });
  }

  window.Panel = { abrir: abrir, cerrar: cerrar, abierto: function () { return abierto; }, agregarCotizacion: agregarCotizacion, agregarVisita: agregarVisita, ocupadas: ocupadas, pesos: pesos, corto: corto, hora: hora, fechaLarga: fechaLarga, dia: dia, hoy: hoy };
  window.abrirPanel = abrir;
})();
