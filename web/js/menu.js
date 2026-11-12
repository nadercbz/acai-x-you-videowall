// Monitor 4 (ganz rechts): das Menü. Bleibt immer stehen und zeigt "Build it YOUR way":
// Größe mit Preis, Saucen, Früchte, Crunch. In der Mitte links baut sich alle 20 s eine Bowl, erst S, dann M, dann L.
(function () {
  const K = window.K, D = window.DATEN, F = window.FORMEN;
  const TAKT = 20;
  const teile = [];
  const ort = {};   // slug -> Mitte des Vorschaubildes (für die fliegenden Zutaten)

  // Drei Bowls, je eine Auswahl, die zum echten Foto der Größe passt
  const BOWLS = [
    { g: 0, sauce: ["sauce-biscoff", "sauce-kondensmilch"], frucht: ["frucht-erdbeere", "frucht-himbeere", "frucht-blaubeere"], crunch: ["crunch-biscoff", "crunch-kokosraspeln"] },
    { g: 1, sauce: ["sauce-bueno-style", "sauce-kondensmilch"], frucht: ["frucht-erdbeere", "frucht-blaubeere", "frucht-himbeere"], crunch: ["crunch-oreo", "crunch-haselnuesse"] },
    { g: 2, sauce: ["sauce-nutella-style", "sauce-raffaello-style", "sauce-mango"], frucht: ["frucht-erdbeere", "frucht-blaubeere", "frucht-banane"], crunch: ["crunch-oreo", "crunch-kokosraspeln"] },
  ];
  const STUECK = {
    "sauce-biscoff": "tropfen-erdnuss", "sauce-kondensmilch": "tropfen-kondensmilch", "sauce-bueno-style": "sauce-haselnuss",
    "sauce-nutella-style": "tropfen-schoko", "sauce-raffaello-style": "sauce-weiss", "sauce-mango": "mango-2",
    "acai-basis": "acai-1", "chia-pudding": "chia-pudding-1", "granola": "granola-1",
    "frucht-erdbeere": "erdbeere-halb-1", "frucht-himbeere": "himbeere-1", "frucht-blaubeere": "blaubeere-1", "frucht-banane": "banane",
    "crunch-biscoff": "biscoff-1", "crunch-kokosraspeln": "kokos", "crunch-oreo": "cookie-1", "crunch-haselnuesse": "haselnuesse",
  };
  // Ablauf einer Bowl in Sekunden
  const Z = { groesse: 0.5, sauce: 2.2, basis: 6.2, frucht: 10.2, crunch: 14.2, fertig: 17.2, ende: 19.3 };
  const wann = (b) => {
    const w = {};
    b.sauce.forEach((s, i) => (w[s] = Z.sauce + 0.3 + i * (3.2 / b.sauce.length)));
    ["acai-basis", "chia-pudding", "granola"].forEach((s, i) => (w[s] = Z.basis + 0.2 + i * 1.15));
    b.frucht.forEach((s, i) => (w[s] = Z.frucht + 0.2 + i * 1.15));
    b.crunch.forEach((s, i) => (w[s] = Z.crunch + 0.2 + i * 1.2));
    return w;
  };
  BOWLS.forEach((b) => (b.wann = wann(b)));

  function liste(s, cls, nr, titel, hinweis, x, y, eintraege, spalten = 1, breite = 310, zeile = 60) {
    const k = K.el("div", "lkopf " + cls, s, `${nr ? `<span class="nr">${nr}</span>` : ""}<b>${titel}</b>${hinweis ? `<i>${hinweis}</i>` : ""}`);
    k.style.cssText = `left:${x}px;top:${y}px`;
    const proSpalte = Math.ceil(eintraege.length / spalten), reihen = [];
    eintraege.forEach(([slug, name], i) => {
      const sx = x + Math.floor(i / proSpalte) * (breite + 8), sy = y + 68 + (i % proSpalte) * zeile;
      const z = K.el("div", "zeile", s); z.style.cssText = `left:${sx}px;top:${sy}px;width:${breite}px`;
      const bild = K.bild(`assets/toppings/${slug}.webp`, "", z);
      K.el("span", "", z, name);
      ort[slug] = [sx + 27, sy + 27];
      reihen.push({ z, bild, slug, i });
    });
    return { k, reihen };
  }

  function bauen() {
    const s = K.el("section", "schirm menu", document.getElementById("board"));
    s.style.left = "5760px";
    const g = K.el("div", "grund", s); g.style.setProperty("--x", "-3600px");
    [["wedel", 820, -90, 1190, 34], ["breit", 480, 1840, 1210, -26]].forEach(([art, gr, x, y, w], i) => {
      const b = K.blatt(art, gr, "#2c0a44", "#5a1a8a"); b.classList.add("rand"); b.style.left = x - gr / 2 + "px"; b.style.top = y - gr * 1.04 + "px";
      s.appendChild(b); teile.push((u, t) => { b.style.transform = `rotate(${w + 2.4 * Math.sin(t * 0.7 + i * 2)}deg)`; });
    });
    K.bild("assets/logo.webp", "mlogo", s);
    const titel = K.el("h1", "", s, "Build it<br><em>YOUR</em> way.");
    const your = titel.querySelector("em");

    // 1 Größe
    const gk = K.el("div", "lkopf", s, `<span class="nr">1</span><b>Größe</b><i>S, M oder L</i>`); gk.style.cssText = "left:852px;top:36px";
    const karten = D.bowls.map((b, i) => {
      const k = K.el("div", "karte", s, `<img src="assets/becher/${b.bild}.webp" alt=""><div><div class="zl"><span class="ring">${b.id}</span><span class="ml">${b.ml} ml</span>${b.beliebt ? '<span class="beliebt">Beliebt</span>' : ""}</div><div class="preis">${K.preis(b.preis)}</div></div>`);
      k.style.left = 852 + i * 344 + "px";
      return k;
    });

    // Listen
    const sauce = liste(s, "", 2, "Saucen", `bis zu ${D.grenzen.saucen}`, 548, 262, D.saucen, 2, 322);
    const basis = liste(s, "klein", 0, "Immer dabei", "", 548, 772, D.basis, 2, 322, 58);
    const frucht = liste(s, "", 3, "Früchte", `bis zu ${D.grenzen.fruechte}`, 1226, 262, D.fruechte);
    const crunch = liste(s, "", 4, "Crunch", `bis zu ${D.grenzen.crunch}`, 1556, 262, D.crunch);
    const inkl = K.el("div", "inkl", s, "<b>Alles inklusive.</b><span>Du zahlst nur die Größe.</span>");

    // Bühne: hier entsteht die Bowl
    const buehne = K.el("div", "bau", s);
    K.el("div", "kicker", buehne, "So entsteht deine Bowl");
    const schein = K.el("div", "schein", buehne);
    const becher = D.bowls.map((b) => {
      const f = F[b.bild], rand = f.rechts[0] * f.rand_y + f.rechts[1] - (f.links[0] * f.rand_y + f.links[1]);
      const sk = (b.rand_mm * 3.1) / rand, w = f.breite * sk, h = f.hoehe * sk;
      const e = K.el("div", "bbecher", buehne); e.style.cssText = `left:${232 - w / 2}px;top:${596 - h}px;width:${w}px;height:${h}px`;
      const geist = K.bild(`assets/becher/${b.bild}.webp`, "geist", e), echt = K.bild(`assets/becher/${b.bild}.webp`, "echt", e);
      const st = f.sticker, dr = K.bild("assets/druck.webp", "druck", e);
      dr.style.cssText = `left:${((st.x - st.d / 2) / f.breite) * 100}%;top:${((st.y - st.d / 2) / f.hoehe) * 100}%;width:${(st.d / f.breite) * 100}%`;
      return { e, geist, echt, dr, randP: (1 - f.rand_y / f.hoehe) * 100, bodenP: (1 - f.boden_y / f.hoehe) * 100, ziel: [56 + 232, 262 + 596 - h + f.rand_y * sk * 0.55] };
    });
    const flug = K.el("div", "flug", s), flieger = [];
    BOWLS.forEach((b, bi) => Object.entries(b.wann).forEach(([slug, t0]) => {
      for (let j = 0; j < 3; j++) {
        const gr = slug.startsWith("sauce") ? 46 : 58 + j * 8, e = K.bild(`assets/zutaten/${STUECK[slug]}.webp`, "", flug);
        e.style.width = gr + "px";
        flieger.push({ e, bi, slug, t0: t0 + j * 0.16, gr, dx: (j - 1) * 46, dreh: j * 70 });
      }
    }));
    const texte = ["Wähl deine Größe", "Sauce in den Becher", "Açaí, Chia Pudding, Granola", "Früchte obendrauf", "Crunch zum Schluss", "Fertig. Genau deine Bowl."];
    const zeilen = K.el("div", "schritt", buehne);
    const nummer = [1, 2, 0, 3, 4, 0];
    const tx = texte.map((x, i) => K.el("span", "", zeilen, (nummer[i] ? `<i>${nummer[i]}</i>` : "") + x));
    const punkte = K.el("div", "punkte", buehne, "<i></i><i></i><i></i><i></i><i></i>");
    const pk = [...punkte.children];
    const fuss = K.el("footer", "mfuss", s,
      `<div><b>Iced Matcha</b> ab ${K.preis(D.matcha.classic[0])}<i></i><b>Limeades</b> ab ${K.preis(D.limeades.preise[0])}<i></i><b>Kaffee</b> ab ${K.preis(D.kaffee[0].preis)}</div>` +
      `<div class="klein">Allergene: frag unser Team · Preise in Euro inkl. MwSt.</div>`);

    const alle = [...sauce.reihen, ...basis.reihen, ...frucht.reihen, ...crunch.reihen];
    const gruppen = [[sauce, Z.sauce, Z.basis], [basis, Z.basis, Z.frucht], [frucht, Z.frucht, Z.crunch], [crunch, Z.crunch, Z.fertig]];
    const fen = (u, a, b, w = 0.5) => K.sanft(K.seg(u, a, a + w)) * (1 - K.sanft(K.seg(u, b - w, b)));

    K.szenen.push((t) => {
      const bi = Math.floor(t / TAKT) % BOWLS.length, u = t % TAKT, B = BOWLS[bi], be = becher[B.g];
      for (const f of teile) f(u, t);
      // YOUR als Neon, atmet leicht
      your.style.setProperty("--an", 0.9 + 0.1 * Math.sin(t * 2.2));
      // Stand im Becher: Sauce, dann Açaí bis zum Rand, dann Früchte und Crunch darüber
      const r = be.randP, b0 = be.bodenP;
      const stand = u < Z.sauce ? b0 - 4
        : u < Z.basis ? K.lerp(b0 - 2, b0 + (r - b0) * 0.2, K.sanft(K.seg(u, Z.sauce + 0.6, Z.basis - 0.4)))
        : u < Z.frucht ? K.lerp(b0 + (r - b0) * 0.2, r, K.sanft(K.seg(u, Z.basis + 0.5, Z.frucht - 0.4)))
        : u < Z.crunch ? K.lerp(r, r + (100 - r) * 0.62, K.sanft(K.seg(u, Z.frucht + 0.5, Z.crunch - 0.4)))
        : K.lerp(r + (100 - r) * 0.62, 104, K.sanft(K.seg(u, Z.crunch + 0.5, Z.fertig - 0.3)));
      const da = K.sanft(K.seg(u, 0.2, 0.9)) * (1 - K.sanft(K.seg(u, Z.ende, TAKT - 0.05)));
      becher.forEach((x, i) => {
        const meins = i === B.g;
        x.e.style.opacity = meins ? da : 0;
        if (!meins) return;
        const fertig = fen(u, Z.fertig, Z.ende + 0.6, 0.4);
        x.e.style.transform = `translate3d(0,${Math.sin(t * 1.1) * 5 - fertig * 8}px,0) scale(${0.94 + 0.06 * K.aus(K.seg(u, 0.2, 1.0)) + 0.035 * fertig})`;
        x.echt.style.webkitMaskImage = x.echt.style.maskImage = `linear-gradient(${Math.sin(t * 5) * 1.6 * (u < Z.frucht ? 1 : 0)}deg, #000 ${stand - 1.2}%, transparent ${stand + 1.6}%)`;
        x.dr.style.opacity = 0.75 * (1 - K.sanft(K.seg(u, Z.basis + 0.6, Z.basis + 2.6)));
      });
      schein.style.opacity = 0.45 + 0.55 * fen(u, Z.fertig, Z.ende + 0.6, 0.4);
      // Schritt Text und Punkte
      const grenzen = [0, Z.sauce, Z.basis, Z.frucht, Z.crunch, Z.fertig, TAKT];
      tx.forEach((e, i) => { const w = fen(u, grenzen[i], grenzen[i + 1] + (i === 5 ? -0.3 : 0.25), 0.35); e.style.opacity = w; e.style.transform = `translate3d(0,${(1 - w) * 18}px,0)`; });
      pk.forEach((e, i) => e.style.setProperty("--w", K.sanft(K.seg(u, grenzen[i + 1] - 0.4, grenzen[i + 1])) * (1 - K.sanft(K.seg(u, Z.ende, TAKT)))));
      // Karten der Größen
      karten.forEach((k, i) => { const w = i === B.g ? fen(u, Z.groesse, Z.ende + 0.5, 0.5) : 0; k.style.setProperty("--w", w.toFixed(3)); k.style.transform = `scale(${1 + 0.035 * w})`; });
      gk.style.setProperty("--w", fen(u, 0.2, Z.sauce + 0.3).toFixed(3));
      // Listen: die aktive leuchtet, gewählte Zutaten bleiben markiert
      gruppen.forEach(([gr, a, b]) => {
        const w = fen(u, a, b + 0.3);
        gr.k.style.setProperty("--w", w.toFixed(3));
        gr.reihen.forEach((x) => {
          const t0 = B.wann[x.slug], gew = t0 == null ? 0 : K.sanft(K.seg(u, t0 - 0.15, t0 + 0.25)) * (1 - K.sanft(K.seg(u, Z.ende, TAKT - 0.1)));
          const welle = w * Math.max(0, Math.sin(t * 2.6 - x.i * 0.55)) ** 6;
          x.z.style.setProperty("--g", gew.toFixed(3));
          x.z.style.opacity = 0.74 + 0.26 * Math.max(w, gew);
          x.bild.style.transform = `scale(${1 + 0.12 * welle + 0.2 * gew}) rotate(${t * 4 + x.i * 40}deg)`;
        });
      });
      // Zutaten fliegen im Bogen aus der Liste in den Becher
      for (const f of flieger) {
        if (f.bi !== bi) { f.e.style.opacity = 0; continue; }
        const k = K.seg(u, f.t0, f.t0 + 0.95);
        if (k <= 0 || k >= 1) { f.e.style.opacity = 0; continue; }
        const [x0, y0] = ort[f.slug], [x1, y1] = be.ziel, e = K.sanft(k);
        const x = K.lerp(x0, x1 + f.dx * 0.5, e), y = K.lerp(y0, y1, e) - Math.sin(e * Math.PI) * (150 + Math.abs(x0 - x1) * 0.16);
        f.e.style.opacity = K.sanft(K.seg(k, 0, 0.12)) * (1 - K.sanft(K.seg(k, 0.84, 1)));
        f.e.style.transform = `translate3d(${x - f.gr / 2}px,${y - f.gr / 2}px,0) rotate(${f.dreh + k * 260}deg) scale(${0.7 + 0.6 * Math.sin(e * Math.PI)})`;
      }
      inkl.style.setProperty("--w", (0.5 + 0.5 * Math.sin(t * 1.4)).toFixed(3));
    });
  }

  K.menuBauen = bauen;
})();
