import { format } from 'date-fns';
import { Contract } from '../types/contract';

export function formatContractValue(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function calculateContractDuration(contract: Contract): string {
  if (!contract.startDate || !contract.endDate) return 'N/A';
  
  const start = new Date(contract.startDate);
  const end = new Date(contract.endDate);
  
  const years = end.getFullYear() - start.getFullYear();
  const months = end.getMonth() - start.getMonth();
  
  return `${years} ano(s) e ${Math.abs(months)} mês(es)`;
}

export function isContractActive(contract: Contract): boolean {
  const now = new Date();
  const endDate = new Date(contract.endDate);
  return endDate > now;
}

export function formatContractDate(date: string | Date): string {
  return format(new Date(date), 'dd/MM/yyyy');
}
