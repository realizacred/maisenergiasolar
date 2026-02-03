import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Banco Central do Brasil - API de Taxas de Juros
const BCB_API_URL = "https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/TaxasJurosDiariaPorInicioPeriodo";

// Mapeamento de códigos BCB para bancos
const BANCOS_MAPEAMENTO: Record<string, { nomes: string[], codigo_bcb: string }> = {
  "Santander": {
    nomes: ["BANCO SANTANDER (BRASIL) S.A.", "SANTANDER"],
    codigo_bcb: "033"
  },
  "BV": {
    nomes: ["BANCO BV S.A.", "BANCO VOTORANTIM S.A.", "BV FINANCEIRA"],
    codigo_bcb: "655"
  },
  "Banco do Brasil": {
    nomes: ["BANCO DO BRASIL S.A."],
    codigo_bcb: "001"
  },
  "Caixa": {
    nomes: ["CAIXA ECONOMICA FEDERAL", "CAIXA ECONÔMICA FEDERAL"],
    codigo_bcb: "104"
  },
};

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
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ========== AUTENTICAÇÃO OBRIGATÓRIA ==========
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error("[sync-taxas-bcb] Requisição sem token de autenticação");
      return new Response(
        JSON.stringify({ success: false, error: 'Token de autenticação obrigatório' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verificar o token JWT do usuário
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("[sync-taxas-bcb] Token inválido ou expirado:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Token inválido ou expirado. Faça login novamente.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[sync-taxas-bcb] Usuário autenticado: ${user.email}`);
    // ========== FIM AUTENTICAÇÃO ==========

    // Cliente admin para operações no banco
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if syncing specific bank
    let bankId: string | null = null;
    try {
      const body = await req.json();
      bankId = body?.bank_id || null;
    } catch {
      // No body or invalid JSON, sync all
    }

    console.log("[sync-taxas-bcb] Iniciando sincronização com API do Banco Central...");
    if (bankId) {
      console.log(`[sync-taxas-bcb] Sincronizando apenas banco ID: ${bankId}`);
    }

    // Buscar bancos cadastrados
    const { data: bancosDb, error: bancosError } = await supabase
      .from('financiamento_bancos')
      .select('id, nome, codigo_bcb');
    
    if (bancosError) throw bancosError;

    let bancosParaSincronizar = bancosDb || [];
    if (bankId) {
      bancosParaSincronizar = bancosParaSincronizar.filter(b => b.id === bankId);
    }

    // Buscar todas as instituições que podemos mapear
    const todasInstituicoes: string[] = [];
    for (const config of Object.values(BANCOS_MAPEAMENTO)) {
      todasInstituicoes.push(...config.nomes);
    }

    const filterInstituicoes = todasInstituicoes.map(b => `InstituicaoFinanceira eq '${b}'`).join(' or ');
    const url = `${BCB_API_URL}?$format=json&$top=100&$filter=(${filterInstituicoes})`;

    console.log("[sync-taxas-bcb] Consultando API BCB...");
    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[sync-taxas-bcb] Erro na API BCB:", response.status, errorText);
      throw new Error(`Erro na API do Banco Central: ${response.status}`);
    }

    const data = await response.json();
    const taxas: TaxaBCB[] = data.value || [];
    
    console.log(`[sync-taxas-bcb] Recebidas ${taxas.length} taxas da API`);

    // Processar taxas por instituição BCB
    const taxasPorInstituicao: Record<string, number[]> = {};
    for (const taxa of taxas) {
      const inst = taxa.InstituicaoFinanceira.toUpperCase();
      if (!taxasPorInstituicao[inst]) {
        taxasPorInstituicao[inst] = [];
      }
      taxasPorInstituicao[inst].push(taxa.TaxaJurosAoMes);
    }

    const resultados: { banco: string, taxa_anterior: number | null, taxa_nova: number, sincronizado: boolean }[] = [];
    const erros: { banco: string, erro: string }[] = [];

    for (const banco of bancosParaSincronizar) {
      let taxaEncontrada: number | null = null;
      let instituicaoEncontrada: string | null = null;

      if (banco.codigo_bcb) {
        for (const [, config] of Object.entries(BANCOS_MAPEAMENTO)) {
          if (config.codigo_bcb === banco.codigo_bcb) {
            for (const nomeInst of config.nomes) {
              const key = nomeInst.toUpperCase();
              if (taxasPorInstituicao[key] && taxasPorInstituicao[key].length > 0) {
                const taxas = taxasPorInstituicao[key];
                taxaEncontrada = taxas.reduce((a, b) => a + b, 0) / taxas.length;
                instituicaoEncontrada = nomeInst;
                break;
              }
            }
            if (taxaEncontrada) break;
          }
        }
      }

      if (!taxaEncontrada) {
        for (const [nomePadrao, config] of Object.entries(BANCOS_MAPEAMENTO)) {
          if (banco.nome.toUpperCase().includes(nomePadrao.toUpperCase())) {
            for (const nomeInst of config.nomes) {
              const key = nomeInst.toUpperCase();
              if (taxasPorInstituicao[key] && taxasPorInstituicao[key].length > 0) {
                const taxas = taxasPorInstituicao[key];
                taxaEncontrada = taxas.reduce((a, b) => a + b, 0) / taxas.length;
                instituicaoEncontrada = nomeInst;
                break;
              }
            }
            if (taxaEncontrada) break;
          }
        }
      }

      if (taxaEncontrada !== null) {
        const taxaArredondada = Math.round(taxaEncontrada * 100) / 100;
        
        const { data: bancoAtual } = await supabase
          .from('financiamento_bancos')
          .select('taxa_mensal')
          .eq('id', banco.id)
          .single();

        const { error: updateError } = await supabase
          .from('financiamento_bancos')
          .update({ 
            taxa_mensal: taxaArredondada,
            fonte_sync: 'bcb',
            ultima_sync: new Date().toISOString(),
          })
          .eq('id', banco.id);

        if (updateError) {
          console.error(`[sync-taxas-bcb] Erro ao atualizar ${banco.nome}:`, updateError);
          erros.push({ banco: banco.nome, erro: updateError.message });
        } else {
          console.log(`[sync-taxas-bcb] ✅ ${banco.nome}: ${bancoAtual?.taxa_mensal || '?'}% → ${taxaArredondada}% (fonte: ${instituicaoEncontrada})`);
          resultados.push({ 
            banco: banco.nome, 
            taxa_anterior: bancoAtual?.taxa_mensal || null,
            taxa_nova: taxaArredondada,
            sincronizado: true 
          });
        }
      } else {
        console.log(`[sync-taxas-bcb] ⚠️ ${banco.nome}: Não encontrado na API do BCB`);
        erros.push({ banco: banco.nome, erro: "Não encontrado na API do Banco Central. Configure o código BCB ou sincronize manualmente." });
      }
    }

    await supabase
      .from('financiamento_api_config')
      .update({ ultima_sincronizacao: new Date().toISOString() })
      .eq('nome', 'Configuração de API');

    console.log(`[sync-taxas-bcb] Sincronização concluída. ${resultados.length} bancos atualizados, ${erros.length} erros.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Taxas atualizadas para ${resultados.length} banco(s)`,
        resultados,
        erros,
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
