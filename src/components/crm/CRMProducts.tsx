import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Pencil, X, Check } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CRMProducts = () => {
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["crm-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_pricing(id, buy_price, sell_price, margin, supplier_id, suppliers(company_name))")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: suppliers = [] } = useQuery({
    queryKey: ["crm-suppliers-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("suppliers")
        .select("id, company_name")
        .order("company_name");
      if (error) throw error;
      return data;
    },
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, values, pricingId }: { id: string; values: Record<string, string>; pricingId?: string }) => {
      const { error: prodErr } = await supabase.from("products").update({
        name: values.name || undefined,
        category: values.category || null,
        reference: values.reference || null,
        composition: values.composition || null,
        color: values.color || null,
        price: values.sellPrice ? Number(values.sellPrice) : null,
        width_cm: values.width ? Number(values.width) : null,
        weight_gsm: values.weight ? Number(values.weight) : null,
      }).eq("id", id);
      if (prodErr) throw prodErr;

      const buyPrice = Number(values.buyPrice) || 0;
      const sellPrice = Number(values.sellPrice) || 0;
      const supplierId = values.supplierId || null;

      if (pricingId) {
        const { error } = await supabase.from("product_pricing").update({
          buy_price: buyPrice,
          sell_price: sellPrice,
          supplier_id: supplierId,
        }).eq("id", pricingId);
        if (error) throw error;
      } else if (buyPrice > 0 || sellPrice > 0 || supplierId) {
        const { error } = await supabase.from("product_pricing").insert({
          product_id: id,
          buy_price: buyPrice,
          sell_price: sellPrice,
          supplier_id: supplierId,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm-products"] });
      toast.success("Produit mis à jour");
      setEditingId(null);
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });

  const startEdit = (p: any) => {
    const pricing = p.product_pricing?.[0];
    setEditingId(p.id);
    setEditValues({
      name: p.name || "",
      category: p.category || "",
      reference: p.reference || "",
      composition: p.composition || "",
      color: p.color || "",
      sellPrice: p.price ? String(p.price) : pricing ? String(pricing.sell_price) : "",
      buyPrice: pricing ? String(pricing.buy_price) : "",
      width: p.width_cm ? String(p.width_cm) : "",
      weight: p.weight_gsm ? String(p.weight_gsm) : "",
      supplierId: pricing?.supplier_id || "",
    });
  };

  const saveEdit = (p: any) => {
    const pricingId = p.product_pricing?.[0]?.id;
    updateProduct.mutate({ id: p.id, values: editValues, pricingId });
  };

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.reference || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.unb || "").includes(search)
  );

  const EditInput = ({ field, className = "w-full" }: { field: string; className?: string }) => (
    <Input
      value={editValues[field] || ""}
      onChange={(e) => setEditValues((v) => ({ ...v, [field]: e.target.value }))}
      className={`h-7 text-sm ${className}`}
    />
  );

  return (
    <div className="space-y-4">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Rechercher par nom, ref, UNB..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="text-xs">
              <TableHead className="whitespace-nowrap px-2">UNB</TableHead>
              <TableHead className="whitespace-nowrap px-2">Nom</TableHead>
              <TableHead className="whitespace-nowrap px-2">Cat.</TableHead>
              <TableHead className="whitespace-nowrap px-2">Réf.</TableHead>
              <TableHead className="whitespace-nowrap px-2">Compo.</TableHead>
              <TableHead className="whitespace-nowrap px-2">Couleur</TableHead>
              <TableHead className="whitespace-nowrap px-2 text-right">Larg.</TableHead>
              <TableHead className="whitespace-nowrap px-2 text-right">Poids</TableHead>
              <TableHead className="whitespace-nowrap px-2 text-right">Vente €</TableHead>
              <TableHead className="whitespace-nowrap px-2 text-right">Achat ¥</TableHead>
              <TableHead className="whitespace-nowrap px-2 text-right">Marge</TableHead>
              <TableHead className="whitespace-nowrap px-2">Fournisseur</TableHead>
              <TableHead className="w-16 px-2"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-8">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={13} className="text-center text-muted-foreground py-8">Aucun produit</TableCell></TableRow>
            ) : filtered.map((p: any) => {
              const pricing = p.product_pricing?.[0];
              const isEditing = editingId === p.id;

              return (
                <TableRow key={p.id} className={`align-middle ${isEditing ? "!bg-primary/20" : "hover:bg-muted/50"}`}>
                  <TableCell className="font-mono text-xs whitespace-nowrap">{p.unb || "—"}</TableCell>
                  <TableCell className="whitespace-nowrap">{isEditing ? <EditInput field="name" /> : <span className="font-medium">{p.name}</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{isEditing ? <EditInput field="category" /> : <span className="text-sm">{p.category || "—"}</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{isEditing ? <EditInput field="reference" /> : <span className="text-sm">{p.reference || "—"}</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{isEditing ? <EditInput field="composition" /> : <span className="text-sm">{p.composition || "—"}</span>}</TableCell>
                  <TableCell className="whitespace-nowrap">{isEditing ? <EditInput field="color" /> : <span className="text-sm">{p.color || "—"}</span>}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{isEditing ? <EditInput field="width" className="w-20 ml-auto" /> : (p.width_cm || "—")}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{isEditing ? <EditInput field="weight" className="w-20 ml-auto" /> : (p.weight_gsm || "—")}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{isEditing ? <EditInput field="sellPrice" className="w-20 ml-auto" /> : (p.price ? `${Number(p.price).toFixed(2)} €` : pricing ? `${Number(pricing.sell_price).toFixed(2)} €` : "—")}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">{isEditing ? <EditInput field="buyPrice" className="w-20 ml-auto" /> : (pricing ? `${Number(pricing.buy_price).toFixed(2)} ¥` : "—")}</TableCell>
                  <TableCell className="text-right whitespace-nowrap font-medium">{pricing ? <span className={Number(pricing.margin) > 0 ? "text-green-600" : "text-destructive"}>{Number(pricing.margin).toFixed(2)} €</span> : "—"}</TableCell>
                  <TableCell className="text-sm whitespace-nowrap">
                    {isEditing ? (
                      <Select
                        value={editValues.supplierId || "none"}
                        onValueChange={(val) => setEditValues((v) => ({ ...v, supplierId: val === "none" ? "" : val }))}
                      >
                        <SelectTrigger className="h-7 text-sm w-[180px]">
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">— Aucun —</SelectItem>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.company_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      pricing?.suppliers?.company_name || "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {isEditing ? (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => saveEdit(p)} disabled={updateProduct.isPending}>
                          <Check className="w-3.5 h-3.5 text-green-600" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                          <X className="w-3.5 h-3.5 text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(p)}>
                        <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    )}
                  </TableCell>
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
