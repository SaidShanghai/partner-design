import heroImage from "@/assets/hero-fabrics.jpg";
import { Heart } from "lucide-react";

const HeroBanner = () => {
  return (
    <section className="relative w-full h-[500px] md:h-[550px] overflow-hidden">
      <img
        src={heroImage}
        alt="Collection de tissus Textile Partner"
        className="w-full h-full object-cover"
        width={1920}
        height={800}
      />
      <div className="absolute inset-0 bg-foreground/30 flex flex-col items-center justify-center text-center px-4">
        <p className="text-primary-foreground text-sm md:text-base tracking-[0.3em] uppercase mb-3">
          Déco Maison
        </p>
        <h1 className="text-primary-foreground text-4xl md:text-6xl font-bold tracking-wider uppercase mb-8">
          Toile de Coton
        </h1>

        <a
          href="#"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full text-sm font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2 mb-10"
        >
          C'est le printemps ! 🧹
          <span className="text-xs">↗</span>
        </a>

        <Heart className="w-8 h-8 text-primary-foreground fill-primary-foreground mb-3" />
        <p className="text-primary-foreground text-sm md:text-base tracking-[0.25em] uppercase leading-relaxed">
          Nappes, Tabliers,
          <br />
          Serviettes, Accessoires
        </p>
      </div>
    </section>
  );
};

export default HeroBanner;
