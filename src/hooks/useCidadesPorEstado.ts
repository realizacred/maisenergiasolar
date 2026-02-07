import { useState, useEffect } from "react";

interface CidadeIBGE {
  id: number;
  nome: string;
}

interface UseCidadesPorEstadoReturn {
  cidades: { value: string; label: string }[];
  isLoading: boolean;
  error: string | null;
}

const cidadesCache = new Map<string, { value: string; label: string }[]>();

export function useCidadesPorEstado(uf: string): UseCidadesPorEstadoReturn {
  const [cidades, setCidades] = useState<{ value: string; label: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uf || uf.length !== 2) {
      setCidades([]);
      return;
    }

    // Check cache first
    const cached = cidadesCache.get(uf);
    if (cached) {
      setCidades(cached);
      return;
    }

    const fetchCidades = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
        );

        if (!response.ok) {
          throw new Error("Erro ao buscar cidades");
        }

        const data: CidadeIBGE[] = await response.json();
        const options = data.map((c) => ({
          value: c.nome,
          label: c.nome,
        }));

        cidadesCache.set(uf, options);
        setCidades(options);
      } catch (e) {
        console.error("Erro ao buscar cidades:", e);
        setError("Não foi possível carregar as cidades");
        setCidades([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCidades();
  }, [uf]);

  return { cidades, isLoading, error };
}
