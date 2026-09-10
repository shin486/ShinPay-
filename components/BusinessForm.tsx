'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createBusinessAction, updateBusinessAction, type ActionResult } from '@/lib/actions/business-actions';
import { FormError } from '@/components/ui';

export interface BusinessFormValues {
  name: string;
  code: string;
  description: string;
  address: string;
  contact_information: string;
}

export function BusinessForm({ initial, businessId }: { initial?: BusinessFormValues; businessId?: number }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    name: initial?.name || '',
    code: initial?.code || '',
    description: initial?.description || '',
    address: initial?.address || '',
    contact_information: initial?.contact_information || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res: ActionResult = businessId
        ? await updateBusinessAction(businessId, values)
        : await createBusinessAction(values);
      if (res.ok) router.push('/app/businesses');
      else setError(res.error || 'Something went wrong.');
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Business Name</label>
          <input id="name" name="name" className="input" required value={values.name} onChange={handleChange} placeholder="e.g. RA's Shuttle Services" />
        </div>
        <div>
          <label className="label" htmlFor="code">Business Code</label>
          <input id="code" name="code" className="input" required value={values.code} onChange={handleChange} placeholder="e.g. RASHUTTLE" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea id="description" name="description" className="input" rows={3} value={values.description} onChange={handleChange} />
      </div>
      <div>
        <label className="label" htmlFor="address">Address</label>
        <input id="address" name="address" className="input" value={values.address} onChange={handleChange} />
      </div>
      <div>
        <label className="label" htmlFor="contact_information">Contact Information</label>
        <input id="contact_information" name="contact_information" className="input" value={values.contact_information} onChange={handleChange} placeholder="Phone / email" />
      </div>
      <FormError error={error} />
      <div className="flex justify-end gap-2">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? 'Saving…' : businessId ? 'Update Business' : 'Add Business'}
        </button>
      </div>
    </form>
  );
}