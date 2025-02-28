
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SolicitacaoAcesso {
  nome: string;
  email: string;
  setor: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, setor }: SolicitacaoAcesso = await req.json();

    // Validar os dados
    if (!nome || !email || !setor) {
      return new Response(
        JSON.stringify({ error: "Todos os campos devem ser preenchidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Criar cliente Supabase
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Enviar email para o administrador
    const { error: emailError } = await supabaseClient.functions.invoke('notify-admin', {
      body: {
        adminEmail: 'luizfernandosato@gmail.com',
        subject: 'Nova Solicitação de Acesso - Projeto Moriah',
        message: `
          Nome: ${nome}
          Email: ${email}
          Setor: ${setor}
          
          Esta pessoa está solicitando acesso ao sistema Projeto Moriah.
          Você pode criar um usuário para ela no painel administrativo do Supabase.
        `,
      }
    });

    if (emailError) {
      console.error("Erro ao enviar email:", emailError);
      return new Response(
        JSON.stringify({ error: "Erro ao enviar solicitação" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Solicitação enviada com sucesso" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Erro na função solicitar-acesso:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
