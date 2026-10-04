/* Dibujos del nivel 3, todos a escala y en SVG:
   · el mueble que la persona arma (cama, closet, comedor, cocina), con la foto real de cada madera
   · la casa de la calculadora de obra, separada por etapas para poder «construirla»
   · el plano que se dibuja al bajar */
(function () {
  "use strict";
  var IMG = "../assets/img/";
  var MADERAS = ["pino", "cedro", "roble", "nogal", "guayacan"];
  var PISO = 470;                       // la línea del piso en el escenario del mueble

  function n2(v) { return (Math.round(v * 100) / 100).toFixed(2).replace(".", ","); }

  /* ───────────── Definiciones comunes (texturas, luces, telas) ───────────── */
  function defs() {
    var p = MADERAS.map(function (m) {
      var img = '<image href="' + IMG + "madera-" + m + '-512.webp" width="260" height="260" preserveAspectRatio="xMidYMid slice"/>';
      // En las fotos de madera la veta corre de lado: para puertas y paneles (veta parada) se gira.
      return '<pattern id="veta-' + m + '-v" patternUnits="userSpaceOnUse" width="260" height="260" patternTransform="rotate(90)">' + img + "</pattern>" +
             '<pattern id="veta-' + m + '-h" patternUnits="userSpaceOnUse" width="260" height="260">' + img + "</pattern>";
    }).join("");
    return "<defs>" + p +
      '<radialGradient id="sombra-piso"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
      '<radialGradient id="resplandor"><stop offset="0" stop-color="#ffd59a" stop-opacity=".55"/><stop offset=".5" stop-color="#ffb35c" stop-opacity=".16"/><stop offset="1" stop-color="#ffb35c" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="luz-baja" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd59a" stop-opacity=".55"/><stop offset="1" stop-color="#ffd59a" stop-opacity="0"/></linearGradient>' +
      '<linearGradient id="colchon" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4efe7"/><stop offset="1" stop-color="#cfc5b6"/></linearGradient>' +
      '<linearGradient id="cobija" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9b9a2"/><stop offset="1" stop-color="#9c8b74"/></linearGradient>' +
      '<linearGradient id="almohada" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f3"/><stop offset="1" stop-color="#ddd3c4"/></linearGradient>' +
      '<pattern id="tela" patternUnits="userSpaceOnUse" width="6" height="6"><rect width="6" height="6" fill="#5e5952"/><path d="M0 6L6 0" stroke="#6a655d" stroke-width="1"/></pattern>' +
      '<linearGradient id="espejo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb2bd"/><stop offset=".45" stop-color="#5d6f7b"/><stop offset=".5" stop-color="#c9d6dd"/><stop offset=".56" stop-color="#5d6f7b"/><stop offset="1" stop-color="#3b4a54"/></linearGradient>' +
      '<linearGradient id="acabado-natural" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="560"><stop offset="0" stop-color="#ffcf8a" stop-opacity=".07"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
      '<linearGradient id="acabado-mate" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="900" y2="560"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient>' +
      '<linearGradient id="acabado-laca" gradientUnits="userSpaceOnUse" x1="150" y1="0" x2="750" y2="560"><stop offset="0" stop-color="#fff" stop-opacity=".04"/><stop offset=".38" stop-color="#fff" stop-opacity=".05"/><stop offset=".46" stop-color="#fff" stop-opacity=".34"/><stop offset=".52" stop-color="#fff" stop-opacity=".06"/><stop offset=".72" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient>' +
      '<linearGradient id="granito" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c2a27"/><stop offset=".5" stop-color="#3b3834"/><stop offset="1" stop-color="#2c2a27"/></linearGradient>' +
      '<linearGradient id="cuarzo" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ede9e2"/><stop offset=".6" stop-color="#f8f6f2"/><stop offset="1" stop-color="#e5e0d8"/></linearGradient>' +
      '<pattern id="baldosa" patternUnits="userSpaceOnUse" width="34" height="17"><rect width="34" height="17" fill="#2a241e"/><path d="M0 16.5H34M17 0V8.5M0 8H34M8.5 8.5V17M25.5 8.5V17" stroke="#3a322a" stroke-width="1"/></pattern>' +
      '<linearGradient id="vidrio-mesa" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#bfe0ea" stop-opacity=".25"/><stop offset=".5" stop-color="#e9f7fb" stop-opacity=".55"/><stop offset="1" stop-color="#bfe0ea" stop-opacity=".25"/></linearGradient>' +
      '<linearGradient id="metal" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d6f73"/><stop offset=".5" stop-color="#c9cbcf"/><stop offset="1" stop-color="#6d6f73"/></linearGradient>' +
      "</defs>";
  }

  /* ───────────── El mueble ───────────── */
  function Lienzo(anchoM, altoM, madera, acabado) {
    var s = Math.min(620 / anchoM, 340 / altoM, 290);
    this.s = s; this.x0 = 450 - anchoM * s / 2; this.ancho = anchoM; this.alto = altoM;
    this.madera = madera; this.acabado = acabado;
    this.atras = []; this.base = []; this.capa = []; this.encima = [];
  }
  Lienzo.prototype.X = function (m) { return this.x0 + m * this.s; };
  Lienzo.prototype.Y = function (m) { return PISO - m * this.s; };
  Lienzo.prototype.caja = function (x, y, w, h) {
    return 'x="' + this.X(x).toFixed(1) + '" y="' + this.Y(y + h).toFixed(1) + '" width="' + Math.max(0, w * this.s).toFixed(1) + '" height="' + Math.max(0, h * this.s).toFixed(1) + '"';
  };
  /* Una pieza de madera: la textura, el acabado encima y el filo. */
  Lienzo.prototype.madera_ = function (x, y, w, h, veta, extra, destino) {
    var c = this.caja(x, y, w, h), r = (extra && extra.r) || 1.5;
    (destino || this.base).push('<rect ' + c + ' rx="' + r + '" fill="url(#veta-' + this.madera + "-" + (veta || "v") + ')"/>');
    this.capa.push('<rect ' + c + ' rx="' + r + '" fill="url(#acabado-' + this.acabado + ')" class="borde-acabado" stroke="rgba(0,0,0,.42)" stroke-width="1"' + (extra && extra.oscuro ? ' style="fill:rgba(0,0,0,' + extra.oscuro + ')"' : "") + "/>");
  };
  Lienzo.prototype.ranura = function (x1, y1, x2, y2) { this.capa.push('<line x1="' + this.X(x1) + '" y1="' + this.Y(y1) + '" x2="' + this.X(x2) + '" y2="' + this.Y(y2) + '" class="ranura"/>'); };
  Lienzo.prototype.tirador = function (x, y, w, h) { this.encima.push('<rect ' + this.caja(x, y, w, h) + ' rx="2" class="tirador"/>'); };
  Lienzo.prototype.svg = function (cotas) {
    var w = this.ancho * this.s, out = [];
    out.push('<ellipse cx="450" cy="' + (PISO + 4) + '" rx="' + (w * 0.62) + '" ry="16" fill="url(#sombra-piso)"/>');
    out.push(this.atras.join(""), this.base.join(""), this.capa.join(""), this.encima.join(""));
    if (cotas) out.push(this.cotas());
    return out.join("");
  };
  Lienzo.prototype.cotas = function () {
    var xa = this.X(0), xb = this.X(this.ancho), yb = PISO + 38, ya = this.Y(this.alto), xr = xb + 30;
    return '<g class="cota">' +
      '<line x1="' + xa + '" y1="' + yb + '" x2="' + xb + '" y2="' + yb + '"/>' +
      '<line x1="' + xa + '" y1="' + (yb - 6) + '" x2="' + xa + '" y2="' + (yb + 6) + '"/><line x1="' + xb + '" y1="' + (yb - 6) + '" x2="' + xb + '" y2="' + (yb + 6) + '"/>' +
      '<rect x="' + ((xa + xb) / 2 - 38) + '" y="' + (yb - 11) + '" width="76" height="22" rx="11" fill="#1a130c" stroke="rgba(242,207,143,.4)"/>' +
      '<text x="' + ((xa + xb) / 2) + '" y="' + (yb + 4.5) + '" text-anchor="middle">' + n2(this.ancho) + ' m</text>' +
      '<line x1="' + xr + '" y1="' + PISO + '" x2="' + xr + '" y2="' + ya + '"/>' +
      '<line x1="' + (xr - 6) + '" y1="' + PISO + '" x2="' + (xr + 6) + '" y2="' + PISO + '"/><line x1="' + (xr - 6) + '" y1="' + ya + '" x2="' + (xr + 6) + '" y2="' + ya + '"/>' +
      '<text x="' + (xr + 10) + '" y="' + ((PISO + ya) / 2 + 4) + '">' + n2(this.alto) + ' m</text></g>';
  };

  function cama(c) {
    var ancho = { sencilla: 1.0, semidoble: 1.2, doble: 1.4, queen: 1.6, king: 2.0 }[c.medida] || 1.4;
    var Wb = ancho + 0.1, conMesas = c.extras.mesitas, off = conMesas ? 0.58 : 0;
    var L = new Lienzo(Wb + off * 2, 1.17, c.madera, c.acabado);
    if (c.extras.led) L.atras.push('<ellipse cx="' + L.X(off + Wb / 2) + '" cy="' + L.Y(1.12) + '" rx="' + (Wb * L.s * 0.75) + '" ry="' + (0.55 * L.s) + '" fill="url(#resplandor)"/>');
    // cabecero
    L.madera_(off, 0.3, Wb, 0.84, "v");
    if (c.extras.tapizado) {
      L.encima.push('<rect ' + L.caja(off + 0.07, 0.62, Wb - 0.14, 0.46) + ' rx="8" fill="url(#tela)" stroke="rgba(0,0,0,.35)"/>');
      for (var i = 1; i < Math.round((Wb - 0.14) / 0.2); i++) for (var j = 1; j <= 2; j++)
        L.encima.push('<circle cx="' + L.X(off + 0.07 + i * (Wb - 0.14) / Math.round((Wb - 0.14) / 0.2)) + '" cy="' + L.Y(0.62 + j * 0.46 / 3) + '" r="2.4" fill="#3b3833"/>');
    } else {
      for (var k = off + 0.11; k < off + Wb - 0.05; k += 0.11) L.ranura(k, 0.62, k, 1.1);
    }
    L.madera_(off - 0.02, 1.12, Wb + 0.04, 0.05, "h");
    if (c.extras.led) L.encima.push('<rect ' + L.caja(off + 0.02, 1.105, Wb - 0.04, 0.012) + ' fill="#ffe2a8" opacity=".95"/>');
    // almohadas, colchón y cobija
    var al = ancho <= 1.2 ? [[off + 0.05 + ancho * 0.15, ancho * 0.7]] : [[off + 0.05 + 0.04, ancho * 0.44], [off + 0.05 + ancho - 0.04 - ancho * 0.44, ancho * 0.44]];
    al.forEach(function (a) { L.encima.push('<rect ' + L.caja(a[0], 0.6, a[1], 0.2) + ' rx="' + (0.08 * L.s) + '" fill="url(#almohada)" stroke="rgba(0,0,0,.18)"/>'); });
    L.encima.push('<rect ' + L.caja(off + 0.05, 0.4, ancho, 0.26) + ' rx="7" fill="url(#colchon)" stroke="rgba(0,0,0,.2)"/>');
    L.encima.push('<rect ' + L.caja(off + 0.03, 0.36, ancho + 0.04, 0.2) + ' rx="6" fill="url(#cobija)" stroke="rgba(0,0,0,.22)"/>');
    L.encima.push('<path d="M' + L.X(off + 0.05) + " " + L.Y(0.5) + " Q" + L.X(off + 0.05 + ancho / 2) + " " + L.Y(0.47) + " " + L.X(off + 0.05 + ancho) + " " + L.Y(0.5) + '" stroke="rgba(255,255,255,.25)" fill="none"/>');
    // marco, cajones y patas
    var baseY = c.extras.cajones ? 0.07 : 0.17;
    L.madera_(off, baseY, Wb, 0.42 - baseY, "h");
    if (c.extras.cajones) {
      var cw = (Wb - 0.12) / 2;
      [0, 1].forEach(function (i) {
        var x = off + 0.04 + i * (cw + 0.04);
        L.encima.push('<rect ' + L.caja(x, 0.11, cw, 0.25) + ' rx="2" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="1.4"/>');
        L.tirador(x + cw / 2 - 0.1, 0.27, 0.2, 0.018);
      });
    }
    L.madera_(off + 0.02, 0, 0.07, baseY + 0.01, "v");
    L.madera_(off + Wb - 0.09, 0, 0.07, baseY + 0.01, "v");
    if (conMesas) [0, off + Wb + 0.08].forEach(function (x) {
      L.madera_(x + 0.03, 0.09, 0.44, 0.44, "v");
      L.madera_(x, 0.52, 0.5, 0.04, "h");
      L.madera_(x + 0.05, 0, 0.04, 0.1, "v"); L.madera_(x + 0.41, 0, 0.04, 0.1, "v");
      L.ranura(x + 0.03, 0.33, x + 0.47, 0.33);
      L.tirador(x + 0.19, 0.42, 0.12, 0.016);
      // lámpara
      L.encima.push('<rect ' + L.caja(x + 0.22, 0.56, 0.06, 0.16) + ' fill="#2b241d"/>');
      L.encima.push('<path d="M' + L.X(x + 0.12) + " " + L.Y(0.72) + " L" + L.X(x + 0.38) + " " + L.Y(0.72) + " L" + L.X(x + 0.33) + " " + L.Y(0.9) + " L" + L.X(x + 0.17) + " " + L.Y(0.9) + 'Z" fill="#e8dcc6" stroke="rgba(0,0,0,.25)"/>');
      if (c.extras.led) L.atras.push('<ellipse cx="' + L.X(x + 0.25) + '" cy="' + L.Y(0.8) + '" rx="' + (0.42 * L.s) + '" ry="' + (0.36 * L.s) + '" fill="url(#resplandor)"/>');
    });
    return L;
  }

  function closet(c) {
    var W = c.medida, H = 2.4, L = new Lienzo(W, H, c.madera, c.acabado);
    L.base.push('<rect ' + L.caja(0.02, 0, W - 0.04, 0.08) + ' fill="#17110c"/>');
    L.madera_(0, 0.08, W, H - 0.08, "v", { oscuro: 0.25 });
    var techoPuertas = c.extras.altillo ? 1.96 : 2.37;
    if (c.extras.altillo) {
      var na = Math.max(2, Math.round(W / 0.6)), wa = W / na;
      for (var a = 0; a < na; a++) { L.madera_(a * wa + 0.006, 1.99, wa - 0.012, 0.38, "h"); L.tirador(a * wa + wa / 2 - 0.06, 2.03, 0.12, 0.015); }
    }
    if (c.extras.led) L.encima.push('<rect ' + L.caja(0.04, techoPuertas - 0.005, W - 0.08, 0.012) + ' fill="#ffe2a8"/><rect ' + L.caja(0.04, techoPuertas - 0.45, W - 0.08, 0.44) + ' fill="url(#luz-baja)" opacity=".4" transform="scale(1,-1) translate(0,' + (-2 * L.Y(techoPuertas) + 0) + ')"/>');
    var hp = techoPuertas - 0.1;
    if (c.extras.corredizas) {
      var n = W <= 1.4 ? 2 : W <= 2.4 ? 3 : 4, pw = W / n + 0.03;
      L.encima.push('<rect ' + L.caja(0, techoPuertas, W, 0.03) + ' fill="url(#metal)"/><rect ' + L.caja(0, 0.08, W, 0.025) + ' fill="url(#metal)"/>');
      for (var i = 0; i < n; i++) {
        var x = Math.min(W - pw, i * (W / n) - (i ? 0.015 : 0));
        L.madera_(x, 0.1, pw, hp, "v", i % 2 ? { oscuro: 0.18 } : null);
        L.encima.push('<rect ' + L.caja(x + (i % 2 ? pw - 0.05 : 0.025), 0.8, 0.022, 0.6) + ' rx="2" fill="rgba(0,0,0,.45)"/>');
        if (c.extras.espejo && i === 1) L.encima.push('<rect ' + L.caja(x + 0.07, 0.25, pw - 0.14, hp - 0.32) + ' rx="3" fill="url(#espejo)" stroke="rgba(0,0,0,.35)"/>');
      }
    } else {
      var np = Math.max(2, Math.round(W / 0.5)), dw = W / np;
      for (var d = 0; d < np; d++) {
        var xd = d * dw + 0.005;
        L.madera_(xd, 0.1, dw - 0.01, hp, "v");
        L.tirador(d % 2 ? xd + 0.03 : xd + dw - 0.055, 0.85, 0.016, 0.42);
        if (c.extras.espejo && d === Math.floor((np - 1) / 2)) L.encima.push('<rect ' + L.caja(xd + 0.06, 0.25, dw - 0.13, hp - 0.32) + ' rx="3" fill="url(#espejo)" stroke="rgba(0,0,0,.35)"/>');
      }
    }
    return L;
  }

  function comedor(c) {
    var Lm = { 4: 1.2, 6: 1.6, 8: 2.0, 10: 2.4 }[c.medida] || 1.6, H = c.extras.sillas ? 0.98 : 0.78;
    var L = new Lienzo(Lm, H, c.madera, c.acabado);
    if (c.extras.sillas) {
      var ns = c.medida / 2, paso = (Lm - 0.3) / ns;
      for (var i = 0; i < ns; i++) {
        var cx = 0.15 + paso * (i + 0.5);
        L.madera_(cx - 0.2, 0.72, 0.4, 0.26, "v", { oscuro: 0.38 });
        for (var r = cx - 0.12; r < cx + 0.15; r += 0.08) L.ranura(r, 0.77, r, 0.95);
        L.madera_(cx - 0.17, 0, 0.035, 0.45, "v", { oscuro: 0.4 });
        L.madera_(cx + 0.135, 0, 0.035, 0.45, "v", { oscuro: 0.4 });
        L.madera_(cx - 0.2, 0.43, 0.4, 0.04, "h", { oscuro: 0.4 });
      }
    }
    if (c.extras.metalica) {
      [0.12, Lm - 0.62].forEach(function (x) {
        L.encima.push('<path d="M' + L.X(x + 0.06) + " " + L.Y(0.71) + " L" + L.X(x + 0.44) + " " + L.Y(0.71) + " L" + L.X(x + 0.5) + " " + L.Y(0) + " L" + L.X(x) + " " + L.Y(0) + 'Z" fill="none" stroke="#141416" stroke-width="' + (0.045 * L.s) + '" stroke-linejoin="round"/>');
      });
    } else {
      L.madera_(0.1, 0.6, Lm - 0.2, 0.11, "h");
      [0.1, Lm - 0.19].forEach(function (x) {
        L.base.push('<path d="M' + L.X(x) + " " + L.Y(0.71) + " L" + L.X(x + 0.09) + " " + L.Y(0.71) + " L" + L.X(x + 0.075) + " " + L.Y(0) + " L" + L.X(x + 0.015) + " " + L.Y(0) + 'Z" fill="url(#veta-' + c.madera + '-v)"/>');
        L.capa.push('<path d="M' + L.X(x) + " " + L.Y(0.71) + " L" + L.X(x + 0.09) + " " + L.Y(0.71) + " L" + L.X(x + 0.075) + " " + L.Y(0) + " L" + L.X(x + 0.015) + " " + L.Y(0) + 'Z" fill="url(#acabado-' + c.acabado + ')" stroke="rgba(0,0,0,.42)"/>');
      });
    }
    if (c.extras.borde) {
      var pts = [], pasos = 24;
      for (var k = 0; k <= pasos; k++) { var xm = Lm * k / pasos; pts.push(L.X(xm).toFixed(1) + " " + L.Y(0.765 + Math.sin(k * 1.7) * 0.006 + Math.sin(k * 0.6) * 0.008).toFixed(1)); }
      var d = "M" + L.X(0.015) + " " + L.Y(0.71) + " L" + pts.join(" L") + " L" + L.X(Lm - 0.01) + " " + L.Y(0.71) + "Z";
      L.encima.push('<path d="' + d + '" fill="url(#veta-' + c.madera + '-h)"/><path d="' + d + '" fill="url(#acabado-' + c.acabado + ')" stroke="rgba(0,0,0,.45)"/>');
    } else {
      L.madera_(0, 0.71, Lm, 0.055, "h", null, L.encima);
      L.encima.push(L.capa.pop());
    }
    if (c.extras.vidrio) L.encima.push('<rect ' + L.caja(0.03, 0.768, Lm - 0.06, 0.012) + ' fill="url(#vidrio-mesa)"/>');
    return L;
  }

  function cocina(c) {
    var Lm = c.medida, Htop = c.extras.techo ? 2.4 : 2.18, L = new Lienzo(Lm, Htop, c.madera, c.acabado);
    var n = Math.max(3, Math.round(Lm / 0.6)), mw = Lm / n;
    L.atras.push('<rect ' + L.caja(0, 0.9, Lm, 0.56) + ' fill="url(#baldosa)"/>');
    if (c.extras.luz) L.atras.push('<rect ' + L.caja(0, 0.9, Lm, 0.56) + ' fill="url(#luz-baja)"/>');
    L.base.push('<rect ' + L.caja(0.02, 0, Lm - 0.04, 0.1) + ' fill="#17110c"/>');
    var horno = n >= 4 ? 2 : -1, lavaplatos = 1;
    for (var i = 0; i < n; i++) {
      var x = i * mw + 0.004, w = mw - 0.008;
      if (i === horno) {
        L.encima.push('<rect ' + L.caja(x, 0.1, w, 0.76) + ' fill="#141416" stroke="rgba(0,0,0,.6)"/><rect ' + L.caja(x + 0.05, 0.18, w - 0.1, 0.45) + ' rx="4" fill="#25282d" stroke="#3a3e44"/><rect ' + L.caja(x + 0.08, 0.68, w - 0.16, 0.025) + ' rx="2" fill="url(#metal)"/>');
        continue;
      }
      L.madera_(x, 0.1, w, 0.76, "v");
      if (c.extras.cajones && (i === 0 || i === n - 1)) {
        [0.36, 0.61].forEach(function (y) { L.ranura(x, y, x + w, y); });
        [0.25, 0.5, 0.75].forEach(function (y) { L.tirador(x + w / 2 - 0.08, y, 0.16, 0.015); });
      } else L.tirador(x + w / 2 - 0.09, 0.78, 0.18, 0.015);
    }
    L.encima.push('<rect ' + L.caja(-0.01, 0.86, Lm + 0.02, 0.04) + ' fill="url(#' + (c.extras.cuarzo ? "cuarzo" : "granito") + ')" stroke="rgba(0,0,0,.35)"/>');
    var xl = lavaplatos * mw + mw / 2;
    L.encima.push('<path d="M' + L.X(xl - 0.02) + " " + L.Y(0.9) + " L" + L.X(xl - 0.02) + " " + L.Y(1.18) + " Q" + L.X(xl - 0.02) + " " + L.Y(1.26) + " " + L.X(xl + 0.08) + " " + L.Y(1.26) + " L" + L.X(xl + 0.12) + " " + L.Y(1.2) + '" fill="none" stroke="url(#metal)" stroke-width="' + (0.025 * L.s) + '" stroke-linecap="round"/>');
    if (horno >= 0) L.encima.push('<rect ' + L.caja(horno * mw + 0.03, 0.9, mw - 0.06, 0.012) + ' fill="#0f0f10"/>');
    for (var j = 0; j < n; j++) {
      var xs = j * mw + 0.004, ws = mw - 0.008;
      if (j === horno) {
        L.encima.push('<path d="M' + L.X(xs - 0.02) + " " + L.Y(1.5) + " L" + L.X(xs + ws + 0.02) + " " + L.Y(1.5) + " L" + L.X(xs + ws - 0.1) + " " + L.Y(1.72) + " L" + L.X(xs + 0.1) + " " + L.Y(1.72) + 'Z" fill="url(#metal)" stroke="rgba(0,0,0,.4)"/><rect ' + L.caja(xs + 0.16, 1.72, ws - 0.32, Htop - 1.72) + ' fill="url(#metal)" stroke="rgba(0,0,0,.35)"/>');
        continue;
      }
      L.madera_(xs, 1.46, ws, Htop - 1.46, "v");
      L.tirador(xs + ws / 2 - 0.08, 1.5, 0.16, 0.015);
    }
    if (c.extras.luz) L.encima.push('<rect ' + L.caja(0.02, 1.44, Lm - 0.04, 0.012) + ' fill="#ffe2a8"/>');
    return L;
  }

  var PIEZAS = { cama: cama, closet: closet, comedor: comedor, cocina: cocina };
  function mueble(c) { return PIEZAS[c.pieza](c).svg(true); }

  /* ───────────── La casa de la calculadora ───────────── */
  function casa(c) {
    var suelo = 392, pisos = c.pisos, huella = c.area / pisos;
    var cabana = c.tipo === "cabana", segundo = c.tipo === "segundo", remodela = c.tipo === "remodelacion";
    if (segundo) pisos = Math.max(2, pisos);
    var w = Math.max(230, Math.min(560, 110 + Math.sqrt(huella) * 40));
    var fh = cabana ? 70 : 88, x0 = 450 - w / 2, top = suelo - pisos * fh;
    var techoAlto = cabana ? Math.min(220, w * 0.55) : Math.min(140, w * 0.3);
    var vol = 18;
    var o = [];
    o.push('<defs><pattern id="casa-veta" patternUnits="userSpaceOnUse" width="200" height="200"><image href="' + IMG + 'madera-' + (c.acabado === "premium" ? "nogal" : c.acabado === "basico" ? "pino" : "cedro") + '-512.webp" width="200" height="200" preserveAspectRatio="xMidYMid slice"/></pattern>' +
      '<linearGradient id="cielo-luz" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd08a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd08a" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="ventana-luz"><stop offset="0" stop-color="#ffd690" stop-opacity=".5"/><stop offset="1" stop-color="#ffd690" stop-opacity="0"/></radialGradient></defs>');
    // montañas al fondo
    o.push('<path d="M0 300 L120 210 L210 262 L330 170 L450 250 L560 190 L690 260 L790 205 L900 255 L900 400 L0 400Z" fill="#1d2630" opacity=".7"/>');
    o.push('<path d="M0 330 L150 270 L260 310 L400 255 L520 300 L650 262 L780 312 L900 280 L900 400 L0 400Z" fill="#232e2a" opacity=".85"/>');
    o.push('<rect x="0" y="' + suelo + '" width="900" height="' + (470 - suelo) + '" class="suelo"/><rect x="0" y="' + suelo + '" width="900" height="8" class="pasto"/>');
    // plano (solo en la etapa de diseño)
    o.push('<g class="fase f-plano" data-solo="1"><rect x="' + x0 + '" y="' + top + '" width="' + w + '" height="' + (pisos * fh) + '" class="nuevo"/><path d="M' + (x0 - vol) + " " + top + " L450 " + (top - techoAlto) + " L" + (x0 + w + vol) + " " + top + '" class="nuevo"/></g>');
    // existente (segundo piso)
    if (segundo) o.push('<g><rect x="' + x0 + '" y="' + (suelo - fh) + '" width="' + w + '" height="' + fh + '" class="muro-existente"/>' + ventanas(x0, suelo - fh, w, fh, false, true) + "</g>");
    var desde = segundo ? 1 : 0;
    // cimientos
    o.push('<g class="fase f-cimientos"><rect x="' + (x0 - 12) + '" y="' + (segundo ? suelo - fh - 6 : suelo - 4) + '" width="' + (w + 24) + '" height="' + (segundo ? 8 : 16) + '" class="cimiento"/>' +
      '<g class="f-varillas">' + rango(x0 + 10, x0 + w - 10, 34).map(function (x) { return '<line x1="' + x + '" y1="' + (segundo ? suelo - fh - 6 : suelo - 4) + '" x2="' + x + '" y2="' + ((segundo ? suelo - fh : suelo) - 34) + '" class="varilla"/>'; }).join("") + "</g></g>");
    // estructura
    var est = [];
    for (var p = desde; p < pisos; p++) {
      var yb = suelo - p * fh, yt = yb - fh;
      est.push('<line x1="' + x0 + '" y1="' + yt + '" x2="' + (x0 + w) + '" y2="' + yt + '"/>');
      rango(x0, x0 + w, 30).forEach(function (x) { est.push('<line x1="' + x + '" y1="' + yb + '" x2="' + x + '" y2="' + yt + '"/>'); });
    }
    est.push('<path d="M' + (x0 - vol) + " " + top + " L450 " + (top - techoAlto) + " L" + (x0 + w + vol) + " " + top + 'Z" fill="none"/>');
    est.push('<line x1="450" y1="' + top + '" x2="450" y2="' + (top - techoAlto) + '"/>');
    est.push('<line x1="' + (450 - w / 4) + '" y1="' + top + '" x2="450" y2="' + (top - techoAlto * 0.55) + '"/><line x1="' + (450 + w / 4) + '" y1="' + top + '" x2="450" y2="' + (top - techoAlto * 0.55) + '"/>');
    o.push('<g class="fase f-estructura estructura">' + est.join("") + "</g>");
    // muros
    var mur = [];
    for (var q = desde; q < pisos; q++) {
      var ybq = suelo - q * fh;
      mur.push('<rect x="' + x0 + '" y="' + (ybq - fh) + '" width="' + w + '" height="' + fh + '" class="' + (remodela ? "muro-existente" : "muro") + '"/>');
      rango(ybq - fh + 11, ybq - 2, 11).forEach(function (y) { mur.push('<line x1="' + x0 + '" y1="' + y + '" x2="' + (x0 + w) + '" y2="' + y + '" stroke="rgba(0,0,0,.18)"/>'); });
      mur.push('<rect x="' + x0 + '" y="' + (ybq - 5) + '" width="' + w + '" height="5" fill="rgba(0,0,0,.35)"/>');
    }
    if (cabana) mur.push('<path d="M' + x0 + " " + top + " L450 " + (top - techoAlto) + " L" + (x0 + w) + " " + top + 'Z" class="muro"/>');
    o.push('<g class="fase f-muros">' + mur.join("") + "</g>");
    // techo
    var tg = cabana ? 22 : 16;
    o.push('<g class="fase f-techo"><path d="M' + (x0 - vol - 6) + " " + (top + 4) + " L450 " + (top - techoAlto - 10) + " L" + (x0 + w + vol + 6) + " " + (top + 4) + " L" + (x0 + w + vol + 6 - tg * 0.6) + " " + (top + 4 + tg * 0.35) + " L450 " + (top - techoAlto - 10 + tg) + " L" + (x0 - vol - 6 + tg * 0.6) + " " + (top + 4 + tg * 0.35) + 'Z" class="techo"/>' +
      (cabana ? "" : '<path d="M' + x0 + " " + top + " L450 " + (top - techoAlto + 10) + " L" + (x0 + w) + " " + top + 'Z" class="' + (remodela ? "muro-existente" : "muro") + '"/>') + "</g>");
    // ventanas y puerta
    var ven = [];
    for (var v = desde; v < pisos; v++) ven.push(ventanas(x0, suelo - (v + 1) * fh, w, fh, v === 0, false));
    ven.push('<rect x="' + (450 - 22) + '" y="' + (top - techoAlto * 0.55) + '" width="44" height="' + (techoAlto * 0.32) + '" class="ventanal" rx="3"/>');
    if (segundo) ven.push('<text x="' + (x0 + w + 16) + '" y="' + (suelo - fh - (pisos - 1) * fh / 2) + '">NUEVO</text><rect x="' + (x0 - 6) + '" y="' + (top - 6) + '" width="' + (w + 12) + '" height="' + ((pisos - 1) * fh + 6) + '" class="nuevo"/>');
    o.push('<g class="fase f-ventanas">' + ven.join("") + "</g>");
    // entrega: luces, matas y camino
    var ent = ['<ellipse cx="450" cy="' + (suelo - pisos * fh / 2) + '" rx="' + (w * 0.9) + '" ry="' + (pisos * fh) + '" fill="url(#ventana-luz)" opacity=".6"/>'];
    [[x0 - 40, 26], [x0 - 12, 18], [x0 + w + 16, 24], [x0 + w + 44, 17]].forEach(function (a) { ent.push('<ellipse cx="' + a[0] + '" cy="' + (suelo + 2) + '" rx="' + a[1] + '" ry="' + (a[1] * 0.75) + '" class="arbusto"/>'); });
    ent.push('<path d="M430 ' + (suelo + 6) + ' L470 ' + (suelo + 6) + ' L520 470 L380 470Z" fill="#5a4a38" opacity=".7"/>');
    if (remodela) ent.push('<rect x="' + (x0 + 14) + '" y="' + (suelo - fh + 10) + '" width="' + Math.min(w - 28, (w - 28) * c.area / 160) + '" height="' + (fh - 20) + '" class="nuevo"/><text x="' + (x0 + 22) + '" y="' + (suelo - fh - 10) + '">ZONA A REMODELAR</text>');
    o.push('<g class="fase f-entrega">' + ent.join("") + "</g>");
    return o.join("");

    function ventanas(x, y, ancho, alto, conPuerta, existente) {
      var k = Math.max(2, Math.floor(ancho / 110)), sal = [], paso = ancho / k;
      for (var i = 0; i < k; i++) {
        var cx = x + paso * (i + 0.5);
        if (conPuerta && i === Math.floor(k / 2)) { sal.push('<rect x="' + (cx - 17) + '" y="' + (y + alto - 62) + '" width="34" height="58" class="puerta" rx="2"/>'); continue; }
        sal.push('<rect x="' + (cx - 19) + '" y="' + (y + 20) + '" width="38" height="' + (alto - 46) + '" rx="2" class="ventanal' + (existente ? " luz" : "") + '"/>');
        sal.push('<line x1="' + cx + '" y1="' + (y + 20) + '" x2="' + cx + '" y2="' + (y + alto - 26) + '" stroke="#2e241b" stroke-width="2"/>');
      }
      return sal.join("");
    }
  }
  function rango(a, b, paso) { var r = []; for (var x = a; x <= b + 0.1; x += paso) r.push(Math.round(x * 10) / 10); return r; }

  /* ───────────── El plano que se dibuja al bajar ───────────── */
  function plano() {
    var L = [];
    var tierra = 430;
    L.push('<path d="M40 ' + tierra + 'H760"/>');
    for (var x = 50; x < 760; x += 22) L.push('<path class="cota" d="M' + x + " " + (tierra + 4) + " l-12 14\"/>");
    // casa de dos pisos con corredor, como la de la foto
    L.push('<path d="M190 ' + tierra + 'V250H610V' + tierra + '"/>');
    L.push('<path d="M190 340H610"/>');
    L.push('<path d="M160 250L400 150L640 250Z"/>');
    L.push('<path d="M150 340H650M170 340V' + tierra + 'M630 340V' + tierra + '"/>');
    [230, 300, 450, 520].forEach(function (x) { L.push('<rect x="' + x + '" y="270" width="50" height="52"/><path d="M' + (x + 25) + ' 270V322M' + x + ' 296H' + (x + 50) + '"/>'); });
    L.push('<rect x="372" y="360" width="56" height="70"/><path d="M400 360V430"/>');
    [230, 470].forEach(function (x) { L.push('<rect x="' + x + '" y="360" width="80" height="48"/><path d="M' + (x + 40) + ' 360V408"/>'); });
    L.push('<rect x="378" y="186" width="44" height="40"/>');
    // cotas
    L.push('<path class="cota" d="M190 470H610M190 462V478M610 462V478"/>');
    L.push('<text x="400" y="494" text-anchor="middle">8,40 m</text>');
    L.push('<path class="cota" d="M690 ' + tierra + 'V150M682 ' + tierra + 'H698M682 150H698"/>');
    L.push('<text x="702" y="295">6,20 m</text>');
    L.push('<text x="60" y="60">FACHADA PRINCIPAL · ESC. 1:50</text>');
    L.push('<path class="cota" d="M60 72H330"/>');
    return L.join("");
  }

  window.Dibujos = { defs: defs, mueble: mueble, casa: casa, plano: plano, MADERAS: MADERAS };
})();
