# Teste 2 - Banco de Dados (PostgreSQL)

Este teste avalia sua capacidade avançada em:
1. Modelagem de dados relacional (normalização, N:N)
2. Indexação e otimização de queries
3. Controle de concorrência e race-conditions
4. Estratégias de escalabilidade para 1 M pedidos/dia

---

## 1. Schema e Índices

### 1.1. DDL (PostgreSQL)

```sql
-- Tabela de usuários
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de produtos
CREATE TABLE produtos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco NUMERIC(10, 2) NOT NULL,
    estoque INTEGER NOT NULL DEFAULT 0,
    data_cadastro TIMESTAMP NOT NULL DEFAULT NOW(),
    ativo BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabela de pedidos
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    data_pedido TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(20) NOT NULL DEFAULT 'pendente',
    valor_total NUMERIC(12, 2) NOT NULL,
);

-- Tabela de associação N:N (itens do pedido)
CREATE TABLE pedido_itens (
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id),
    produto_id INTEGER NOT NULL REFERENCES produtos(id),
    quantidade INTEGER NOT NULL CHECK (quantidade > 0),
    preco_unitario NUMERIC(10, 2) NOT NULL,
    PRIMARY KEY (pedido_id, produto_id)
);

```
### 1.2. Índices
```sql

-- Índices para produtos
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_preco ON produtos(preco);
CREATE INDEX idx_produtos_ativo ON produtos(ativo);

-- Índices para pedidos
CREATE INDEX idx_pedidos_usuario_id ON pedidos(usuario_id);
CREATE INDEX idx_pedidos_data_pedido ON pedidos(data_pedido);
CREATE INDEX idx_pedidos_status ON pedidos(status);

-- Índices para pedido_itens
CREATE INDEX idx_pedido_itens_produto_id ON pedido_itens(produto_id);
CREATE INDEX idx_pedido_itens_pedido_id ON pedido_itens(pedido_id);

```
---

## 2. Queries Otimizadas

### 2.1. Últimos 10 Pedidos de um Usuário (com itens)
```sql
SELECT
  p.id            AS pedido_id,
  p.data_pedido   AS data,
  pi.produto_id,
  pr.nome         AS produto,
  pi.quantidade,
  pi.preco_unitario
FROM pedidos p
JOIN pedido_itens pi ON pi.pedido_id = p.id
JOIN produtos pr ON pr.id = pi.produto_id
WHERE p.usuario_id = $1
ORDER BY p.data_pedido DESC
LIMIT 10;
```
### 2.2. Produtos Mais Vendidos nos Últimos 30 Dias
```sql
SELECT 
    pr.id,
    pr.nome,
    SUM(pi.quantidade) AS total_vendido
FROM pedidos p
JOIN pedido_itens pi ON pi.pedido_id = p.id
JOIN produtos pr ON pr.id = pi.produto_id
WHERE p.data_pedido >= now() - INTERVAL '30 days'
GROUP BY pr.id,
         pr.nome
ORDER BY total_vendido DESC
LIMIT 20;
```
### 2.3. Atualização de Estoque com Concorrência
```sql
BEGIN;
SELECT estoque FROM produtos WHERE id = $1 FOR UPDATE;
UPDATE produtos
   SET estoque = estoque - $2,
       version = version + 1
 WHERE id      = $1
   AND estoque >= $2;
COMMIT;
```
---

## 3. Escalabilidade (1 M pedidos/dia)

1. Fila Assíncrona (Kafka / RabbitMQ):
   - API enfileira pedidos.
   - Workers processam: UPDATE produtos …; INSERT pedidos/pedido_itens.

2. CQRS & Read Replicas:
   - Writes no master, reads em réplicas ou materialized views.

3. Partitioning / Sharding:
   - PARTITION BY RANGE(data_pedido) na tabela pedidos.
   - Shard horizontal por usuário ou data.

4. Cache & CDN:
   - Redis para catálogo e ranking “mais vendidos”.
   - CDN para assets estáticos.

5. Load Balancing & Failover:
   - API Gateway com rate limiting e circuit breakers.
   - Load balancer (NGINX, AWS ALB) e pool de conexões (PgBouncer).

6. Observabilidade:
   - Prometheus/Grafana para métricas.
   - Logs estruturados e alertas.

---
