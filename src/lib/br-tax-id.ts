/** CPF/CNPJ: apenas dígitos, sem validação de dígitos verificadores (Asaas valida). */

export function digitsOnly(input: string | undefined | null): string {
  return (input ?? '').replace(/\D/g, '');
}

/** CPF = 11 dígitos; CNPJ = 14. */
export function isValidBrCpfCnpjLength(digits: string): boolean {
  return digits.length === 11 || digits.length === 14;
}

/**
 * Prioridade: valor enviado no checkout → cadastro do usuário → fallback do servidor (env).
 */
export function resolvePayerDocumentDigits(options: {
  bodyCpfCnpj?: string | null;
  userCpfCnpj?: string | null;
  envFallbackDigits?: string | null;
}): string {
  const fromBody = digitsOnly(options.bodyCpfCnpj);
  if (isValidBrCpfCnpjLength(fromBody)) return fromBody;
  const fromUser = digitsOnly(options.userCpfCnpj);
  if (isValidBrCpfCnpjLength(fromUser)) return fromUser;
  const fromEnv = digitsOnly(options.envFallbackDigits);
  if (isValidBrCpfCnpjLength(fromEnv)) return fromEnv;
  return '';
}

export const PAYER_DOCUMENT_REQUIRED = 'PAYER_DOCUMENT_REQUIRED';
