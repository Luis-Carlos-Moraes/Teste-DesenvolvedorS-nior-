-- Query 1: Últimos 10 pedidos de um usuário
SELECT 
    p.id AS pedido_id, 
    p.data_pedido, 
    pr.nome AS produto_nome, 
    pp.quantidade
FROM pedidos p
JOIN pedidos_produtos pp ON p.id = pp.pedido_id
JOIN produtos pr ON pp.produto_id = pr.id
WHERE p.usuario_id = 1
ORDER BY p.data_pedido DESC
LIMIT 10;

-- Query 2: Produtos mais vendidos nos últimos 30 dias
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

-- Query 3: Atualizar estoque durante um pedido
BEGIN;
SELECT estoque FROM produtos WHERE id = 1 FOR UPDATE;
UPDATE produtos 
SET estoque = estoque - 2, 
    data_atualizacao = CURRENT_TIMESTAMP 
WHERE id = 1;
INSERT INTO pedidos (usuario_id, status) 
VALUES (1, 'confirmado');
INSERT INTO pedidos_produtos (pedido_id, produto_id, quantidade) 
VALUES (currval('pedidos_id_seq'), 1, 2);
COMMIT;