'use client';

import { useState, useTransition } from 'react';
import { changePasswordAction } from '@/lib/actions/auth-actions';
import { FormError } from '@/components/ui';

export function PasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setMsg(null);
    if (newPassword !== confirm) { setError('New password and confirmation do not match.'); return; }
    startTransition(async () => {
      const res = await changePasswordAction({ current, newPassword });
      if (res.ok) { setMsg('Password updated.'); setCurrent(''); setNewPassword(''); setConfirm(''); }
      else setError(res.error || 'Could not change password.');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label">Current Password</label>
        <input type="password" className="input" value={current} onChange={(e) => setCurrent(e.target.value)} required />
      </div>
      <div>
        <label className="label">New Password</label>
        <input type="password" className="input" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} />
      </div>
      <div>
        <label className="label">Confirm New Password</label>
        <input type="password" className="input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
      </div>
      <FormError error={error} />
      <div className="flex items-center gap-3">
        <button type="submit" className="btn-primary" disabled={pending}>{pending ? 'Updating…' : 'Change Password'}</button>
        {msg && <p className="text-sm text-emerald-600">{msg}</p>}
      </div>
    </form>
  );
}