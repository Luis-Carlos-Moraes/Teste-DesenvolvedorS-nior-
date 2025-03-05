# Queries para Análise de Performance

Aqui estão as queries otimizadas para os casos solicitados, com explicações sobre performance e consistência.

## 1. Últimos 10 Pedidos de um Usuário Específico

Recupera os últimos 10 pedidos de um usuário, incluindo os produtos comprados.

```sql
SELECT 
    p.id AS pedido_id, 
    p.data_pedido, 
    pr.nome AS produto_nome, 
    pp.quantidade
FROM pedidos p
JOIN pedidos_produtos pp ON p.id = pp.pedido_id
JOIN produtos pr ON pp.produto_id = pr.id
WHERE p.usuario_id = [usuario_id]
ORDER BY p.data_pedido DESC
LIMIT 10;
```

- **Otimização**: 
  - Índices em `pedidos.usuario_id` e `pedidos.data_pedido` aceleram o filtro e a ordenação.
  - `LIMIT 10` reduz o resultado processado.
- **Performance**: O uso de joins com índices evita varreduras completas nas tabelas.

## 2. Produtos Mais Vendidos nos Últimos 30 Dias

Lista os produtos mais vendidos no último mês.

```sql
SELECT 
    pr.id AS produto_id, 
    pr.nome AS produto_nome, 
    SUM(pp.quantidade) AS total_vendido
FROM pedidos p
JOIN pedidos_produtos pp ON p.id = pp.pedido_id
JOIN produtos pr ON pp.produto_id = pr.id
WHERE p.data_pedido >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY pr.id, pr.nome
ORDER BY total_vendido DESC;
```

- **Otimização**:
  - Índice em `pedidos.data_pedido` otimiza o filtro temporal.
  - Agrupamento por `pr.id` e `pr.nome` é eficiente com índices nas chaves primárias.
- **Performance**: A query usa índices para filtragem e agregação, reduzindo o custo computacional.

## 3. Atualizar Estoque Durante um Pedido

Garante que a atualização do estoque seja segura em cenários concorrentes.

```sql
BEGIN;
-- Bloqueia a linha do produto
SELECT estoque FROM produtos WHERE id = [produto_id] FOR UPDATE;
-- Verifica se há estoque suficiente (lógica no aplicativo)
-- Se sim, atualiza o estoque e cria o pedido
UPDATE produtos 
SET estoque = estoque - [quantidade], 
    data_atualizacao = CURRENT_TIMESTAMP 
WHERE id = [produto_id];
INSERT INTO pedidos (usuario_id, status) 
VALUES ([usuario_id], 'confirmado');
INSERT INTO pedidos_produtos (pedido_id, produto_id, quantidade) 
VALUES (currval('pedidos_id_seq'), [produto_id], [quantidade]);
COMMIT;
```

- **Consistência**:
  - `SELECT FOR UPDATE`: Evita race conditions ao bloquear o registro do produto.
  - Transação: Garante que todas as operações (atualização de estoque e criação do pedido) sejam atômicas.
- **Performance**:
  - O lock é aplicado apenas ao registro específico, minimizando contenção.
  - Uso de `currval` para obter o ID do pedido recém-criado sem consultas adicionais.