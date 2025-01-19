const { faker } = require('@faker-js/faker/locale/pt_BR');
const fs = require('fs');
const path = require('path');

function generateMockContracts(count) {
  const contracts = Array.from({ length: count }, (_, index) => {
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
