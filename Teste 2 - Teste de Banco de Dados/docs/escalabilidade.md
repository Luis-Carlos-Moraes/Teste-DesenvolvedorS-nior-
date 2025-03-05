# Solução para Escalabilidade

Para suportar 1 milhão de pedidos por dia, eu usaria essas estratégias, balanceando performance e custo.

## Estratégias

### 1. Sharding
- **O que é**: Divide o banco em partições (shards) por `usuario_id` ou regiões geográficas.
- **Como funciona**: Um hash no `usuario_id` define o shard de cada pedido.
- **Benefício**: Distribui a carga, permitindo mais servidores.
- **Custo-Benefício**: Alto custo inicial (complexidade), mas ideal para crescimento massivo.

### 2. Replicação
- **O que é**: Réplicas de leitura do banco principal.
- **Como funciona**: Consultas analíticas vão para réplicas, reduzindo carga no principal.
- **Benefício**: Melhora leitura sem afetar escritas.
- **Custo-Benefício**: Baixo custo (PostgreSQL suporta nativamente), alto impacto.

### 3. Caching
- **O que é**: Armazena dados frequentes (estoques, produtos) em Redis.
- **Como funciona**: Redis é usado como cache, armazenando dados em memória.
- **Benefício**: Diminui consultas ao banco.
- **Custo-Benefício**: Dependendo tamanho do cache é Barato e rápido de implementar, reduz carga significativamente.

### 4. Assincronia
- **O que é**: Processa tarefas secundárias (emails, relatórios) em filas (RabbitMQ/Kafka).
- **Benefício**: Libera o banco de operações em tempo real.
- **Custo-Benefício**: Custo moderado, essencial para alta escala.

## Plano de Ação
- **Curto Prazo**: Cache e réplicas.
- **Médio Prazo**: Sharding e filas.

Essa estratégia equilibra custo e performance, priorizando soluções rápidas e escaláveis.