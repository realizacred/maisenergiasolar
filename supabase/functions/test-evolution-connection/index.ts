import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get Evolution API config from database
    const { data: config, error: configError } = await supabase
      .from('whatsapp_automation_config')
      .select('evolution_api_url, evolution_api_key, evolution_instance')
      .single();

    if (configError) {
      console.error('Error fetching config:', configError);
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao buscar configuração' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    if (!config.evolution_api_url || !config.evolution_api_key || !config.evolution_instance) {
      return new Response(
        JSON.stringify({ success: false, error: 'Configuração incompleta. Preencha URL, API Key e Instância.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Test connection by fetching instance info
    const evolutionUrl = config.evolution_api_url.replace(/\/$/, '');
    const testUrl = `${evolutionUrl}/instance/fetchInstances`;
    
    console.log(`Testing Evolution API connection to: ${testUrl}`);

    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'apikey': config.evolution_api_key,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Evolution API response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Evolution API error:', errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erro na API: ${response.status} - ${errorText}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const instances = await response.json();
    console.log('Instances found:', JSON.stringify(instances));

    // Check if our instance exists
    const instanceExists = Array.isArray(instances) && instances.some(
      (inst: any) => inst.instance?.instanceName === config.evolution_instance || 
                     inst.instanceName === config.evolution_instance ||
                     inst.name === config.evolution_instance
    );

    // Get instance status
    let instanceStatus = 'não encontrada';
    let connectionState = 'unknown';
    
    if (instanceExists) {
      try {
        const statusUrl = `${evolutionUrl}/instance/connectionState/${config.evolution_instance}`;
        const statusResponse = await fetch(statusUrl, {
          method: 'GET',
          headers: {
            'apikey': config.evolution_api_key,
            'Content-Type': 'application/json',
          },
        });
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          connectionState = statusData.instance?.state || statusData.state || 'unknown';
          instanceStatus = connectionState === 'open' ? 'conectada' : connectionState;
        }
      } catch (e) {
        console.error('Error checking instance status:', e);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        instanceExists,
        instanceStatus,
        connectionState,
        totalInstances: Array.isArray(instances) ? instances.length : 0,
        message: instanceExists 
          ? `Conexão OK! Instância "${config.evolution_instance}" ${instanceStatus}` 
          : `API conectada, mas instância "${config.evolution_instance}" não encontrada`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing Evolution connection:', error);
    return new Response(
      JSON.stringify({ success: false, error: `Erro: ${error.message}` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
