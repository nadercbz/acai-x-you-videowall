// Kern der Videowall: Zeit, Hilfen, Blätter, Video in Einzelbildern, Wechsel zwischen den Szenen.
// Alles hängt an window.renderAt(t). Kein Element bewegt sich von selbst, so ist jedes Bild beim Export exakt.
(function () {
  const Q = new URLSearchParams(location.search);
  const K = (window.K = {
    LOOP: 60,        // Länge der Schleife in Sekunden, für alle 4 Monitore gleich
    KINO: 18,        // 0 bis KINO: Dschungel Film über die 3 linken Monitore, danach Produkte
    WECHSEL: 0.75,   // Dauer des Zuziehens und des Aufziehens
    EXPORT: Q.has("export"),
    NUR: Q.get("nur") || "alles",   // alles, wand, menu, 1, 2, 3, 4
    szenen: [],
    offen: [],
  });

  K.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  K.lerp = (a, b, t) => a + (b - a) * t;
  K.seg = (t, a, b) => K.clamp((t - a) / (b - a));
  K.sanft = (x) => { x = K.clamp(x); return x * x * (3 - 2 * x); };
  K.aus = (x) => 1 - Math.pow(1 - K.clamp(x), 3);
  K.ein = (x) => Math.pow(K.clamp(x), 3);
  K.zurueck = (x) => { x = K.clamp(x); const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  K.rnd = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  K.preis = (p) => p.toFixed(2).replace(".", ",") + " €";

  K.el = (tag, cls, parent, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  };
  K.bild = (src, cls, parent) => { const i = K.el("img", cls, parent); i.src = src; i.decoding = "sync"; i.draggable = false; return i; };

  // Einblenden mit Versatz: Deckkraft und kleiner Weg nach oben
  K.rein = (e, p, y = 40) => { e.style.opacity = K.sanft(p); e.style.transform = `translate3d(0,${(1 - K.aus(p)) * y}px,0)`; };

  // ------------------------------------------------------------------ Blätter (für Dschungel und Ränder der Screens)
  // Zwei Formen: Wedel (Palme) und breites Blatt. Rückgabe ist ein SVG Element, Ursprung am Stielansatz.
  K.blatt = (art, groesse, farbe, farbe2) => {
    const ns = "http://www.w3.org/2000/svg";
    const s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "-500 -1000 1000 1040");
    s.setAttribute("width", groesse); s.setAttribute("height", groesse * 1.04);
    s.style.overflow = "visible";
    const id = "g" + Math.random().toString(36).slice(2, 8);
    s.innerHTML = `<defs><linearGradient id="${id}" x1="0" y1="1" x2="0.4" y2="0"><stop offset="0" stop-color="${farbe}"/><stop offset="1" stop-color="${farbe2 || farbe}"/></linearGradient></defs>`;
    const p = (d) => { const e = document.createElementNS(ns, "path"); e.setAttribute("d", d); e.setAttribute("fill", `url(#${id})`); s.appendChild(e); };
    if (art === "wedel") {
      // gebogene Mittelrippe, daran schmale Fiedern
      const n = 13;
      for (let i = 0; i < n; i++) {
        const u = 0.16 + (i / (n - 1)) * 0.8;
        const sx = 190 * u * u, sy = -960 * u;
        for (const seite of [-1, 1]) {
          const l = 470 * (1 - Math.abs(u - 0.5) * 1.1), w = 30 + 16 * (1 - u);
          const a = (seite * (58 - u * 18) * Math.PI) / 180 + 0.2 * u;
          const ex = sx + Math.sin(a) * l, ey = sy - Math.cos(a) * l * 0.55 + l * 0.42;
          const nx = Math.cos(a) * w, ny = Math.sin(a) * w;
          p(`M${sx},${sy} Q${(sx + ex) / 2 + nx},${(sy + ey) / 2 - ny * 0.2 - 30} ${ex},${ey} Q${(sx + ex) / 2 - nx},${(sy + ey) / 2 + ny * 0.2 + 26} ${sx},${sy}Z`);
        }
      }
      p("M-9,20 Q20,-500 196,-990 Q46,-500 9,20Z");
    } else {
      p("M0,20 C-330,-150 -390,-640 -40,-1000 C330,-700 330,-190 0,20Z");
    }
    return s;
  };

  // ------------------------------------------------------------------ Video als Einzelbilder
  // Live läuft ein <video>. Im Export zeigt ein <img> genau das Bild zur Zeit t (assets/frames/<slug>/f_001.jpg ...).
  K.film = (slug, bilder, fps, parent, cls) => {
    const f = { slug, bilder, fps, dauer: bilder / fps, letzte: -1 };
    if (K.EXPORT) {
      f.e = K.el("img", cls, parent);
      f.e.decoding = "sync";
    } else {
      f.e = K.el("video", cls, parent);
      Object.assign(f.e, { muted: true, loop: true, playsInline: true, autoplay: true, preload: "auto", src: `assets/video/${slug}.mp4` });
    }
    f.zeige = (t) => {
      if (!K.EXPORT) { if (f.e.paused) f.e.play().catch(() => {}); return; }
      const i = Math.floor((((t % f.dauer) + f.dauer) % f.dauer) * fps) % bilder;
      if (i === f.letzte) return;
      f.letzte = i;
      f.e.src = `assets/frames/${slug}/f_${String(i + 1).padStart(3, "0")}.jpg`;
      K.offen.push(f.e.decode().catch(() => {}));
    };
    return f;
  };

  // ------------------------------------------------------------------ Wechsel: flüssige Welle zieht über die Wand
  let wctx, wcan;
  K.wechselBauen = (wand) => {
    wcan = K.el("canvas", "wechsel", wand);
    wcan.width = 2880; wcan.height = 540;
    wctx = wcan.getContext("2d");
  };
  // zu: 0 bis 1 (Welle deckt von links nach rechts zu), auf: 0 bis 1 (Welle gibt von links nach rechts frei)
  function welle(t, zu, auf) {
    const c = wctx, W = 2880, H = 540;
    c.clearRect(0, 0, W, H);
    if (zu <= 0 && auf <= 0) { wcan.style.display = "none"; return; }
    wcan.style.display = "block";
    const kante = (x0, k) => {
      c.beginPath();
      for (let y = -10; y <= H + 10; y += 10) {
        const x = x0 + 46 * Math.sin(y / 92 + t * 5 + k) + 20 * Math.sin(y / 31 - t * 8 + k * 2.1) + (H - y) * 0.16;
        y === -10 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
    };
    const farben = ["#ff4fa3", "#a855f7", "#5b1a8f", "#1d0429"];
    if (auf <= 0) {
      const x = K.lerp(-260, W + 420, K.sanft(zu));
      farben.forEach((f, i) => { kante(x - i * 70, i); c.lineTo(-20, H + 10); c.lineTo(-20, -10); c.closePath(); c.fillStyle = f; c.fill(); });
    } else {
      const x = K.lerp(-420, W + 260, K.sanft(auf));
      farben.forEach((f, i) => { kante(x + i * 70, i); c.lineTo(W + 20, H + 10); c.lineTo(W + 20, -10); c.closePath(); c.fillStyle = f; c.fill(); });
    }
  }

  // ------------------------------------------------------------------ Zeit
  window.renderAt = (t) => {
    t = ((t % K.LOOP) + K.LOOP) % K.LOOP;
    K.t = t;
    // Wand: Kino von 0 bis KINO, danach Produkte. Wechsel jeweils an den Grenzen.
    const kino = t < K.KINO;
    let zu = 0, auf = 0;
    if (t >= K.KINO - K.WECHSEL && t < K.KINO) zu = (t - (K.KINO - K.WECHSEL)) / K.WECHSEL;
    else if (t >= K.KINO && t < K.KINO + K.WECHSEL) auf = (t - K.KINO) / K.WECHSEL + 1e-4;
    else if (t >= K.LOOP - K.WECHSEL) zu = (t - (K.LOOP - K.WECHSEL)) / K.WECHSEL;
    else if (t < K.WECHSEL) auf = t / K.WECHSEL + 1e-4;
    for (const s of K.szenen) s(t, kino);
    if (wctx) welle(t, zu, auf);
  };
  window.bereit = () => { const o = K.offen; K.offen = []; return Promise.all(o); };

  // ------------------------------------------------------------------ Start
  K.start = () => {
    const board = document.getElementById("board");
    const ausschnitt = { alles: [0, 7680], wand: [0, 5760], menu: [5760, 1920], 1: [0, 1920], 2: [1920, 1920], 3: [3840, 1920], 4: [5760, 1920] }[K.NUR] || [0, 7680];
    const blende = document.getElementById("blende");
    const passen = () => {
      const s = K.EXPORT ? 1 : Math.min(innerWidth / ausschnitt[1], innerHeight / 1080);
      const ox = K.EXPORT ? 0 : (innerWidth - ausschnitt[1] * s) / 2, oy = K.EXPORT ? 0 : (innerHeight - 1080 * s) / 2;
      blende.style.cssText = `left:${ox}px;top:${oy}px;width:${ausschnitt[1] * s}px;height:${1080 * s}px`;
      board.style.transform = `translate(${-ausschnitt[0] * s}px,0) scale(${s})`;
    };
    addEventListener("resize", passen); passen();
    const bereitAlles = () => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]);
    bereitAlles().then(() => {
      K.fertig && K.fertig();
      document.body.classList.add("bereit");
      if (K.EXPORT) { window.renderAt(parseFloat(Q.get("t") || "0")); return; }
      const t0 = performance.now() / 1000 - parseFloat(Q.get("t") || "0");
      const fest = Q.has("fest");
      const tick = () => { window.renderAt(fest ? parseFloat(Q.get("t") || "0") : performance.now() / 1000 - t0); requestAnimationFrame(tick); };
      tick();
    });
  };
})();
