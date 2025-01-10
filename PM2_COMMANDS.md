# Comandos PM2 para NewFinance

## Iniciar Aplicação

### Iniciar em Background (sem watch)
```bash
npm run start:background
```

### Iniciar com Monitoramento de Alterações
```bash
npm run start:watch
```

## Gerenciamento de Processos

### Parar Aplicação
```bash
npm run stop:background
```

### Reiniciar Aplicação
```bash
npm run restart:background
```

### Ver Logs em Tempo Real
```bash
npm run logs:background
```

## Comandos PM2 Adicionais

### Listar Processos
```bash
pm2 list
```

### Monitorar Recursos
```bash
pm2 monit
```

### Configurar Inicialização Automática
```bash
pm2 startup
pm2 save
```

## Dicas

- O modo watch reinicia automaticamente quando há mudanças nos arquivos
- Logs ficam salvos e podem ser consultados mesmo após reiniciar o terminal
- Use `pm2 logs newfinance-dev` para ver logs detalhados
