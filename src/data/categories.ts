// Category data for all sub-categories
// Each category has products, SEO description, and breadcrumb info

export interface CategoryProduct {
  image: string;
  name: string;
  price: string;
  unit?: string;
  variants?: string;
  badge?: string;
}

export interface CategorySeoBlock {
  title: string;
  paragraphs: string[];
}

export interface CategoryData {
  slug: string;
  name: string;
  parentName: string;
  parentSlug?: string;
  shortDescription: string;
  products: CategoryProduct[];
  seo: CategorySeoBlock;
  filters?: string[];
}

// Helper to generate a slug from a menu item name
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Import images - we'll use dynamic imports via the component
// For now, define data referencing asset paths

export const categoriesData: Record<string, CategoryData> = {
  chambray: {
    slug: "chambray",
    name: "Chambray",
    parentName: "Tissu Habillement",
    shortDescription:
      "Pour des tops, robes et chemisiers classiquement élégants, vous aimerez le chambray de coton ou chambray tencel. Faussement uni (il est tissé avec un fil de chaîne et de trame de couleurs différentes), il offre une couleur subtile au rendu impeccable.",
    filters: ["COULEUR", "MOTIF", "TAILLE MOTIF", "PLUS DE FILTRES"],
    products: [
      {
        image: "cat-chambray-uni",
        name: "Tissu Chambray Uni Bleu Jean",
        price: "11,85 €",
        unit: "le mètre",
      },
      {
        image: "cat-chambray-brode-floral",
        name: "Tissu Denim Chambray Brodé Floral Caramel",
        price: "18,50 €",
        unit: "le mètre",
        variants: "2 teintes",
      },
      {
        image: "cat-chambray-cerises",
        name: "Chambray de Coton Cerises Brodées Indigo",
        price: "17,50 €",
        unit: "le mètre",
      },
      {
        image: "cat-chambray-bouche",
        name: "Tissu Chambray Bouche",
        price: "15,90 €",
        unit: "le mètre",
        badge: "Oeko-Tex Standard 100",
      },
      {
        image: "cat-chambray-coeurs",
        name: "Tissu Chambray Bleu Jean Cœurs Brodés",
        price: "15,90 €",
        unit: "le mètre",
      },
      {
        image: "cat-chambray-lin",
        name: "Tissu Chambray Lin Coton Bleu Jean Oeko-Tex",
        price: "14,90 €",
        unit: "le mètre",
        badge: "Oeko-Tex",
      },
    ],
    seo: {
      title: "Tissu Chambray : Légèreté et Élégance pour Vos Créations",
      paragraphs: [
        "Le tissu chambray est un incontournable pour celles et ceux qui recherchent un textile léger, respirant et élégant. Son aspect légèrement texturé, souvent confondu avec le denim, lui confère un style à la fois décontracté et raffiné. Idéal pour la confection de chemises, robes, jupes ou encore d'accessoires, le chambray est apprécié pour son confort et sa polyvalence.",
        "Pour une finition soignée et une touche de modernité, pensez à associer votre chambray avec du <a href='/categorie/bord-cote' class='text-primary hover:underline'>bord-côte</a>. Ce tissu extensible est parfait pour ajouter des poignets, des cols ou des ceintures élastiques, notamment sur des vestes légères en chambray ou des pulls casuals.",
        "Si vous souhaitez ajouter une note romantique à votre projet, la <a href='/categorie/broderie-anglaise' class='text-primary hover:underline'>broderie anglaise</a> est un excellent choix. Son design ajouré et délicat contraste élégamment avec le chambray, que ce soit pour agrémenter des empiècements, des volants ou des bordures de robes et de chemisiers.",
        "Enfin, pour des créations alliant douceur et praticité, le mélange du chambray avec de l'<a href='/categorie/eponge' class='text-primary hover:underline'>éponge coton</a> peut être une option originale. Idéal pour des accessoires comme des lingettes lavables, des tabliers ou des vêtements pour enfants, cette combinaison garantit confort et fonctionnalité.",
        "Facile à coudre, le <strong>tissu chambray de coton</strong> est souple, résistant, et très agréable à porter.",
        "Le chambray type denim est fin, très souple, parfois fluide, très facile à porter, avec un très joli tombé. Il est très seyant en robe, jupe, maxi-jupe, ou tops amples.",
        "Découvrez notre gamme de tissus chambray et laissez libre cours à votre créativité pour des projets à la fois légers, élégants et agréables à porter.",
      ],
    },
  },
  "broderie-anglaise": {
    slug: "broderie-anglaise",
    name: "Broderie Anglaise",
    parentName: "Tissu Habillement",
    shortDescription:
      "Tissu délicat et ajouré, la broderie anglaise apporte une touche romantique et féminine à vos créations. Parfaite pour des robes, blouses et accessoires raffinés.",
    filters: ["COULEUR", "MOTIF", "LAIZE", "PLUS DE FILTRES"],
    products: [
      {
        image: "cat-broderie-blanche",
        name: "Broderie Anglaise Coton Blanc Festonnée",
        price: "14,90 €",
        unit: "le mètre",
        badge: "Oeko-Tex Standard 100",
      },
      {
        image: "cat-broderie-ecru",
        name: "Broderie Anglaise Coton Écru Motif Floral",
        price: "13,50 €",
        unit: "le mètre",
        variants: "3 teintes",
      },
      {
        image: "cat-broderie-rose",
        name: "Broderie Anglaise Rose Poudré Fleurs Délicates",
        price: "15,90 €",
        unit: "le mètre",
      },
      {
        image: "cat-broderie-marine",
        name: "Broderie Anglaise Coton Bleu Marine",
        price: "14,90 €",
        unit: "le mètre",
        variants: "2 teintes",
      },
      {
        image: "cat-broderie-noire",
        name: "Broderie Anglaise Noire Bordure Festonnée",
        price: "16,50 €",
        unit: "le mètre",
      },
      {
        image: "cat-broderie-lavande",
        name: "Broderie Anglaise Lavande Coton Oeko-Tex",
        price: "14,90 €",
        unit: "le mètre",
        badge: "Oeko-Tex",
      },
      {
        image: "cat-broderie-ciel",
        name: "Broderie Anglaise Bleu Ciel Petites Fleurs",
        price: "13,90 €",
        unit: "le mètre",
      },
    ],
    seo: {
      title: "Broderie Anglaise : Délicatesse et Romantisme",
      paragraphs: [
        "La broderie anglaise est un tissu ajouré orné de motifs brodés, généralement floraux, qui apporte une touche de raffinement à toutes vos créations couture.",
        "Idéale pour confectionner des blouses, robes d'été, jupes et accessoires, elle se prête aussi bien aux tenues casual qu'aux pièces plus habillées.",
      ],
    },
  },
  "bord-cote": {
    slug: "bord-cote",
    name: "Bord-côte",
    parentName: "Tissu Habillement",
    shortDescription:
      "Le bord-côte est un tissu extensible tricoté, idéal pour les finitions de vêtements : poignets, cols, ceintures et bas de vêtements.",
    filters: ["COULEUR", "COMPOSITION", "PLUS DE FILTRES"],
    products: [
      { image: "cat-chambray-uni", name: "Bord-côte Tubulaire Coton Bio Noir", price: "8,90 €", unit: "le mètre", badge: "Oeko-Tex Standard 100" },
      { image: "cat-chambray-lin", name: "Bord-côte Côtelé Gris Chiné", price: "7,50 €", unit: "le mètre", variants: "8 coloris" },
      { image: "cat-broderie-ecru", name: "Bord-côte Lurex Doré Fond Écru", price: "10,90 €", unit: "le mètre" },
      { image: "cat-broderie-rose", name: "Bord-côte Uni Rose Dragée", price: "7,50 €", unit: "le mètre" },
      { image: "cat-chambray-brode-floral", name: "Bord-côte Rayé Marine et Blanc", price: "9,50 €", unit: "le mètre", variants: "3 coloris" },
      { image: "cat-broderie-marine", name: "Bord-côte Tubulaire Bleu Canard", price: "7,50 €", unit: "le mètre" },
    ],
    seo: {
      title: "Bord-côte : Finitions Parfaites pour Vos Vêtements",
      paragraphs: [
        "Le bord-côte est un incontournable de la couture pour des finitions impeccables. Tricoté en côtes, il offre une élasticité naturelle parfaite pour les poignets, cols et ceintures.",
      ],
    },
  },
  coton: {
    slug: "coton",
    name: "Coton",
    parentName: "Tissu Habillement",
    shortDescription:
      "Le tissu coton est la matière la plus utilisée en couture. Naturel, respirant et facile à coudre, il convient à tous les projets.",
    filters: ["COULEUR", "MOTIF", "GRAMMAGE", "PLUS DE FILTRES"],
    products: [
      { image: "cat-chambray-uni", name: "Popeline de Coton Unie Blanc Optique", price: "7,90 €", unit: "le mètre", variants: "24 coloris", badge: "Oeko-Tex" },
      { image: "cat-broderie-ecru", name: "Coton Imprimé Petites Fleurs Fond Écru", price: "9,50 €", unit: "le mètre" },
      { image: "cat-chambray-cerises", name: "Cretonne Coton Cerises Rouge", price: "8,90 €", unit: "le mètre" },
      { image: "cat-broderie-rose", name: "Coton Plumetis Rose Tendre", price: "10,50 €", unit: "le mètre", variants: "6 coloris" },
      { image: "cat-chambray-brode-floral", name: "Popeline Coton Motif Cachemire Terracotta", price: "9,90 €", unit: "le mètre" },
      { image: "cat-broderie-marine", name: "Tissu Coton Uni Marine Épais", price: "8,50 €", unit: "le mètre", variants: "18 coloris" },
      { image: "cat-chambray-lin", name: "Coton Bio Sergé Naturel", price: "11,90 €", unit: "le mètre", badge: "GOTS Certifié" },
    ],
    seo: {
      title: "Tissu Coton : Le Classique Indémodable",
      paragraphs: [
        "Le coton est la fibre textile la plus populaire au monde. Naturel, doux et respirant, il se décline en une multitude de poids et de finitions pour s'adapter à tous vos projets couture.",
      ],
    },
  },
  "double-gaze": {
    slug: "double-gaze",
    name: "Double Gaze",
    parentName: "Tissu Habillement",
    shortDescription:
      "La double gaze est un tissu léger et aérien composé de deux couches de gaze assemblées. Douce au toucher, elle est parfaite pour les vêtements d'été et la layette.",
    filters: ["COULEUR", "MOTIF", "PLUS DE FILTRES"],
    products: [
      { image: "cat-broderie-blanche", name: "Double Gaze Coton Blanc Cassé", price: "9,90 €", unit: "le mètre", variants: "15 coloris", badge: "Oeko-Tex" },
      { image: "cat-broderie-rose", name: "Double Gaze Unie Rose Poudré", price: "9,90 €", unit: "le mètre" },
      { image: "cat-chambray-cerises", name: "Double Gaze Imprimée Cerises Fond Crème", price: "11,50 €", unit: "le mètre" },
      { image: "cat-broderie-lavande", name: "Double Gaze Plumetis Doré Fond Lilas", price: "12,50 €", unit: "le mètre" },
      { image: "cat-chambray-uni", name: "Double Gaze Unie Vert Sauge", price: "9,90 €", unit: "le mètre", variants: "15 coloris" },
      { image: "cat-broderie-ecru", name: "Double Gaze Bio Imprimée Feuillages Naturel", price: "12,90 €", unit: "le mètre", badge: "GOTS" },
      { image: "cat-broderie-marine", name: "Double Gaze Unie Bleu Orage", price: "9,90 €", unit: "le mètre" },
    ],
    seo: {
      title: "Double Gaze : Douceur et Légèreté",
      paragraphs: [
        "La double gaze de coton est le tissu tendance par excellence. Sa texture froissée naturelle et sa douceur incomparable en font un choix idéal pour robes, blouses, langes et vêtements bébé.",
      ],
    },
  },
  jersey: {
    slug: "jersey",
    name: "Jersey",
    parentName: "Tissu Habillement",
    shortDescription:
      "Le jersey est un tissu tricoté extensible et confortable, idéal pour les t-shirts, robes et vêtements du quotidien.",
    filters: ["COULEUR", "MOTIF", "COMPOSITION", "PLUS DE FILTRES"],
    products: [
      { image: "cat-chambray-uni", name: "Jersey Coton Uni Noir Premium", price: "9,90 €", unit: "le mètre", variants: "22 coloris", badge: "Oeko-Tex" },
      { image: "cat-broderie-ecru", name: "Jersey Viscose Chiné Écru", price: "11,50 €", unit: "le mètre" },
      { image: "cat-broderie-rose", name: "Jersey Coton Bio Imprimé Fleurs des Champs Rose", price: "13,90 €", unit: "le mètre" },
      { image: "cat-chambray-brode-floral", name: "Jersey Milano Uni Camel", price: "14,50 €", unit: "le mètre", variants: "8 coloris" },
      { image: "cat-chambray-cerises", name: "Jersey Imprimé Léopard Fond Terracotta", price: "12,90 €", unit: "le mètre" },
      { image: "cat-broderie-marine", name: "Jersey Maille Polo Bleu Marine", price: "12,50 €", unit: "le mètre" },
    ],
    seo: {
      title: "Tissu Jersey : Confort et Extensibilité",
      paragraphs: [
        "Le jersey est un tissu maille extensible, doux et confortable. Indispensable pour la confection de t-shirts, robes, leggings et sous-vêtements, il se décline en coton, viscose ou polyester.",
      ],
    },
  },
  viscose: {
    slug: "viscose",
    name: "Viscose",
    parentName: "Tissu Habillement",
    shortDescription:
      "La viscose est une fibre artificielle au tombé fluide et soyeux. Légère et agréable à porter, elle est parfaite pour les vêtements d'été.",
    filters: ["COULEUR", "MOTIF", "PLUS DE FILTRES"],
    products: [
      { image: "cat-broderie-ecru", name: "Viscose Fluide Unie Écru Naturel", price: "9,50 €", unit: "le mètre", variants: "16 coloris" },
      { image: "cat-chambray-brode-floral", name: "Viscose Imprimée Bouquets Champêtres Ocre", price: "12,95 €", unit: "le mètre" },
      { image: "cat-broderie-rose", name: "Viscose Crêpée Unie Rose Ballerine", price: "10,50 €", unit: "le mètre", variants: "12 coloris" },
      { image: "cat-chambray-cerises", name: "Viscose Imprimée Feuilles Tropicales Vert", price: "12,95 €", unit: "le mètre" },
      { image: "cat-broderie-marine", name: "Viscose Twill Unie Bleu Nuit", price: "11,50 €", unit: "le mètre" },
      { image: "cat-chambray-uni", name: "Viscose Satinée Imprimée Chaînes Dorées Noir", price: "13,90 €", unit: "le mètre" },
      { image: "cat-broderie-lavande", name: "Viscose Lin Mélangée Rayures Lavande", price: "12,50 €", unit: "le mètre" },
    ],
    seo: {
      title: "Tissu Viscose : Fluidité et Élégance",
      paragraphs: [
        "La viscose offre un tombé fluide et un toucher soyeux qui en font un tissu de choix pour les robes, jupes et blouses. Respirante et légère, elle est idéale pour les beaux jours.",
      ],
    },
  },
  lin: {
    slug: "lin",
    name: "Lin",
    parentName: "Tissu Habillement",
    shortDescription:
      "Le lin est une fibre naturelle noble, thermorégulatrice et écologique. Son froissé naturel lui donne un charme authentique. Idéal pour robes, pantalons, tops et chemises d'été.",
    filters: ["COULEUR", "GRAMMAGE", "COMPOSITION", "PLUS DE FILTRES"],
    products: [
      { image: "cat-broderie-blanche", name: "Lin Lavé Uni Blanc Naturel", price: "14,90 €", unit: "le mètre", variants: "20 coloris", badge: "Oeko-Tex Standard 100" },
      { image: "cat-broderie-ecru", name: "Lin Coton Mélangé Uni Écru", price: "11,90 €", unit: "le mètre", variants: "14 coloris" },
      { image: "cat-chambray-uni", name: "Lin Lavé Uni Bleu Cobalt", price: "14,90 €", unit: "le mètre" },
      { image: "cat-broderie-rose", name: "Lin Viscose Imprimé Floral Rose Ancien", price: "12,95 €", unit: "le mètre" },
      { image: "cat-chambray-brode-floral", name: "Lin Lavé Uni Terracotta", price: "14,90 €", unit: "le mètre", variants: "20 coloris" },
      { image: "cat-chambray-cerises", name: "Lin Imprimé Rayures Fines Marine et Écru", price: "13,50 €", unit: "le mètre" },
      { image: "cat-broderie-marine", name: "Lin Pur Uni Bleu Marine Épais", price: "16,50 €", unit: "le mètre", badge: "100% Lin" },
      { image: "cat-broderie-lavande", name: "Lin Viscose Uni Lilas Pastel", price: "12,50 €", unit: "le mètre", variants: "10 coloris" },
      { image: "cat-chambray-lin", name: "Lin Coton Bio Uni Vert Sauge", price: "13,90 €", unit: "le mètre", badge: "GOTS" },
      { image: "cat-broderie-noire", name: "Lin Lavé Uni Noir Profond", price: "14,90 €", unit: "le mètre" },
    ],
    seo: {
      title: "Tissu Lin : Naturel et Authentique",
      paragraphs: [
        "Le lin est l'une des fibres les plus anciennes et les plus nobles. Thermorégulateur, il garde au frais en été et au chaud en hiver. Son aspect froissé naturel lui confère un style décontracté et élégant.",
        "Idéal pour confectionner des robes, pantalons, chemises et tops d'été, le <strong>tissu lin</strong> se décline en pur lin, lin lavé ou mélanges lin-viscose et lin-coton pour plus de souplesse.",
        "Retrouvez également nos <a href='/categorie/viscose' class='text-primary hover:underline'>viscoses</a> et <a href='/categorie/coton' class='text-primary hover:underline'>cotons</a> pour varier les textures dans vos projets couture.",
      ],
    },
  },
  satin: {
    slug: "satin",
    name: "Satin",
    parentName: "Tissu Habillement",
    shortDescription:
      "Le satin est un tissu au fini brillant et luxueux, parfait pour les créations habillées, la lingerie et les doublures.",
    filters: ["COULEUR", "COMPOSITION", "PLUS DE FILTRES"],
    products: [
      { image: "cat-broderie-blanche", name: "Satin Duchesse Uni Ivoire", price: "12,90 €", unit: "le mètre", variants: "15 coloris" },
      { image: "cat-broderie-noire", name: "Satin de Coton Uni Noir", price: "11,50 €", unit: "le mètre", badge: "Oeko-Tex" },
      { image: "cat-broderie-rose", name: "Satin Crêpe Back Uni Rose Poudré", price: "13,90 €", unit: "le mètre" },
      { image: "cat-broderie-marine", name: "Satin Fluide Uni Bleu Royal", price: "10,90 €", unit: "le mètre", variants: "20 coloris" },
      { image: "cat-chambray-brode-floral", name: "Satin Imprimé Floral Aquarelle Pastel", price: "14,90 €", unit: "le mètre" },
      { image: "cat-broderie-ecru", name: "Satin de Soie Mélangée Champagne", price: "18,90 €", unit: "le mètre" },
    ],
    seo: {
      title: "Tissu Satin : Brillance et Luxe",
      paragraphs: [
        "Le satin se distingue par son aspect lisse et brillant sur l'endroit. Utilisé pour les robes de soirée, la lingerie, les doublures et les accessoires, il apporte une touche de luxe à toutes vos créations.",
      ],
    },
  },
};

// Build a lookup from menu item name -> slug
export const menuItemToSlug: Record<string, string> = {};
Object.values(categoriesData).forEach((cat) => {
  menuItemToSlug[cat.name] = cat.slug;
});
