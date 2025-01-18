// Configurações globais para testes
import '@testing-library/jest-dom/extend-expect';

// Configurações de mock para fetch e outros
(global as any).fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  })
);

// Limpar mocks entre os testes
beforeEach(() => {
  jest.clearAllMocks();
});

// Configurações adicionais de ambiente de teste
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
  }))
});
