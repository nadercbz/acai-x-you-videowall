// Produkte auf den drei linken Monitoren: links Açaí Bowl, Mitte Iced Matcha, rechts Kaffee.
// Läuft von K.KINO bis zum Ende der Schleife. Alle Bewegungen hängen nur an der Zeit.
(function () {
  const K = window.K, D = window.DATEN, F = window.FORMEN;
  let wurzel, funken, fc;
  const teile = [];   // Funktionen (p, t), p = Sekunden seit Beginn der Produktphase
  const P = K.LOOP - K.KINO, TB = (P - 2) / 3, TS = (P - 2) / 6;   // Dauer je Bowl Größe, je Sorte und je Kaffee

  // Becher in echter Größe zueinander: Breite am Rand in mm mal k Pixel
  function mass(slug, rand_mm, k) {
    const f = F[slug], rand = f.rechts[0] * f.rand_y + f.rechts[1] - (f.links[0] * f.rand_y + f.links[1]);
    const s = (rand_mm * k) / rand;
    return { b: f.breite * s, h: f.hoehe * s, s, f };
  }
  // Fenster: 1 zwischen a und b, weich ein und aus
  const fenster = (p, a, b, w = 0.7) => K.sanft(K.seg(p, a, a + w)) * (1 - K.sanft(K.seg(p, b - w, b)));

  function grund(s, n) {
    const g = K.el("div", "grund", s);
    g.style.setProperty("--x", -n * 1920 + "px");
    [["wedel", 900, -120, 1180, 38], ["breit", 520, 1800, 1200, -30], ["wedel", 760, 1960, 120, -128]].forEach(([art, gr, x, y, w], i) => {
      const b = K.blatt(art, gr, "#2c0a44", "#5a1a8a");
      b.classList.add("rand"); b.style.left = x - gr / 2 + "px"; b.style.top = y - gr * 1.04 + "px";
      s.appendChild(b); teile.push((p, t) => { b.style.transform = `rotate(${w + 2.4 * Math.sin(t * 0.7 + i * 2 + n)}deg)`; });
    });
  }
  const kopf = (s, kicker, titel, unter) => {
    const k = K.el("div", "kopf", s);
    const a = K.el("div", "kicker", k, kicker), b = K.el("h2", "", k, titel), c = unter ? K.el("p", "unter", k, unter) : null;
    teile.push((p) => { K.rein(a, K.seg(p, 0.5, 1.1), 24); K.rein(b, K.seg(p, 0.6, 1.3)); if (c) K.rein(c, K.seg(p, 0.8, 1.5), 24); });
    return k;
  };

  // ------------------------------------------------------------------ Monitor 1: Açaí Bowl
  function bowls(s) {
    grund(s, 0);
    kopf(s, "Açaí Bowls", "Açaí Bowl");
    const claim = K.el("p", "seitlich", s, "Schicht für Schicht,<br>ganz nach dir.");
    const fall = K.el("div", "fall", s);
    const mitte = [356, 940, 1520], boden = 812, r = K.rnd(31);
    const namen = ["erdbeere-halb-1", "blaubeere-1", "granola-1", "himbeere-1", "banane", "kokos", "erdbeere", "blaubeere-3", "mango-1", "kiwi", "granola-2", "himbeere-2", "erdbeere-halb-2", "mandeln", "blaubeere-2", "ananas-1", "haselnuesse", "mango-3"];
    D.bowls.forEach((b, i) => {
      const m = mass(b.bild, b.rand_mm, 3.28), x = mitte[i], oben = boden - m.h;
      const g = K.el("div", "groesse", s); g.style.cssText = `left:${x - m.b / 2}px;top:${oben}px;width:${m.b}px;height:${m.h}px`;
      const schein = K.el("div", "schein", g);
      const bild = K.bild(`assets/becher/${b.bild}.webp`, "becher", g);
      const schild = K.el("div", "schild", s, `<div class="sz"><span class="ring">${b.id}</span><span class="ml">${b.ml} ml</span>${b.beliebt ? '<span class="beliebt">Beliebt</span>' : ""}</div><div class="preis">${K.preis(b.preis)}</div>`);
      schild.style.left = x - 260 + "px";
      const preis = schild.querySelector(".preis"), ring = schild.querySelector(".ring");
      // Toppings fallen in den Becher, solange er dran ist
      const start = 1.2 + i * TB, rand = m.f.rand_y * m.s, stuecke = [];
      for (let j = 0; j < 9; j++) {
        const gr = 70 + r() * 46, e = K.bild(`assets/zutaten/${namen[(i * 5 + j) % namen.length]}.webp`, "", fall);
        e.style.width = gr + "px";
        stuecke.push({ e, gr, t: start + 1.0 + j * ((TB - 3) / 9) + r() * 0.4, x: x + (r() - 0.5) * m.b * 0.5, dreh: r() * 360, dir: r() < 0.5 ? -1 : 1 });
      }
      teile.push((p, t) => {
        const w = fenster(p, start, start + TB), da = K.seg(p, 0.7 + i * 0.18, 1.6 + i * 0.18);
        const schweb = Math.sin(t * 1.1 + i * 2.1) * 7;
        g.style.opacity = K.sanft(da);
        g.style.transform = `translate3d(0,${(1 - K.aus(da)) * 90 + schweb - w * 10}px,0) scale(${1 + 0.05 * w})`;
        schein.style.opacity = 0.3 + 0.7 * w;
        K.rein(schild, K.seg(p, 1.1 + i * 0.18, 1.8 + i * 0.18), 30);
        preis.style.textShadow = `0 0 ${46 * w}px rgba(255,79,163,${0.85 * w})`;
        ring.style.boxShadow = `0 0 ${10 + 30 * w}px rgba(255,79,163,${0.45 + 0.5 * w}), inset 0 0 ${8 + 10 * w}px rgba(255,79,163,${0.3 + 0.4 * w})`;
        for (const z of stuecke) {
          const k = K.seg(p, z.t, z.t + 1.0);
          z.e.style.opacity = k <= 0 || k >= 1 ? 0 : K.sanft(K.seg(k, 0, 0.18)) * (1 - K.sanft(K.seg(k, 0.82, 1)));
          z.e.style.transform = `translate3d(${z.x - z.gr / 2}px,${K.lerp(Math.max(oben - 230, 205), oben + rand * 0.45, K.ein(k) * 0.6 + k * 0.4) - z.gr / 2}px,0) rotate(${z.dreh + z.dir * k * 200}deg)`;
        }
      });
    });
    const fuss = K.el("p", "fuss", s, "Früchte, Crunch, Chia Pudding, Granola und Saucen inklusive. <b>Du zahlst nur die Größe.</b>");
    teile.push((p) => { K.rein(claim, K.seg(p, 1.0, 1.8), 24); K.rein(fuss, K.seg(p, 1.8, 2.6), 20); });
  }

  // ------------------------------------------------------------------ Monitor 2: Iced Matcha (echte Videos der Becher), unten Limeades
  function matcha(s) {
    grund(s, 1);
    const M = D.matcha, f0 = F[M.sorten[0].slug], hoch = 742, breit = (hoch * f0.breite) / f0.hoehe;
    const held = K.el("div", "held", s); held.style.cssText = `left:${505 - breit / 2}px;top:128px;width:${breit}px;height:${hoch}px`;
    const schein = K.el("div", "schein", held);
    const filme = M.sorten.map((so) => {
      const fi = K.film(so.slug, 91, 20, held, "film");
      fi.e.style.webkitMaskImage = fi.e.style.maskImage = `url(assets/becher/${so.slug}.webp)`;
      if (so.flick) {   // Stelle im Higgsfield Video, die ruhig bleiben soll: dort liegt das Foto darüber
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

    const text = K.el("div", "text", s);
    const kicker = K.el("div", "kicker", text, "Iced Matcha"), titel = K.el("h2", "", text, "Iced Matcha");
    const sorte = K.el("div", "sorte", text);
    const namen = M.sorten.map((so) => { const e = K.el("span", "", sorte, so.name); e.style.color = so.farbe; return e; });
    const preise = K.el("div", "preise", text,
      `<div class="pk"><span></span><span>M</span><span>L</span></div>` +
      `<div class="pz" data-z="0"><span>Classic</span><b>${K.preis(M.classic[0])}</b><b>${K.preis(M.classic[1])}</b></div>` +
      `<div class="pz" data-z="1"><span>Flavoured</span><b>${K.preis(M.flavoured[0])}</b><b>${K.preis(M.flavoured[1])}</b></div>`);
    const zeilen = [...preise.querySelectorAll(".pz")];
    const chips = K.el("div", "chips", text);
    const chip = M.sorten.map((so) => { const e = K.el("span", "chip", chips, `<i style="background:${so.farbe}"></i>${so.name}`); e.style.setProperty("--f", so.farbe); return e; });
    const milch = K.el("p", "milch", text, "Milch nach Wahl: " + M.milch.join(", "));

    const leiste = K.el("div", "leiste", s);
    K.el("div", "limkopf", leiste, `<div class="kicker">Limeades</div><div class="lpreis"><span>${D.limeades.groessen[0]}</span><b>${K.preis(D.limeades.preise[0])}</b><span>${D.limeades.groessen[1]}</span><b>${K.preis(D.limeades.preise[1])}</b></div>`);
    const lim = D.limeades.sorten.map((so) => { const e = K.el("div", "lim", leiste); K.bild(`assets/becher/${so.slug}.webp`, "", e); K.el("span", "", e, so.name); return e; });

    const takt = TS;   // Sekunden je Sorte
    teile.push((p, t) => {
      const da = K.seg(p, 0.7, 1.7);
      held.style.opacity = K.sanft(da);
      held.style.transform = `translate3d(0,${(1 - K.aus(da)) * 90 + Math.sin(t * 0.9) * 6}px,0)`;
      let farbe = M.sorten[0].farbe, aktiv = 0;
      M.sorten.forEach((so, i) => {
        const a = 1 + i * takt, w = i === 0 ? 1 - K.sanft(K.seg(p, a + takt - 0.35, a + takt + 0.35)) : fenster(p, a - 0.35, a + takt + 0.35 + (i === 5 ? 99 : 0), 0.7);
        filme[i].e.style.opacity = w; if (filme[i].flick) filme[i].flick.style.opacity = w;
        if (w > 0.001) filme[i].zeige(t);
        if (w > 0.5) { farbe = so.farbe; aktiv = i; }
        const rein = K.seg(p, a - 0.2, a + 0.35), raus = i === 5 ? 0 : K.seg(p, a + takt - 0.2, a + takt + 0.35);
        const sicht = i === 0 ? 1 - K.sanft(raus) : K.sanft(rein) * (1 - K.sanft(raus));
        namen[i].style.opacity = sicht;
        namen[i].style.transform = `translate3d(0,${(1 - K.aus(i === 0 ? 1 : rein)) * 46 - K.ein(raus) * 46}px,0)`;
        chip[i].style.setProperty("--w", w.toFixed(3));
      });
      schein.style.background = `radial-gradient(closest-side, ${farbe}66, ${farbe}22 55%, transparent 72%)`;
      schein.style.opacity = 0.75 + 0.2 * Math.sin(t * 1.3);
      zeilen[0].style.setProperty("--w", aktiv === 0 ? 1 : 0); zeilen[1].style.setProperty("--w", aktiv === 0 ? 0 : 1);
      K.rein(kicker, K.seg(p, 0.6, 1.2), 24); K.rein(titel, K.seg(p, 0.7, 1.4)); K.rein(sorte, K.seg(p, 0.9, 1.6), 30);
      K.rein(preise, K.seg(p, 1.1, 1.9), 30); K.rein(chips, K.seg(p, 1.3, 2.1), 30); K.rein(milch, K.seg(p, 1.5, 2.3), 20);
      K.rein(leiste, K.seg(p, 1.6, 2.5), 40);
      lim.forEach((e, i) => { e.firstChild.style.transform = `translate3d(0,${Math.sin(t * 1.2 + i * 1.4) * 4}px,0)`; });
    });
  }

  // ------------------------------------------------------------------ Monitor 3: Kaffee
  function kaffee(s) {
    grund(s, 2);
    kopf(s, "Coffee Bar", "Kaffee", "Heiß oder auf Eis.");
    const boden = 716, k = 2.62;
    const m = D.kaffee.map((x) => mass(x.slug, x.rand_mm, k));
    const summe = m.reduce((a, x) => a + x.b, 0), luecke = (1500 - summe) / 5;
    let x = 62;
    const dampf = K.el("canvas", "dampf", s); dampf.width = 1920; dampf.height = 760;
    const dc = dampf.getContext("2d"), quelle = [];
    D.kaffee.forEach((ka, i) => {
      const mm = m[i], cx = x + mm.b / 2; x += mm.b + luecke;
      const e = K.el("div", "tasse", s); e.style.cssText = `left:${cx - mm.b / 2}px;top:${boden - mm.h}px;width:${mm.b}px;height:${mm.h}px`;
      K.bild(`assets/becher/${ka.slug}.webp`, "becher", e);
      const schild = K.el("div", "kschild", s, `<span>${ka.name}</span><b>${K.preis(ka.preis)}</b>`); schild.style.left = cx - 150 + "px";
      const preis = schild.querySelector("b");
      quelle.push({ x: cx, y: boden - mm.h + mm.f.rand_y * mm.s, b: mm.b });
      teile.push((p, t) => {
        const a = 1 + i * TS, w = fenster(p, a, a + TS), da = K.seg(p, 0.7 + i * 0.1, 1.5 + i * 0.1);
        e.style.opacity = K.sanft(da);
        e.style.transform = `translate3d(0,${(1 - K.aus(da)) * 70 - w * 14}px,0) scale(${1 + 0.06 * w})`;
        K.rein(schild, K.seg(p, 1.0 + i * 0.1, 1.7 + i * 0.1), 24);
        preis.style.textShadow = `0 0 ${40 * w}px rgba(255,79,163,${0.85 * w})`;
        quelle[i].w = w;
      });
    });
    const eis = K.el("div", "eis", s);
    K.bild("assets/becher/kaffee-auf-eis.webp", "", eis);
    const eisText = K.el("div", "eistext", s, "<span>Auch</span><b>auf Eis</b>");
    const fuss = K.el("p", "fuss", s, "Cappuccino und Latte Macchiato mit <b>Kuhmilch, Hafermilch, Mandelmilch oder Kokosmilch.</b>");
    teile.push((p, t) => {
      const da = K.seg(p, 1.2, 2.2);
      eis.style.opacity = K.sanft(da); eis.style.transform = `translate3d(0,${(1 - K.aus(da)) * 70 + Math.sin(t * 1.0 + 1) * 6}px,0)`;
      K.rein(eisText, K.seg(p, 1.6, 2.4), 24); K.rein(fuss, K.seg(p, 1.9, 2.7), 20);
      // Dampf über dem Kaffee, der gerade dran ist (und ganz leicht über allen)
      dc.clearRect(0, 0, 1920, 760);
      dc.lineCap = "round"; dc.filter = "blur(10px)";
      quelle.forEach((q, n) => {
        const st = 0.16 + 0.84 * (q.w || 0);
        for (let j = 0; j < 3; j++) {
          dc.beginPath();
          for (let i = 0; i <= 13; i++) {
            const u = i / 13, y = q.y - 6 - u * (150 + 70 * st), xx = q.x + (j - 1) * q.b * 0.2 + Math.sin(u * 3.4 + t * 1.5 + j * 2 + n) * (5 + u * 30) + Math.sin(u * 7 - t * 0.9 + n) * u * 9;
            i ? dc.lineTo(xx, y) : dc.moveTo(xx, y);
          }
          const g = dc.createLinearGradient(0, q.y, 0, q.y - 220);
          g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.25, `rgba(255,240,250,${0.34 * st})`); g.addColorStop(1, "rgba(255,255,255,0)");
          dc.strokeStyle = g; dc.lineWidth = 13 + 9 * Math.sin(t + j + n); dc.stroke();
        }
      });
      dc.filter = "none";
    });
  }

  // weiche Lichtpunkte, die langsam aufsteigen
  const rf = K.rnd(99);
  const PUNKTE = Array.from({ length: 90 }, () => ({ x: rf() * 5760, y: rf() * 1080, r: 6 + rf() * 26, v: 8 + rf() * 20, ph: rf() * 6.28, pink: rf() < 0.5 }));
  function lichter(t) {
    fc.clearRect(0, 0, 2880, 540); fc.globalCompositeOperation = "lighter";
    for (const q of PUNKTE) {
      const y = (((q.y - t * q.v) % 1160) + 1160) % 1160 - 40, x = q.x + 40 * Math.sin(t * 0.3 + q.ph), a = 0.05 + 0.07 * (0.5 + 0.5 * Math.sin(t * 0.8 + q.ph));
      const g = fc.createRadialGradient(x / 2, y / 2, 0, x / 2, y / 2, q.r);
      g.addColorStop(0, q.pink ? `rgba(255,79,163,${a})` : `rgba(168,85,247,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
      fc.fillStyle = g; fc.beginPath(); fc.arc(x / 2, y / 2, q.r, 0, 6.2832); fc.fill();
    }
  }

  K.produkteBauen = () => {
    wurzel = K.el("div", "szene produkte", document.getElementById("wand"));
    const s = [0, 1, 2].map((i) => { const e = K.el("section", "schirm p" + (i + 1), wurzel); e.style.left = i * 1920 + "px"; return e; });
    bowls(s[0]); matcha(s[1]); kaffee(s[2]);
    funken = K.el("canvas", "lichter", wurzel); funken.width = 2880; funken.height = 540; fc = funken.getContext("2d");
    K.szenen.push((t, kino) => {
      wurzel.style.display = kino ? "none" : "block";
      if (kino) return;
      const p = t - K.KINO;
      for (const f of teile) f(p, t);
      lichter(t);
    });
  };
})();
