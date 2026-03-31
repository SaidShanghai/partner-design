import { Heart } from "lucide-react";

interface Badge {
  label: string;
  color: "red" | "green" | "pink";
}

interface CouponCardProps {
  image: string;
  name: string;
  originalPrice: string;
  salePrice: string;
  discount: string;
  badges?: Badge[];
  variants?: string;
}

const badgeColors = {
  red: "bg-primary text-primary-foreground",
  green: "bg-emerald-500 text-white",
  pink: "bg-pink-400 text-white",
};

const CouponCard = ({
  image,
  name,
  originalPrice,
  salePrice,
  discount,
  badges = [],
  variants,
}: CouponCardProps) => {
  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-sm">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1">
          <span className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            {discount}
          </span>
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${badgeColors[badge.color]}`}
            >
              {badge.label}
            </span>
          ))}
        </div>

        <button
          className="absolute top-3 right-3 z-10 text-foreground/60 hover:text-primary transition-colors"
          aria-label="Ajouter aux favoris"
        >
          <Heart className="w-5 h-5" />
        </button>

        {/* Price tag */}
        <span className="absolute bottom-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-sm">
          {salePrice}
        </span>

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
        <div className="mt-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground line-through">{originalPrice}</span>
          <span className="text-sm font-bold text-primary">{salePrice}</span>
        </div>
        {variants && (
          <p className="mt-0.5 text-xs text-muted-foreground">{variants}</p>
        )}
      </div>
    </div>
  );
};

export default CouponCard;
