# Modelagem de Banco de Dados

## Parte 1: Modelagem e Boas Práticas

Esta seção descreve a modelagem das tabelas para o sistema de e-commerce, com ênfase em normalização, indexação e estratégias para consistência e concorrência.

### Estrutura das Tabelas

#### Usuários (usuarios)
- `id` (SERIAL, PRIMARY KEY): Identificador único.
- `nome` (VARCHAR(255), NOT NULL): Nome do usuário.
- `email` (VARCHAR(255), UNIQUE, NOT NULL): Email único.
- `data_criacao` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Data de criação.

#### Produtos (produtos)
- `id` (SERIAL, PRIMARY KEY): Identificador único.
- `nome` (VARCHAR(255), NOT NULL): Nome do produto.
- `preco` (NUMERIC(10,2), NOT NULL): Preço com duas casas decimais.
- `estoque` (INTEGER, NOT NULL, DEFAULT 0): Quantidade em estoque.
- `data_atualizacao` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Última atualização.

#### Pedidos (pedidos)
- `id` (SERIAL, PRIMARY KEY): Identificador único.
- `usuario_id` (INTEGER, FOREIGN KEY REFERENCES usuarios(id)): Referência ao usuário.
- `data_pedido` (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP): Data do pedido.
- `status` (VARCHAR(50), NOT NULL, DEFAULT 'pendente'): Status do pedido.

#### Pedidos_Produtos (pedidos_produtos)
- `pedido_id` (INTEGER, FOREIGN KEY REFERENCES pedidos(id)): Referência ao pedido.
- `produto_id` (INTEGER, FOREIGN KEY REFERENCES produtos(id)): Referência ao produto.
- `quantidade` (INTEGER, NOT NULL): Quantidade comprada.
- **Primary Key**: `(pedido_id, produto_id)` (chave composta).

### Normalização

- **2NF (Segunda Forma Normal)**: 
  - Remover dependências parciais, ou seja, colunas não-chave devem depender totalmente da chave primária. Na tabela `pedidos_produtos`, `quantidade` depende de ambos `pedido_id` e `produto_id` (chave composta), não apenas de um deles.

- **3NF (Terceira Forma Normal)**: 
  - Eliminar dependências transitivas, onde uma coluna não-chave depende de outra não-chave. Exemplo: o `preco` está em `produtos`, não em `pedidos_produtos`, evitando que o preço dependa de algo além do `id` do produto.

Essas abordagens reduz redundâncias e previne inconsistências (como preços diferentes para o mesmo produto).

### Índices Otimizados

- **usuarios**: Índice único em `email` para buscas rápidas.
- **produtos**: Índices em `nome` (buscas) e `estoque` (verificação de disponibilidade).
- **pedidos**: Índices em `usuario_id` (consultas por usuário) e `data_pedido` (filtro temporal).
- **pedidos_produtos**: Índice em `produto_id` (consultas por produto).

### Consistência e Concorrência

#### Soluções para Locking e Race Conditions
1. **Transações**: Garantem que operações relacionadas (verificar estoque, atualizar, criar pedido) sejam atômicas.
2. **Locks Pessimistas**: Usar `SELECT FOR UPDATE` para bloquear o registro do produto durante a transação:
   ```sql
   BEGIN;
   SELECT estoque FROM produtos WHERE id = [produto_id] FOR UPDATE;
   -- Verifica se estoque >= quantidade
   UPDATE produtos SET estoque = [estoque_novo] WHERE id = [produto_id];
   COMMIT;
   ```
3. **Nível de Isolamento**: 
 - Para transações críticas usar `SERIALIZABLE` para evita anomalias em cenários críticos;
 - Para transações não críticas `READ COMMITTED` que é o padrão e equilibra performance e segurança.
4. **Validação Prévia**: Abortar a transação se o estoque for insuficiente antes de atualizar.

Essas estratégias evitam que múltiplas compras simultâneas comprometam o estoque, garantindo consistência.