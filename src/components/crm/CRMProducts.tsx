import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CRMProducts = () => {
  const [search, setSearch] = useState("");

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["crm-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_pricing(buy_price, sell_price, margin, suppliers(company_name))")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.unb || "").includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, ref, UNB..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>UNB</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Référence</TableHead>
              <TableHead className="text-right">Prix vente</TableHead>
              <TableHead className="text-right">Prix achat</TableHead>
              <TableHead className="text-right">Marge</TableHead>
              <TableHead>Fournisseur</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Aucun produit</TableCell></TableRow>
            ) : filtered.map((p: any) => {
              const pricing = p.product_pricing?.[0];
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.unb || "—"}</TableCell>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-sm">{p.category || "—"}</TableCell>
                  <TableCell className="text-sm">{p.reference || "—"}</TableCell>
                  <TableCell className="text-right">{p.price ? `${Number(p.price).toFixed(2)} €` : pricing ? `${Number(pricing.sell_price).toFixed(2)} €` : "—"}</TableCell>
                  <TableCell className="text-right">{pricing ? `${Number(pricing.buy_price).toFixed(2)} €` : "—"}</TableCell>
                  <TableCell className="text-right font-medium">{pricing ? <span className={Number(pricing.margin) > 0 ? "text-green-600" : "text-destructive"}>{Number(pricing.margin).toFixed(2)} €</span> : "—"}</TableCell>
                  <TableCell className="text-sm">{pricing?.suppliers?.company_name || "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CRMProducts;
