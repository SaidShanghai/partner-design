import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import T from "@/components/T";
import blogKeqiao from "@/assets/blog-sourcing-keqiao.jpg";
import blogLogistics from "@/assets/blog-logistics-china.jpg";
import blogShipping from "@/assets/blog-shipping-europe.jpg";

const posts = [
  {
    image: blogKeqiao,
    title: "Sourcer du tissu directement depuis Keqiao : ce qu'il faut savoir",
    excerpt:
      "Keqiao est le plus grand marché textile au monde. Voici comment s'y approvisionner efficacement sans intermédiaire, avec un partenaire de confiance sur place.",
    date: "12 avril 2026",
  },
  {
    image: blogLogistics,
    title: "Pourquoi les distributeurs européens s'approvisionnent directement en Chine",
    excerpt:
      "Délais maîtrisés, qualité constante, interlocuteur unique : les avantages concrets d'un sourcing direct sans intermédiaire pour votre activité.",
    date: "5 avril 2026",
  },
  {
    image: blogShipping,
    title: "Expédition textile Chine → Europe : choisir le bon mode selon votre volume",
    excerpt:
      "Express, fret aérien ou maritime : guide pratique pour optimiser vos coûts logistiques selon la taille de vos commandes.",
    date: "28 mars 2026",
  },
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <h1 className="font-logo text-4xl md:text-5xl text-foreground mb-8">
            <T>Ressources & Marché</T>
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, i) => (
              <article
                key={i}
                className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                />
                <div className="p-6">
                  <span className="text-xs text-muted-foreground mb-2 block">
                    {post.date}
                  </span>
                  <h2 className="font-semibold text-foreground text-base mb-2 line-clamp-2">
                    <T>{post.title}</T>
                  </h2>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    <T>{post.excerpt}</T>
                  </p>
                  <a
                    href="#"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    <T>Lire l'article</T> →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default Blog;
