// Kino über die drei linken Monitore (5760 x 1080): eine Açaí Beere löst sich von der Palme, fliegt durch den
// Dschungel in den leeren Becher, die Bowl entsteht, dann der Spruch der Website.
// Fassung ohne Higgsfield Clip: alles gezeichnet. Liegt assets/buehne/flug.mp4 bereit (siehe README), ersetzt es den Flug.
(function () {
  const K = window.K, L = window.LAGE;
  const W = 5760, H = 1080;
  let wurzel, kamera, leer, voll, fx, c, staub, sc, strahlen, laub = [], zutaten = [], spruch = {}, scrim, clip, vornEl;
  const FLUG = window.DATEN.flug;   // Higgsfield Clip statt gezeichnetem Flug
  const CLIP_ENDE = FLUG ? FLUG.bilder / FLUG.fps : 0;
  if (FLUG) K.KINO = Math.max(K.KINO, Math.ceil(CLIP_ENDE + 8));   // vor produkte.js, das K.KINO beim Laden liest
  const SPRUCH = FLUG ? CLIP_ENDE - 0.2 : 10.1;

  // ------------------------------------------------------------------ Flugbahn: Zeit, x, y, Nähe zur Kamera
  const R = L.rispe;
  const BAHN = [
    [1.25, R.x, R.y, 0.62],
    [1.75, R.x - 70, R.y + 190, 0.8],
    [2.35, 2560, 900, 1.25],
    [3.0, 1750, 560, 1.0],
    [3.55, 900, 250, 0.7],
    [4.05, 330, 470, 1.15],
    [4.55, 700, 850, 2.1],
    [5.1, 1850, 720, 1.5],
    [5.6, 2880, 380, 0.95],
    [6.1, 3880, 300, 0.85],
    [6.55, 4560, 150, 1.0],
    [6.9, L.rand.cx - 30, 70, 1.1],
    [7.25, L.rand.cx, L.rand.cy - 10, 1.0],
  ];
  const T0 = BAHN[0][0], T1 = BAHN[BAHN.length - 1][0];
  const RB = 44;   // Radius der Beere bei Nähe 1
  function bahn(t) {
    t = K.clamp(t, T0, T1);
    let i = 0;
    while (i < BAHN.length - 2 && t > BAHN[i + 1][0]) i++;
    const p0 = BAHN[Math.max(i - 1, 0)], p1 = BAHN[i], p2 = BAHN[i + 1], p3 = BAHN[Math.min(i + 2, BAHN.length - 1)];
    const u = (t - p1[0]) / (p2[0] - p1[0]), u2 = u * u, u3 = u2 * u;
    const cr = (k) => 0.5 * (2 * p1[k] + (-p0[k] + p2[k]) * u + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * u2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * u3);
    return [cr(1), cr(2), cr(3)];
  }

  // Tropfen, die die Beere verliert (fest ausgewürfelt, hängen nur an der Zeit)
  const rz = K.rnd(7);
  const TROPFEN = Array.from({ length: 260 }, (_, i) => ({ t: T0 + 0.25 + (i / 260) * (T1 - T0 - 0.3), dx: (rz() - 0.5) * 50, dy: (rz() - 0.5) * 50,
    vx: (rz() - 0.5) * 160, vy: -40 - rz() * 120, r: 3 + rz() * 8, leben: 0.55 + rz() * 0.5, hell: rz() }));
  const SPRITZER = Array.from({ length: 44 }, () => { const a = -Math.PI / 2 + (rz() - 0.5) * 1.9, v = 520 + rz() * 980;
    return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: 5 + rz() * 13, leben: 0.7 + rz() * 0.5, x: (rz() - 0.5) * 300 }; });
  const FUNKEN = Array.from({ length: 150 }, () => ({ x: rz() * W, y: rz() * H, r: 1 + rz() * 2.6, v: 6 + rz() * 22, ph: rz() * 6.28, tw: 0.4 + rz() * 1.4 }));

  // Zutaten, die zum Schluss in den Becher fallen: Bild, Start x Versatz, Ziel (x Versatz, y), Zeit, Größe
  const REGEN = [
    ["erdbeere-halb-1", -260, -150, 250, 8.42, 150], ["blaubeere-1", 120, 70, 300, 8.5, 86], ["granola-1", -40, -220, 330, 8.58, 110],
    ["erdbeere", 300, 190, 270, 8.66, 150], ["blaubeere-3", -330, -40, 320, 8.74, 84], ["kokos", 60, 10, 190, 8.82, 120],
    ["erdbeere-halb-2", -120, 110, 210, 8.92, 140], ["granola-2", 240, -130, 240, 9.0, 104], ["blaubeere-2", -200, 230, 330, 9.06, 82],
    ["himbeere-1", 30, -70, 160, 9.14, 96], ["mandeln", 190, 50, 130, 9.22, 100], ["chiasamen", -60, 0, 110, 9.3, 110],
  ];

  function bauen() {
    const wand = document.getElementById("wand");
    wurzel = K.el("div", "szene dschungel", wand);
    kamera = K.el("div", "kamera", wurzel);
    K.bild("assets/buehne/buehne.jpg", "grund", kamera);
    const a = L.ausschnitt;
    const lage = `left:${a.x}px;top:${a.y}px;width:${a.b}px;height:${a.h}px`;
    leer = K.bild("assets/buehne/becher_leer.webp", "stueck", kamera); leer.style.cssText = lage;
    voll = K.el("div", "stueck voll", kamera); voll.style.cssText = lage + ";background-image:url(assets/buehne/becher_voll.webp)";
    const zl = K.el("div", "regen", kamera);
    for (const [name, sx, zx, zy, t, g] of REGEN) {
      const i = K.bild(`assets/zutaten/${name}.webp`, "", zl);
      i.style.width = g + "px";
      zutaten.push({ i, sx, zx, zy, t, g, dreh: (sx % 7) * 40 });
    }
    fx = K.el("canvas", "fx", kamera); fx.width = W; fx.height = H; c = fx.getContext("2d");
    if (FLUG) { clip = K.film("flug", FLUG.bilder, FLUG.fps, wurzel, "clip"); if (!K.EXPORT) clip.e.loop = false; }
    strahlen = K.el("div", "strahlen", wurzel);
    staub = K.el("canvas", "staub", wurzel); staub.width = W / 2; staub.height = H / 2; sc = staub.getContext("2d");
    // unscharfes Laub ganz vorn, bewegt sich stärker als der Hintergrund
    const vorn = (vornEl = K.el("div", "vorn", wurzel));
    [["wedel", 1350, 140, 1340, 30, 4.2], ["wedel", 1150, 1930, -230, 172, 3.2], ["wedel", 1050, 3790, -280, 190, 3.6],
     ["wedel", 1250, 5690, 1370, -40, 4.6], ["wedel", 1000, -260, 420, 78, 5.0]]
      .forEach(([art, g, x, y, w, tiefe], n) => {
        const s = K.blatt(art, g, "#0a1407", n % 2 ? "#1f3414" : "#2b4619");
        s.style.left = x + "px"; s.style.top = y - g * 1.04 + "px"; s.style.transformOrigin = "50% 96%";
        vorn.appendChild(s); laub.push({ s, w, tiefe, ph: n * 1.7 });
      });
    scrim = K.el("div", "scrim", wurzel);
    // Spruch: je Monitor ein Block, kein Wort läuft über eine Monitorkante
    const b1 = K.el("div", "spruch eins", wurzel);
    spruch.logo = K.bild("assets/logo.webp", "logo", b1);
    spruch.from = K.el("div", "from", b1, "From the");
    spruch.amazon = K.el("div", "amazon", b1, [..."Amazon"].map((z) => `<span>${z}</span>`).join(""));
    const b2 = K.el("div", "spruch zwei", wurzel);
    spruch.spoon = K.el("div", "spoon", b2, "to your spoon.".split(" ").map((w) => `<span>${w}</span>`).join(" "));
    spruch.claim = K.el("div", "claim", b2, "Build it <em>YOUR</em> way.");
    spruch.your = spruch.claim.querySelector("em");
  }

  // ------------------------------------------------------------------ Zeichnen
  function beere(x, y, r, winkel, zug, glut) {
    c.save(); c.translate(x, y);
    c.globalCompositeOperation = "lighter";
    let g = c.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 4.6);
    g.addColorStop(0, `rgba(255,96,178,${0.62 * glut})`); g.addColorStop(0.3, `rgba(170,80,255,${0.26 * glut})`); g.addColorStop(1, "rgba(120,40,220,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r * 4.6, 0, 6.2832); c.fill();
    c.globalCompositeOperation = "source-over";
    c.rotate(winkel); c.scale(1 + zug, 1 - zug * 0.3); c.rotate(-winkel);
    // Körper: fast schwarzes Violett wie eine reife Açaí Beere, bläulicher Reif oben
    g = c.createRadialGradient(-r * 0.34, -r * 0.4, r * 0.04, 0, 0, r);
    g.addColorStop(0, "#d7b8ff"); g.addColorStop(0.16, "#8a45c4"); g.addColorStop(0.5, "#3a1260"); g.addColorStop(0.86, "#16051f"); g.addColorStop(1, "#0b0212");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill();
    g = c.createRadialGradient(r * 0.3, r * 0.5, 0, r * 0.3, r * 0.5, r * 0.9);
    g.addColorStop(0, "rgba(255,110,190,0.42)"); g.addColorStop(1, "rgba(255,110,190,0)");
    c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, 6.2832); c.fill();
    c.lineWidth = r * 0.05; c.strokeStyle = "rgba(255,170,225,0.6)"; c.beginPath(); c.arc(0, 0, r * 0.95, 0.45, 1.9); c.stroke();
    c.fillStyle = "rgba(255,255,255,0.92)"; c.beginPath(); c.ellipse(-r * 0.36, -r * 0.44, r * 0.22, r * 0.12, -0.6, 0, 6.2832); c.fill();
    c.fillStyle = "rgba(255,255,255,0.5)"; c.beginPath(); c.arc(-r * 0.1, -r * 0.66, r * 0.05, 0, 6.2832); c.fill();
    c.restore();
  }

  function schweif(t) {
    // Band aus den letzten 0,9 s der Bahn: außen violetter Schein, innen heller Kern
    const n = 80, dt = 0.9 / n, pk = [];
    for (let k = 0; k <= n; k++) {
      const tt = t - k * dt;
      if (tt < T0) break;
      const [x, y, z] = bahn(tt), [x2, y2] = bahn(tt - 0.01);
      let nx = -(y - y2), ny = x - x2; const l = Math.hypot(nx, ny) || 1;
      pk.push([x, y, nx / l, ny / l, RB * z * Math.pow(1 - k / n, 1.15)]);
    }
    if (pk.length < 3) return;
    const kopf = pk[0], ende = pk[pk.length - 1];
    const pfad = (f) => { c.beginPath(); pk.forEach((p, i) => { const x = p[0] + p[2] * p[4] * f, y = p[1] + p[3] * p[4] * f; i ? c.lineTo(x, y) : c.moveTo(x, y); });
      for (let i = pk.length - 1; i >= 0; i--) { const p = pk[i]; c.lineTo(p[0] - p[2] * p[4] * f, p[1] - p[3] * p[4] * f); } c.closePath(); };
    const g = c.createLinearGradient(kopf[0], kopf[1], ende[0], ende[1]);
    g.addColorStop(0, "rgba(255,120,200,0.95)"); g.addColorStop(0.35, "rgba(190,80,255,0.7)"); g.addColorStop(1, "rgba(90,30,200,0)");
    const g2 = c.createLinearGradient(kopf[0], kopf[1], ende[0], ende[1]);
    g2.addColorStop(0, "rgba(255,235,250,0.95)"); g2.addColorStop(0.4, "rgba(255,150,220,0.55)"); g2.addColorStop(1, "rgba(255,150,220,0)");
    c.save(); c.globalCompositeOperation = "lighter";
    c.filter = "blur(34px)"; c.globalAlpha = 0.75; c.fillStyle = g; pfad(1.25); c.fill();
    c.filter = "blur(6px)"; c.globalAlpha = 0.9; pfad(0.8); c.fill();
    c.filter = "blur(2px)"; c.globalAlpha = 0.9; c.fillStyle = g2; pfad(0.26); c.fill();
    c.restore();
  }

  function zeichne(t) {
    c.clearRect(0, 0, W, H);
    const r0 = L.rand, b0 = L.boden;
    // 1. Die Beere glüht an der Rispe auf, löst sich und fliegt
    if (t > 0.5 && t < T1 + 0.05) {
      const [x, y, z] = bahn(t), [xv, yv] = bahn(t - 0.02);
      const v = Math.hypot(x - xv, y - yv) / 0.02;
      const puls = t < T0 ? K.sanft(K.seg(t, 0.5, 1.1)) * (0.7 + 0.3 * Math.sin(t * 14)) : 1;
      // Licht, das die Beere auf den Dschungel wirft
      c.save(); c.globalCompositeOperation = "lighter";
      const lr = 700 * Math.sqrt(z), lg = c.createRadialGradient(x, y, 0, x, y, lr);
      lg.addColorStop(0, `rgba(255,110,190,${0.3 * puls})`); lg.addColorStop(0.5, `rgba(150,80,255,${0.1 * puls})`); lg.addColorStop(1, "rgba(120,60,255,0)");
      c.fillStyle = lg; c.fillRect(x - lr, y - lr, lr * 2, lr * 2); c.restore();
      if (t >= T0) {
        schweif(t);
        c.save(); c.globalCompositeOperation = "lighter";
        for (const d of TROPFEN) {
          const a = t - d.t; if (a < 0 || a > d.leben) continue;
          const [px, py, pz] = bahn(d.t), k = a / d.leben, f = (1 - k) * (0.6 + 0.4 * Math.sin(a * 30 + d.r));
          c.fillStyle = d.hell > 0.55 ? `rgba(255,190,230,${0.95 * f})` : `rgba(170,90,255,${0.9 * f})`;
          c.beginPath(); c.arc(px + d.dx * pz + d.vx * a, py + d.dy * pz + d.vy * a + 300 * a * a, d.r * 0.7 * pz * (1 - k * 0.5), 0, 6.2832); c.fill();
        }
        c.restore();
      }
      const tauch = K.seg(t, T1 - 0.1, T1 + 0.05);
      beere(x, y, RB * z * (1 - tauch * 0.35), Math.atan2(y - yv, x - xv), K.clamp(v / 16000, 0, 0.16), puls);
    }
    // 2. Eintauchen: Spritzer und ein kurzer Lichtring
    const s = t - T1;
    if (s > 0 && s < 1.3) {
      c.save();
      if (s < 0.45) {
        c.globalCompositeOperation = "lighter"; const k = s / 0.45, rr = 60 + 460 * K.aus(k);
        const g = c.createRadialGradient(r0.cx, r0.cy, rr * 0.4, r0.cx, r0.cy, rr);
        g.addColorStop(0, "rgba(255,120,200,0)"); g.addColorStop(0.75, `rgba(255,120,200,${0.5 * (1 - k)})`); g.addColorStop(1, "rgba(160,70,255,0)");
        c.fillStyle = g; c.beginPath(); c.ellipse(r0.cx, r0.cy, rr, rr * 0.42, 0, 0, 6.2832); c.fill();
        c.globalCompositeOperation = "source-over";
      }
      for (const p of SPRITZER) {
        if (s > p.leben) continue; const k = s / p.leben;
        const x = r0.cx + p.x + p.vx * s, y = r0.cy + 10 + p.vy * s + 1500 * s * s, r = p.r * (1 - k * 0.4);
        const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
        g.addColorStop(0, `rgba(214,150,255,${1 - k * k})`); g.addColorStop(0.5, `rgba(110,30,150,${1 - k * k})`); g.addColorStop(1, `rgba(46,8,70,${1 - k * k})`);
        c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
      }
      c.restore();
    }
    // 3. Spiegel der steigenden Açaí Creme im Becher
    const fuell = K.seg(t, 7.3, 8.65);
    if (fuell > 0 && fuell < 1) {
      const y = K.lerp(b0.cy - 10, r0.cy + 6, K.sanft(fuell)), u = (y - r0.cy) / (b0.cy - r0.cy), rx = K.lerp(r0.rx, b0.rx, u) - 8;
      c.save(); c.globalCompositeOperation = "lighter"; c.filter = "blur(2px)";
      c.strokeStyle = "rgba(255,170,225,0.75)"; c.lineWidth = 5; c.beginPath(); c.ellipse(r0.cx, y, rx, 22 + 10 * Math.sin(t * 9), 0, 0, Math.PI); c.stroke();
      c.fillStyle = "rgba(200,90,255,0.25)"; c.beginPath(); c.ellipse(r0.cx, y, rx, 22, 0, 0, 6.2832); c.fill(); c.restore();
    }
    // 4. Logo leuchtet auf, wenn die Bowl fertig ist
    const blitz = K.seg(t, 9.75, 10.6);
    if (blitz > 0 && blitz < 1) {
      c.save(); c.globalCompositeOperation = "lighter";
      const rr = 200 + 620 * K.aus(blitz), g = c.createRadialGradient(r0.cx, 690, 0, r0.cx, 690, rr);
      g.addColorStop(0, `rgba(255,120,200,${0.42 * (1 - blitz)})`); g.addColorStop(1, "rgba(255,120,200,0)");
      c.fillStyle = g; c.fillRect(r0.cx - rr, 690 - rr, rr * 2, rr * 2); c.restore();
    }
  }

  function staubZeichnen(t, cam) {
    sc.clearRect(0, 0, W / 2, H / 2);
    sc.globalCompositeOperation = "lighter";
    for (const f of FUNKEN) {
      const x = (((f.x + t * f.v + cam * 1.6) % W) + W) % W, y = (((f.y - t * f.v * 0.35 + 20 * Math.sin(t * 0.5 + f.ph)) % H) + H) % H;
      const a = (0.25 + 0.75 * Math.pow(0.5 + 0.5 * Math.sin(t * f.tw + f.ph), 2)) * (0.25 + 0.75 * K.clamp(x / W + 0.15));
      sc.fillStyle = `rgba(255,226,170,${0.55 * a})`;
      sc.beginPath(); sc.arc(x / 2, y / 2, f.r, 0, 6.2832); sc.fill();
    }
  }

  function szene(t, kino) {
    wurzel.style.display = kino ? "block" : "none";
    if (!kino) return;
    // Kamera folgt der Beere, kommt nach dem Eintauchen langsam zur Ruhe
    const [bx] = bahn(t);
    const ziel = -((bx - W / 2) / (W / 2)) * 104;
    const ruhe = K.sanft(K.seg(t, 9.6, 17.5));
    const cam = clip ? 0 : ziel * (1 - ruhe), zoom = clip ? K.lerp(1, 1.025, K.sanft(K.seg(t, CLIP_ENDE, K.KINO))) : K.lerp(1.046, 1.02, K.sanft(K.seg(t, 7.2, 17.5)));
    kamera.style.transform = `translate3d(${cam}px,0,0) scale(${zoom})`;
    // Becher: erst leer, dann steigt die Creme, dann fallen die Toppings, am Ende blendet das Logo ein
    const fuell = K.sanft(K.seg(t, 7.3, 8.65)), berg = K.sanft(K.seg(t, 8.6, 9.75));
    const stand = fuell < 1 ? K.lerp(4, 63, fuell) : K.lerp(63, 104, berg);
    const kipp = Math.sin(t * 8.5) * 2.4 * (1 - berg) * (fuell > 0 ? 1 : 0), rand = 1.4 + 5 * K.seg(t, 8.6, 8.9);
    voll.style.webkitMaskImage = voll.style.maskImage = `linear-gradient(${kipp}deg, #000 ${stand - rand}%, transparent ${stand + rand}%)`;
    leer.style.webkitMaskImage = leer.style.maskImage = t < 7.3 ? "none" : `linear-gradient(${kipp}deg, transparent ${stand - rand}%, #000 ${stand + rand}%)`;
    const weg = 1 - K.sanft(K.seg(t, 9.75, 10.35));
    voll.style.opacity = t < 7.3 ? 0 : weg;
    leer.style.opacity = weg;
    for (const z of zutaten) {
      const k = K.seg(t, z.t, z.t + 0.5), x = L.rand.cx + K.lerp(z.sx, z.zx, k), y = K.lerp(-180, z.zy, K.ein(k) * 0.55 + k * 0.45);
      z.i.style.opacity = k <= 0 ? 0 : 1 - K.seg(t, z.t + 0.46, z.t + 0.62);
      z.i.style.transform = `translate3d(${x - z.g / 2}px,${y - z.g / 2}px,0) rotate(${z.dreh + k * 190}deg)`;
    }
    if (clip) {
      // Clip läuft, die gezeichnete Fassung ruht. In der letzten halben Sekunde blendet er in die scharfe Bühne.
      const an = t < CLIP_ENDE;
      clip.e.style.opacity = 1 - K.sanft(K.seg(t, CLIP_ENDE - 0.5, CLIP_ENDE));
      if (an) { if (K.EXPORT) clip.zeige(Math.min(t, CLIP_ENDE - 0.001)); else { if (Math.abs(clip.e.currentTime - t) > 0.25) clip.e.currentTime = t; if (clip.e.paused) clip.e.play().catch(() => {}); } }
      leer.style.opacity = voll.style.opacity = 0;
      vornEl.style.opacity = strahlen.style.opacity = K.sanft(K.seg(t, CLIP_ENDE - 0.5, CLIP_ENDE));
      for (const z of zutaten) z.i.style.opacity = 0;
      c.clearRect(0, 0, W, H);
      if (t > CLIP_ENDE - 0.05) zeichne(K.clamp(t - CLIP_ENDE + 9.75, 9.7, 11));   // Logo leuchtet auf, wenn der Clip in die Bühne übergeht
    } else zeichne(t);
    staubZeichnen(t, cam);
    strahlen.style.opacity = (0.55 + 0.2 * Math.sin(t * 0.8) + 0.1 * Math.sin(t * 2.3)) * (clip ? K.sanft(K.seg(t, CLIP_ENDE - 0.5, CLIP_ENDE)) : 1);
    strahlen.style.transform = `translate3d(${cam * 0.6 + 20 * Math.sin(t * 0.3)}px,0,0)`;
    for (const b of laub) b.s.style.transform = `translate3d(${cam * b.tiefe}px,0,0) rotate(${b.w + 2.2 * Math.sin(t * 0.9 + b.ph)}deg)`;
    // Spruch
    const p = t - SPRUCH;
    scrim.style.opacity = K.sanft(K.seg(p, 0, 1.2));
    K.rein(spruch.logo, K.seg(p, 0.0, 0.8), -30);
    K.rein(spruch.from, K.seg(p, 0.2, 0.9));
    [...spruch.amazon.children].forEach((z, i) => {
      const k = K.seg(p, 0.45 + i * 0.07, 1.15 + i * 0.07);
      z.style.opacity = K.sanft(k); z.style.transform = `translate3d(0,${(1 - K.zurueck(k)) * 120}px,0)`; z.style.filter = `blur(${(1 - k) * 14}px)`;
    });
    [...spruch.spoon.children].forEach((z, i) => K.rein(z, K.seg(p, 1.3 + i * 0.16, 2.0 + i * 0.16), 60));
    K.rein(spruch.claim, K.seg(p, 2.2, 2.9), 40);
    // YOUR geht an wie eine Neonröhre
    const an = p - 3.0;
    const neon = an < 0 ? 0 : an < 0.08 ? 1 : an < 0.16 ? 0.15 : an < 0.26 ? 1 : an < 0.32 ? 0.3 : 1;
    spruch.your.style.setProperty("--an", neon * (0.93 + 0.07 * Math.sin(t * 6)));
  }

  K.dschungelBauen = () => { bauen(); K.szenen.push(szene); };
})();
