import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, FileDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  brouillon: { label: "Brouillon", variant: "outline" },
  envoyee: { label: "Envoyée", variant: "secondary" },
  payee: { label: "Payée", variant: "default" },
};

const CRMInvoices = () => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: "", order_id: "", amount_ht: "", tva_rate: "20", due_at: "", notes: "" });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ["crm-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, customers(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: customers = [] } = useQuery({
    queryKey: ["crm-customers-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["crm-orders-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("id").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const createInvoice = useMutation({
    mutationFn: async () => {
      const now = new Date();
      const invoiceNumber = `FA-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`;
      const { error } = await supabase.from("invoices").insert({
        invoice_number: invoiceNumber,
        customer_id: form.customer_id || null,
        order_id: form.order_id || null,
        amount_ht: parseFloat(form.amount_ht) || 0,
        tva_rate: parseFloat(form.tva_rate) || 20,
        due_at: form.due_at || null,
        notes: form.notes || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["crm-invoices"] });
      toast({ title: "Facture créée" });
      setFormOpen(false);
      setForm({ customer_id: "", order_id: "", amount_ht: "", tva_rate: "20", due_at: "", notes: "" });
    },
    onError: (e: any) => toast({ title: "Erreur", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("invoices").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["crm-invoices"] }); toast({ title: "Statut mis à jour" }); },
  });

  const filtered = invoices.filter((inv: any) =>
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    (inv.customers?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Rechercher..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => setFormOpen(true)} size="sm"><Plus className="w-4 h-4 mr-1" />Nouvelle facture</Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Facture</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">HT</TableHead>
              <TableHead className="text-right">TVA</TableHead>
              <TableHead className="text-right">TTC</TableHead>
              <TableHead>Émission</TableHead>
              <TableHead>Échéance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Chargement...</TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Aucune facture</TableCell></TableRow>
            ) : filtered.map((inv: any) => {
              const st = STATUS_LABELS[inv.status] || { label: inv.status, variant: "outline" as const };
              return (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-xs font-medium">{inv.invoice_number}</TableCell>
                  <TableCell>{inv.customers?.name || "—"}</TableCell>
                  <TableCell><Badge variant={st.variant}>{st.label}</Badge></TableCell>
                  <TableCell className="text-right">{Number(inv.amount_ht).toFixed(2)} €</TableCell>
                  <TableCell className="text-right text-muted-foreground">{Number(inv.tva_amount).toFixed(2)} €</TableCell>
                  <TableCell className="text-right font-medium">{Number(inv.amount_ttc).toFixed(2)} €</TableCell>
                  <TableCell className="text-sm">{inv.issued_at ? new Date(inv.issued_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                  <TableCell className="text-sm">{inv.due_at ? new Date(inv.due_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                  <TableCell>
                    <Select value={inv.status} onValueChange={(v) => updateStatus.mutate({ id: inv.id, status: v })}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(STATUS_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouvelle facture</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Client</Label>
              <Select value={form.customer_id} onValueChange={(v) => setForm({ ...form, customer_id: v })}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>
                  {customers.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Montant HT (€) *</Label>
              <Input type="number" step="0.01" value={form.amount_ht} onChange={(e) => setForm({ ...form, amount_ht: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Taux TVA (%)</Label>
              <Input type="number" step="0.01" value={form.tva_rate} onChange={(e) => setForm({ ...form, tva_rate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Échéance</Label>
              <Input type="date" value={form.due_at} onChange={(e) => setForm({ ...form, due_at: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Commande liée</Label>
              <Select value={form.order_id} onValueChange={(v) => setForm({ ...form, order_id: v })}>
                <SelectTrigger><SelectValue placeholder="Aucune" /></SelectTrigger>
                <SelectContent>
                  {orders.map((o: any) => <SelectItem key={o.id} value={o.id}>{o.id.slice(0, 8)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
            </div>
            <div className="col-span-2">
              <Button onClick={() => createInvoice.mutate()} disabled={!form.amount_ht || createInvoice.isPending} className="w-full">
                {createInvoice.isPending ? "Création..." : "Créer la facture"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CRMInvoices;
