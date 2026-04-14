import { Link, useParams } from "react-router-dom";
import AnnouncementBar from "@/components/AnnouncementBar";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import T from "@/components/T";
import { getBlogPostBySlug } from "@/data/blogPosts";

const BlogArticle = () => {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AnnouncementBar />
        <SiteHeader />
        <main className="flex-1 container mx-auto px-4 py-12">
          <h1 className="text-3xl font-semibold text-foreground mb-4">Article introuvable</h1>
          <Link to="/blog" className="text-primary hover:underline">Retour au blog</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AnnouncementBar />
      <SiteHeader />

      <main className="flex-1">
        <article className="container mx-auto px-4 py-10 max-w-4xl">
          <Link to="/blog" className="text-sm text-primary hover:underline inline-block mb-6">
            ← <T>Retour aux ressources</T>
          </Link>

          <span className="text-sm text-muted-foreground block mb-3">{post.date}</span>
          <h1 className="text-3xl md:text-5xl font-semibold text-foreground mb-6">
            <T>{post.title}</T>
          </h1>

          <img
            src={post.image}
            alt={post.title}
            className="w-full rounded-xl object-cover mb-8 border border-border"
            width={1280}
            height={720}
          />

          <div className="space-y-5 text-base leading-7 text-muted-foreground">
            {post.content.map((paragraph, index) => (
              <p key={index}>
                <T>{paragraph}</T>
              </p>
            ))}
          </div>

          {/* CTA B2B */}
          <div className="mt-12 rounded-xl bg-primary/5 border border-primary/20 p-8 md:p-10 text-center">
            <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-3">
              <T>Prêt à sourcer directement depuis la Chine ?</T>
            </h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              <T>Contactez notre équipe pour un devis personnalisé selon vos volumes et vos besoins textile.</T>
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
            >
              <T>Demander un devis</T> →
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
};

export default BlogArticle;
