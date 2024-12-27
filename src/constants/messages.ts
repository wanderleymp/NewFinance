export const messages = {
  auth: {
    welcome: (name: string) => `Bem-vindo, ${name}!`,
    sessionExpired: 'Sessão expirada. Redirecionando para login...',
    invalidCredentials: 'Erro ao autenticar. Verifique suas credenciais.',
    unauthorized: 'Você não tem permissão para acessar esta página.',
    tokenRefreshError: 'Erro ao renovar sua sessão. Por favor, faça login novamente.',
    logoutSuccess: 'Logout realizado com sucesso!',
  },
  errors: {
    default: 'Ocorreu um erro. Tente novamente.',
    connection: 'Não foi possível conectar ao servidor. Verifique sua conexão.',
    notFound: 'Recurso não encontrado.',
    serverError: 'Erro interno do servidor. Tente novamente mais tarde.',
    invalidData: 'Dados inválidos. Verifique as informações fornecidas.',
  },
  success: {
    saved: 'Dados salvos com sucesso!',
    deleted: 'Registro excluído com sucesso!',
    updated: 'Registro atualizado com sucesso!',
  },
};