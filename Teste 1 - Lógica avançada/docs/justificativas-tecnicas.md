# Justificativas Técnicas

---

## Sumário
- [Justificativas Técnicas](#justificativas-técnicas)
- [Considerações sobre Escalabilidade](#considerações-sobre-escalabilidade)

---

## Justificativas Técnicas

### 1. Arquitetura Modular
  - **Motivo**: A separação em camadas (domain, infra, main) promove desacoplamento, facilitando manutenção, testes e substituição de implementações (ex.: trocar o banco de dados ou o método de leitura de arquivos). Isso melhora a clareza e organização do código, atendendo aos critérios de avaliação.

### 2. Uso de Interfaces e Injeção de Dependências
  - **Motivo**: Interfaces como `ITransactionRepository` e `ITransactionLoader` permitem que o caso de uso principal (`ProcessTransactionsUseCase`) seja independente de implementações específicas. Isso torna o código mais flexível e testável, seguindo princípios de SOLID.

### 3. Estratégia de Carregamento de Transações
  - **InMemoryTransactionLoader**: Carrega todas as transações em memória e ordena por timestamp quando o tamanho do arquivo é menor que a memória disponível.
  - **Por que é eficiente?**: Para arquivos pequenos (como `transacoes1k.json`), o processamento em memória é mais rápido, evitando I/O desnecessário.
  - **ChunkedTransactionLoader**: Divide o arquivo em chunks, ordena cada chunk em paralelo com workers e mescla os resultados usando um heap.
  - **Por que é melhor para grandes volumes?**: Para `transacoes1m.json`, evita estouro de memória e aproveita múltiplos núcleos da CPU, otimizando a performance em arquivos grandes.

### 4. Detecção de Transações Duplicadas
  - **Janela Deslizante com Heap**: Um heap mantém os timestamps dentro de uma janela de 10 segundos, removendo eficientemente transações antigas (O(log N)).
  - **Mapas para Rastreamento**: Usa `Map` para agrupar transações por timestamp e por chave (pagador-recebedor-valor), oferecendo acesso O(1) para verificar duplicatas.
  - **Por que essas escolhas?**: O heap é ideal para manter a ordem temporal com remoções rápidas, enquanto os mapas garantem consultas eficientes, atendendo ao requisito de performance com 1 milhão de registros.

### 5. Inserção em Batch
  - **Motivo**: Inserir transações em lotes reduz o número de operações no banco de dados, minimizando o overhead de conexões e transações. Isso melhora significativamente a eficiência ao lidar com grandes volumes.

### 6. Paralelismo com Workers
  - **Motivo**: O uso de `worker_threads` para ordenar chunks em paralelo aproveita múltiplos núcleos da CPU, acelerando o processamento de arquivos grandes como `transacoes1m.json`. Isso é essencial para otimizar o tempo de execução.

### 7. Logging com Pino
  - **Motivo**: O logger Pino é rápido e leve, permitindo monitoramento detalhado do processo (início, inserções em batch, conclusão) sem comprometer a performance. Isso facilita debugging e análise de gargalos.

### 8. Escolha do PostgreSQL
  - **Motivo**: PostgreSQL é robusto, suporta inserções em batch e oferece índices para consultas futuras, além de ser amplamente utilizado e gratuito. É uma escolha prática e escalável para o teste.

## Considerações sobre escalabilidade

### Processamento de Arquivos Grandes
  - A solução adapta-se dinamicamente ao tamanho do arquivo:
  - Arquivos menores que a memória disponível são processados em memória.
  - Arquivos maiores são divididos em chunks, ordenados em paralelo e mesclados com um heap.
  - Isso garante que o sistema funcione mesmo com arquivos muito maiores que `transacoes1m.json`, sem esgotar a memória.

### Paralelismo
  - O uso de workers para ordenação de chunks explora a capacidade de CPUs modernas com múltiplos núcleos, reduzindo o tempo de processamento proporcionalmente ao número de núcleos disponíveis.

### Banco de Dados
  - A inserção em batch minimiza o impacto no banco de dados, mas para escalas ainda maiores (ex.: 10 milhões de transações).

### Extensibilidade
  - A arquitetura modular permite integrar novos loaders, repositórios ou estratégias de deduplicação sem grandes alterações. Por exemplo, adicionar suporte a um banco NoSQL.

---

Anterior: [Estrutura do Projeto](estrutura-do-projeto.md)