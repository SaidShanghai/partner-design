import ProductCard from "./ProductCard";
import T from "@/components/T";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";
import product7 from "@/assets/product-7.jpg";

const products = [
  { image: product1, name: "Coton Fleuri Multicolore Fond Crème", price: "7,90 €" },
  { image: product2, name: "Tissu Matelassé Talullah Noir et Or", price: "18,90 €" },
  { image: product3, name: "Tissu Coton Motif Fleuri Bleu & Orange", price: "7,90 €" },
  { image: product4, name: "Popeline Imprimée Ethnique Fond Lin", price: "8,90 €" },
  { image: product5, name: "Viscose Imprimée Savane Fond Camel", price: "8,90 €" },
  { image: product6, name: "Popeline Vintage Roses Fond Crème", price: "9,30 €", variants: 4 },
  { image: product7, name: "Double Gaze Unie Rose Poudré", price: "6,50 €", variants: 12 },
  { image: product1, name: "Coton Imprimé Bohème Terracotta", price: "8,50 €" },
];

const ProductSection = () => {
  return (
    <section className="container mx-auto px-4 py-12">
      <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-2">
        <T>Tissus et mercerie : découvrez nos nouveautés</T>
      </h2>

      <div className="flex items-center gap-6 mb-8 mt-8">
        <h3 className="font-logo text-3xl md:text-4xl text-foreground whitespace-nowrap">
          <T>Nos dernières pépites tissus</T>
        </h3>
        <a
          href="#"
          className="text-sm text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <T>Explorez nos nouveaux tissus</T> ✨ 😍 <span className="text-xs">↗</span>
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((product, i) => (
          <ProductCard key={i} {...product} />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
