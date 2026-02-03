import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Banco Central do Brasil - API de Taxas de Juros
// Documentação: https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/swagger-ui3#/
const BCB_API_URL = "https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/TaxasJurosDiariaPorInicioPeriodo";

// Mapeamento de instituições financeiras para energia solar
const BANCOS_SOLAR: Record<string, string> = {
  "BANCO SANTANDER (BRASIL) S.A.": "Santander Solar",
  "BANCO BV S.A.": "BV Financeira",
  "BANCO VOTORANTIM S.A.": "BV Financeira",
  "BANCO DO BRASIL S.A.": "Banco do Brasil",
  "CAIXA ECONOMICA FEDERAL": "Caixa Econômica",
  "CAIXA ECONÔMICA FEDERAL": "Caixa Econômica",
};

// Modalidades de crédito relacionadas a financiamento
const MODALIDADES_CREDITO = [
  "Aquisição de outros bens - Pessoa física",
  "Crédito pessoal não consignado",
  "Financiamento de projeto - Pessoa física",
];

interface TaxaBCB {
  InstituicaoFinanceira: string;
  Modalidade: string;
  TaxaJurosAoMes: number;
  TaxaJurosAoAno: number;
  InicioPeriodo: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("[sync-taxas-bcb] Iniciando sincronização com API do Banco Central...");

    // Buscar taxas do BCB
    const filterInstituicoes = Object.keys(BANCOS_SOLAR).map(b => `InstituicaoFinanceira eq '${b}'`).join(' or ');
    const filterModalidades = MODALIDADES_CREDITO.map(m => `Modalidade eq '${m}'`).join(' or ');
    
    const url = `${BCB_API_URL}?$format=json&$top=100&$filter=(${filterInstituicoes})`;
    console.log("[sync-taxas-bcb] URL:", url);

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[sync-taxas-bcb] Erro na API BCB:", response.status, errorText);
      throw new Error(`Erro na API do Banco Central: ${response.status}`);
    }

    const data = await response.json();
    const taxas: TaxaBCB[] = data.value || [];
    
    console.log(`[sync-taxas-bcb] Recebidas ${taxas.length} taxas da API`);

    // Processar e agregar taxas por banco
    const taxasPorBanco: Record<string, { taxas: number[], nome: string }> = {};

    for (const taxa of taxas) {
      const nomeBanco = BANCOS_SOLAR[taxa.InstituicaoFinanceira];
      if (!nomeBanco) continue;

      if (!taxasPorBanco[nomeBanco]) {
        taxasPorBanco[nomeBanco] = { taxas: [], nome: nomeBanco };
      }
      taxasPorBanco[nomeBanco].taxas.push(taxa.TaxaJurosAoMes);
    }

    // Calcular média das taxas e atualizar no banco
    const resultados: { banco: string, taxa_atualizada: number }[] = [];

    for (const [nomeBanco, dados] of Object.entries(taxasPorBanco)) {
      if (dados.taxas.length === 0) continue;

      // Média das taxas encontradas
      const taxaMedia = dados.taxas.reduce((a, b) => a + b, 0) / dados.taxas.length;
      const taxaArredondada = Math.round(taxaMedia * 100) / 100;

      // Atualizar no banco de dados
      const { error } = await supabase
        .from('financiamento_bancos')
        .update({ taxa_mensal: taxaArredondada })
        .ilike('nome', `%${nomeBanco.split(' ')[0]}%`);

      if (error) {
        console.error(`[sync-taxas-bcb] Erro ao atualizar ${nomeBanco}:`, error);
      } else {
        console.log(`[sync-taxas-bcb] ${nomeBanco}: ${taxaArredondada}% a.m.`);
        resultados.push({ banco: nomeBanco, taxa_atualizada: taxaArredondada });
      }
    }

    // Atualizar timestamp de sincronização
    await supabase
      .from('financiamento_api_config')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('nome', 'Configuração de API');

    console.log(`[sync-taxas-bcb] Sincronização concluída. ${resultados.length} bancos atualizados.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Taxas atualizadas para ${resultados.length} bancos`,
        resultados,
        fonte: "Banco Central do Brasil - API de Taxas de Juros",
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error("[sync-taxas-bcb] Erro:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
