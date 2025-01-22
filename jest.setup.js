// Configurações globais para testes
import '@testing-library/jest-dom/extend-expect';

// Limpar mocks entre os testes
beforeEach(() => {
  jest.clearAllMocks();
});

// Configurar console.error para lançar erros
const originalConsoleError = console.error;
console.error = (...args) => {
  originalConsoleError(...args);
  throw new Error('Console error called');
};
