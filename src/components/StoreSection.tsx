import storeImg from "@/assets/store.jpg";

const StoreSection = () => {
  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="rounded-lg overflow-hidden">
          <img
            src={storeImg}
            alt="Nos boutiques de tissus"
            className="w-full h-80 md:h-96 object-cover"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Des magasins de tissus uniques au style affirmé
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Pour tous vos projets couture et décoration, Land of Fabrics vous propose des milliers de mètres de tissus. Nous vous proposons des tissus en fonction de leur adéquation à vos projets et disponibles au meilleur rapport qualité / prix. Nos tissus d'ameublement, tissus habillement sont en stock dans nos locaux. des milliers de mètres de tissus. Nous vous proposons des tissus en fonction de leur adéquation à vos projets et disponibles au meilleur rapport qualité / prix. Nos tissus d'ameublement, tissus habillement sont en stock dans nos locaux.
          </p>
          <div className="flex gap-4">
            <a
              href="#"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Nos magasins
            </a>
            <a
              href="#"
              className="border border-foreground text-foreground px-6 py-2.5 rounded-full text-sm font-medium hover:bg-foreground hover:text-background transition-colors"
            >
              Qui sommes-nous ?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreSection;
