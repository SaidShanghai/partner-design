import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import T from "@/components/T";
import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

const posts = [
  {
    image: blog1,
    title: "Tuto couture galette de chaise déhoussable",
    excerpt:
      "Tuto couture galette de chaise avec le pas-à-pas détaillé et le patron PDF gratuit à télécharger",
    date: "12 avril 2026",
  },
  {
    image: blog2,
    title: "Tuto couture gratuit nœud papillon",
    excerpt:
      "Découvrez notre tuto couture de nœud papillon avec patron PDF gratuit, idéal pour vos cérémonies",
    date: "5 avril 2026",
  },
  {
    image: blog3,
    title: "Défi couture du mois",
    excerpt:
      "Challenge couture Textile Partner : Cousez un sac demi-lune et tentez de gagner de jolis cadeaux 🎁",
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
            <T>Notre blog couture</T>
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
