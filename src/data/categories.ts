export type CategoryColor = "rose" | "sage" | "lavender";

export interface Category {
  slug: string;
  name: string;
  description: string;
  color: CategoryColor;
  icon: "amigurumi" | "pattern" | "notebook";
}

export const categories: Category[] = [
  {
    slug: "amigurumis",
    name: "Amigurumis",
    description:
      "Personajes tejidos a crochet, suaves y abrazables. Cada uno con su personalidad.",
    color: "rose",
    icon: "amigurumi",
  },
  {
    slug: "patrones",
    name: "Patrones",
    description:
      "Instrucciones paso a paso en PDF para que tú también puedas crear tus propios amigurumis.",
    color: "sage",
    icon: "pattern",
  },
  {
    slug: "agendas",
    name: "Agendas",
    description:
      "Agendas y libretas personalizadas, decoradas a mano. Tu nombre, tus colores, tu estilo.",
    color: "lavender",
    icon: "notebook",
  },
];

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}
