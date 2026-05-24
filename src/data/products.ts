import type { CategoryColor } from "./categories";

export type ProductType = "physical" | "digital";

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  color: CategoryColor;
  price: number;
  stock: number;
  type: ProductType;
  badge?: string;
  description: string;
  details?: string[];
  images?: string[];
  featured?: boolean;
}

export const products: Product[] = [
  {
    id: "p-001",
    slug: "conejito-pastel-tomas",
    name: 'Conejito Pastel "Tomás"',
    category: "amigurumis",
    categoryLabel: "Amigurumi",
    color: "rose",
    price: 18500,
    stock: 3,
    type: "physical",
    badge: "Nuevo",
    description:
      "Conejito tejido a crochet en tonos pastel. Mide 22 cm aprox. y está relleno con guata hipoalergénica.",
    details: [
      "Alto: 22 cm aprox.",
      "Materiales: algodón premium e hilo amigurumi",
      "Relleno: guata hipoalergénica",
      "Lavable a mano con agua fría",
    ],
    featured: true,
  },
  {
    id: "p-002",
    slug: "patron-osito-pancho",
    name: 'Patrón Osito "Pancho" — Principiante',
    category: "patrones",
    categoryLabel: "Patrón digital",
    color: "sage",
    price: 4900,
    stock: 999,
    type: "digital",
    badge: "PDF",
    description:
      "Patrón en PDF con instrucciones paso a paso y fotos. Ideal para quienes recién empiezan con amigurumis.",
    details: [
      "18 páginas con fotos y diagrama",
      "Nivel: principiante",
      "Materiales sugeridos incluidos",
      "Descarga inmediata tras el pago",
    ],
    featured: true,
  },
  {
    id: "p-003",
    slug: "agenda-2026-nombre",
    name: "Agenda 2026 con tu nombre",
    category: "agendas",
    categoryLabel: "Agenda",
    color: "lavender",
    price: 14900,
    stock: 2,
    type: "physical",
    badge: "Personalizable",
    description:
      "Agenda 2026 con tapa dura, decorada a mano. Te incluimos tu nombre y los colores que prefieras.",
    details: [
      "Tamaño A5, 200 páginas",
      "Tapa dura forrada en tela",
      "Personalización con tu nombre",
      "Tiempo de entrega: 5 a 7 días hábiles",
    ],
    featured: true,
  },
  {
    id: "p-004",
    slug: "gatito-luna",
    name: 'Gatito durmiente "Luna"',
    category: "amigurumis",
    categoryLabel: "Amigurumi",
    color: "sage",
    price: 21000,
    stock: 5,
    type: "physical",
    badge: "Destacado",
    description: "Gatito acurrucado, ideal como decoración o regalo tierno.",
    featured: true,
  },
  {
    id: "p-005",
    slug: "pack-3-patrones-familia-bosque",
    name: 'Pack 3 patrones "Familia bosque"',
    category: "patrones",
    categoryLabel: "Patrones digitales",
    color: "rose",
    price: 11900,
    stock: 999,
    type: "digital",
    badge: "Pack ahorro",
    description:
      "Tres patrones temáticos: zorro, búho y conejo. Ahorra 30% comprándolos juntos.",
    featured: true,
  },
  {
    id: "p-006",
    slug: "libreta-pocket-pastel",
    name: "Libreta pocket pastel — Tapa dura",
    category: "agendas",
    categoryLabel: "Libreta",
    color: "lavender",
    price: 8500,
    stock: 0,
    type: "physical",
    description: "Libreta de bolsillo con tapa dura, lista para llevar a todas partes.",
  },
  {
    id: "p-007",
    slug: "pulpito-amoroso",
    name: 'Pulpito amoroso "Coco"',
    category: "amigurumis",
    categoryLabel: "Amigurumi",
    color: "lavender",
    price: 15500,
    stock: 4,
    type: "physical",
    description: "Pulpito con sonrisa tierna, perfecto para regalar a alguien especial.",
  },
  {
    id: "p-008",
    slug: "patron-amigurumi-flor",
    name: "Patrón Flor decorativa",
    category: "patrones",
    categoryLabel: "Patrón digital",
    color: "sage",
    price: 3500,
    stock: 999,
    type: "digital",
    badge: "PDF",
    description: "Crea ramos de flores tejidas que duran para siempre.",
  },
];

export function getFeaturedProducts() {
  return products.filter((p) => p.featured);
}

export function getProductsByCategory(slug: string) {
  if (slug === "todos") return products;
  return products.filter((p) => p.category === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}
