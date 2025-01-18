// Adicionar ao arquivo existente

export const ModificationType = {
  DESCONTO: 'DESCONTO',
  ACRESCIMO: 'ACRESCIMO',
  SERVICO_ADD: 'SERVICO_ADD',
  SERVICO_REMOVE: 'SERVICO_REMOVE',
} as const;

export type ModificationType = keyof typeof ModificationType;