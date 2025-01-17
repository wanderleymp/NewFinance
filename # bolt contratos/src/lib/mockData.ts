// Mock data for the chat system
const mockCustomers = [
  {
    id: '1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    document: '123.456.789-00',
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 98765-4322',
    document: '987.654.321-00',
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro.oliveira@email.com',
    phone: '(11) 98765-4323',
    document: '456.789.123-00',
  },
];

const mockUsers = [
  {
    id: '1',
    name: 'Ana Atendente',
    email: 'ana.atendente@empresa.com',
    role: 'attendant',
  },
  {
    id: '2',
    name: 'Carlos Suporte',
    email: 'carlos.suporte@empresa.com',
    role: 'support',
  },
  {
    id: '3',
    name: 'Mariana Técnica',
    email: 'mariana.tecnica@empresa.com',
    role: 'technician',
  },
];

const mockChats = [
  {
    id: '1',
    title: 'Suporte Técnico - Sistema ERP',
    status: 'open',
    createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    updatedAt: new Date().toISOString(),
    customerId: '1',
    assignedToId: '1',
    serviceOrderId: '1',
    lastMessage: 'Sistema continua apresentando lentidão',
    unreadCount: 2,
  },
  {
    id: '2',
    title: 'Dúvida sobre Faturamento',
    status: 'paused',
    createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
    updatedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
    customerId: '2',
    assignedToId: null,
    serviceOrderId: '2',
    lastMessage: 'Aguardando retorno do financeiro',
    unreadCount: 0,
  },
  {
    id: '3',
    title: 'Instalação de Módulo',
    status: 'closed',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    customerId: '3',
    assignedToId: '2',
    serviceOrderId: '3',
    lastMessage: 'Módulo instalado com sucesso',
    unreadCount: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    chatId: '1',
    content: 'Olá, estou com problemas no sistema ERP. Está muito lento.',
    senderId: '1',
    senderType: 'customer',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    chatId: '1',
    content: 'Olá! Pode me descrever melhor o problema? Em quais módulos está percebendo a lentidão?',
    senderId: '1',
    senderType: 'agent',
    createdAt: new Date(Date.now() - 3500000).toISOString(),
  },
  {
    id: '3',
    chatId: '1',
    content: 'Principalmente no módulo financeiro e no de estoque.',
    senderId: '1',
    senderType: 'customer',
    createdAt: new Date(Date.now() - 3400000).toISOString(),
  },
  {
    id: '4',
    chatId: '2',
    content: 'Preciso de ajuda com o faturamento mensal.',
    senderId: '2',
    senderType: 'customer',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '5',
    chatId: '2',
    content: 'Claro! Vou encaminhar para o setor financeiro analisar.',
    senderId: '2',
    senderType: 'agent',
    createdAt: new Date(Date.now() - 7100000).toISOString(),
  },
];

const mockInternalMessages = [
  {
    id: '1',
    chatId: '1',
    content: 'Cliente já teve esse problema antes, verificar histórico de chamados.',
    userId: '1',
    userName: 'Ana Atendente',
    createdAt: new Date(Date.now() - 3550000).toISOString(),
  },
  {
    id: '2',
    chatId: '1',
    content: 'Verificado. Problema relacionado à configuração do servidor.',
    userId: '2',
    userName: 'Carlos Suporte',
    createdAt: new Date(Date.now() - 3450000).toISOString(),
  },
  {
    id: '3',
    chatId: '2',
    content: 'Necessário validação do financeiro para prosseguir.',
    userId: '1',
    userName: 'Ana Atendente',
    createdAt: new Date(Date.now() - 7150000).toISOString(),
  },
];

const mockServiceOrders = [
  {
    id: '1',
    title: 'Lentidão no Sistema ERP',
    description: 'Cliente reportou lentidão nos módulos financeiro e estoque',
    status: 'in_progress',
    priority: 'high',
    customer: mockCustomers[0],
    openedAt: new Date(Date.now() - 3600000).toISOString(),
    closedAt: null,
    assignedTo: '2',
    serviceType: 'Suporte Técnico',
  },
  {
    id: '2',
    title: 'Análise de Faturamento',
    description: 'Cliente necessita de auxílio com faturamento mensal',
    status: 'waiting_approval',
    priority: 'medium',
    customer: mockCustomers[1],
    openedAt: new Date(Date.now() - 7200000).toISOString(),
    closedAt: null,
    assignedTo: null,
    serviceType: 'Financeiro',
  },
  {
    id: '3',
    title: 'Instalação de Módulo Fiscal',
    description: 'Instalação e configuração do novo módulo fiscal',
    status: 'completed',
    priority: 'medium',
    customer: mockCustomers[2],
    openedAt: new Date(Date.now() - 86400000).toISOString(),
    closedAt: new Date(Date.now() - 43200000).toISOString(),
    assignedTo: '3',
    serviceType: 'Instalação',
  },
];

export const mockData = {
  getCustomers: () => Promise.resolve(mockCustomers),
  getUsers: () => Promise.resolve(mockUsers),
  getChats: () => Promise.resolve(mockChats),
  getChatMessages: (chatId: string) => Promise.resolve(
    mockMessages.filter(message => message.chatId === chatId)
  ),
  getInternalMessages: (chatId: string) => Promise.resolve(
    mockInternalMessages.filter(message => message.chatId === chatId)
  ),
  getServiceOrders: () => Promise.resolve(mockServiceOrders),
  getServiceOrder: (id: string) => Promise.resolve(
    mockServiceOrders.find(order => order.id === id) || null
  ),
  updateServiceOrderStatus: (id: string, status: string) => Promise.resolve({
    success: true,
    message: 'Status atualizado com sucesso',
  }),
  createServiceOrder: (data: any) => Promise.resolve({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }),
  createChat: (data: any) => Promise.resolve({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }),
  sendMessage: (data: any) => Promise.resolve({
    ...data,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }),
};