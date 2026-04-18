import T from "@/components/T";
import TopInfoBar from "@/components/TopInfoBar";

const AnnouncementBar = () => {
  return (
    <>
      <TopInfoBar />
      <div className="bg-primary text-primary-foreground text-center py-2.5 text-sm font-medium tracking-wide">
        <T>Popeline de coton : la valeur sûre pour tous vos projets couture</T> ✨
      </div>
    </>
  );
};

export default AnnouncementBar;
