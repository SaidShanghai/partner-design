import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Users, Factory, Package, FileText, BarChart3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import CRMOrders from "@/components/crm/CRMOrders";
import CRMCustomers from "@/components/crm/CRMCustomers";
import CRMSuppliers from "@/components/crm/CRMSuppliers";
import CRMProducts from "@/components/crm/CRMProducts";
import CRMInvoices from "@/components/crm/CRMInvoices";
import CRMStats from "@/components/crm/CRMStats";

const AdminCRM = () => {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!isAdmin) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-3 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-bold text-foreground">CRM — Back-office</h1>
        </div>
      </header>

      <div className="px-6 py-6">
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl">
            <TabsTrigger value="orders" className="flex items-center gap-1.5 text-xs">
              <ShoppingCart className="w-3.5 h-3.5" />
              Commandes
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-1.5 text-xs">
              <Users className="w-3.5 h-3.5" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="flex items-center gap-1.5 text-xs">
              <Factory className="w-3.5 h-3.5" />
              Fournisseurs
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs">
              <Package className="w-3.5 h-3.5" />
              Produits
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" />
              Factures
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-1.5 text-xs">
              <BarChart3 className="w-3.5 h-3.5" />
              Stats
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders"><CRMOrders /></TabsContent>
          <TabsContent value="customers"><CRMCustomers /></TabsContent>
          <TabsContent value="suppliers"><CRMSuppliers /></TabsContent>
          <TabsContent value="products"><CRMProducts /></TabsContent>
          <TabsContent value="invoices"><CRMInvoices /></TabsContent>
          <TabsContent value="stats"><CRMStats /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminCRM;
