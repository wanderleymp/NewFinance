import { faker } from '@faker-js/faker/locale/pt_BR';
import fs from 'fs';
import path from 'path';

interface Contract {
  id: string;
  name: string;
  personId: string;
  currentValue: number;
  status: 'ativo' | 'inativo' | 'pendente';
  group: string;
  nextBillingDate: string;
  startDate: string;
  endDate: string;
}

interface Person {
  id: string;
  name: string;
  document: string;
  type: 'pf' | 'pj';
}

function generateCPF(): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n1 = randomDigit();
  const n2 = randomDigit();
  const n3 = randomDigit();
  const n4 = randomDigit();
  const n5 = randomDigit();
  const n6 = randomDigit();
  const n7 = randomDigit();
  const n8 = randomDigit();
  const n9 = randomDigit();

  let d1 = n9 * 10 + n8 * 9 + n7 * 8 + n6 * 7 + n5 * 6 + n4 * 5 + n3 * 4 + n2 * 3 + n1 * 2;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  let d2 = d1 * 10 + n9 * 9 + n8 * 8 + n7 * 7 + n6 * 6 + n5 * 5 + n4 * 4 + n3 * 3 + n2 * 2 + n1 * 1;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

function generateCNPJ(): string {
  const randomDigit = () => Math.floor(Math.random() * 10);
  const n1 = randomDigit();
  const n2 = randomDigit();
  const n3 = randomDigit();
  const n4 = randomDigit();
  const n5 = randomDigit();
  const n6 = randomDigit();
  const n7 = randomDigit();
  const n8 = randomDigit();
  const n9 = randomDigit();
  const n10 = randomDigit();
  const n11 = randomDigit();
  const n12 = randomDigit();

  const d1 = n12 * 2 + n11 * 3 + n10 * 4 + n9 * 5 + n8 * 6 + n7 * 7 + n6 * 8 + n5 * 9 + n4 * 2 + n3 * 3 + n2 * 4 + n1 * 5;
  const d2 = d1 % 11 < 2 ? 0 : 11 - (d1 % 11);

  const d3 = (d2 * 2 + n12 * 3 + n11 * 4 + n10 * 5 + n9 * 6 + n8 * 7 + n7 * 8 + n6 * 9 + n5 * 2 + n4 * 3 + n3 * 4 + n2 * 5 + n1 * 6) % 11;
  const d4 = d3 < 2 ? 0 : 11 - d3;

  return `${n1}${n2}.${n3}${n4}${n5}.${n6}${n7}${n8}/${n9}${n10}${n11}${n12}-${d1}${d2}`;
}

function generateMockPeople(count: number): Person[] {
  return Array.from({ length: count }, () => {
    const type = faker.helpers.arrayElement(['pf', 'pj']);
    return {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      document: type === 'pf' ? generateCPF() : generateCNPJ(),
      type
    };
  });
}

function generateMockContracts(people: Person[], count: number): Contract[] {
  return Array.from({ length: count }, () => {
    const person = faker.helpers.arrayElement(people);
    const startDate = faker.date.past({ years: 2 });
    const endDate = faker.date.future({ years: 2, refDate: startDate });

    return {
      id: faker.string.uuid(),
      name: `Contrato ${faker.commerce.productName()}`,
      personId: person.id,
      currentValue: parseFloat(faker.finance.amount({ min: 500, max: 50000, dec: 2 })),
      status: faker.helpers.arrayElement(['ativo', 'inativo', 'pendente']),
      group: faker.helpers.arrayElement(['Serviços', 'Produtos', 'Consultoria', 'Manutenção']),
      nextBillingDate: faker.date.future({ years: 1 }).toISOString(),
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  });
}

function main() {
  const people = generateMockPeople(50);
  const contracts = generateMockContracts(people, 100);

  const mockData = {
    people,
    contracts
  };

  const outputDir = path.resolve(__dirname, '../services');
  const outputFile = path.join(outputDir, 'mockData.ts');

  // Garantir que o diretório exista
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(
    outputFile, 
    `export const mockData = ${JSON.stringify(mockData, null, 2)} as const;`
  );

  console.log(`Mock data generated successfully at ${outputFile}`);
}

main();
