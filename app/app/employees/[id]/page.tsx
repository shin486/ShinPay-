import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettingsAsync } from '@/lib/settings';
import { formatMoney, formatDate, fullName } from '@/lib/format';
import { getEmployeeDetail } from '@/lib/queries';
import { PageHeader, Card, StatusBadge, EmptyState } from '@/components/ui';
import { EmployeeActions } from '@/components/EmployeeActions';
import { SalaryManager } from '@/components/SalaryManager';
import { EarningsManager, type EarningRow } from '@/components/EarningsManager';
import { DeductionsManager, type DeductionRow } from '@/components/DeductionsManager';
import { Pencil, Mail, Phone, MapPin, Briefcase, CalendarDays, Wallet } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const id = Number(params.id);

  const detail = await getEmployeeDetail(id, orgId);
  if (!detail || !detail.emp) return <EmptyState title="Employee not found" />;

  const emp = detail.emp as Record<string, unknown>;
  const business = detail.business as { name: string } | null;
  const salary = detail.salary as Record<string, unknown> | null;
  const salaryHistory = detail.salaryHistory as Array<Record<string, unknown>>;
  const earningTypes = detail.earningTypes;
  const deductionTypes = detail.deductionTypes;
  const earnings = detail.earnings as unknown as EarningRow[];
  const deductions = detail.deductions as unknown as DeductionRow[];
  const payrollHistory = detail.payrollHistory as Array<Record<string, unknown>>;

  const settings = await getSettingsAsync();
  const sym = settings.currency_symbol || '\u20B1';

  return (
    <div>
      <PageHeader
        title={fullName(emp)}
        subtitle={`${String(emp.employee_id)} • ${String(business?.name ?? '')}`}
        actions={
          <div className="flex gap-2">
            <Link href={`/app/employees/${id}/edit`} className="btn-secondary"><Pencil className="h-4 w-4" /> Edit</Link>
            <EmployeeActions id={id} status={String(emp.status)} />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card title="Personal Information">
            <dl className="space-y-3 text-sm">
              <div className="flex items-start gap-2"><Briefcase className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600">{String(emp.position || '—')}</dd></div>
              <div className="flex items-start gap-2"><Mail className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600">{String(emp.email || '—')}</dd></div>
              <div className="flex items-start gap-2"><Phone className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600">{String(emp.contact_number || '—')}</dd></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600">{String(emp.address || '—')}</dd></div>
              <div className="flex items-start gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-slate-400" /><dd className="text-slate-600">Hired {formatDate(String(emp.date_hired))} • Born {formatDate(String(emp.date_of_birth))}</dd></div>
            </dl>
          </Card>

          <Card title="Current Salary">
            {salary ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-emerald-600"><Wallet className="h-5 w-5" /><span className="text-2xl font-bold text-slate-800">{formatMoney(salary.basic_rate as number, sym)}</span></div>
                <p className="text-sm capitalize text-slate-500">{String(salary.salary_type)} • {String(salary.payroll_frequency).replace('-', ' ')}</p>
                {!!salary.effective_date && <p className="text-xs text-slate-400">Effective {formatDate(String(salary.effective_date))}</p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No salary configured.</p>
            )}
          </Card>

          <Card title="Employment Status"><StatusBadge status={String(emp.status)} /></Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card title="Update Salary">
            <SalaryManager
              employeeId={id}
              salaryType={salary ? String(salary.salary_type) : 'monthly'}
              basicRate={salary ? Number(salary.basic_rate) : 0}
              payrollFrequency={salary ? String(salary.payroll_frequency) : 'semi-monthly'}
              effectiveDate={salary?.effective_date ? String(salary.effective_date) : undefined}
            />
          </Card>

          {salaryHistory.length > 1 && (
            <Card title="Salary History">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {salaryHistory.map((s) => (
                      <tr key={String(s.id)}>
                        <td className="py-2 font-medium text-slate-700 capitalize">{String(s.salary_type)}</td>
                        <td className="py-2 text-right text-slate-600">{formatMoney(Number(s.basic_rate), sym)}</td>
                        <td className="py-2 text-right text-slate-500 capitalize">{String(s.payroll_frequency).replace('-', ' ')}</td>
                        <td className="py-2 text-right text-xs text-slate-400">Effective {formatDate(String(s.effective_date))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          <Card title="Earnings">
            <EarningsManager employeeId={id} types={earningTypes} earnings={earnings} symbol={sym} />
          </Card>

          <Card title="Deductions">
            <DeductionsManager employeeId={id} types={deductionTypes} deductions={deductions} symbol={sym} />
          </Card>

          <Card title="Payroll History">
            {payrollHistory.length === 0 ? (
              <p className="text-sm text-slate-400">No payroll processed for this employee yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                  <thead><tr><th className="th">Period</th><th className="th text-right">Gross</th><th className="th text-right">Deductions</th><th className="th text-right">Net</th><th className="th">Status</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {payrollHistory.map((ph) => (
                      <tr key={String(ph.id)} className="hover:bg-slate-50">
                        <td className="td">{formatDate(String(ph.payroll_period_start))} — {formatDate(String(ph.payroll_period_end))}</td>
                        <td className="td text-right">{formatMoney(Number(ph.gross_pay), sym)}</td>
                        <td className="td text-right">{formatMoney(Number(ph.total_deductions), sym)}</td>
                        <td className="td text-right">{formatMoney(Number(ph.net_pay), sym)}</td>
                        <td className="td"><StatusBadge status={String(ph.status)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
