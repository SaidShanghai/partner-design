import { Link } from "react-router-dom";
import T from "@/components/T";

const TopInfoBar = () => {
  return (
    <div className="bg-zinc-900 text-white text-xs tracking-wide py-2 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-0 text-center">
        <span><T>Prix usine direct de Keqiao, Chine</T></span>
        <span aria-hidden="true" className="hidden sm:inline mx-3">·</span>
        <span><T>DHL Express 5-7 jours</T></span>
        <span aria-hidden="true" className="hidden sm:inline mx-3">·</span>
        <span><T>TVA et facture incluses</T></span>
        <span aria-hidden="true" className="hidden sm:inline mx-3">·</span>
        <Link to="/notre-modele" className="hover:underline">
          <T>Comment ça marche</T> →
        </Link>
      </div>
    </div>
  );
};

export default TopInfoBar;
