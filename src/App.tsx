import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { CartProvider } from "@/hooks/useCart";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Coupons from "./pages/Coupons.tsx";
import Category from "./pages/Category.tsx";
import Nouveautes from "./pages/Nouveautes.tsx";
import Login from "./pages/Login.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import AdminCRM from "./pages/AdminCRM.tsx";
import Cart from "./pages/Cart.tsx";
import Superadmin from "./pages/Superadmin.tsx";
import Team from "./pages/Team.tsx";
import Backoffice from "./pages/Backoffice.tsx";
import WeChatView from "./pages/WeChatView.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/nouveautes" element={<Nouveautes />} />
                <Route path="/categorie/:slug" element={<Category />} />
                <Route path="/connexion" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/admin/crm" element={<AdminCRM />} />
                <Route path="/panier" element={<Cart />} />
                <Route
                  path="/superadmin"
                  element={
                    <ProtectedRoute allowedRoles={["superadmin"]}>
                      <Superadmin />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/team"
                  element={
                    <ProtectedRoute allowedRoles={["team", "superadmin"]}>
                      <Team />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/backoffice"
                  element={
                    <ProtectedRoute allowedRoles={["backoffice", "admin", "superadmin"]}>
                      <Backoffice />
                    </ProtectedRoute>
                  }
                />
                <Route path="/wechat/:supplierCode" element={<WeChatView />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
