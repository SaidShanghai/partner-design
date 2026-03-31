import { Heart } from "lucide-react";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  isNew?: boolean;
  variants?: number;
}

const ProductCard = ({ image, name, price, isNew = true, variants }: ProductCardProps) => {
  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-sm">
        {isNew && (
          <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-sm">
            Nouveauté
          </span>
        )}
        <button
          className="absolute top-3 right-3 z-10 text-foreground/60 hover:text-primary transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-5 h-5" />
        </button>
        <img
          src={image}
          alt={name}
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          width={640}
          height={640}
        />
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">
          {name}
        </h3>
        <p className="mt-1 text-sm font-semibold text-foreground">{price}</p>
        {variants && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {variants} teintes
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
