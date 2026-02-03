export type ParsedInvokeError = {
  message: string;
  status?: number;
};

/**
 * Supabase functions.invoke() costuma retornar `error.message` genérico (ex: "Edge Function returned a non-2xx status code").
 * Esta função tenta extrair o body real retornado pela função para mostrar um erro útil.
 */
export async function parseInvokeError(err: unknown): Promise<ParsedInvokeError> {
  const anyErr = err as any;
  const status: number | undefined = anyErr?.context?.status;

  let message = String(anyErr?.message || "Erro ao executar a função");

  const ctx = anyErr?.context;
  if (ctx && typeof ctx === "object" && typeof ctx.clone === "function") {
    try {
      const res: Response = ctx as Response;
      const cloned = res.clone();
      const contentType = cloned.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const json = await cloned.json();
        if (typeof json === "string") {
          message = json;
        } else if (json && typeof json === "object") {
          const maybeError = (json as any).error ?? (json as any).message;
          message = maybeError ? String(maybeError) : JSON.stringify(json);
        }
      } else {
        const text = await cloned.text();
        if (text) message = text;
      }
    } catch {
      // ignore parsing failures; keep generic message
    }
  }

  return { message, status };
}

export function isEmailAlreadyRegisteredError(message: string): boolean {
  const m = (message || "").toLowerCase();
  return (
    m.includes("already been registered") ||
    m.includes("email_exists") ||
    m.includes("email address has already been registered") ||
    m.includes("e-mail já") ||
    m.includes("email já")
  );
}
