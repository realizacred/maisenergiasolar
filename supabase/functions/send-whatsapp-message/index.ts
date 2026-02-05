import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  telefone: string;
  mensagem: string;
  lead_id?: string;
  tipo?: 'automatico' | 'manual' | 'lembrete';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { telefone, mensagem, lead_id, tipo = 'manual' }: SendMessageRequest = await req.json();

    if (!telefone || !mensagem) {
      return new Response(
        JSON.stringify({ success: false, error: 'Telefone e mensagem são obrigatórios' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get WhatsApp config
    const { data: config, error: configError } = await supabase
      .from('whatsapp_automation_config')
      .select('*')
      .single();

    if (configError || !config) {
      console.error('Error fetching config:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração de WhatsApp não encontrada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!config.ativo) {
      return new Response(
        JSON.stringify({ success: false, error: 'Automação de WhatsApp está desativada' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Format phone number (remove non-digits, ensure country code)
    let formattedPhone = telefone.replace(/\D/g, '');
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone;
    }

    const results: { method: string; success: boolean; error?: string }[] = [];

    // Send via Webhook if configured
    if ((config.modo_envio === 'webhook' || config.modo_envio === 'ambos') && config.webhook_url) {
      try {
        console.log('Sending via webhook:', config.webhook_url);
        
        const webhookPayload = {
          telefone: formattedPhone,
          mensagem,
          lead_id,
          tipo,
          timestamp: new Date().toISOString(),
        };

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (config.api_token) {
          headers['Authorization'] = `Bearer ${config.api_token}`;
        }

        const webhookResponse = await fetch(config.webhook_url, {
          method: 'POST',
          headers,
          body: JSON.stringify(webhookPayload),
        });

        results.push({
          method: 'webhook',
          success: webhookResponse.ok,
          error: webhookResponse.ok ? undefined : `Status: ${webhookResponse.status}`,
        });
      } catch (e: any) {
        console.error('Webhook error:', e);
        results.push({ method: 'webhook', success: false, error: e.message });
      }
    }

    // Send via Evolution API if configured
    if ((config.modo_envio === 'evolution' || config.modo_envio === 'ambos') && 
        config.evolution_api_url && config.evolution_api_key && config.evolution_instance) {
      try {
        const evolutionUrl = config.evolution_api_url.replace(/\/$/, '');
        const sendUrl = `${evolutionUrl}/message/sendText/${config.evolution_instance}`;
        
        console.log('Sending via Evolution API:', sendUrl);

        const evolutionPayload = {
          number: formattedPhone,
          text: mensagem,
        };

        const evolutionResponse = await fetch(sendUrl, {
          method: 'POST',
          headers: {
            'apikey': config.evolution_api_key,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(evolutionPayload),
        });

        const evolutionData = await evolutionResponse.json();
        console.log('Evolution API response:', JSON.stringify(evolutionData));

        results.push({
          method: 'evolution',
          success: evolutionResponse.ok,
          error: evolutionResponse.ok ? undefined : evolutionData.message || `Status: ${evolutionResponse.status}`,
        });
      } catch (e: any) {
        console.error('Evolution API error:', e);
        results.push({ method: 'evolution', success: false, error: e.message });
      }
    }

    // Determine overall status
    const anySuccess = results.some(r => r.success);
    const status = anySuccess ? 'enviado' : 'erro';

    // Log message to database
    const { error: logError } = await supabase
      .from('whatsapp_messages')
      .insert({
        lead_id: lead_id || null,
        tipo,
        mensagem,
        telefone: formattedPhone,
        status,
        erro_detalhes: anySuccess ? null : JSON.stringify(results),
      });

    if (logError) {
      console.error('Error logging message:', logError);
    }

    if (!anySuccess && results.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Nenhum método de envio configurado' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: anySuccess, 
        results,
        message: anySuccess ? 'Mensagem enviada com sucesso' : 'Falha ao enviar mensagem'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error sending WhatsApp message:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
