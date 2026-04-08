import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Users, FileText, TrendingUp } from "lucide-react";

const CRMStats = () => {
  const { data: stats } = useQuery({
    queryKey: ["crm-stats"],
    queryFn: async () => {
      const [ordersRes, customersRes, invoicesRes, revenueRes] = await Promise.all([
        supabase.from("orders").select("id", { count: "exact", head: true }),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("invoices").select("id", { count: "exact", head: true }).eq("status", "payee"),
        supabase.from("orders").select("total"),
      ]);

      const totalRevenue = (revenueRes.data || []).reduce((sum: number, o: any) => sum + Number(o.total || 0), 0);

      return {
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        paidInvoices: invoicesRes.count || 0,
        revenue: totalRevenue,
      };
    },
  });

  const { data: recentOrders = [] } = useQuery({
    queryKey: ["crm-recent-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: statusBreakdown = [] } = useQuery({
    queryKey: ["crm-status-breakdown"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("status");
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach((o: any) => { counts[o.status] = (counts[o.status] || 0) + 1; });
      return Object.entries(counts).map(([status, count]) => ({ status, count }));
    },
  });

  const STATUS_FR: Record<string, string> = {
    en_attente: "En attente",
    confirmee: "Confirmée",
    expediee: "Expédiée",
    livree: "Livrée",
    annulee: "Annulée",
  };

  const kpis = [
    { label: "Commandes", value: stats?.orders || 0, icon: ShoppingCart, color: "text-blue-500" },
    { label: "Clients", value: stats?.customers || 0, icon: Users, color: "text-green-500" },
    { label: "Factures payées", value: stats?.paidInvoices || 0, icon: FileText, color: "text-purple-500" },
    { label: "CA Total", value: `${(stats?.revenue || 0).toFixed(2)} €`, icon: TrendingUp, color: "text-amber-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <kpi.icon className={`w-8 h-8 ${kpi.color}`} />
                <div>
                  <p className="text-2xl font-bold text-foreground">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Dernières commandes</CardTitle></CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune commande</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o: any) => (
                  <div key={o.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{o.customers?.name || "Client inconnu"}</span>
                      <span className="text-muted-foreground ml-2">{new Date(o.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <span className="font-medium">{Number(o.total).toFixed(2)} €</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Répartition par statut</CardTitle></CardHeader>
          <CardContent>
            {statusBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune donnée</p>
            ) : (
              <div className="space-y-3">
                {statusBreakdown.map((s: any) => (
                  <div key={s.status} className="flex items-center justify-between">
                    <span className="text-sm">{STATUS_FR[s.status] || s.status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, (s.count / (stats?.orders || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-8 text-right">{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CRMStats;
