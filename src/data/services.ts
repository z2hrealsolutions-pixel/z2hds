export type Service = {
  slug: string;
  title: string;
  homeTitle?: string;
  short: string;
  long: string;
  bullets: string[];
  photo: { src: string; alt: string; pos?: string } | null;
  cta: { label: string; href: string };
};

export const SERVICES: Service[] = [
  {
    slug: "3d-printing",
    title: "3D printing, single and multi-colour",
    homeTitle: "3D printing, single and multi&#8209;colour",
    short: "FDM printing in PLA+, PETG, ABS and TPU, in one colour or several, from a single part to a batch. Parts larger than the printer are printed in pieces and joined.",
    long: "Send a 3D file and we print it. Use one colour or several in the same part, from a single piece to a batch of hundreds. Parts that are bigger than the printer are printed in pieces and joined, so size is not a limit.",
    bullets: [
      "PLA+, PETG, ABS, TPU (flexible) and Lightweight PLA",
      "One colour, or several colours in one part",
      "One piece, or a batch that looks the same from first to last",
      "Up to about 25 cm in one piece, bigger parts printed in pieces and joined",
      "Instant price range for STL, 3MF and OBJ files",
    ],
    photo: { src: "/photos/realities-multicolour-bust-on-plinth.webp", alt: "Multi-colour 3D printed bust of a man in a suit and red tie, on a black plinth", pos: "50% 30%" },
    cta: { label: "Get an instant price", href: "/estimate" },
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
    photo: { src: "/photos/realities-wedding-couple-statues.webp", alt: "White 3D printed statues of a wedding couple, groom in uniform", pos: "50% 22%" },
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
    photo: { src: "/photos/design-custom-jig-bracket.webp", alt: "Black 3D printed jig bracket, a functional part designed in CAD" },
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
    photo: { src: "/photos/lifestyles-light-up-letters-ttj.webp", alt: "3D printed light-up letters spelling TTJ, glowing warm white", pos: "50% 60%" },
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
    photo: { src: "/photos/design-grid-enclosure-prototype.webp", alt: "White 3D printed enclosure prototype with grid panels, on the print bed" },
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

export const MATERIALS = [
  { name: "PLA+", use: "The everyday choice. Good detail, strong enough for display pieces, gifts and most prototypes." },
  { name: "PETG", use: "Tougher and handles moisture and some heat better than PLA. Good for functional parts." },
  { name: "ABS", use: "Heat resistant and sturdy. Used for parts that sit near warm places or take knocks." },
  { name: "TPU", use: "Flexible and rubbery. Used for grips, seals, cases and shock absorbing parts." },
  { name: "Lightweight PLA", use: "Prints with a foamed, lighter body. Good for large display pieces and props that must be easy to carry." },
];
