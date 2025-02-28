
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend("re_5bkNznz1_7qPkyP1TKG6SEcsApGt8VyYA");

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nome, email, setor } = await req.json();

    console.log("Enviando email sobre solicitação de acesso para:", email);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'Projeto Moriah <onboarding@resend.dev>',
      to: 'luizfernandosato@gmail.com',
      subject: 'Nova solicitação de acesso - Projeto Moriah',
      html: `
        <h1>Nova solicitação de acesso</h1>
        <p>Um novo usuário solicitou acesso ao sistema:</p>
        <ul>
          <li><strong>Nome:</strong> ${nome}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Setor:</strong> ${setor}</li>
        </ul>
        <p>Por favor, acesse o painel administrativo do Supabase para criar uma conta para este usuário.</p>
      `,
    });

    if (emailError) {
      console.error("Erro ao enviar email:", emailError);
      throw emailError;
    }

    console.log("Email enviado com sucesso:", emailData);

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
