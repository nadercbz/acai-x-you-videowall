// Hochkant Menüboard (1080 x 1920, ein Bildschirm), Schleife 60 s.
// 0 bis 20 s Dschungel Film (Higgsfield, hochkant geschnitten) mit Spruch, danach Açaí Bowls, Build it YOUR way,
// Iced Matcha mit Limeades und Kaffee. Preise und Zutaten aus daten.js. Alles hängt an window.renderAt(t).
(function () {
  const K = window.K, D = window.DATEN, F = window.FORMEN;
  const W = 1080, H = 1920, LOOP = 60, WISCH = 0.75;
  const FILM = { bilder: 301, fps: 25 }, CLIP_ENDE = FILM.bilder / FILM.fps;
  const SEG = [
    { id: "film", a: 0, b: 20 },
    { id: "bowls", a: 20, b: 30 },
    { id: "build", a: 30, b: 40 },
    { id: "matcha", a: 40, b: 52 },
    { id: "kaffee", a: 52, b: 60 },
  ];
  const Q = new URLSearchParams(location.search);
  const teile = {};   // id -> Liste von Funktionen (p, t)
  const wurzeln = {};
  let root, wcan, wctx, lcan, lctx;

  const fenster = (p, a, b, w = 0.5) => K.sanft(K.seg(p, a, a + w)) * (1 - K.sanft(K.seg(p, b - w, b)));
  function mass(slug, rand_mm, k) {
    const f = F[slug], rand = f.rechts[0] * f.rand_y + f.rechts[1] - (f.links[0] * f.rand_y + f.links[1]);
    const s = (rand_mm * k) / rand;
    return { b: f.breite * s, h: f.hoehe * s, s, f };
  }
  function szene(id, mitGrund = true) {
    const s = K.el("section", "h-szene h-" + id, root);
    if (mitGrund) {
      const g = K.el("div", "grund", s);
      g.style.setProperty("--x", -2300 - SEG.findIndex((x) => x.id === id) * 520 + "px");
      [["wedel", 760, -80, 1960, 34], ["breit", 460, 1130, 1930, -28], ["wedel", 700, 1120, 80, -140]].forEach(([art, gr, x, y, w], i) => {
        const b = K.blatt(art, gr, "#2c0a44", "#5a1a8a");
        b.classList.add("rand"); b.style.left = x - gr / 2 + "px"; b.style.top = y - gr * 1.04 + "px";
        s.appendChild(b);
        (teile[id] = teile[id] || []).push((p, t) => { b.style.transform = `rotate(${w + 2.4 * Math.sin(t * 0.7 + i * 2)}deg)`; });
      });
    }
    wurzeln[id] = s;
    teile[id] = teile[id] || [];
    return s;
  }
  const auf = (id, f) => teile[id].push(f);
  function kopf(s, id, kicker, titel, unter, y = 86) {
    const k = K.el("div", "h-kopf", s); k.style.top = y + "px";
    const a = K.el("div", "kicker", k, kicker), b = K.el("h2", "", k, titel), c = unter ? K.el("p", "unter", k, unter) : null;
    auf(id, (p) => { K.rein(a, K.seg(p, 0.45, 1.05), 24); K.rein(b, K.seg(p, 0.55, 1.25)); if (c) K.rein(c, K.seg(p, 0.75, 1.45), 24); });
  }

  // ------------------------------------------------------------------ 1 Film mit Spruch
  function film() {
    const s = szene("film", false);
    const clip = K.film("hoch_flug", FILM.bilder, FILM.fps, s, "h-voll");
    if (!K.EXPORT) clip.e.loop = false;
    const still = K.bild("assets/hoch/still.jpg", "h-voll h-still", s);
    const blitz = K.el("div", "h-blitz", s);
    const oben = K.el("div", "h-scrim oben", s), unten = K.el("div", "h-scrim unten", s);
    const t1 = K.el("div", "h-from", s, "From the");
    const t2 = K.el("div", "h-amazon", s, [..."Amazon"].map((z) => `<span>${z}</span>`).join(""));
    const t3 = K.el("div", "h-spoon", s, "to your spoon.".split(" ").map((w) => `<span>${w}</span>`).join(" "));
    const t4 = K.el("div", "h-claim", s, "Build it <em>YOUR</em> way.");
    const your = t4.querySelector("em");
    auf("film", (p, t) => {
      const ende = K.sanft(K.seg(t, CLIP_ENDE - 0.5, CLIP_ENDE));
      clip.e.style.opacity = 1 - ende;
      if (t < CLIP_ENDE) {
        if (K.EXPORT) clip.zeige(Math.min(t, CLIP_ENDE - 0.001));
        else { if (Math.abs(clip.e.currentTime - t) > 0.25) clip.e.currentTime = t; if (clip.e.paused) clip.e.play().catch(() => {}); }
      }
      still.style.opacity = ende;
      still.style.transform = `scale(${1 + 0.025 * K.sanft(K.seg(t, CLIP_ENDE, 20))})`;
      const bl = K.seg(t, CLIP_ENDE - 0.1, CLIP_ENDE + 0.9);
      blitz.style.opacity = bl > 0 && bl < 1 ? Math.sin(bl * Math.PI) * 0.9 : 0;
      blitz.style.transform = `translate(-50%,-50%) scale(${0.4 + 1.6 * K.aus(bl)})`;
      const q = t - (CLIP_ENDE - 0.2);
      oben.style.opacity = unten.style.opacity = K.sanft(K.seg(q, 0, 1.0));
      K.rein(t1, K.seg(q, 0.15, 0.85));
      [...t2.children].forEach((z, i) => {
        const k = K.seg(q, 0.4 + i * 0.07, 1.1 + i * 0.07);
        z.style.opacity = K.sanft(k); z.style.transform = `translate3d(0,${(1 - K.zurueck(k)) * 100}px,0)`; z.style.filter = `blur(${(1 - k) * 12}px)`;
      });
      [...t3.children].forEach((z, i) => K.rein(z, K.seg(q, 1.2 + i * 0.15, 1.9 + i * 0.15), 50));
      K.rein(t4, K.seg(q, 2.1, 2.8), 40);
      const an = q - 2.9, neon = an < 0 ? 0 : an < 0.08 ? 1 : an < 0.16 ? 0.15 : an < 0.26 ? 1 : an < 0.32 ? 0.3 : 1;
      your.style.setProperty("--an", neon * (0.93 + 0.07 * Math.sin(t * 6)));
    });
  }

  // ------------------------------------------------------------------ 2 Açaí Bowls
  function bowls() {
    const s = szene("bowls");
    kopf(s, "bowls", "Açaí Bowls", "Açaí Bowl", "Schicht für Schicht, ganz nach dir.");
    const fall = K.el("div", "h-fall", s), r = K.rnd(41);
    const namen = ["erdbeere-halb-1", "blaubeere-1", "granola-1", "himbeere-1", "banane", "kokos", "erdbeere", "blaubeere-3", "mango-1", "kiwi", "granola-2", "himbeere-2"];
    const reihen = [372, 846, 1320], cx = 272;
    D.bowls.forEach((b, i) => {
      const m = mass(b.bild, b.rand_mm, 2.4), unten = reihen[i] + 430, oben = unten - m.h;
      const zeile = K.el("div", "h-zeile", s); zeile.style.top = reihen[i] + "px";
      const g = K.el("div", "h-becher", s); g.style.cssText = `left:${cx - m.b / 2}px;top:${oben}px;width:${m.b}px;height:${m.h}px`;
      const schein = K.el("div", "schein", g);
      K.bild(`assets/becher/${b.bild}.webp`, "becher", g);
      const info = K.el("div", "h-info", s, `<div class="sz"><span class="ring">${b.id}</span><span class="ml">${b.ml} ml</span>${b.beliebt ? '<span class="beliebt">Beliebt</span>' : ""}</div><div class="preis">${K.preis(b.preis)}</div>`);
      info.style.top = reihen[i] + 120 + "px";
      const preis = info.querySelector(".preis"), ring = info.querySelector(".ring");
      const a = 0.9 + i * 2.9, st = [];
      for (let j = 0; j < 5; j++) {
        const gr = 62 + r() * 40, e = K.bild(`assets/zutaten/${namen[(i * 4 + j) % namen.length]}.webp`, "", fall);
        e.style.width = gr + "px";
        st.push({ e, gr, t: a + 0.3 + j * 0.48, x: cx + (r() - 0.5) * m.b * 0.5, dreh: r() * 360, dir: r() < 0.5 ? -1 : 1 });
      }
      auf("bowls", (p, t) => {
        const w = fenster(p, a, a + 2.9 + (i === 2 ? 4 : 0), 0.45), da = K.seg(p, 0.6 + i * 0.16, 1.4 + i * 0.16);
        g.style.opacity = K.sanft(da);
        g.style.transform = `translate3d(0,${(1 - K.aus(da)) * 80 + Math.sin(t * 1.1 + i * 2) * 6 - w * 10}px,0) scale(${1 + 0.06 * w})`;
        schein.style.opacity = 0.25 + 0.75 * w;
        K.rein(info, K.seg(p, 0.8 + i * 0.16, 1.5 + i * 0.16), 30);
        zeile.style.setProperty("--w", w.toFixed(3));
        K.rein(zeile, K.seg(p, 0.5 + i * 0.16, 1.2 + i * 0.16), 0);
        preis.style.textShadow = `0 0 ${46 * w}px rgba(255,79,163,${0.85 * w})`;
        ring.style.boxShadow = `0 0 ${10 + 30 * w}px rgba(255,79,163,${0.45 + 0.5 * w})`;
        for (const z of st) {
          const k = K.seg(p, z.t, z.t + 0.9);
          z.e.style.opacity = k <= 0 || k >= 1 ? 0 : K.sanft(K.seg(k, 0, 0.18)) * (1 - K.sanft(K.seg(k, 0.82, 1)));
          z.e.style.transform = `translate3d(${z.x - z.gr / 2}px,${K.lerp(oben - 200, oben + m.f.rand_y * m.s * 0.5, K.ein(k) * 0.6 + k * 0.4) - z.gr / 2}px,0) rotate(${z.dreh + z.dir * k * 200}deg)`;
        }
      });
    });
    const fuss = K.el("p", "h-fuss", s, "Früchte, Crunch, Chia Pudding, Granola und Saucen inklusive.<br><b>Du zahlst nur die Größe.</b>");
    auf("bowls", (p) => K.rein(fuss, K.seg(p, 1.6, 2.4), 20));
  }

  // ------------------------------------------------------------------ 3 Build it YOUR way
  const AUSWAHL = { sauce: ["sauce-bueno-style", "sauce-kondensmilch"], frucht: ["frucht-erdbeere", "frucht-blaubeere", "frucht-himbeere"], crunch: ["crunch-oreo", "crunch-haselnuesse"] };
  function build() {
    const s = szene("build");
    const ki = K.el("div", "kicker h-bk", s, "Deine Bowl, deine Wahl");
    const ti = K.el("h1", "h-bt", s, "Build it<br><em>YOUR</em> way.");
    const your = ti.querySelector("em");
    const kopfZ = (nr, titel, hinweis, x, y) => { const k = K.el("div", "lkopf", s, `<span class="nr">${nr}</span><b>${titel}</b>${hinweis ? `<i>${hinweis}</i>` : ""}`); k.style.cssText = `left:${x}px;top:${y}px`; return k; };
    const g1 = kopfZ(1, "Größe", "du zahlst nur die Größe", 64, 366);
    const karten = D.bowls.map((b, i) => {
      const k = K.el("div", "h-karte", s, `<img src="assets/becher/${b.bild}.webp" alt=""><div><div class="zl"><span class="ring">${b.id}</span><span class="ml">${b.ml} ml</span></div><div class="preis">${K.preis(b.preis)}</div></div>`);
      k.style.left = 64 + i * 324 + "px";
      return k;
    });
    const gruppen = [];
    const liste = (nr, titel, hinweis, x, y, eintraege, spalten, breite, auswahl, abstand = 50) => {
      const k = kopfZ(nr, titel, hinweis, x, y);
      const pro = Math.ceil(eintraege.length / spalten), reihen = [];
      eintraege.forEach(([slug, name], i) => {
        const z = K.el("div", "zeile", s);
        z.style.cssText = `left:${x + Math.floor(i / pro) * (breite + 10)}px;top:${y + 58 + (i % pro) * abstand}px;width:${breite}px`;
        const bild = K.bild(`assets/toppings/${slug}.webp`, "", z);
        K.el("span", "", z, name);
        reihen.push({ z, bild, gew: auswahl.includes(slug), i });
      });
      gruppen.push({ k, reihen });
    };
    liste(2, "Saucen", `bis zu ${D.grenzen.saucen}`, 64, 608, D.saucen, 2, 466, AUSWAHL.sauce);
    liste(3, "Früchte", `bis zu ${D.grenzen.fruechte}`, 64, 1040, D.fruechte, 1, 440, AUSWAHL.frucht);
    liste(4, "Crunch", `bis zu ${D.grenzen.crunch}`, 556, 1040, D.crunch, 1, 470, AUSWAHL.crunch);
    const dabei = K.el("div", "h-dabei", s, `<span class="kicker">Immer dabei</span><div>${D.basis.map(([slug, n]) => `<i><img src="assets/toppings/${slug}.webp" alt="">${n}</i>`).join("")}</div>`);
    const inkl = K.el("div", "h-inkl", s, "<b>Alles inklusive.</b> Sauce, Früchte und Crunch sind im Preis drin.");
    const schritte = [[g1, 0.9, 2.6], [gruppen[0].k, 2.6, 4.4], [gruppen[1].k, 4.4, 6.2], [gruppen[2].k, 6.2, 8.0]];
    auf("build", (p, t) => {
      K.rein(ki, K.seg(p, 0.4, 1.0), 20); K.rein(ti, K.seg(p, 0.5, 1.2), 30);
      your.style.setProperty("--an", 0.9 + 0.1 * Math.sin(t * 2.2));
      K.rein(g1, K.seg(p, 0.7, 1.3), 20);
      karten.forEach((k, i) => { K.rein(k, K.seg(p, 0.8 + i * 0.1, 1.4 + i * 0.1), 30); const w = i === 1 ? fenster(p, 1.2, 9.4, 0.5) : 0; k.style.setProperty("--w", w.toFixed(3)); });
      schritte.forEach(([k, a, b]) => k.style.setProperty("--w", fenster(p, a, b + 0.3, 0.35).toFixed(3)));
      gruppen.forEach((g, gi) => {
        K.rein(g.k, K.seg(p, 1.0 + gi * 0.2, 1.6 + gi * 0.2), 20);
        const [, a, b] = schritte[gi + 1];
        g.reihen.forEach((x) => {
          K.rein(x.z, K.seg(p, 1.1 + gi * 0.2 + x.i * 0.04, 1.7 + gi * 0.2 + x.i * 0.04), 16);
          const gew = x.gew ? K.sanft(K.seg(p, a + 0.3 + x.i * 0.05, a + 0.7 + x.i * 0.05)) * (1 - K.sanft(K.seg(p, 9.2, 9.8))) : 0;
          const welle = fenster(p, a, b + 0.3, 0.35) * Math.max(0, Math.sin(t * 2.6 - x.i * 0.55)) ** 6;
          x.z.style.setProperty("--g", gew.toFixed(3));
          x.bild.style.transform = `scale(${1 + 0.12 * welle + 0.2 * gew}) rotate(${t * 4 + x.i * 40}deg)`;
        });
      });
      K.rein(dabei, K.seg(p, 1.8, 2.5), 20); K.rein(inkl, K.seg(p, 2.0, 2.7), 20);
      inkl.style.setProperty("--w", (0.5 + 0.5 * Math.sin(t * 1.4)).toFixed(3));
    });
  }

  // ------------------------------------------------------------------ 4 Iced Matcha und Limeades
  function matcha() {
    const s = szene("matcha");
    kopf(s, "matcha", "Iced Matcha", "Iced Matcha", null, 80);
    const M = D.matcha, f0 = F[M.sorten[0].slug], hoch = 780, breit = (hoch * f0.breite) / f0.hoehe;
    const held = K.el("div", "held h-held", s); held.style.cssText = `left:${540 - breit / 2}px;top:250px;width:${breit}px;height:${hoch}px`;
    const schein = K.el("div", "schein", held);
    const filme = M.sorten.map((so) => {
      const fi = K.film(so.slug, 91, 20, held, "film");
      fi.e.style.webkitMaskImage = fi.e.style.maskImage = `url(assets/becher/${so.slug}.webp)`;
      if (so.flick) {
        const [x0, y0, x1, y1] = so.flick, w = K.el("div", "flick", held);
        w.style.cssText = `left:${x0}%;top:${y0}%;width:${x1 - x0}%;height:${y1 - y0}%`;
        const im = K.bild(`assets/becher/${so.slug}-ohne.webp`, "", w);
        im.style.cssText = `left:${(-x0 / (x1 - x0)) * 100}%;top:${(-y0 / (y1 - y0)) * 100}%;width:${10000 / (x1 - x0)}%;height:${10000 / (y1 - y0)}%`;
        fi.flick = w;
      }
      return fi;
    });
    const st = f0.sticker, druck = K.bild("assets/druck_dunkel.webp", "druck", held);
    druck.style.cssText = `left:${((st.x - st.d / 2) / f0.breite) * 100}%;top:${((st.y - st.d / 2) / f0.hoehe) * 100}%;width:${(st.d / f0.breite) * 100}%`;
    const sorte = K.el("div", "h-sorte", s);
    const namen = M.sorten.map((so) => { const e = K.el("span", "", sorte, so.name); e.style.color = so.farbe; return e; });
    const preise = K.el("div", "preise h-preise", s,
      `<div class="pk"><span></span><span>M</span><span>L</span></div>` +
      `<div class="pz"><span>Classic</span><b>${K.preis(M.classic[0])}</b><b>${K.preis(M.classic[1])}</b></div>` +
      `<div class="pz"><span>Flavoured</span><b>${K.preis(M.flavoured[0])}</b><b>${K.preis(M.flavoured[1])}</b></div>`);
    const zeilen = [...preise.querySelectorAll(".pz")];
    const chips = K.el("div", "chips h-chips", s);
    const chip = M.sorten.map((so) => { const e = K.el("span", "chip", chips, `<i style="background:${so.farbe}"></i>${so.name}`); e.style.setProperty("--f", so.farbe); return e; });
    const milch = K.el("p", "h-milch", s, "Milch nach Wahl: " + M.milch.join(", "));
    const leiste = K.el("div", "h-leiste", s);
    K.el("div", "h-lkopf", leiste, `<span class="kicker">Limeades</span><span class="lp">${D.limeades.groessen[0]} <b>${K.preis(D.limeades.preise[0])}</b></span><span class="lp">${D.limeades.groessen[1]} <b>${K.preis(D.limeades.preise[1])}</b></span>`);
    const lims = K.el("div", "h-lims", leiste);
    const lim = D.limeades.sorten.map((so) => { const e = K.el("div", "lim", lims); K.bild(`assets/becher/${so.slug}.webp`, "", e); K.el("span", "", e, so.name); return e; });
    const takt = 1.75, a0 = 0.9;
    auf("matcha", (p, t) => {
      const da = K.seg(p, 0.6, 1.5);
      held.style.opacity = K.sanft(da);
      held.style.transform = `translate3d(0,${(1 - K.aus(da)) * 80 + Math.sin(t * 0.9) * 6}px,0)`;
      let farbe = M.sorten[0].farbe, aktiv = 0;
      M.sorten.forEach((so, i) => {
        const a = a0 + i * takt, letzte = i === M.sorten.length - 1;
        const w = i === 0 ? 1 - K.sanft(K.seg(p, a + takt - 0.3, a + takt + 0.3)) : fenster(p, a - 0.3, letzte ? 99 : a + takt + 0.3, 0.6);
        filme[i].e.style.opacity = w; if (filme[i].flick) filme[i].flick.style.opacity = w;
        if (w > 0.001) filme[i].zeige(t);
        if (w > 0.5) { farbe = so.farbe; aktiv = i; }
        const rein = K.seg(p, a - 0.2, a + 0.3), raus = letzte ? 0 : K.seg(p, a + takt - 0.2, a + takt + 0.3);
        namen[i].style.opacity = i === 0 ? 1 - K.sanft(raus) : K.sanft(rein) * (1 - K.sanft(raus));
        namen[i].style.transform = `translate3d(-50%,${(1 - K.aus(i === 0 ? 1 : rein)) * 40 - K.ein(raus) * 40}px,0)`;
        chip[i].style.setProperty("--w", w.toFixed(3));
      });
      schein.style.background = `radial-gradient(closest-side, ${farbe}66, ${farbe}22 55%, transparent 72%)`;
      zeilen[0].style.setProperty("--w", aktiv === 0 ? 1 : 0); zeilen[1].style.setProperty("--w", aktiv === 0 ? 0 : 1);
      K.rein(sorte, K.seg(p, 0.8, 1.5), 24); K.rein(preise, K.seg(p, 1.0, 1.8), 30); K.rein(chips, K.seg(p, 1.2, 2.0), 30);
      K.rein(milch, K.seg(p, 1.4, 2.1), 20); K.rein(leiste, K.seg(p, 1.6, 2.4), 40);
      lim.forEach((e, i) => { e.firstChild.style.transform = `translate3d(0,${Math.sin(t * 1.2 + i * 1.4) * 4}px,0)`; });
    });
  }

  // ------------------------------------------------------------------ 5 Kaffee
  function kaffee() {
    const s = szene("kaffee");
    kopf(s, "kaffee", "Coffee Bar", "Kaffee", "Heiß oder auf Eis.");
    const dampf = K.el("canvas", "h-dampf", s); dampf.width = W; dampf.height = H;
    const dc = dampf.getContext("2d"), quelle = [];
    const pos = [[200, 840], [540, 840], [880, 840], [200, 1390], [540, 1390], [880, 1390]];
    D.kaffee.forEach((ka, i) => {
      const mm = mass(ka.slug, ka.rand_mm, 2.75), [cx, boden] = pos[i];
      const e = K.el("div", "h-tasse", s); e.style.cssText = `left:${cx - mm.b / 2}px;top:${boden - mm.h}px;width:${mm.b}px;height:${mm.h}px`;
      K.bild(`assets/becher/${ka.slug}.webp`, "becher", e);
      const schild = K.el("div", "h-kschild", s, `<span>${ka.name}</span><b>${K.preis(ka.preis)}</b>`); schild.style.cssText = `left:${cx - 160}px;top:${boden + 18}px`;
      const preis = schild.querySelector("b");
      quelle.push({ x: cx, y: boden - mm.h + mm.f.rand_y * mm.s, b: mm.b });
      auf("kaffee", (p) => {
        const a = 0.9 + i * 1.1, w = fenster(p, a, a + 1.1 + (i === 5 ? 9 : 0), 0.35), da = K.seg(p, 0.6 + i * 0.08, 1.3 + i * 0.08);
        e.style.opacity = K.sanft(da);
        e.style.transform = `translate3d(0,${(1 - K.aus(da)) * 60 - w * 12}px,0) scale(${1 + 0.07 * w})`;
        K.rein(schild, K.seg(p, 0.8 + i * 0.08, 1.5 + i * 0.08), 20);
        preis.style.textShadow = `0 0 ${40 * w}px rgba(255,79,163,${0.85 * w})`;
        quelle[i].w = w;
      });
    });
    const eis = K.el("div", "h-eis", s); K.bild("assets/becher/kaffee-auf-eis.webp", "", eis);
    const eisT = K.el("div", "h-eistext", s, "<span>Jeder Kaffee</span><b>auch auf Eis</b>");
    const fuss = K.el("p", "h-fuss", s, "Cappuccino und Latte Macchiato mit<br><b>Kuh, Hafer, Mandel oder Kokosmilch.</b>");
    auf("kaffee", (p, t) => {
      const da = K.seg(p, 1.2, 2.0);
      eis.style.opacity = K.sanft(da); eis.style.transform = `translate3d(0,${(1 - K.aus(da)) * 60 + Math.sin(t) * 5}px,0)`;
      K.rein(eisT, K.seg(p, 1.5, 2.2), 24); K.rein(fuss, K.seg(p, 1.8, 2.5), 20);
      dc.clearRect(0, 0, W, H); dc.lineCap = "round"; dc.filter = "blur(9px)";
      quelle.forEach((q, n) => {
        const stv = 0.15 + 0.85 * (q.w || 0);
        for (let j = 0; j < 3; j++) {
          dc.beginPath();
          for (let i = 0; i <= 12; i++) {
            const u = i / 12, y = q.y - 6 - u * (130 + 60 * stv), x = q.x + (j - 1) * q.b * 0.2 + Math.sin(u * 3.4 + t * 1.5 + j * 2 + n) * (5 + u * 26);
            i ? dc.lineTo(x, y) : dc.moveTo(x, y);
          }
          const g = dc.createLinearGradient(0, q.y, 0, q.y - 200);
          g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.25, `rgba(255,240,250,${0.34 * stv})`); g.addColorStop(1, "rgba(255,255,255,0)");
          dc.strokeStyle = g; dc.lineWidth = 12 + 8 * Math.sin(t + j + n); dc.stroke();
        }
      });
      dc.filter = "none";
    });
  }

  // ------------------------------------------------------------------ Wechsel und Lichter
  function welle(t) {
    let zu = 0, aufd = 0;
    for (const sg of SEG) {
      const g = sg.b % LOOP;
      if (t >= sg.b - WISCH && t < sg.b) zu = (t - (sg.b - WISCH)) / WISCH;
      if (t >= g && t < g + WISCH && !(g === 0 && false)) aufd = (t - g) / WISCH + 1e-4;
    }
    const c = wctx, w = W / 2, h = H / 2;
    c.clearRect(0, 0, w, h);
    if (zu <= 0 && aufd <= 0) { wcan.style.display = "none"; return; }
    wcan.style.display = "block";
    const kante = (y0, k) => {
      c.beginPath();
      for (let x = -10; x <= w + 10; x += 8) {
        const y = y0 + 34 * Math.sin(x / 70 + t * 5 + k) + 14 * Math.sin(x / 23 - t * 8 + k * 2.1) + x * 0.12;
        x === -10 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
    };
    const farben = ["#ff4fa3", "#a855f7", "#5b1a8f", "#1d0429"];
    if (aufd <= 0) {
      const y = K.lerp(h + 200, -320, K.sanft(zu));
      farben.forEach((f, i) => { kante(y + i * 60, i); c.lineTo(w + 10, h + 20); c.lineTo(-10, h + 20); c.closePath(); c.fillStyle = f; c.fill(); });
    } else {
      const y = K.lerp(h + 320, -200, K.sanft(aufd));
      farben.forEach((f, i) => { kante(y - i * 60, i); c.lineTo(w + 10, -20); c.lineTo(-10, -20); c.closePath(); c.fillStyle = f; c.fill(); });
    }
  }
  const rf = K.rnd(77);
  const PUNKTE = Array.from({ length: 40 }, () => ({ x: rf() * W, y: rf() * H, r: 6 + rf() * 24, v: 8 + rf() * 22, ph: rf() * 6.28, pink: rf() < 0.5 }));
  function lichter(t, an) {
    lctx.clearRect(0, 0, W / 2, H / 2);
    if (!an) return;
    lctx.globalCompositeOperation = "lighter";
    for (const q of PUNKTE) {
      const y = (((q.y - t * q.v) % (H + 80)) + H + 80) % (H + 80) - 40, x = q.x + 30 * Math.sin(t * 0.3 + q.ph), a = 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.8 + q.ph));
      const g = lctx.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, q.r);
      g.addColorStop(0, q.pink ? `rgba(255,79,163,${a})` : `rgba(168,85,247,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      lctx.fillStyle = g; lctx.beginPath(); lctx.arc(x / 2, y / 2, q.r, 0, 6.2832); lctx.fill();
    }
  }

  window.renderAt = (t) => {
    t = ((t % LOOP) + LOOP) % LOOP;
    K.t = t;
    const sg = SEG.find((x) => t >= x.a && t < x.b) || SEG[0];
    for (const x of SEG) {
      const an = x === sg;
      wurzeln[x.id].style.display = an ? "block" : "none";
      if (an) for (const f of teile[x.id]) f(t - x.a, t);
    }
    lichter(t, sg.id !== "film");
    welle(t);
  };

  function start() {
    root = document.getElementById("hoch");
    film(); bowls(); build(); matcha(); kaffee();
    lcan = K.el("canvas", "h-lichter", root); lcan.width = W / 2; lcan.height = H / 2; lctx = lcan.getContext("2d");
    wcan = K.el("canvas", "h-wechsel", root); wcan.width = W / 2; wcan.height = H / 2; wctx = wcan.getContext("2d");
    const passen = () => {
      const s = K.EXPORT ? 1 : Math.min(innerWidth / W, innerHeight / H);
      root.style.transform = `translate(${K.EXPORT ? 0 : (innerWidth - W * s) / 2}px,${K.EXPORT ? 0 : (innerHeight - H * s) / 2}px) scale(${s})`;
    };
    addEventListener("resize", passen); passen();
    const passe = (sel, max) => { const e = document.querySelector(sel), r = document.createRange(); r.selectNodeContents(e); const w = r.getBoundingClientRect().width / (K.EXPORT ? 1 : root.getBoundingClientRect().width / W); if (w > max) e.style.fontSize = (parseFloat(getComputedStyle(e).fontSize) * max) / w + "px"; };
    Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => {}))]).then(() => {
      passe(".h-amazon", 960); passe(".h-spoon", 960); passe(".h-claim", 960);
      document.body.classList.add("bereit");
      if (K.EXPORT) { window.renderAt(parseFloat(Q.get("t") || "0")); return; }
      const t0 = performance.now() / 1000 - parseFloat(Q.get("t") || "0"), fest = Q.has("fest");
      const tick = () => { window.renderAt(fest ? parseFloat(Q.get("t") || "0") : performance.now() / 1000 - t0); requestAnimationFrame(tick); };
      tick();
    });
  }
  start();
})();
