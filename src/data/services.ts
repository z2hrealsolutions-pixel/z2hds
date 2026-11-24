export type Service = {
  slug: string;
  title: string;
  homeTitle?: string;
  short: string;
  long: string;
  bullets: string[];
  photo: { src: string; alt: string; pos?: string } | null;
  slides?: { src: string; alt: string; caption: string }[];
  studio?: { name: string; by: string; href: string };
  more?: { label: string; href: string };
  cta: { label: string; href: string };
};

export const SERVICES: Service[] = [
  {
    slug: "3d-printing",
    title: "3D printing, single and multi-colour",
    homeTitle: "3D printing, single and multi&#8209;colour",
    short: "FDM printing in PLA, PETG, ABS/ASA and TPU, in one colour or several, from a single part to a batch. Parts larger than the printer are printed in pieces and joined.",
    long: "Send a 3D file and we print it. Use one colour or several in the same part, from a single piece to a batch of hundreds.",
    bullets: [
      "PLA+, PLA, PLA variants, PETG, PETG variants, ABS/ASA, TPU (flexible) and Lightweight PLA",
      "One colour, or several colours in one part",
      "One piece, or a batch that looks the same from first to last",
      "Instant price range for STL, 3MF and OBJ files",
    ],
    photo: { src: "/photos/realities-multicolour-bust-on-plinth.webp", alt: "Multi-colour 3D printed bust of a man in a suit and red tie, on a black plinth", pos: "50% 30%" },
    cta: { label: "Get an instant price", href: "/estimate" },
    more: { label: "See all materials", href: "/services/materials" },
  },
  {
    slug: "custom-figurines",
    title: "Custom figurine printing",
    short: "Portrait busts, couple statues and full figures made from your photos, with display cases and printed name plates.",
    long: "Send us photos and we make a statue of a person, a couple or a whole family. Choose a single colour or full colour, a small desk figure or a statue of 50 cm and more.",
    bullets: [
      "Busts, full figures and couple statues",
      "Made from clear photos, front and sides",
      "Single colour or multi-colour",
      "Display cases and printed name plates",
      "Gifts for weddings, birthdays and awards",
    ],
    photo: { src: "/photos/realities-couple-bust-gold.webp", alt: "Gold-coloured 3D printed couple bust made from a photo", pos: "50% 70%" },
    studio: { name: "Realities", by: "by Z2H DS", href: "/gallery?studio=realities" },
    cta: { label: "Ask about a figurine", href: "/contact?topic=figurine#form" },
  },
  {
    slug: "3d-modelling-cad",
    title: "3D modelling and CAD",
    short: "We turn a sketch, a photo or a broken part into a model that is ready to print or manufacture.",
    long: "No file yet? We model it. Bring a sketch, a photo, a measurement or the part that broke, and we draw it in CAD so it can be printed or made.",
    bullets: [
      "Models from sketches, photos and measurements",
      "Copies and repairs of broken or worn parts",
      "Jigs, brackets, housings and fixtures",
      "Designed to print well, so the part works the first time",
    ],
    photo: { src: "/photos/design-cad-model-threaded-part.webp", alt: "3D printed threaded part held in front of its CAD model on a laptop screen", pos: "50% 45%" },
    cta: { label: "Ask about modelling", href: "/contact?topic=cad#form" },
  },
  {
    slug: "electronics-embedded",
    title: "Electronics and embedded product development",
    short: "Lights, sensors and controllers designed into the product, with the housing and the circuit developed together.",
    long: "Our team is made up of mechatronics engineers, so we can design the electronics and the housing as one product. That is how a light-up sign, a sensor box or a small controller ends up neat and easy to assemble.",
    bullets: [
      "Light-up signs, logos and lamps",
      "Sensors and controllers inside a printed housing",
      "Working prototypes you can test and show",
      "Circuit and housing developed together",
    ],
    photo: { src: "/photos/uniqs-light-up-letters-ttj-centred.webp", alt: "3D printed light-up letters spelling TTJ, glowing warm white" },
    cta: { label: "Talk about a product", href: "/contact?topic=electronics#form" },
  },
  {
    slug: "simulation-analysis",
    title: "Simulation and analysis",
    short: "Strength and fit checks on your design before it is made, so the first version is closer to the last.",
    long: "Before a part is printed or made, we can test it on the computer. That saves material, time and a few bad prototypes.",
    bullets: [
      "Strength checks for parts that carry a load",
      "Fit checks for parts that must go together",
      "Comparing two or three design options",
      "Clear findings in plain words, not a wall of numbers",
    ],
    photo: { src: "/photos/design-simulation-stress-box-frame.webp", alt: "Stress simulation of a box frame under load, coloured by von Mises stress" },
    slides: [
      { src: "/photos/design-simulation-stress-box-frame.webp", alt: "Stress simulation of a box frame under load, coloured by von Mises stress", caption: "Stress check: box frame under load" },
      { src: "/photos/design-simulation-stress-table-mount.webp", alt: "Stress simulation of a plate on a single post under a spread load", caption: "Stress check: plate on a single post" },
      { src: "/photos/design-simulation-displacement-bracket.webp", alt: "Deflection simulation of a bent bracket under load, coloured by displacement", caption: "Deflection check: bent bracket" },
    ],
    cta: { label: "Ask about analysis", href: "/contact?topic=simulation#form" },
  },
  {
    slug: "laser-cutting",
    title: "Laser cutting and engraving",
    short: "Cut and engraved signs, plates and parts in wood and acrylic.",
    long: "For flat parts, signs and name plates, a laser is the right tool. We cut and engrave wood and acrylic, and can combine laser parts with 3D printed ones in the same product.",
    bullets: [
      "Wood and acrylic",
      "Signs, name plates and display stands",
      "Engraved logos and text",
      "Combined with 3D printed parts when a product needs both",
    ],
    photo: null,
    cta: { label: "Ask about laser work", href: "/contact?topic=laser#form" },
  },
];

export const MATERIAL_NAMES = ["PLA+", "PLA", "PLA variants", "PETG", "PETG variants", "ABS/ASA", "TPU (flexible)", "Lightweight PLA"];

export const MATERIALS = [
  { name: "PLA+", use: "The everyday choice. A tougher PLA with good detail. Strong enough for display pieces, gifts and most prototypes." },
  { name: "PLA", use: "Easy to print with a clean finish and the widest choice of colours. Good for models, statues and decorative pieces." },
  { name: "PLA variants", use: "PLA in special finishes and blends. Ask us which ones we have in stock for your job." },
  { name: "PETG", use: "Tougher than PLA, and handles moisture and some heat better. Good for functional parts such as brackets, covers and holders." },
  { name: "PETG variants", use: "PETG in special finishes and blends, for parts that need PETG's toughness with a different look. Ask us what is in stock." },
  { name: "ABS/ASA", use: "Hard, sturdy plastics that handle heat better than PLA. ASA also stands up to sunlight, so it suits parts used outdoors." },
  { name: "TPU (flexible)", use: "Flexible and rubbery. Used for grips, seals, cases and shock absorbing parts." },
  { name: "Lightweight PLA", use: "Prints with a foamed, lighter body. Good for large display pieces and props that must be easy to carry." },
];
