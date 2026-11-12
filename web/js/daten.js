// Alle Inhalte und Preise der Videowall an einer Stelle.
// Quelle: Projects/86_Acai Website/neue_website/src/data.ts (Preise wie acaixyou.de, geprüft 01.11.2026)
// und Projects/56_Social Bite/Konzepte/acai-x-you/00_Material/marke.json. Bei Preisänderung nur hier ändern, dann neu rendern.
window.DATEN = {
  // Flug der Beere als Higgsfield Clip: null = gezeichneter Flug. Mit Clip: { bilder: 250, fps: 25 } (siehe higgsfield/PROMPT.md)
  flug: { bilder: 301, fps: 25 },   // Seedance 2.5 4K, Job 0b9d6a97 (higgsfield/jobs.json), Streifen per tools/flug_einbauen.py
  bowls: [
    { id: "S", ml: 300, preis: 8.9, bild: "echt-bowl-s", rand_mm: 95 },
    { id: "M", ml: 400, preis: 10.9, bild: "echt-bowl-m", rand_mm: 95, beliebt: true },
    { id: "L", ml: 500, preis: 12.5, bild: "echt-bowl-l", rand_mm: 128 },
  ],
  // Auswahlgrenzen wie auf der Live Seite
  grenzen: { saucen: 3, fruechte: 3, crunch: 4 },
  saucen: [
    ["sauce-bueno-style", "Bueno-Style"], ["sauce-nutella-style", "Nutella-Style"],
    ["sauce-raffaello-style", "Raffaello-Style"], ["sauce-vollmilchschokolade", "Vollmilchschokolade"],
    ["sauce-pistazie", "Pistazie"], ["sauce-cookies-and-cream", "Cookies and Cream"],
    ["sauce-biscoff", "Biscoff"], ["sauce-kondensmilch", "Kondensmilch"],
    ["sauce-erdnussmus", "Erdnussmus"], ["sauce-erdbeere", "Erdbeersoße"],
    ["sauce-himbeere", "Himbeersoße"], ["sauce-blaubeere", "Blaubeersoße"],
    ["sauce-mango", "Mangosoße"], ["sauce-maracuja", "Maracujasoße"],
  ],
  basis: [
    ["acai-basis", "Açaí"], ["chia-pudding", "Chia Pudding"], ["granola", "Granola"], ["schoko-granola", "Schoko Granola"],
  ],
  fruechte: [
    ["frucht-erdbeere", "Erdbeere"], ["frucht-blaubeere", "Blaubeere"], ["frucht-himbeere", "Himbeere"],
    ["frucht-banane", "Banane"], ["frucht-mango", "Mango"], ["frucht-ananas", "Ananas"],
    ["frucht-kiwi", "Kiwi"], ["frucht-weintrauben", "Weintrauben"],
  ],
  crunch: [
    ["crunch-biscoff", "Biscoff Crumbles"], ["crunch-oreo", "Oreo Crumbles"], ["crunch-kitkat", "KitKat Crumbles"],
    ["crunch-lion", "Lion Crumbles"], ["crunch-krokant", "Krokant"], ["crunch-kokosraspeln", "Kokosraspeln"],
    ["crunch-mandeln", "Mandeln gehackt"], ["crunch-haselnuesse", "Haselnüsse"],
    ["crunch-erdnuesse", "Erdnüsse gehackt"], ["crunch-chiasamen", "Chiasamen"],
  ],
  matcha: {
    classic: [4.9, 5.9], flavoured: [5.5, 6.5],
    milch: ["Kuhmilch", "Hafermilch", "Mandelmilch", "Kokosmilch"],
    sorten: [
      { slug: "echt-matcha-classic", name: "Classic", farbe: "#a9d06a" },
      { slug: "echt-matcha-blaubeere", name: "Blaubeere", farbe: "#8f7bff", flick: [13, 53, 36, 74] },
      { slug: "echt-matcha-passionsfrucht", name: "Passionsfrucht", farbe: "#f7cc3c" },
      { slug: "echt-matcha-erdbeere", name: "Erdbeere", farbe: "#ff5470" },
      { slug: "echt-matcha-himbeere", name: "Himbeere", farbe: "#ff4f9a" },
      { slug: "echt-matcha-mango", name: "Mango", farbe: "#ffa62b" },
    ],
  },
  limeades: {
    preise: [3.9, 4.9], groessen: ["M 0,3 l", "L 0,4 l"],
    sorten: [
      { slug: "echt-limeade-regular", name: "Regular" },
      { slug: "echt-limeade-mango-lime-cooler", name: "Mango Lime Cooler" },
      { slug: "echt-limeade-passionfruit", name: "Passionfruit" },
      { slug: "echt-limeade-strawberry", name: "Strawberry" },
    ],
  },
  kaffee: [
    { slug: "kaffee-espresso", name: "Espresso", preis: 2.2, rand_mm: 62 },
    { slug: "kaffee-double-espresso", name: "Double Espresso", preis: 2.9, rand_mm: 72 },
    { slug: "kaffee-americano", name: "Americano", preis: 2.9, rand_mm: 80 },
    { slug: "kaffee-cafe-crema", name: "Café Crema", preis: 2.9, rand_mm: 80 },
    { slug: "kaffee-cappuccino", name: "Cappuccino", preis: 3.5, rand_mm: 80 },
    { slug: "kaffee-latte-macchiato", name: "Latte Macchiato", preis: 3.9, rand_mm: 90 },
  ],
};
