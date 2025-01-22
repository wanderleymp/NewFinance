import { Contract } from '../types/contract';

export class ContractValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractValidationError';
  }
}

export class ContractValidator {
  static validateContract(contract: Partial<Contract>): void {
    const errors: string[] = [];

    // Validação de nome
    if (!contract.name || contract.name.trim().length < 3) {
      errors.push('Nome do contrato deve ter pelo menos 3 caracteres');
    }

    // Validação de valor
    if (contract.value === undefined || contract.value <= 0) {
      errors.push('Valor do contrato deve ser positivo');
    }

    // Validação de data
    if (contract.startDate) {
      const startDate = new Date(contract.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push('Data de início inválida');
      }
    }

    // Validação de status
    const validStatuses = ['ativo', 'inativo', 'pendente'];
    if (contract.status && !validStatuses.includes(contract.status)) {
      errors.push(`Status inválido. Opções válidas: ${validStatuses.join(', ')}`);
    }

    // Lançar erro se houver problemas
    if (errors.length > 0) {
      throw new ContractValidationError(errors.join('; '));
    }
  }

  static sanitizeContract(contract: Partial<Contract>): Partial<Contract> {
    return {
      ...contract,
      name: contract.name?.trim(),
      value: Number(contract.value?.toFixed(2)),
      createdAt: contract.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// Função de log centralizada
export function logContractAction(action: string, details: any) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    action,
    details
  }, null, 2));
}
