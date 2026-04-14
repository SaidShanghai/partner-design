import { Link } from "react-router-dom";
import T from "@/components/T";
import { blogPosts } from "@/data/blogPosts";

const BlogSection = () => {
  return (
    <section className="bg-secondary py-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-logo text-3xl md:text-4xl text-foreground">
            <T>Ressources & Marché</T>
          </h3>
          <div className="flex gap-3">
            <Link to="/blog" className="text-sm text-foreground hover:text-primary transition-colors">
              <T>Voir toutes les ressources</T>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <div key={post.slug} className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" loading="lazy" width={1280} height={720} />
              <div className="p-5">
                <h4 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">
                  <T>{post.title}</T>
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-3">
                  <T>{post.excerpt}</T>
                </p>
                <Link to={`/blog/${post.slug}`} className="text-xs font-semibold text-primary hover:underline">
                  <T>Lire l'article</T> →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
