import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, Pencil, Trash2, ChevronRight, GripVertical, LogOut } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
  position: number;
}

const Superadmin = () => {
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string }[]>([
    { id: null, name: "Racine" },
  ]);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    const query = parentId
      ? supabase.from("categories").select("*").eq("parent_id", parentId).order("position")
      : supabase.from("categories").select("*").is("parent_id", null).order("position");

    const { data, error } = await query;
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchCategories();
  }, [parentId]);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const maxPos = categories.length > 0 ? Math.max(...categories.map((c) => c.position)) + 1 : 0;
    const { error } = await supabase.from("categories").insert({
      name: newName.trim(),
      parent_id: parentId,
      position: maxPos,
    });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setNewName("");
      fetchCategories();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      fetchCategories();
    }
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return;
    const { error } = await supabase.from("categories").update({ name: editingName.trim() }).eq("id", id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      setEditingId(null);
      fetchCategories();
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...categories];
    const [a, b] = [updated[index], updated[index - 1]];
    await Promise.all([
      supabase.from("categories").update({ position: b.position }).eq("id", a.id),
      supabase.from("categories").update({ position: a.position }).eq("id", b.id),
    ]);
    fetchCategories();
  };

  const drillDown = (cat: Category) => {
    setParentId(cat.id);
    setBreadcrumb((prev) => [...prev, { id: cat.id, name: cat.name }]);
  };

  const goToBreadcrumb = (index: number) => {
    const target = breadcrumb[index];
    setParentId(target.id);
    setBreadcrumb((prev) => prev.slice(0, index + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-foreground">Superadmin — Catégories</h1>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="w-4 h-4 mr-2" /> Déconnexion
        </Button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground flex-wrap">
          {breadcrumb.map((b, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="w-3 h-3" />}
              <button
                onClick={() => goToBreadcrumb(i)}
                className={`hover:underline ${i === breadcrumb.length - 1 ? "text-foreground font-medium" : ""}`}
              >
                {b.name}
              </button>
            </span>
          ))}
        </div>

        {/* Add form */}
        <div className="flex gap-2">
          <Input
            placeholder="Nouvelle catégorie..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Ajouter
          </Button>
        </div>

        {/* List */}
        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement...</p>
        ) : categories.length === 0 ? (
          <p className="text-muted-foreground text-sm">Aucune sous-catégorie ici.</p>
        ) : (
          <ul className="space-y-2">
            {categories.map((cat, index) => (
              <li key={cat.id} className="flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-3">
                <button onClick={() => handleMoveUp(index)} className="text-muted-foreground hover:text-foreground" title="Monter">
                  <GripVertical className="w-4 h-4" />
                </button>

                {editingId === cat.id ? (
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRename(cat.id)}
                    onBlur={() => setEditingId(null)}
                    autoFocus
                    className="flex-1 h-8"
                  />
                ) : (
                  <button onClick={() => drillDown(cat)} className="flex-1 text-left text-foreground font-medium hover:underline">
                    {cat.name}
                  </button>
                )}

                <button
                  onClick={() => { setEditingId(cat.id); setEditingName(cat.name); }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Superadmin;
