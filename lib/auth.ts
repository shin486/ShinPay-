import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { get, run, all, transaction } from './db';
import { createClient, isSupabaseConfigured } from './supabase/server';
import { createAdminClient } from './supabase/admin';

const COOKIE_NAME = 'shinex_session';
const SESSION_DAYS = 7;

export interface SessionUser {
  id: string | number;
  username: string;
  email: string;
  full_name: string;
  display_name: string;
  role: string;
  organization_id: number | null;
  organization_name: string | null;
  organization_role: string | null;
}

/** Create a session row and set the httpOnly cookie (SQLite fallback). */
export function createSession(userId: number): void {
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  run(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
    token,
    userId,
    now.toISOString(),
    expires.toISOString()
  );
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires,
  });
}

/** Resolve the current session into the logged-in user, or null. Supports Supabase and SQLite. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  // 1. If Supabase is configured, use Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;

      // Query active organization membership
      const db = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase;
      const { data: member } = await db
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations (
            id,
            name
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      const org = member?.organizations as unknown as { id: number; name: string } | null;
      let orgId = member?.organization_id ?? org?.id ?? null;
      let orgName = org?.name ?? null;
      let orgRole = member?.role ?? 'member';

      // Fallback: Check if user owns an organization directly
      if (!orgId) {
        const { data: ownedOrg } = await db
          .from('organizations')
          .select('id, name')
          .eq('owner_id', user.id)
          .limit(1)
          .maybeSingle();

        if (ownedOrg) {
          orgId = Number(ownedOrg.id);
          orgName = ownedOrg.name;
          orgRole = 'owner';
        }
      }

      return {
        id: user.id,
        username: user.email?.split('@')[0] || 'user',
        email: user.email || '',
        full_name: (user.user_metadata?.full_name as string) || (user.user_metadata?.name as string) || user.email?.split('@')[0] || 'User',
        display_name: (user.user_metadata?.display_name as string) || user.email?.split('@')[0] || 'User',
        role: (user.user_metadata?.role as string) || 'member',
        organization_id: orgId,
        organization_name: orgName,
        organization_role: orgRole,
      };
    } catch (e) {
      console.error('Error fetching Supabase user:', e);
      return null;
    }
  }

  // 2. SQLite session fallback
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const row = get(
    `SELECT s.id AS sid, u.id, u.username, u.email, u.full_name, u.display_name, u.role,
            om.organization_id, om.role AS organization_role, o.name AS organization_name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN organization_members om ON om.user_id = u.id AND om.status = 'active'
     LEFT JOIN organizations o ON o.id = om.organization_id
     WHERE s.id = ? AND s.expires_at > datetime('now') AND u.status = 'active'`,
    token
  );
  if (!row) return null;

  let orgId = row.organization_id ? Number(row.organization_id) : null;
  let orgName = row.organization_name ? String(row.organization_name) : null;
  let orgRole = row.organization_role ? String(row.organization_role) : null;

  if (!orgId) {
    const defaultOrg = get('SELECT id, name FROM organizations ORDER BY id ASC LIMIT 1') as
      | { id: number; name: string }
      | undefined;
    if (defaultOrg) {
      orgId = Number(defaultOrg.id);
      orgName = String(defaultOrg.name);
      orgRole = 'owner';
      try {
        run(
          'INSERT OR IGNORE INTO organization_members (organization_id, user_id, role, status) VALUES (?, ?, ?, ?)',
          orgId,
          Number(row.id),
          'owner',
          'active'
        );
      } catch {
        // ignore
      }
    }
  }

  return {
    id: Number(row.id),
    username: String(row.username),
    email: String(row.email ?? ''),
    full_name: String(row.full_name ?? ''),
    display_name: String(row.display_name),
    role: String(row.role),
    organization_id: orgId,
    organization_name: orgName,
    organization_role: orgRole,
  };
}

/** Ensure the caller is an authenticated user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('UNAUTHORIZED');
  }
  return user;
}

/** Ensure the caller belongs to an organization. */
export async function requireOrganization(): Promise<SessionUser> {
  const user = await requireUser();
  if (!user.organization_id) {
    throw new Error('NO_ORGANIZATION');
  }
  return user;
}

export async function destroySession(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  const store = cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      run('DELETE FROM sessions WHERE id = ?', token);
    } catch {
      // ignore
    }
  }
  store.delete(COOKIE_NAME);
}

/** Verify credentials; returns the user id or null (SQLite fallback). */
export function verifyCredentials(username: string, password: string): number | null {
  const row = get('SELECT id, username, password_hash, status FROM users WHERE username = ? OR email = ?', username, username);
  if (!row || String(row.status) !== 'active') return null;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
  const ok = bcrypt.compareSync(password, String(row.password_hash));
  return ok ? Number(row.id) : null;
}

/** Register a new user. Returns the user id (SQLite fallback). */
export function registerUser(input: {
  username: string;
  email: string;
  password: string;
  fullName: string;
}): number {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
  const hash = bcrypt.hashSync(input.password, 12);
  const res = run(
    'INSERT INTO users (username, email, password_hash, display_name, full_name, role) VALUES (?, ?, ?, ?, ?, ?)',
    input.username,
    input.email,
    hash,
    input.fullName,
    input.fullName,
    'owner'
  );
  return res.lastInsertRowid;
}

/** Create an organization and add the user as owner. */
export async function createOrganization(input: {
  userId: string | number;
  name: string;
  slug: string;
  businessType?: string;
  country?: string;
  address?: string;
  contactNumber?: string;
  email?: string;
}): Promise<number> {
  if (isSupabaseConfigured()) {
    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : createClient();

    // 1. Try atomic PostgreSQL function (bypasses multi-step RLS and executes in a single transaction)
    try {
      const { data: rpcOrgId, error: rpcErr } = await supabase.rpc('create_organization_for_user', {
        org_name: input.name,
        org_slug: input.slug,
        org_business_type: input.businessType || null,
        org_country: input.country || 'Philippines',
        org_address: input.address || null,
        org_contact_number: input.contactNumber || null,
        org_email: input.email || null,
      });
      if (!rpcErr && rpcOrgId) {
        return Number(rpcOrgId);
      }
    } catch {
      // Fallback to direct client inserts
    }

    // 2. Direct table insert fallback
    const { data: orgData, error: orgErr } = await supabase
      .from('organizations')
      .insert({
        name: input.name,
        slug: input.slug,
        owner_id: String(input.userId),
        business_type: input.businessType || null,
        country: input.country || 'Philippines',
        address: input.address || null,
        contact_number: input.contactNumber || null,
        email: input.email || null,
      })
      .select('id')
      .single();

    if (orgErr || !orgData) {
      console.error('Direct organization insert failed:', orgErr);
      throw new Error(orgErr?.message || 'Failed to create organization');
    }

    const orgId = Number(orgData.id);

    const { error: memberErr } = await supabase.from('organization_members').insert({
      organization_id: orgId,
      user_id: String(input.userId),
      role: 'owner',
      status: 'active',
    });
    if (memberErr) {
      console.error('Member insert error:', memberErr);
    }

    const { error: subErr } = await supabase.from('subscriptions').insert({
      organization_id: orgId,
      plan: 'free',
      employee_limit: 10,
      business_limit: 1,
    });
    if (subErr) {
      console.error('Subscription insert error:', subErr);
    }

    const steps = ['organization_created', 'business_added', 'employee_added', 'compensation_configured', 'first_payroll'];
    for (const step of steps) {
      await supabase.from('onboarding_steps').insert({
        organization_id: orgId,
        step,
        completed: step === 'organization_created' ? 1 : 0,
      });
    }

    return orgId;
  }

  // SQLite fallback
  let orgId = 0;
  transaction(() => {
    const res = run(
      'INSERT INTO organizations (name, slug, owner_id, business_type, country, address, contact_number, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      input.name,
      input.slug,
      Number(input.userId),
      input.businessType || null,
      input.country || 'Philippines',
      input.address || null,
      input.contactNumber || null,
      input.email || null
    );
    orgId = res.lastInsertRowid;
    run(
      'INSERT INTO organization_members (organization_id, user_id, role) VALUES (?, ?, ?)',
      orgId,
      Number(input.userId),
      'owner'
    );
    run(
      'INSERT INTO subscriptions (organization_id, plan, employee_limit, business_limit) VALUES (?, ?, ?, ?)',
      orgId,
      'free',
      10,
      1
    );
    const steps = ['organization_created', 'business_added', 'employee_added', 'compensation_configured', 'first_payroll'];
    for (const step of steps) {
      run(
        'INSERT INTO onboarding_steps (organization_id, step, completed) VALUES (?, ?, ?)',
        orgId,
        step,
        step === 'organization_created' ? 1 : 0
      );
    }
  });
  return orgId;
}

/** Mark an onboarding step as complete. */
export async function completeOnboardingStep(organizationId: number, step: string): Promise<void> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase
      .from('onboarding_steps')
      .update({ completed: 1, completed_at: new Date().toISOString() })
      .eq('organization_id', organizationId)
      .eq('step', step);
    return;
  }

  run(
    "UPDATE onboarding_steps SET completed = 1, completed_at = datetime('now') WHERE organization_id = ? AND step = ?",
    organizationId,
    step
  );
}

/** Get onboarding progress for an organization. */
export async function getOnboardingProgress(organizationId: number): Promise<{ completed: number; total: number; steps: Array<{ step: string; completed: boolean }> }> {
  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { data: rows } = await supabase
      .from('onboarding_steps')
      .select('step, completed')
      .eq('organization_id', organizationId)
      .order('id', { ascending: true });

    const stepRows = rows || [];
    const completed = stepRows.filter((r) => Number(r.completed) === 1).length;
    return {
      completed,
      total: stepRows.length,
      steps: stepRows.map((r) => ({ step: String(r.step), completed: Number(r.completed) === 1 })),
    };
  }

  const rows = all('SELECT step, completed FROM onboarding_steps WHERE organization_id = ? ORDER BY id', organizationId) as Array<{ step: string; completed: number }>;
  const completed = rows.filter((r) => Number(r.completed) === 1).length;
  return { completed, total: rows.length, steps: rows.map((r) => ({ step: String(r.step), completed: Number(r.completed) === 1 })) };
}