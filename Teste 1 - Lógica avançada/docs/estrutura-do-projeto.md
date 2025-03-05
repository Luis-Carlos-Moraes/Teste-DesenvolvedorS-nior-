# Estrutura do Projeto

---

## Sumário
- [Estrutura do Projeto](#estrutura-do-projeto)

---

## Estrutura do Projeto
A estrutura do projeto segue uma arquitetura modular, separando responsabilidades em camadas distintas:

- `src/domain/`: Contém a lógica de negócio e as entidades do domínio.
  - `entities/transaction.ts`: Define a classe `Transaction` com os campos da transação (id, valor, pagador, recebedor, timestamp).
  - `repository/transaction.repository.ts`: Interface do repositório para abstrair o acesso ao banco de dados.
  - `usecases/process-transaction.usecase.ts`: Implementa o caso de uso principal para processar transações e detectar duplicatas.
  - `utils/`: Utilitários como heap, logger e loader de transações.

- `src/infra/`: Implementações concretas de infraestrutura.
  - `database/postgres/`: Configuração e repositório para PostgreSQL.
  - `file/`: Códigos para leitura e processamento de arquivos (`InMemoryTransactionLoader` e `ChunkedTransactionLoader`).
  - `logger/`: Logger baseado em Pino para monitoramento.
  - `utils/adapters/`: Adaptador para a biblioteca `heap-js`.

- `src/main/`: Configuração e ponto de entrada.
  - `config.ts`: Carrega variáveis de ambiente.
  - `index.ts`: Inicializa e executa a aplicação.

---

Próximo: [Justificativas técnicas](justificativas-tecnicas.md)