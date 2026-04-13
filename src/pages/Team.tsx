import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogOut, Plus } from "lucide-react";
import TeamProductForm from "@/components/TeamProductForm";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

const Team = () => {
  const { signOut } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [parentName, setParentName] = useState<string | null>(null);
  const [history, setHistory] = useState<{ id: string | null; name: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    const query = parentId
      ? supabase.from("categories").select("*").eq("parent_id", parentId).order("position")
      : supabase.from("categories").select("*").is("parent_id", null).order("position");

    const { data } = await query;
    setCategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, [parentId]);

  const drillDown = (cat: Category) => {
    setHistory((prev) => [...prev, { id: parentId, name: parentName }]);
    setParentId(cat.id);
    setParentName(cat.name);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setParentId(prev.id);
      setParentName(prev.name);
      setHistory((h) => h.slice(0, -1));
    }
  };

  const colors = [
    "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500",
    "bg-violet-500", "bg-pink-500", "bg-teal-500", "bg-orange-500",
    "bg-indigo-500",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {parentId && (
            <button onClick={goBack} className="text-foreground">
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-lg font-bold text-foreground truncate">
            {parentName || "Catalogue"}
          </h1>
        </div>
        <button onClick={signOut} className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Grid */}
      <div className="flex-1 p-4 pb-24">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            Chargement...
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground text-lg">
            Aucune sous-catégorie
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <button
                key={cat.id}
                onClick={() => drillDown(cat)}
                className={`${colors[i % colors.length]} text-white rounded-2xl p-6 text-center font-semibold text-lg shadow-md active:scale-95 transition-transform min-h-[120px] flex items-center justify-center`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform z-40"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Form */}
      {showForm && (
        <TeamProductForm
          categoryName={parentName}
          onClose={() => setShowForm(false)}
          onSaved={() => {}}
        />
      )}
    </div>
  );
};

export default Team;
