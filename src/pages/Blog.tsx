import { Link } from "react-router-dom";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import AnnouncementBar from "@/components/AnnouncementBar";
import T from "@/components/T";
import { blogPosts } from "@/data/blogPosts";

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
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-background rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border"
              >
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-56 object-cover"
                  loading="lazy"
                  width={1280}
                  height={720}
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
                  <Link
                    to={`/blog/${post.slug}`}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    <T>Lire l'article</T> →
                  </Link>
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
