'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '../auth';
import { recordAudit } from '../audit';
import { get, run } from '../db';
import { firstError, required } from '../validators';
import { init } from '../init';
import { createClient, isSupabaseConfigured } from '../supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
  id?: number;
}

export interface BusinessInput {
  name: string;
  code: string;
  description?: string;
  address?: string;
  contact_information?: string;
}

export async function createBusinessAction(input: BusinessInput): Promise<ActionResult> {
  const user = await requireUser();
  const err = firstError([
    required(input.name, 'Business name'),
    required(input.code, 'Business code'),
  ]);
  if (err) return { ok: false, error: err };

  const code = input.code.trim().toUpperCase();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: dup } = await supabase
      .from('businesses')
      .select('id')
      .eq('code', code)
      .eq('organization_id', orgId)
      .maybeSingle();

    if (dup) return { ok: false, error: 'A business with this code already exists.' };

    const { data: b, error } = await supabase
      .from('businesses')
      .insert({
        organization_id: orgId,
        name: input.name.trim(),
        code,
        description: input.description?.trim() || null,
        address: input.address?.trim() || null,
        contact_information: input.contact_information?.trim() || null,
      })
      .select('id')
      .single();

    if (error || !b) {
      return { ok: false, error: error?.message || 'Failed to create business entity.' };
    }

    const id = Number(b.id);
    recordAudit(user.id, 'BUSINESS_CREATED', 'business', id, { name: input.name.trim(), code });
    revalidatePath('/app/businesses');
    revalidatePath('/');
    return { ok: true, id };
  }

  init();
  const dup = get('SELECT id FROM businesses WHERE code = ? AND organization_id = ?', code, orgId);
  if (dup) return { ok: false, error: 'A business with this code already exists.' };

  const res = run(
    `INSERT INTO businesses (organization_id, name, code, description, address, contact_information)
     VALUES (?, ?, ?, ?, ?, ?)`,
    orgId,
    input.name.trim(),
    code,
    input.description?.trim() || null,
    input.address?.trim() || null,
    input.contact_information?.trim() || null
  );
  const id = res.lastInsertRowid;
  recordAudit(user.id, 'BUSINESS_CREATED', 'business', id, { name: input.name.trim(), code });
  revalidatePath('/app/businesses');
  revalidatePath('/');
  return { ok: true, id };
}

export async function updateBusinessAction(id: number, input: BusinessInput): Promise<ActionResult> {
  const user = await requireUser();
  const err = firstError([
    required(input.name, 'Business name'),
    required(input.code, 'Business code'),
  ]);
  if (err) return { ok: false, error: err };

  const code = input.code.trim().toUpperCase();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: dup } = await supabase
      .from('businesses')
      .select('id')
      .eq('code', code)
      .eq('organization_id', orgId)
      .neq('id', id)
      .maybeSingle();

    if (dup) return { ok: false, error: 'A business with this code already exists.' };

    await supabase
      .from('businesses')
      .update({
        name: input.name.trim(),
        code,
        description: input.description?.trim() || null,
        address: input.address?.trim() || null,
        contact_information: input.contact_information?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('organization_id', orgId);

    recordAudit(user.id, 'BUSINESS_UPDATED', 'business', id, { name: input.name.trim(), code });
    revalidatePath('/app/businesses');
    revalidatePath('/');
    return { ok: true, id };
  }

  init();
  const dup = get('SELECT id FROM businesses WHERE code = ? AND organization_id = ? AND id <> ?', code, orgId, id);
  if (dup) return { ok: false, error: 'A business with this code already exists.' };

  run(
    `UPDATE businesses SET name = ?, code = ?, description = ?, address = ?,
       contact_information = ?, updated_at = datetime('now') WHERE id = ? AND organization_id = ?`,
    input.name.trim(),
    code,
    input.description?.trim() || null,
    input.address?.trim() || null,
    input.contact_information?.trim() || null,
    id,
    orgId
  );
  recordAudit(user.id, 'BUSINESS_UPDATED', 'business', id, { name: input.name.trim(), code });
  revalidatePath('/app/businesses');
  revalidatePath('/');
  return { ok: true, id };
}

export async function deactivateBusinessAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('businesses')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', orgId);
    recordAudit(user.id, 'BUSINESS_DEACTIVATED', 'business', id, null);
    revalidatePath('/app/businesses');
    return { ok: true };
  }

  init();
  run(
    `UPDATE businesses SET status = 'inactive', updated_at = datetime('now') WHERE id = ? AND organization_id = ?`,
    id,
    orgId
  );
  recordAudit(user.id, 'BUSINESS_DEACTIVATED', 'business', id, null);
  revalidatePath('/app/businesses');
  return { ok: true };
}

export async function reactivateBusinessAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('businesses')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('organization_id', orgId);
    recordAudit(user.id, 'BUSINESS_REACTIVATED', 'business', id, null);
    revalidatePath('/app/businesses');
    return { ok: true };
  }

  init();
  run(
    `UPDATE businesses SET status = 'active', updated_at = datetime('now') WHERE id = ? AND organization_id = ?`,
    id,
    orgId
  );
  recordAudit(user.id, 'BUSINESS_REACTIVATED', 'business', id, null);
  revalidatePath('/app/businesses');
  return { ok: true };
}

export async function deleteBusinessAction(id: number): Promise<ActionResult> {
  const user = await requireUser();
  const orgId = user.organization_id;
  if (!orgId) return { ok: false, error: 'No active organization.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { count } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', id);

    if (count && count > 0) {
      return { ok: false, error: 'This business has employees and cannot be deleted. You can deactivate it instead.' };
    }

    await supabase.from('businesses').delete().eq('id', id).eq('organization_id', orgId);
    recordAudit(user.id, 'BUSINESS_DELETED', 'business', id, null);
    revalidatePath('/app/businesses');
    return { ok: true };
  }

  init();
  const emps = get('SELECT COUNT(*) AS c FROM employees WHERE business_id = ?', id) as { c: number };
  if (Number(emps.c) > 0) {
    return { ok: false, error: 'This business has employees and cannot be deleted. You can deactivate it instead.' };
  }
  run('DELETE FROM businesses WHERE id = ? AND organization_id = ?', id, orgId);
  recordAudit(user.id, 'BUSINESS_DELETED', 'business', id, null);
  revalidatePath('/app/businesses');
  return { ok: true };
}