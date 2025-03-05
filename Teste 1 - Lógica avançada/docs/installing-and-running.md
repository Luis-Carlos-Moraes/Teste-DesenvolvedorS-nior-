# Instalação e execução

---

## Sumário

- [Iniciar modo de desenvolvimento](#iniciar-modo-de-desenvolvimento)
- [Buildar e iniciar](#buildar-e-iniciar)

---

### Pré-requisitos
- **Node.js**: Estou utilizando versão 22.11.0 (acredito que v16+ seja suficiente).
- **Arquivo de transações**: `transacoes1m.json` ou `transacoes1k.json` no formato JSON.
- **Docker**: Para rodar o banco de dados.

## Iniciar modo de desenvolvimento

1. Clone o repositório

2. Dentro do diretório do projeto copie o conteudo de `env-example` para `.env`.

   ```bash
   cp env-example .env
   ```

5. Inicie container do `postgres`:

   ```bash
   docker run --name some-postgres -e POSTGRES_PASSWORD=root -e POSTGRES_USER=root -p 5432:5432 -d postgres:17-alpine
   ```

6. Instalar dependências

   ```bash
   npm install
   ```

7. Executar aplicação

   ```bash
   npm run start:dev
   ```
   - O programa exibirá logs com o progresso e o tempo total de execução em milissegundos ao final.

---

## Buildar e iniciar

1. Clone o repositório

2. Dentro do diretório do projeto copie o conteudo de `env-example` para `.env`.

   ```bash
   cp env-example .env
   ```

5. Inicie container do `postgres`:

   ```bash
   docker run --name some-postgres -e POSTGRES_PASSWORD=root -e POSTGRES_USER=root -p 5432:5432 -d postgres:17-alpine
   ```

6. Instalar dependências

   ```bash
   npm install
   ```

7. buildar aplicação
   ```bash
   npm run build
   ```

8. Executar aplicação

   ```bash
   npm run start
   ```
   - O programa exibirá logs com o progresso e o tempo total de execução em milissegundos ao final.

---

Próximo: [Estrutura do Projeto](estrutura-do-projeto.md)