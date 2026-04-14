import blogKeqiao from "@/assets/blog-sourcing-keqiao.jpg";
import blogLogistics from "@/assets/blog-logistics-china.jpg";
import blogShipping from "@/assets/blog-shipping-europe.jpg";

export interface BlogPost {
  slug: string;
  image: string;
  title: string;
  excerpt: string;
  date: string;
  content: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: "sourcer-tissu-keqiao",
    image: blogKeqiao,
    title: "Sourcer du tissu directement depuis Keqiao : ce qu'il faut savoir",
    excerpt:
      "Keqiao est le plus grand marché textile au monde. Voici comment s'y approvisionner efficacement sans intermédiaire, avec un partenaire de confiance sur place.",
    date: "12 avril 2026",
    content: [
      "Keqiao concentre des milliers de fournisseurs, showrooms et usines spécialisées dans tous les segments textiles : habillement, ameublement, maille, jacquards, dentelles ou tissus techniques.",
      "Pour un distributeur européen, acheter directement sur place permet d'accéder à plus de choix, de meilleurs prix et une vision claire des tendances du marché avant qu'elles n'arrivent en Europe.",
      "Mais le vrai enjeu n'est pas seulement de trouver un tissu : c'est de sécuriser la qualité, les minimums de commande, la conformité, les délais et le suivi fournisseur. C'est là qu'un partenaire implanté localement fait la différence.",
      "Avec une présence à Keqiao, vous pouvez sourcer plus vite, comparer plusieurs fournisseurs sérieux et centraliser vos échanges sans multiplier les intermédiaires."
    ]
  },
  {
    slug: "pourquoi-sourcer-directement-en-chine",
    image: blogLogistics,
    title: "Pourquoi les distributeurs européens s'approvisionnent directement en Chine",
    excerpt:
      "Délais maîtrisés, qualité constante, interlocuteur unique : les avantages concrets d'un sourcing direct sans intermédiaire pour votre activité.",
    date: "5 avril 2026",
    content: [
      "Le sourcing direct permet d'améliorer la compétitivité sur plusieurs leviers : prix d'achat, stabilité d'approvisionnement, accès à plus de collections et meilleure réactivité face à la demande du marché.",
      "Contrairement à un schéma avec plusieurs couches d'intermédiaires, vous gardez une meilleure visibilité sur le fournisseur, les conditions de production, les délais et les coûts logistiques réels.",
      "Pour les grossistes, détaillants et distributeurs textile, cela signifie aussi davantage de souplesse pour développer des gammes différenciantes et mieux piloter les marges.",
      "Le bon modèle n'est pas d'acheter seul à distance, mais de combiner accès direct au marché chinois et accompagnement opérationnel fiable sur place."
    ]
  },
  {
    slug: "expedition-textile-chine-europe",
    image: blogShipping,
    title: "Expédition textile Chine → Europe : choisir le bon mode selon votre volume",
    excerpt:
      "Express, fret aérien ou maritime : guide pratique pour optimiser vos coûts logistiques selon la taille de vos commandes.",
    date: "28 mars 2026",
    content: [
      "Le bon mode d'expédition dépend avant tout de votre volume, de la valeur marchande du produit, de vos délais de rotation et de la saisonnalité de vos ventes.",
      "L'express est adapté aux envois urgents et aux échantillons. Le fret aérien convient mieux aux commandes intermédiaires quand le temps est un facteur critique. Le maritime reste la solution la plus compétitive pour les volumes importants.",
      "Au-delà du transport, il faut intégrer les coûts annexes : préparation documentaire, dédouanement, livraison finale, assurance et éventuels contrôles qualité avant départ.",
      "Une stratégie logistique performante consiste souvent à mixer plusieurs modes selon les références, les urgences commerciales et le calendrier d'approvisionnement."
    ]
  }
];

export const getBlogPostBySlug = (slug?: string) =>
  blogPosts.find((post) => post.slug === slug);
