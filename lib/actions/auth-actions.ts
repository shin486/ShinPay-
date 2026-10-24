'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  createSession,
  destroySession,
  verifyCredentials,
  getCurrentUser,
  registerUser,
  createOrganization,
} from '../auth';
import { recordAudit } from '../audit';
import { init } from '../init';
import { run, get } from '../db';
import { createClient, isSupabaseConfigured } from '../supabase/server';

export interface ActionResult {
  ok: boolean;
  error?: string;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  const usernameOrEmail = String(formData.get('username') || '').trim();
  const password = String(formData.get('password') || '');

  if (!usernameOrEmail || !password) {
    return { ok: false, error: 'Username or email and password are required.' };
  }

  // 1. If Supabase is configured, use Supabase Auth
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      let email = usernameOrEmail;

      // If user typed a username (no '@'), try to resolve their registered email
      if (!email.includes('@')) {
        try {
          const { data: resolvedEmail } = await supabase.rpc('get_email_by_identifier', {
            identifier: usernameOrEmail,
          });
          if (resolvedEmail && typeof resolvedEmail === 'string') {
            email = resolvedEmail;
          }
        } catch {
          // RPC might not exist yet; continue with username
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const msg = (error.message || '').toLowerCase();
        if (msg.includes('invalid login credentials')) {
          if (!usernameOrEmail.includes('@')) {
            return {
              ok: false,
              error: 'Invalid login credentials. Please sign in using your full registered email address (e.g. name@company.com), or ensure your email has been confirmed in Supabase.',
            };
          }
          return {
            ok: false,
            error: 'Invalid login credentials. Please check your email and password, or check if email confirmation is required in your Supabase Auth settings.',
          };
        }
        if (msg.includes('email not confirmed')) {
          return {
            ok: false,
            error: 'Email address has not been confirmed. Please check your email inbox or disable "Confirm email" in Supabase Auth settings.',
          };
        }
        return { ok: false, error: error.message };
      }

      if (data.user) {
        recordAudit(data.user.id, 'LOGIN', 'user', null, null);
      }

      return { ok: true };
    } catch {
      return { ok: false, error: 'Authentication service temporarily unavailable.' };
    }
  }

  // 2. SQLite session fallback
  try {
    init();
    const userId = verifyCredentials(usernameOrEmail, password);
    if (!userId) return { ok: false, error: 'Invalid username or password.' };

    createSession(userId);
    try {
      run("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", userId);
    } catch {
      // ignore
    }
    recordAudit(userId, 'LOGIN', 'user', userId, null);
    return { ok: true };
  } catch (err: any) {
    console.error('Login fallback error:', err);
    return {
      ok: false,
      error: 'Unable to connect to database. If running on Vercel, please verify that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in Project Settings > Environment Variables.',
    };
  }
}

export async function logoutAction(): Promise<void> {
  const user = await getCurrentUser();
  if (user) recordAudit(user.id, 'LOGOUT', 'user', null, null);
  await destroySession();
  redirect('/login');
}

export async function registerAction(formData: FormData): Promise<ActionResult> {
  const fullName = String(formData.get('full_name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const username = String(formData.get('username') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm_password') || '');

  if (!fullName || !email || !password) {
    return { ok: false, error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { ok: false, error: 'Passwords do not match.' };
  }

  // 1. Supabase registration
  if (isSupabaseConfigured()) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            display_name: fullName,
            username: username || email.split('@')[0],
          },
        },
      });

      if (error) {
        return { ok: false, error: error.message };
      }

      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          return {
            ok: false,
            error: 'An account with this email address already exists. Please go to the sign-in page to log in.',
          };
        }

        const orgName = `${fullName}'s Organization`;
        const slug = slugify(orgName) + '-' + Date.now().toString(36);

        try {
          await createOrganization({
            userId: data.user.id,
            name: orgName,
            slug,
            country: 'Philippines',
          });
        } catch (orgErr) {
          console.warn('Initial org creation deferred to setup wizard:', orgErr);
        }

        recordAudit(data.user.id, 'REGISTER', 'user', null, null);

        // If no session was returned, Supabase requires email verification
        if (!data.session) {
          return {
            ok: false,
            error: 'Account registered successfully! Supabase has email confirmation enabled. Please check your inbox to confirm your email, or turn off "Confirm email" in Supabase Dashboard (Authentication -> Providers -> Email) to sign in immediately.',
          };
        }
      }
    } catch (err) {
      console.error('Registration failed:', err);
      return { ok: false, error: 'Registration failed. Please try again.' };
    }

    redirect('/app');
  }

  // 2. SQLite registration fallback
  try {
    init();
    const dup = get('SELECT id FROM users WHERE username = ? OR email = ?', username, email);
    if (dup) return { ok: false, error: 'Username or email already in use.' };

    const userId = registerUser({ username, email, password, fullName });
    recordAudit(userId, 'REGISTER', 'user', userId, null);
    createSession(userId);
  } catch (err: any) {
    console.error('Registration fallback error:', err);
    return { ok: false, error: 'Registration failed. Please ensure Supabase environment variables are configured in Vercel.' };
  }

  redirect('/organization/setup');
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') || '').trim().toLowerCase();

  if (!email) {
    return { ok: false, error: 'Email address is required.' };
  }
  if (!email.includes('@') || !email.includes('.')) {
    return { ok: false, error: 'Please enter a valid email address.' };
  }

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    await supabase.auth.resetPasswordForEmail(email);
    return { ok: true };
  }

  init();
  const user = get('SELECT id, email FROM users WHERE email = ?', email) as { id: number; email: string } | undefined;
  if (user) {
    recordAudit(user.id, 'PASSWORD_RESET_REQUESTED', 'user', user.id, { email });
  }

  return { ok: true };
}

export async function resetPasswordAction(formData: FormData): Promise<ActionResult> {
  const password = String(formData.get('password') || '');
  const confirm = String(formData.get('confirm_password') || '');

  if (!password || !confirm) {
    return { ok: false, error: 'All fields are required.' };
  }
  if (password.length < 8) {
    return { ok: false, error: 'Password must be at least 8 characters.' };
  }
  if (password !== confirm) {
    return { ok: false, error: 'Passwords do not match.' };
  }

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  return { ok: true };
}

export async function createOrganizationAction(formData: FormData | Record<string, string>): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const getVal = (key: string) => {
    if (formData && typeof (formData as any).get === 'function') {
      return String((formData as FormData).get(key) || '').trim();
    }
    return String((formData as Record<string, string>)?.[key] || '').trim();
  };

  const name = getVal('name');
  const businessType = getVal('business_type');
  const country = getVal('country') || 'Philippines';
  const address = getVal('address');
  const contactNumber = getVal('contact_number');
  const email = getVal('email');

  if (!name) return { ok: false, error: 'Organization name is required.' };

  const slug = slugify(name) + '-' + Date.now().toString(36);

  try {
    const orgId = await createOrganization({
      userId: user.id,
      name,
      slug,
      businessType: businessType || undefined,
      country,
      address: address || undefined,
      contactNumber: contactNumber || undefined,
      email: email || undefined,
    });
    recordAudit(user.id, 'ORGANIZATION_CREATED', 'organization', orgId, { name });
    revalidatePath('/');
  } catch (err: any) {
    console.error('Failed to create organization action:', err);
    return {
      ok: false,
      error: err?.message || 'Could not create organization. Please try again.',
    };
  }

  redirect('/onboarding');
}

export async function changePasswordAction(input: {
  current: string;
  newPassword: string;
}): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  if (!input.current || !input.newPassword) return { ok: false, error: 'All fields are required.' };
  if (input.newPassword.length < 8) return { ok: false, error: 'New password must be at least 8 characters.' };

  if (isSupabaseConfigured()) {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: input.newPassword });
    if (error) return { ok: false, error: error.message };
    recordAudit(user.id, 'PASSWORD_CHANGED', 'user', null, null);
    return { ok: true };
  }

  init();
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const bcrypt = require('bcryptjs') as typeof import('bcryptjs');
  const row = get('SELECT password_hash FROM users WHERE id = ?', user.id) as { password_hash?: string };
  if (!bcrypt.compareSync(input.current, row?.password_hash || '')) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  const hash = bcrypt.hashSync(input.newPassword, 12);
  run('UPDATE users SET password_hash = ? WHERE id = ?', hash, user.id);
  recordAudit(user.id, 'PASSWORD_CHANGED', 'user', null, null);
  return { ok: true };
}