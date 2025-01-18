import { 
  formatContractValue, 
  calculateContractDuration, 
  isContractActive, 
  formatContractDate 
} from '../utils';

describe('Utilitários de Contratos', () => {
  describe('formatContractValue', () => {
    it('deve formatar valor positivo corretamente', () => {
      expect(formatContractValue(1000)).toBe('R$ 1.000,00');
    });

    it('deve formatar valor zero corretamente', () => {
      expect(formatContractValue(0)).toBe('R$ 0,00');
    });

    it('deve formatar valor negativo corretamente', () => {
      expect(formatContractValue(-500)).toBe('R$ -500,00');
    });

    it('deve formatar valor com centavos corretamente', () => {
      expect(formatContractValue(1234.56)).toBe('R$ 1.234,56');
    });
  });

  describe('calculateContractDuration', () => {
    it('deve calcular duração de 1 ano', () => {
      const contract = {
        startDate: '2023-01-01',
        endDate: '2024-01-01'
      };
      
      expect(calculateContractDuration(contract)).toBe('1 ano(s) e 0 mês(es)');
    });

    it('deve calcular duração com meses diferentes', () => {
      const contract = {
        startDate: '2023-01-01',
        endDate: '2024-06-15'
      };
      
      expect(calculateContractDuration(contract)).toBe('1 ano(s) e 5 mês(es)');
    });

    it('deve retornar N/A se datas não existirem', () => {
      const contract = {};
      
      expect(calculateContractDuration(contract)).toBe('N/A');
    });
  });

  describe('isContractActive', () => {
    it('deve retornar true para contrato futuro', () => {
      const futureContract = {
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(isContractActive(futureContract)).toBe(true);
    });

    it('deve retornar true para contrato em andamento', () => {
      const currentContract = {
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(isContractActive(currentContract)).toBe(true);
    });

    it('deve retornar false para contrato expirado', () => {
      const expiredContract = {
        endDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()
      };

      expect(isContractActive(expiredContract)).toBe(false);
    });
  });

  describe('formatContractDate', () => {
    it('deve formatar data corretamente a partir de string', () => {
      expect(formatContractDate('2023-01-15')).toBe('15/01/2023');
    });

    it('deve formatar data corretamente a partir de objeto Date', () => {
      const date = new Date('2023-12-31');
      expect(formatContractDate(date)).toBe('31/12/2023');
    });

    it('deve lidar com datas inválidas', () => {
      expect(() => formatContractDate('invalid-date')).toThrow();
    });
  });
});
