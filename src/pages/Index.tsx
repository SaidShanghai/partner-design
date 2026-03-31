import AnnouncementBar from "@/components/AnnouncementBar";
import SiteHeader from "@/components/SiteHeader";
import HeroBanner from "@/components/HeroBanner";
import ProductSection from "@/components/ProductSection";
import BlogSection from "@/components/BlogSection";
import StoreSection from "@/components/StoreSection";
import SiteFooter from "@/components/SiteFooter";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBar />
      <SiteHeader />
      <HeroBanner />
      <ProductSection />
      <BlogSection />
      <StoreSection />
      <SiteFooter />
    </div>
  );
};

export default Index;
