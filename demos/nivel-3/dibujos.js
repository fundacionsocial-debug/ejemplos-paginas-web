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
      '<pattern id="baldosa-clara" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="#e4e0d8"/><path d="M0 .5H40M.5 0V40" stroke="#cdc8be"/></pattern>' +
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
    // La medida que se marca es la del mueble (sin marco ni pared), si la pieza la fijó.
    var ax = this.cotaX || 0, aw = this.cotaW || this.ancho, ah = this.cotaH || this.alto;
    var xa = this.X(ax), xb = this.X(ax + aw), yb = PISO + 38, ya = this.Y(ah), xr = this.X(this.ancho) + 30;
    return '<g class="cota">' +
      '<line x1="' + xa + '" y1="' + yb + '" x2="' + xb + '" y2="' + yb + '"/>' +
      '<line x1="' + xa + '" y1="' + (yb - 6) + '" x2="' + xa + '" y2="' + (yb + 6) + '"/><line x1="' + xb + '" y1="' + (yb - 6) + '" x2="' + xb + '" y2="' + (yb + 6) + '"/>' +
      '<rect x="' + ((xa + xb) / 2 - 38) + '" y="' + (yb - 11) + '" width="76" height="22" rx="11" fill="#1a130c" stroke="rgba(242,207,143,.4)"/>' +
      '<text x="' + ((xa + xb) / 2) + '" y="' + (yb + 4.5) + '" text-anchor="middle">' + n2(aw) + ' m</text>' +
      '<line x1="' + xr + '" y1="' + PISO + '" x2="' + xr + '" y2="' + ya + '"/>' +
      '<line x1="' + (xr - 6) + '" y1="' + PISO + '" x2="' + (xr + 6) + '" y2="' + PISO + '"/><line x1="' + (xr - 6) + '" y1="' + ya + '" x2="' + (xr + 6) + '" y2="' + ya + '"/>' +
      '<text x="' + (xr + 10) + '" y="' + ((PISO + ya) / 2 + 4) + '">' + n2(ah) + ' m</text></g>';
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

  function puerta(c) {
    var W = +c.medida || 0.9, H = 2.1, ch = c.extras.chambrana ? 0.08 : 0, mc = 0.05;
    var L = new Lienzo(W + 2 * (mc + ch), H + mc + ch + 0.02, c.madera, c.acabado);
    var x0 = ch + mc;
    L.cotaX = x0; L.cotaW = W; L.cotaH = H;
    if (ch) {
      L.madera_(0, 0, ch, H + mc + ch, "v");
      L.madera_(W + 2 * mc + ch, 0, ch, H + mc + ch, "v");
      L.madera_(0, H + mc, W + 2 * (mc + ch), ch, "h");
    }
    L.madera_(ch, 0, mc, H + mc, "v", { oscuro: 0.2 });
    L.madera_(ch + mc + W, 0, mc, H + mc, "v", { oscuro: 0.2 });
    L.madera_(ch, H, W + 2 * mc, mc, "h", { oscuro: 0.2 });
    var hojas = W >= 1.2 ? 2 : 1, hw = W / hojas;
    for (var i = 0; i < hojas; i++) {
      var x = x0 + i * hw;
      L.madera_(x + 0.004, 0.01, hw - 0.008, H - 0.012, "v");
      if (c.extras.vidrio) {
        L.encima.push('<rect ' + L.caja(x + hw / 2 - 0.08, 0.35, 0.16, 1.45) + ' rx="2" fill="#cfe3ea" opacity=".55" stroke="rgba(0,0,0,.45)"/>');
        L.encima.push('<path d="M' + L.X(x + hw / 2 - 0.05) + " " + L.Y(1.6) + " L" + L.X(x + hw / 2 + 0.04) + " " + L.Y(1.75) + '" stroke="#fff" stroke-opacity=".6" stroke-width="2"/>');
      } else {
        [1 / 3, 2 / 3].forEach(function (f) { L.ranura(x + hw * f, 0.15, x + hw * f, H - 0.15); });
      }
      var lado = hojas === 2 ? (i === 0 ? hw - 0.09 : 0.03) : hw - 0.12;
      L.encima.push('<circle cx="' + L.X(x + lado + 0.03) + '" cy="' + L.Y(1.02) + '" r="' + (0.03 * L.s) + '" fill="url(#metal)" stroke="rgba(0,0,0,.4)"/>');
      L.encima.push('<rect ' + L.caja(hojas === 2 && i === 0 ? x + lado - 0.11 : x + lado + 0.03 - (hojas === 2 ? 0 : 0.11), 1.008, 0.14, 0.024) + ' rx="3" fill="url(#metal)" stroke="rgba(0,0,0,.35)"/>');
      if (c.extras.digital && (hojas === 1 || i === 1)) {
        L.encima.push('<rect ' + L.caja(x + lado, 1.12, 0.06, 0.16) + ' rx="3" fill="#121214" stroke="#3a3c40"/>');
        for (var k = 0; k < 3; k++) L.encima.push('<circle cx="' + L.X(x + lado + 0.03) + '" cy="' + L.Y(1.24 - k * 0.04) + '" r="1.6" fill="#7fd1ff"/>');
      }
    }
    return L;
  }

  function bano(c) {
    var W = +c.medida || 0.9, L = new Lienzo(W + 0.3, 2.0, c.madera, c.acabado);
    var x0 = 0.15;
    L.cotaX = x0; L.cotaW = W; L.cotaH = 0.86;
    L.atras.push('<rect ' + L.caja(0, 0, W + 0.3, 2.0) + ' fill="url(#baldosa-clara)"/>');
    if (c.extras.luz) L.atras.push('<ellipse cx="' + L.X(x0 + W / 2) + '" cy="' + L.Y(1.5) + '" rx="' + ((W / 2 + 0.25) * L.s) + '" ry="' + (0.5 * L.s) + '" fill="url(#resplandor)"/>');
    L.encima.push('<rect ' + L.caja(x0 + 0.06, 1.15, W - 0.12, 0.7) + ' rx="6" fill="url(#espejo)" stroke="rgba(0,0,0,.35)"/>');
    if (c.extras.luz) L.encima.push('<rect ' + L.caja(x0 + 0.06, 1.15, W - 0.12, 0.7) + ' rx="6" fill="none" stroke="#ffe2a8" stroke-width="3" opacity=".9"/>');
    if (c.extras.repisa) { L.madera_(x0 + 0.1, 1.02, W - 0.2, 0.035, "h"); L.encima.push('<rect ' + L.caja(x0 + 0.2, 1.055, 0.06, 0.1) + ' rx="2" fill="#e9e4da"/><rect ' + L.caja(x0 + 0.3, 1.055, 0.05, 0.14) + ' rx="2" fill="#6f8a7a"/>'); }
    L.madera_(x0, 0.42, W, 0.4, "v");
    if (c.extras.cajones) {
      [0.55, 0.69].forEach(function (y) { L.ranura(x0, y, x0 + W, y); });
      [0.49, 0.62, 0.76].forEach(function (y) { L.tirador(x0 + W / 2 - 0.08, y, 0.16, 0.014); });
    } else {
      var np = W >= 1.1 ? 2 : 1, pw = W / np;
      for (var i = 1; i < np; i++) L.ranura(x0 + pw * i, 0.42, x0 + pw * i, 0.82);
      for (var j = 0; j < np; j++) L.tirador(x0 + pw * j + pw / 2 - 0.08, 0.74, 0.16, 0.014);
    }
    L.encima.push('<rect ' + L.caja(x0 - 0.01, 0.82, W + 0.02, 0.04) + ' fill="url(#' + (c.extras.cuarzo ? "cuarzo" : "granito") + ')" stroke="rgba(0,0,0,.35)"/>');
    var lavas = W >= 1.3 ? [W * 0.28, W * 0.72] : [W / 2];
    lavas.forEach(function (cx) {
      L.encima.push('<path d="M' + L.X(x0 + cx - 0.04) + " " + L.Y(0.86) + " L" + L.X(x0 + cx - 0.04) + " " + L.Y(1.06) + " Q" + L.X(x0 + cx - 0.04) + " " + L.Y(1.1) + " " + L.X(x0 + cx + 0.03) + " " + L.Y(1.1) + '" fill="none" stroke="url(#metal)" stroke-width="' + (0.018 * L.s) + '" stroke-linecap="round"/>');
      L.encima.push('<ellipse cx="' + L.X(x0 + cx + 0.03) + '" cy="' + L.Y(0.9) + '" rx="' + (0.17 * L.s) + '" ry="' + (0.05 * L.s) + '" fill="#f6f4ef" stroke="rgba(0,0,0,.3)"/>');
    });
    return L;
  }

  var PIEZAS = { cama: cama, closet: closet, comedor: comedor, cocina: cocina, puerta: puerta, bano: bano };
  function mueble(c) { return PIEZAS[c.pieza](c).svg(true); }

  /* ───────────── El espacio de la calculadora de remodelación ─────────────
     Una pared vista de frente. Cada etapa de la obra es un grupo («fase»), para poder
     mostrarla remodelándose: lo viejo, el plano, la pared pelada, las tuberías, el enchape,
     los muebles, los acabados y las luces. */
  function espacio(c) {
    var T = c.tipo, a = c.area, o = [];
    var mad = c.acabado === "premium" ? "nogal" : c.acabado === "basico" ? "pino" : "roble";
    var img = '<image href="' + IMG + "madera-" + mad + '-512.webp" width="180" height="180" preserveAspectRatio="xMidYMid slice"/>';
    var PISO = 392, TECHO = 18;
    function R(x, y, w, h, extra) { return '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + h.toFixed(1) + '" ' + (extra || "") + "/>"; }
    function madera(x, y, w, h, veta, extra) { return R(x, y, w, h, 'fill="url(#esp-' + (veta || "v") + ')" stroke="rgba(0,0,0,.4)" ' + (extra || "")); }
    function tirador(x, y, w, h) { return R(x, y, w, h, 'rx="1.5" fill="#d6d0c4"'); }
    function plano(x, y, w, h) { return R(x, y, w, h, 'fill="none" stroke="#f2b41b" stroke-width="2" stroke-dasharray="7 5"'); }
    function tubo(d, color) { return '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>'; }
    function caja(x, y) { return R(x - 7, y - 9, 14, 18, 'rx="2" fill="#e8873a" stroke="#9c5317"'); }
    function brillo(cx, cy, rx, ry) { return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" fill="url(#luz-calida)"/>'; }
    function escombros() {
      return '<path d="M120 392 L150 360 L190 372 L222 352 L260 392Z" fill="#7a746b"/><path d="M590 392 L622 368 L655 378 L690 356 L735 392Z" fill="#8a8378"/>' +
        R(290, 360, 46, 32, 'rx="8" fill="#ecebe6" stroke="#bdbab2"') + R(330, 366, 44, 26, 'rx="8" fill="#e2e0da" stroke="#bdbab2"') +
        '<path d="M470 392 L480 376 L520 376 L530 392Z" fill="#5e5a54"/>' + R(486, 344, 6, 34, 'fill="#8a6a45"');
    }
    o.push('<defs>' +
      '<pattern id="esp-v" patternUnits="userSpaceOnUse" width="180" height="180" patternTransform="rotate(90)">' + img + "</pattern>" +
      '<pattern id="esp-h" patternUnits="userSpaceOnUse" width="180" height="180">' + img + "</pattern>" +
      '<pattern id="b-grande" patternUnits="userSpaceOnUse" width="60" height="60"><rect width="60" height="60" fill="#d8d5ce"/><path d="M0 .5H60M.5 0V60" stroke="#bdb9b0"/></pattern>' +
      '<pattern id="b-metro" patternUnits="userSpaceOnUse" width="30" height="15"><rect width="30" height="15" fill="#efede8"/><path d="M0 .5H30M.5 0V7.5M15 7.5V15M0 7.5H30" stroke="#cfcac0"/></pattern>' +
      '<pattern id="b-vieja" patternUnits="userSpaceOnUse" width="16" height="16"><rect width="16" height="16" fill="#b8c3a2"/><path d="M0 .5H16M.5 0V16" stroke="#e6e9dc" stroke-width="1.2"/><circle cx="8" cy="8" r="2.2" fill="#98a681"/></pattern>' +
      '<pattern id="b-rosa" patternUnits="userSpaceOnUse" width="16" height="16"><rect width="16" height="16" fill="#d8b7b2"/><path d="M0 .5H16M.5 0V16" stroke="#f1e2df" stroke-width="1.2"/></pattern>' +
      '<pattern id="b-piso" patternUnits="userSpaceOnUse" width="80" height="78"><rect width="80" height="78" fill="#b9b3a8"/><path d="M0 .5H80M.5 0V78" stroke="#9e988d"/></pattern>' +
      '<pattern id="cemento" patternUnits="userSpaceOnUse" width="40" height="40"><rect width="40" height="40" fill="#8f8b84"/><circle cx="7" cy="9" r="1" fill="#7c7871"/><circle cx="27" cy="22" r="1.3" fill="#a29e96"/><circle cx="17" cy="33" r=".9" fill="#77736c"/></pattern>' +
      '<pattern id="listones" patternUnits="userSpaceOnUse" width="180" height="26">' + img.replace('height="180"', 'height="26"') + '<path d="M0 .5H180M60 0V26" stroke="rgba(0,0,0,.3)"/></pattern>' +
      '<radialGradient id="luz-calida"><stop offset="0" stop-color="#ffd690" stop-opacity=".6"/><stop offset="1" stop-color="#ffd690" stop-opacity="0"/></radialGradient>' +
      '<linearGradient id="vidrio-ducha" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#dff0f5" stop-opacity=".2"/><stop offset=".5" stop-color="#fff" stop-opacity=".38"/><stop offset="1" stop-color="#dff0f5" stop-opacity=".14"/></linearGradient>' +
      '<linearGradient id="metal-e" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a7c80"/><stop offset=".5" stop-color="#d4d6da"/><stop offset="1" stop-color="#7a7c80"/></linearGradient>' +
      '<linearGradient id="espejo-e" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fb2bd"/><stop offset=".45" stop-color="#5d6f7b"/><stop offset=".5" stop-color="#c9d6dd"/><stop offset=".56" stop-color="#5d6f7b"/><stop offset="1" stop-color="#3b4a54"/></linearGradient>' +
      "</defs>");
    // El cascarón: losa, pared sin terminar debajo de todo y piso
    o.push(R(0, 0, 900, TECHO, 'fill="#2b2622"') + R(0, TECHO, 900, PISO - TECHO, 'fill="#5c5852"') + R(0, PISO, 900, 470 - PISO, 'fill="#3d3832"'));
    var viejo = [], pl = [], inst = [], ench = [], mueb = [], acab = [], luz = [];
    var pintura = { cocina: "#e7e3dc", bano: "#e7e3dc", alcoba: "#d9d1c4", sala: "#e2ddd3" }[T];
    ench.push(R(0, TECHO, 900, PISO - TECHO, 'fill="' + pintura + '"'));
    ench.push(R(0, PISO, 900, 470 - PISO, 'fill="url(#' + (T === "cocina" || T === "bano" ? "b-piso" : "listones") + ')"'));
    ench.push(R(0, PISO - 8, 900, 8, 'fill="rgba(0,0,0,.18)"'));

    if (T === "cocina") {
      var n = Math.max(3, Math.min(8, Math.round(3 + (a - 5) / 5))), mw = 76, tw = 84, run = n * mw, x0 = 450 - (run + tw) / 2, hz = Math.floor(n / 2);
      viejo.push(R(x0 - 30, 196, run + tw + 60, 100, 'fill="url(#b-vieja)"'));
      for (var i = 0; i < n - 1; i++) viejo.push(R(x0 + i * 84, 300, 80, 92, 'fill="#cbb892" stroke="#9f8c66"') + '<circle cx="' + (x0 + i * 84 + 40) + '" cy="312" r="3" fill="#7d6b48"/>');
      viejo.push(R(x0, 292, (n - 1) * 84, 8, 'fill="#8f8a80"') + R(330, 26, 240, 8, 'rx="3" fill="#f4f4ef"'));
      pl.push(plano(x0, 296, run, 96), plano(x0, 118, run, 78), plano(x0 + run, 118, tw, 274));
      var xs = x0 + mw * 1.5;
      inst.push(tubo("M" + (xs - 6) + " 392 V300", "#3c84c6"), tubo("M" + (xs + 6) + " 392 V300", "#d0463b"), tubo("M" + (xs + 22) + " 392 V320", "#9c9a96"));
      inst.push(tubo("M" + (x0 + hz * mw + mw / 2) + " " + TECHO + " V160", "#e8873a"), tubo("M" + (x0 + 40) + " " + TECHO + " V240 H" + (x0 + run - 40), "#e8873a"), caja(x0 + 40, 240), caja(x0 + run - 40, 240));
      inst.push(tubo("M" + (x0 + hz * mw + 20) + " 392 V330", "#e2b93b"));
      ench.push(R(x0, 196, run, 92, 'fill="url(#b-metro)"'));
      for (var m = 0; m < n; m++) {
        var xm = x0 + m * mw;
        if (m === 2 && n >= 4) mueb.push(R(xm + 1, 300, mw - 2, 84, 'fill="#17181a" stroke="#000"') + R(xm + 9, 316, mw - 18, 44, 'rx="3" fill="#2a2e33" stroke="#444"') + R(xm + 12, 304, mw - 24, 5, 'rx="2" fill="url(#metal-e)"'));
        else mueb.push(madera(xm + 1, 300, mw - 2, 84) + tirador(xm + mw / 2 - 14, 307, 28, 3));
        if (m === hz) mueb.push('<path d="M' + (xm - 4) + ' 196 L' + (xm + mw + 4) + ' 196 L' + (xm + mw - 12) + ' 160 L' + (xm + 12) + ' 160Z" fill="url(#metal-e)" stroke="rgba(0,0,0,.4)"/>' + R(xm + mw / 2 - 15, TECHO, 30, 142, 'fill="url(#metal-e)" stroke="rgba(0,0,0,.35)"'));
        else mueb.push(madera(xm + 1, 118, mw - 2, 78) + tirador(xm + mw / 2 - 12, 188, 24, 3));
      }
      mueb.push(R(x0, 384, run, 8, 'fill="#1b1714"'), madera(x0 + run + 1, 118, tw - 2, 274), tirador(x0 + run + 10, 230, 3, 40), tirador(x0 + run + tw - 13, 230, 3, 40));
      acab.push(R(x0 - 4, 288, run + 8, 10, 'fill="' + (c.acabado === "basico" ? "#3b3834" : "#f1eee8") + '" stroke="rgba(0,0,0,.35)"'));
      acab.push('<path d="M' + (xs - 8) + ' 288 V262 Q' + (xs - 8) + ' 254 ' + xs + ' 254 H' + (xs + 12) + '" fill="none" stroke="url(#metal-e)" stroke-width="5" stroke-linecap="round"/>');
      acab.push('<path d="M' + (x0 + run - 70) + ' 288 l6 -26 h20 l6 26Z" fill="#c9c2b4"/><path d="M' + (x0 + run - 60) + ' 262 q-12 -30 4 -44 q8 18 -4 44 M' + (x0 + run - 56) + ' 262 q14 -26 26 -30 q-4 20 -26 30" fill="#4d6b45"/>');
      acab.push('<ellipse cx="' + (x0 + 70 + mw) + '" cy="284" rx="26" ry="6" fill="#8a6a45"/>');
      luz.push(R(x0, 196, run, 4, 'fill="#ffe2a8"'), brillo(450, 240, run / 2 + 40, 60));
    }

    if (T === "bano") {
      var vw = Math.max(120, Math.min(240, 100 + a * 12)), vx = 110, ix = vx + vw + 70, dx = 590;
      viejo.push(R(0, 200, 900, 192, 'fill="url(#b-rosa)"'));
      viejo.push('<path d="M150 392 L160 300 H200 L210 392Z" fill="#f2f0eb" stroke="#c9c5bc"/>' + '<ellipse cx="180" cy="296" rx="44" ry="12" fill="#f4f2ee" stroke="#c9c5bc"/>');
      viejo.push(R(dx, 70, 230, 3, 'fill="#9a9690"') + '<path d="M' + dx + ' 73 q20 8 40 0 q20 8 40 0 q20 8 40 0 q20 8 40 0 q20 8 40 0 V330 H' + dx + 'Z" fill="#c9d8d4" opacity=".9"/>');
      pl.push(plano(vx, 246, vw, 58), plano(vx + 14, 112, vw - 28, 110), plano(dx, 60, 8, 332));
      inst.push(tubo("M" + (vx + vw / 2 - 8) + " 392 V280", "#3c84c6"), tubo("M" + (vx + vw / 2 + 8) + " 392 V280", "#d0463b"));
      inst.push(tubo("M" + (ix + 30) + " 392 V340", "#9c9a96"), tubo("M770 392 V200 V96", "#3c84c6"), tubo("M782 392 V200", "#d0463b"));
      inst.push(tubo("M" + (vx + vw / 2) + " " + TECHO + " V110", "#e8873a"), caja(vx + vw / 2, 110));
      ench.push(R(0, TECHO, 900, PISO - TECHO, 'fill="url(#b-grande)"'));
      mueb.push(madera(vx, 252, vw, 52) + tirador(vx + vw / 2 - 16, 262, 32, 3));
      mueb.push('<path d="M' + ix + ' 392 V352 H' + (ix + 64) + ' V392Z" fill="#f4f2ee" stroke="#c9c5bc"/>' + R(ix + 6, 300, 52, 52, 'rx="8" fill="#f4f2ee" stroke="#c9c5bc"') + '<ellipse cx="' + (ix + 32) + '" cy="352" rx="38" ry="9" fill="#f7f5f1" stroke="#c9c5bc"/>');
      acab.push(R(vx - 3, 246, vw + 6, 8, 'fill="#efece6" stroke="rgba(0,0,0,.3)"') + '<ellipse cx="' + (vx + vw / 2) + '" cy="240" rx="34" ry="9" fill="#f7f5f1" stroke="#c9c5bc"/>');
      acab.push('<path d="M' + (vx + vw / 2 + 26) + ' 246 V222 Q' + (vx + vw / 2 + 26) + ' 214 ' + (vx + vw / 2 + 16) + ' 214" fill="none" stroke="url(#metal-e)" stroke-width="4" stroke-linecap="round"/>');
      acab.push(R(vx + 14, 112, vw - 28, 110, 'rx="8" fill="url(#espejo-e)" stroke="rgba(0,0,0,.35)"'));
      acab.push(R(dx, 60, 8, 332, 'fill="url(#metal-e)"') + R(dx + 8, 60, 220, 332, 'fill="url(#vidrio-ducha)" stroke="rgba(255,255,255,.35)"') + '<path d="M760 96 H800 M760 96 v10" stroke="url(#metal-e)" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="760" cy="110" rx="18" ry="5" fill="#cfd2d6"/>' + R(690, 210, 64, 40, 'fill="#bdb9b0"') + R(698, 226, 10, 22, 'rx="2" fill="#f2f0ea"') + R(712, 230, 8, 18, 'rx="2" fill="#6f8a7a"'));
      acab.push(R(vx + vw + 14, 230, 6, 70, 'rx="2" fill="url(#metal-e)"') + R(vx + vw + 8, 236, 18, 54, 'rx="3" fill="#e9e3d7"'));
      luz.push(R(vx + 14, 112, vw - 28, 110, 'rx="8" fill="none" stroke="#ffe2a8" stroke-width="4"'), brillo(vx + vw / 2, 167, vw / 2 + 50, 90));
    }

    if (T === "alcoba") {
      var cw = Math.max(160, Math.min(320, 120 + a * 6)), cn = Math.max(2, Math.round(cw / 72)), dw = cw / cn, bx = 60 + cw + (840 - 60 - cw) / 2;
      viejo.push(R(0, PISO, 900, 470 - PISO, 'fill="#7f6767"') + R(70, 120, 150, 262, 'fill="#4a3424" stroke="#2d1f15"') + R(70, 382, 10, 10, 'fill="#2d1f15"') + R(210, 382, 10, 10, 'fill="#2d1f15"') + '<circle cx="138" cy="250" r="4" fill="#c2a46a"/><circle cx="152" cy="250" r="4" fill="#c2a46a"/>');
      pl.push(plano(60, 40, cw, 352), plano(bx - 110, 250, 220, 120));
      inst.push(tubo("M" + (bx - 150) + " " + TECHO + " V330", "#e8873a"), caja(bx - 150, 330), tubo("M" + (bx + 150) + " " + TECHO + " V330", "#e8873a"), caja(bx + 150, 330), tubo("M" + (60 + cw / 2) + " " + TECHO + " V40", "#e8873a"));
      for (var d = 0; d < cn; d++) mueb.push(madera(60 + d * dw + 1, 40, dw - 2, 344) + tirador(60 + d * dw + (d % 2 ? 8 : dw - 12), 190, 3, 54));
      mueb.push(R(60, 384, cw, 8, 'fill="#1b1714"'));
      mueb.push(madera(bx - 112, 238, 224, 96, "v") + madera(bx - 112, 330, 224, 30, "h") + madera(bx - 108, 360, 10, 32) + madera(bx + 98, 360, 10, 32));
      [bx - 176, bx + 124].forEach(function (x) { mueb.push(madera(x, 320, 52, 62, "v") + madera(x + 4, 382, 6, 10) + madera(x + 42, 382, 6, 10) + tirador(x + 18, 336, 16, 3)); });
      acab.push(R(bx - 104, 300, 208, 34, 'rx="6" fill="#efebe3" stroke="rgba(0,0,0,.2)"') + R(bx - 96, 284, 86, 24, 'rx="10" fill="#f7f4ee" stroke="rgba(0,0,0,.18)"') + R(bx + 10, 284, 86, 24, 'rx="10" fill="#f7f4ee" stroke="rgba(0,0,0,.18)"') + R(bx - 106, 318, 212, 26, 'rx="6" fill="#8d8172"'));
      [bx - 150, bx + 150].forEach(function (x) { acab.push(R(x - 3, 286, 6, 34, 'fill="#3a332c"') + '<path d="M' + (x - 18) + ' 286 L' + (x + 18) + ' 286 L' + (x + 12) + ' 262 L' + (x - 12) + ' 262Z" fill="#e8dcc6"/>'); });
      acab.push(R(bx - 60, 120, 120, 80, 'fill="#cfc6b8" stroke="#8a6a45" stroke-width="5"') + '<path d="M' + (bx - 50) + ' 190 L' + (bx - 10) + ' 150 L' + (bx + 20) + ' 175 L' + (bx + 50) + ' 140" stroke="#7d8a76" stroke-width="3" fill="none"/>');
      acab.push('<ellipse cx="' + bx + '" cy="430" rx="200" ry="22" fill="#a39686" opacity=".8"/>');
      luz.push(brillo(bx - 150, 290, 70, 50), brillo(bx + 150, 290, 70, 50));
    }

    if (T === "sala") {
      var tvw = Math.max(260, Math.min(480, 200 + a * 5)), tx = 380 - tvw / 2;
      viejo.push(R(0, PISO, 900, 470 - PISO, 'fill="#8c7a63"') + R(300, 300, 200, 92, 'fill="#5a4636" stroke="#3a2d22"') + R(340, 230, 120, 70, 'rx="10" fill="#3b3b3b" stroke="#222"') + R(355, 242, 90, 46, 'rx="8" fill="#6c7a73"'));
      pl.push(plano(tx - 20, 60, tvw + 40, 332), plano(700, 80, 120, 312));
      inst.push(tubo("M380 " + TECHO + " V200", "#e8873a"), caja(380, 200), tubo("M" + (tx + 30) + " " + TECHO + " V340", "#e8873a"), caja(tx + 30, 340));
      for (var sx = tx - 20; sx < tx + tvw + 20; sx += 14) mueb.push(madera(sx, 60, 11, 332, "v"));
      mueb.push(madera(tx, 300, tvw, 40, "h") + tirador(tx + tvw / 2 - 20, 316, 40, 3));
      mueb.push(madera(700, 80, 120, 312, "v", 'fill-opacity=".9"'));
      [140, 200, 260, 320].forEach(function (y) { mueb.push(madera(704, y, 112, 8, "h")); });
      acab.push(R(380 - 95, 170, 190, 108, 'rx="4" fill="#121314" stroke="#2c2e31" stroke-width="3"'));
      acab.push(R(712, 110, 10, 30, 'fill="#c2a46a"') + R(726, 116, 12, 24, 'fill="#5f6f63"') + R(742, 104, 9, 36, 'fill="#e2d9c6"') + '<ellipse cx="770" cy="196" rx="16" ry="4" fill="#8a6a45"/>' + R(736, 230, 50, 30, 'fill="#c9c2b4"'));
      acab.push('<path d="M120 470 V412 Q120 398 136 398 H560 Q576 398 576 412 V470Z" fill="#6e665c"/>' + R(150, 404, 190, 30, 'rx="10" fill="#7d7468"') + R(352, 404, 190, 30, 'rx="10" fill="#7d7468"'));
      acab.push('<path d="M60 392 l10 -40 h40 l10 40Z" fill="#c9c2b4"/><path d="M90 352 q-30 -60 0 -120 q24 60 0 120 M90 352 q40 -50 30 -110 q-30 40 -30 110" fill="#4d6b45"/>');
      luz.push(R(tx - 20, 56, tvw + 40, 4, 'fill="#ffe2a8"'), brillo(380, 120, tvw / 2 + 60, 90));
    }

    o.push('<g class="fase f-viejo solo-obra">' + viejo.join("") + "</g>");
    o.push('<g class="fase f-desnudo solo-obra">' + R(0, TECHO, 900, PISO - TECHO, 'fill="url(#cemento)"') + "</g>");
    o.push('<g class="fase f-plano solo-obra">' + pl.join("") + "</g>");
    o.push('<g class="fase f-escombros solo-obra">' + escombros() + "</g>");
    o.push('<g class="fase f-instalaciones solo-obra">' + inst.join("") + "</g>");
    o.push('<g class="fase f-enchape">' + ench.join("") + "</g>");
    o.push('<g class="fase f-muebles">' + mueb.join("") + "</g>");
    o.push('<g class="fase f-acabados">' + acab.join("") + "</g>");
    o.push('<g class="fase f-entrega">' + luz.join("") + "</g>");
    return o.join("");
  }

  /* ───────────── El plano que se dibuja al bajar: el alzado de una cocina ───────────── */
  function plano() {
    var L = [], piso = 430;
    L.push('<path d="M40 ' + piso + 'H760"/>');
    for (var x = 50; x < 760; x += 22) L.push('<path class="cota" d="M' + x + " " + (piso + 4) + ' l-12 14"/>');
    L.push('<path d="M150 ' + piso + 'V320H560V' + piso + '"/>');
    L.push('<path d="M144 320H566M144 312H566"/>');
    [232, 314, 396, 478].forEach(function (x) { L.push('<path d="M' + x + ' 320V' + piso + '"/>'); });
    [191, 273, 355, 437, 519].forEach(function (x) { L.push('<path d="M' + (x - 14) + ' 334H' + (x + 14) + '"/>'); });
    L.push('<rect x="322" y="340" width="66" height="70"/>');
    L.push('<path d="M150 130V210H310V130Z M232 130V210"/>');
    L.push('<path d="M400 130V210H560V130Z M478 130V210"/>');
    L.push('<path d="M316 210L326 172H384L394 210Z M342 172V100H368V172"/>');
    L.push('<path d="M570 100V' + piso + 'H660V100Z M615 100V' + piso + '"/>');
    L.push('<path d="M200 312V290Q200 282 210 282H222"/>');
    L.push('<path class="cota" d="M150 470H660M150 462V478M660 462V478"/>');
    L.push('<text x="405" y="494" text-anchor="middle">3,60 m</text>');
    L.push('<path class="cota" d="M700 ' + piso + 'V100M692 ' + piso + 'H708M692 100H708"/>');
    L.push('<text x="712" y="270">2,40 m</text>');
    L.push('<text x="60" y="60">COCINA · ALZADO A · ESC. 1:25</text>');
    L.push('<path class="cota" d="M60 72H330"/>');
    return L.join("");
  }

  window.Dibujos = { defs: defs, mueble: mueble, espacio: espacio, plano: plano, MADERAS: MADERAS };
})();
