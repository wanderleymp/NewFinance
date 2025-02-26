// Teste manual para verificar a funcionalidade de busca de contatos
import { contactsService } from '../services/contactsService';

// Função para testar a busca de contatos
async function testContactSearch() {
  console.log('=== TESTE DE BUSCA DE CONTATOS ===');
  
  try {
    // Teste 1: Busca com termo vazio
    console.log('\n1. Testando busca com termo vazio:');
    const emptyResult = await contactsService.searchAllContacts({
      search: '',
      includeNoChat: true,
      limit: 5
    });
    console.log('Resultado:', {
      totalItems: emptyResult.items.length,
      meta: emptyResult.meta,
      error: emptyResult.error
    });
    
    // Teste 2: Busca com termo válido
    console.log('\n2. Testando busca com termo válido:');
    const validResult = await contactsService.searchAllContacts({
      search: 'a', // Um termo genérico que deve retornar resultados
      includeNoChat: true,
      limit: 5
    });
    console.log('Resultado:', {
      totalItems: validResult.items.length,
      meta: validResult.meta,
      error: validResult.error,
      primeiroItem: validResult.items[0] ? {
        id: validResult.items[0].id,
        name: validResult.items[0].name,
        type: validResult.items[0].type,
        value: validResult.items[0].value
      } : null
    });
    
    // Teste 3: Busca com filtro de tipo
    console.log('\n3. Testando busca com filtro de tipo:');
    const typedResult = await contactsService.searchAllContacts({
      search: 'a',
      type: 'EMAIL',
      includeNoChat: true,
      limit: 5
    });
    console.log('Resultado:', {
      totalItems: typedResult.items.length,
      meta: typedResult.meta,
      error: typedResult.error
    });
    
    console.log('\n=== TESTE CONCLUÍDO COM SUCESSO ===');
  } catch (error) {
    console.error('ERRO NO TESTE:', error);
  }
}

// Executa o teste quando o arquivo for carregado
testContactSearch();

export default testContactSearch;
