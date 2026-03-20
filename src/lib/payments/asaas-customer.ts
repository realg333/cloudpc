import type { PrismaClient } from '@prisma/client';
import type { AsaasClient } from './asaas-client';
import { readAsaasDefaultCustomerDocumentRaw } from './payment-env';

function asRecord(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === 'object' && !Array.isArray(v)) return v as Record<string, unknown>;
  return null;
}

function firstCustomerIdFromList(json: unknown): string | null {
  const o = asRecord(json);
  if (!o) return null;
  const data = o.data;
  if (!Array.isArray(data) || data.length === 0) return null;
  const first = asRecord(data[0]);
  const id = first?.id;
  return typeof id === 'string' ? id : null;
}

function customerIdFromCreate(json: unknown): string | null {
  const o = asRecord(json);
  if (!o) return null;
  const id = o.id;
  return typeof id === 'string' ? id : null;
}

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim();
  return local && local.length > 0 ? local : 'Cliente';
}

/**
 * Resolves Asaas customer id for a user: DB → list by externalReference → create.
 * Requires ASAAS_DEFAULT_CUSTOMER_DOCUMENT (CPF/CNPJ digits) when creating a new customer.
 */
export async function ensureAsaasCustomerId(
  prisma: PrismaClient,
  client: AsaasClient,
  user: { id: string; email: string; asaasCustomerId: string | null }
): Promise<string> {
  if (user.asaasCustomerId) {
    return user.asaasCustomerId;
  }

  const listed = await client.listCustomers({ externalReference: user.id, limit: 5 });
  const fromList = firstCustomerIdFromList(listed);
  if (fromList) {
    await prisma.user.update({
      where: { id: user.id },
      data: { asaasCustomerId: fromList },
    });
    return fromList;
  }

  const doc = readAsaasDefaultCustomerDocumentRaw()?.replace(/\D/g, '') ?? '';
  if (!doc || doc.length < 11) {
    throw new Error(
      'ASAAS_DEFAULT_CUSTOMER_DOCUMENT is required (CPF/CNPJ digits) to create Asaas customers'
    );
  }

  const created = await client.createCustomer({
    name: displayNameFromEmail(user.email),
    email: user.email,
    cpfCnpj: doc,
    externalReference: user.id,
  });

  const newId = customerIdFromCreate(created);
  if (!newId) {
    throw new Error('Asaas create customer returned no id');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { asaasCustomerId: newId },
  });

  return newId;
}
