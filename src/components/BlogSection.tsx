import blog1 from "@/assets/blog-1.jpg";
import blog2 from "@/assets/blog-2.jpg";
import blog3 from "@/assets/blog-3.jpg";

const posts = [
  {
    image: blog1,
    title: "Tuto couture galette de chaise déhoussable",
    excerpt: "Tuto couture galette de chaise avec le pas-à-pas détaillé et le patron PDF gratuit à télécharger",
  },
  {
    image: blog2,
    title: "Tuto couture gratuit nœud papillon",
    excerpt: "Découvrez notre tuto couture de nœud papillon avec patron PDF gratuit, idéal pour vos cérémonies",
  },
  {
    image: blog3,
    title: "Défi couture du mois",
    excerpt: "Challenge couture Land of Fabrics : Cousez un sac demi-lune et tentez de gagner de jolis cadeaux 🎁", : Cousez un sac demi-lune et tentez de gagner de jolis cadeaux 🎁",
  },
];

const BlogSection = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-logo text-3xl md:text-4xl text-foreground">
            Notre blog couture
          </h3>
          <div className="flex gap-3">
            <a href="#" className="text-sm text-foreground hover:text-primary transition-colors">
              Découvrir toutes nos actualités
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, i) => (
            <div key={i} className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover"
                loading="lazy"
                width={640}
                height={512}
              />
              <div className="p-5">
                <h4 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                  {post.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  {post.excerpt}
                </p>
                <a
                  href="#"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Découvrir →
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
