
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { adminEmail, newUserEmail, newUserName } = await req.json();

    // Enviar email para o administrador
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Projeto Moriah <onboarding@resend.dev>',
      to: adminEmail,
      subject: 'Nova solicitação de acesso - Projeto Moriah',
      html: `
        <h1>Nova solicitação de acesso</h1>
        <p>Um novo usuário solicitou acesso ao sistema:</p>
        <ul>
          <li><strong>Nome:</strong> ${newUserName}</li>
          <li><strong>Email:</strong> ${newUserEmail}</li>
        </ul>
        <p>Por favor, acesse o painel administrativo para aprovar ou rejeitar esta solicitação.</p>
      `,
    });

    if (emailError) {
      throw emailError;
    }

    return new Response(JSON.stringify({ message: 'Email enviado com sucesso' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
