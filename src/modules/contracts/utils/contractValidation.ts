import { Contract } from '../types/contract';

export class ContractValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContractValidationError';
  }
}

export class ContractValidator {
  static validate(contract: Partial<Contract>): boolean {
    try {
      this.validateContract(contract);
      return true;
    } catch (error) {
      console.error('Erro de validação:', error);
      return false;
    }
  }

  static validateContract(contract: Partial<Contract>): void {
    const errors: string[] = [];

    // Validação do número do contrato
    if (!contract.number || contract.number.trim().length < 1) {
      errors.push('Número do contrato é obrigatório');
    }

    // Validação do cliente
    if (!contract.client || contract.client.trim().length < 3) {
      errors.push('Nome do cliente deve ter pelo menos 3 caracteres');
    }

    // Validação de valor
    if (contract.value === undefined || contract.value <= 0) {
      errors.push('Valor do contrato deve ser positivo');
    }

    // Validação de status
    const validStatuses = ['ATIVO', 'PENDENTE', 'CANCELADO', 'SUSPENSO'];
    if (contract.status && !validStatuses.includes(contract.status.toUpperCase())) {
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
      number: contract.number?.trim(),
      client: contract.client?.trim(),
      value: Number(contract.value?.toFixed(2)),
      status: contract.status?.toUpperCase(),
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
