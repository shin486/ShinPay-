/**
 * Optional initial setup for the client's current businesses and employees.
 * IMPORTANT: This data is NOT part of the application core. It is only loaded
 * when the administrator explicitly clicks "Load sample setup" on the Settings
 * page. All records are editable/deactivatable afterwards, and nothing here is
 * assumed to be fixed. Names/positions are editable placeholders.
 */

export const SAMPLE_BUSINESSES = [
  { name: "R'S Place Water Refilling Station", code: 'RSPLACE', description: 'Water refilling station' },
  { name: 'AutoAvenue Car Care Center', code: 'AUTOCARE', description: 'Car care and detailing center' },
  { name: 'DVL Pharmacy', code: 'DVLPH', description: 'Retail pharmacy' },
  { name: 'Auto Avenue Automotive Parts Store', code: 'AUTOPARTS', description: 'Automotive parts retailer' },
  { name: "RA's Shuttle Services", code: 'RASHUTTLE', description: 'Shuttle and transport services' },
];

export interface SampleEmployee {
  employee_id: string;
  business_code: string;
  first_name: string;
  last_name: string;
  position: string;
  salary_type: string;
  basic_rate: number;
  payroll_frequency: string;
  employment_status: string;
}

export const SAMPLE_EMPLOYEES: SampleEmployee[] = [
  // R'S Place Water Refilling Station - 3
  { employee_id: 'RSP-001', business_code: 'RSPLACE', first_name: 'Maria', last_name: 'Santos', position: 'Station Manager', salary_type: 'monthly', basic_rate: 16000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
  { employee_id: 'RSP-002', business_code: 'RSPLACE', first_name: 'Juan', last_name: 'Dela Cruz', position: 'Refiller', salary_type: 'daily', basic_rate: 400, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RSP-003', business_code: 'RSPLACE', first_name: 'Pedro', last_name: 'Reyes', position: 'Delivery Driver', salary_type: 'daily', basic_rate: 420, payroll_frequency: 'weekly', employment_status: 'Regular' },
  // AutoAvenue Car Care Center - 2
  { employee_id: 'AAC-001', business_code: 'AUTOCARE', first_name: 'Carlo', last_name: 'Mendoza', position: 'Service Manager', salary_type: 'monthly', basic_rate: 18000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
  { employee_id: 'AAC-002', business_code: 'AUTOCARE', first_name: 'Ramon', last_name: 'Garcia', position: 'Auto Detailer', salary_type: 'daily', basic_rate: 450, payroll_frequency: 'weekly', employment_status: 'Regular' },
  // DVL Pharmacy - 1
  { employee_id: 'DVL-001', business_code: 'DVLPH', first_name: 'Liza', last_name: 'Torres', position: 'Pharmacist', salary_type: 'monthly', basic_rate: 20000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
  // Auto Avenue Automotive Parts Store - 1
  { employee_id: 'AAP-001', business_code: 'AUTOPARTS', first_name: 'Mark', last_name: 'Villanueva', position: 'Store Clerk', salary_type: 'monthly', basic_rate: 14000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
  // RA's Shuttle Services - 10
  { employee_id: 'RAS-001', business_code: 'RASHUTTLE', first_name: 'Antonio', last_name: 'Ramos', position: 'Operations Manager', salary_type: 'monthly', basic_rate: 22000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
  { employee_id: 'RAS-002', business_code: 'RASHUTTLE', first_name: 'Jose', last_name: 'Aquino', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-003', business_code: 'RASHUTTLE', first_name: 'Ben', last_name: 'Lim', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-004', business_code: 'RASHUTTLE', first_name: 'Dan', last_name: 'Ocampo', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-005', business_code: 'RASHUTTLE', first_name: 'Earl', last_name: 'Bautista', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-006', business_code: 'RASHUTTLE', first_name: 'Fred', last_name: 'Salazar', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-007', business_code: 'RASHUTTLE', first_name: 'Gary', last_name: 'Domingo', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-008', business_code: 'RASHUTTLE', first_name: 'Henry', last_name: 'Navarro', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-009', business_code: 'RASHUTTLE', first_name: 'Ivan', last_name: 'Pascual', position: 'Shuttle Driver', salary_type: 'daily', basic_rate: 480, payroll_frequency: 'weekly', employment_status: 'Regular' },
  { employee_id: 'RAS-010', business_code: 'RASHUTTLE', first_name: 'Kevin', last_name: 'Alvarez', position: 'Route Supervisor', salary_type: 'monthly', basic_rate: 17000, payroll_frequency: 'semi-monthly', employment_status: 'Regular' },
];