
import React, { useEffect, useState } from 'react';
import GerarRecibo from './GerarRecibo';
import Login from './Login';
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer";

const EmbedRecibo = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Verificar sessão inicial e redirecionar se não estiver autenticado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    checkSession();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="container mx-auto px-4 py-8 flex-grow">
        {!user ? <Login /> : <GerarRecibo />}
      </main>
      <Footer />
    </div>
  );
};

export default EmbedRecibo;
