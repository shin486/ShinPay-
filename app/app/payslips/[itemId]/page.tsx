import Link from 'next/link';
import { redirect } from 'next/navigation';
import { all, get } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { init } from '@/lib/init';
import { getSettings, getSetting } from '@/lib/settings';
import { fullName } from '@/lib/format';
import { EmptyState } from '@/components/ui';
import { Payslip } from '@/components/Payslip';
import { PrintButton } from '@/components/PrintButton';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PayslipPage({ params }: { params: { itemId: string } }) {
  init();
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  const orgId = user.organization_id;
  const itemId = Number(params.itemId);

  const item = get('SELECT * FROM payroll_items WHERE id = ?', itemId) as Record<string, unknown> | undefined;
  if (!item) return <EmptyState title="Payslip not found" message="This employee pay slip does not exist." />;

  const payroll = get('SELECT * FROM payroll WHERE id = ? AND organization_id = ?', Number(item.payroll_id), orgId) as Record<string, unknown> | undefined;
  const employee = get('SELECT * FROM employees WHERE id = ? AND organization_id = ?', Number(item.employee_id), orgId) as Record<string, unknown> | undefined;
  const business = payroll ? (get('SELECT name FROM businesses WHERE id = ? AND organization_id = ?', Number(payroll.business_id), orgId) as { name: string } | undefined) : undefined;

  const settings = getSettings();
  const sym = settings.currency_symbol || '₱';
  const systemName = getSetting('system_name', 'ShinPay+ Workforce OS');

  const earnings = all(
    'SELECT name, amount FROM payroll_item_earnings WHERE payroll_item_id = ? ORDER BY id',
    itemId
  );
  const deductions = all(
    'SELECT name, amount FROM payroll_item_deductions WHERE payroll_item_id = ? ORDER BY id',
    itemId
  );

  if (!payroll || !employee) return <EmptyState title="Payslip data missing" message="Could not resolve payroll run or employee record." />;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Breadcrumbs & Print Action Bar ── */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <Link
          href={`/app/payslips?payroll=${String(item.payroll_id)}`}
          className="btn-ghost text-xs flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Payslips List</span>
        </Link>

        <div className="flex items-center gap-2">
          <PrintButton label="Print / Save as PDF" className="btn-primary" />
        </div>
      </div>

      <Payslip
        systemName={systemName}
        symbol={sym}
        employee={{
          name: fullName(employee),
          employee_id: String(employee.employee_id),
          position: employee.position ? String(employee.position) : undefined,
          business_name: business?.name,
          tin: employee.tin ? String(employee.tin) : undefined,
          sss_no: employee.sss_no ? String(employee.sss_no) : undefined,
          philhealth_no: employee.philhealth_no ? String(employee.philhealth_no) : undefined,
          pagibig_no: employee.pagibig_no ? String(employee.pagibig_no) : undefined,
        }}
        payroll={{
          periodStart: String(payroll.payroll_period_start),
          periodEnd: String(payroll.payroll_period_end),
          payDate: String(payroll.pay_date),
          batchRef: `PAY-PH-${String(payroll.payroll_period_end).replace(/-/g, '')}-${String(employee.employee_id)}`,
        }}
        item={{
          basic_pay: Number(item.basic_pay),
          overtime: Number(item.overtime),
          allowances: Number(item.allowances),
          bonuses: Number(item.bonuses),
          commissions: Number(item.commissions),
          other_earnings: Number(item.other_earnings),
          gross_pay: Number(item.gross_pay),
          total_deductions: Number(item.total_deductions),
          net_pay: Number(item.net_pay),
        }}
        earnings={earnings as { name: string; amount: number }[]}
        deductions={deductions as { name: string; amount: number }[]}
      />
    </div>
  );
}