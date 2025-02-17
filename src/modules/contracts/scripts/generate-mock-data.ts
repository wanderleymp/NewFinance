import { faker } from '@faker-js/faker/locale/pt_BR';
import fs from 'fs';
import path from 'path';

interface Contract {
  contract_id: number;
  contract_name: string;
  contract_value: string;
  start_date: string;
  end_date: string | null;
  recurrence_period: string;
  due_day: number;
  days_before_due: number;
  status: string;
  model_movement_id: number;
  last_billing_date: string;
  next_billing_date: string;
  contract_group_id: number;
  billing_reference: string;
  representative_person_id: number | null;
  commissioned_value: number | null;
  account_entry_id: number | null;
  last_decimo_billing_year: number | null;
  group_name: string;
  full_name: string;
}

interface ApiResponse {
  data: Contract[];
  meta: {
    currentPage: number;
    itemCount: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
  links: {
    first: string;
    previous: string | null;
    next: string;
    last: string;
  };
}

function generateMockContracts(count: number): ApiResponse {
  const contracts: Contract[] = Array.from({ length: count }, (_, index) => {
    const startDate = faker.date.past({ years: 5 });
    const lastBillingDate = faker.date.recent();
    const nextBillingDate = faker.date.future();

    return {
      contract_id: index + 1,
      contract_name: 'Contrato Honorarios Contabeis',
      contract_value: faker.finance.amount({ min: 100, max: 1000, dec: 2 }),
      start_date: startDate.toISOString(),
      end_date: null,
      recurrence_period: 'monthly',
      due_day: faker.number.int({ min: 1, max: 28 }),
      days_before_due: 15,
      status: 'active',
      model_movement_id: index + 1,
      last_billing_date: lastBillingDate.toISOString(),
      next_billing_date: nextBillingDate.toISOString(),
      contract_group_id: faker.helpers.arrayElement([1, 2]),
      billing_reference: faker.helpers.arrayElement(['current', 'next current']),
      representative_person_id: null,
      commissioned_value: null,
      account_entry_id: null,
      last_decimo_billing_year: faker.helpers.maybe(() => new Date().getFullYear(), { probability: 0.5 }) ?? null,
      group_name: faker.helpers.arrayElement(['Honorários Contábeis', 'Licença Colibri LP']),
      full_name: faker.company.name()
    };
  });

  return {
    data: contracts,
    meta: {
      currentPage: 1,
      itemCount: contracts.length,
      itemsPerPage: 10,
      totalItems: count,
      totalPages: Math.ceil(count / 10)
    },
    links: {
      first: '/contracts_recurring?page=1&limit=10',
      previous: null,
      next: '/contracts_recurring?page=2&limit=10',
      last: `/contracts_recurring?page=${Math.ceil(count / 10)}&limit=10`
    }
  };
}

function main() {
  const mockData = generateMockContracts(62);
  const outputPath = path.resolve(__dirname, '../services/mockContracts.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(mockData, null, 2), 'utf8');
  console.log(`Mock contracts generated and saved to ${outputPath}`);
}

main();
