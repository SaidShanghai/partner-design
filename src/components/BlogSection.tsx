import blogKeqiao from "@/assets/blog-sourcing-keqiao.jpg";
import blogLogistics from "@/assets/blog-logistics-china.jpg";
import blogShipping from "@/assets/blog-shipping-europe.jpg";
import T from "@/components/T";

const posts = [
  {
    image: blogKeqiao,
    title: "Sourcer du tissu directement depuis Keqiao : ce qu'il faut savoir",
    excerpt:
      "Keqiao est le plus grand marché textile au monde. Voici comment s'y approvisionner efficacement sans intermédiaire, avec un partenaire de confiance sur place.",
  },
  {
    image: blogLogistics,
    title: "Pourquoi les distributeurs européens s'approvisionnent directement en Chine",
    excerpt:
      "Délais maîtrisés, qualité constante, interlocuteur unique : les avantages concrets d'un sourcing direct sans intermédiaire pour votre activité.",
  },
  {
    image: blogShipping,
    title: "Expédition textile Chine → Europe : choisir le bon mode selon votre volume",
    excerpt:
      "Express, fret aérien ou maritime : guide pratique pour optimiser vos coûts logistiques selon la taille de vos commandes.",
  },
];

const BlogSection = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-logo text-3xl md:text-4xl text-foreground">
            <T>Ressources & Marché</T>
          </h3>
          <div className="flex gap-3">
            <a href="/blog" className="text-sm text-foreground hover:text-primary transition-colors">
              <T>Voir toutes les ressources</T>
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <div key={i} className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" width={1280} height={720} />
              <div className="p-5">
                <h4 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                  <T>{post.title}</T>
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  <T>{post.excerpt}</T>
                </p>
                <a href="/blog" className="text-xs font-semibold text-primary hover:underline">
                  <T>Lire l'article</T> →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
