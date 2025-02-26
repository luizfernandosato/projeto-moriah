
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import GerarRecibo from "@/pages/GerarRecibo";
import Exportar from "@/pages/Exportar";
import MinhaConta from "@/pages/MinhaConta";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Login from "@/pages/Login";
import EmbedRecibo from "@/pages/EmbedRecibo";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/gerar-recibo"
            element={
              <ProtectedRoute>
                <GerarRecibo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/exportar"
            element={
              <ProtectedRoute>
                <Exportar />
              </ProtectedRoute>
            }
          />
          <Route
            path="/minha-conta"
            element={
              <ProtectedRoute>
                <MinhaConta />
              </ProtectedRoute>
            }
          />
          <Route
            path="/embed"
            element={
              <ProtectedRoute>
                <EmbedRecibo />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
