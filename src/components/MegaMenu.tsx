import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { toSlug } from "@/data/categories";
import T from "@/components/T";

export interface MegaMenuColumn {
  title: string;
  items: string[];
}

export interface MegaMenuImage {
  src: string;
  alt: string;
  label: string;
}

export interface MegaMenuButton {
  label: string;
}

export interface MegaMenuData {
  buttons?: MegaMenuButton[];
  columns: MegaMenuColumn[];
  images: MegaMenuImage[];
}

interface MegaMenuProps {
  data: MegaMenuData;
  onClose?: () => void;
}

const MegaMenu = ({ data, onClose }: MegaMenuProps) => {
  return (
    <div className="absolute left-0 right-0 top-full w-full bg-background border-t border-border shadow-xl z-50 max-h-[80vh] overflow-y-auto">
      <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col lg:flex-row gap-6">
        {/* Left column: Voir tout + buttons */}
        <div className="flex flex-row lg:flex-col gap-3 shrink-0 lg:w-[180px] flex-wrap">
          <a href="#" className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition-colors">
            <T>Voir tout</T> <ArrowUpRight className="w-4 h-4" />
          </a>
          {data.buttons?.map((btn) => (
            <a
              key={btn.label}
              href="#"
              className="block px-4 py-2.5 text-sm bg-accent/60 text-foreground rounded-lg hover:bg-accent transition-colors"
            >
              <T>{btn.label}</T>
            </a>
          ))}
        </div>

        {/* Middle columns */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 md:gap-6 flex-1 min-w-0">
          {data.columns.map((col) => (
            <div key={col.title}>
              <span className="block text-sm font-bold text-foreground mb-3">
                <T>{col.title}</T>
              </span>
              <ul className="space-y-1.5">
                {col.items.map((item) => (
                  <li key={item}>
                    <Link
                      to={`/categorie/${toSlug(item)}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={onClose}
                    >
                      <T>{item}</T>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Right images — hidden on mobile */}
        <div className="hidden lg:flex gap-3 shrink-0 w-[280px] h-[280px]">
          {data.images.map((img) => (
            <div key={img.label} className="relative rounded-lg overflow-hidden flex-1">
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
              <span className="absolute bottom-3 left-3 bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
                <T>{img.label}</T>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
