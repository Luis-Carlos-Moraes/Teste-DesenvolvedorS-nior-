# Teste 1 - Lógica Avançada

Este documento descreve o primeiro teste técnico do repositório: **Teste de Lógica Avançada**, cujo objetivo é processar um arquivo com transações bancárias, identificar duplicatas em uma janela de 10 segundos e inserir as transações válidas em lote no MongoDB.

---

📈 Resultados de Performance

Arquivo transacoes1k.json de 1k de registros:
- ![image](https://github.com/user-attachments/assets/b44292dd-c2e2-4f63-a7bd-a2c88b08fc4c)

- ![image](https://github.com/user-attachments/assets/55abcade-e84e-4451-a9bf-12ee18ae7064)

Arquivo transacoes1m.json de 1m de registros:
- ![image](https://github.com/user-attachments/assets/b0707ea8-1153-40b3-ae1f-17ec598b6207)

- ![image](https://github.com/user-attachments/assets/bb2d2c85-49f5-48a5-8c11-1e74d99cdfc8)

---

## 📝 Estrutura do Projeto

```
src/
├── index.js                     # Ponto de entrada da aplicação (main)
├── Deduplicator.js              # Lógica de verificar duplicação em memória
├── TransactionBatchWriter.js    # Gerencia buffer de transações e executa inserções em lote no MongoDB
├── DatabaseService.js           # Conexão e criação de índice MongoDB
├── TransactionProcessor.js      # Gerencia pipeline: leitura de arquivo, deduplicação e inserção em lote
README.md                        # Documentação
```

---

## 🚀 Como Executar

1. **Clone** este repositório:
   ```bash
   git clone <URL_DO_REPO>
   cd <PASTA_DO_REPO>
   ```
2. **Instale** as dependências:
   ```bash
   npm install
   ```
3. **Execute** o script:
   ```bash
   node src/index.js
   ```
4. **Verifique** no console as métricas de execução (tempo total) e no MongoDB a coleção `transacoes` populada.

---

## ⚙️ Configuração e Parâmetros

| Variável                         | Descrição                                                                                                                          | Padrão                      |
|----------------------------------|------------------------------------------------------------------------------------------------------------------------------------|-----------------------------|
| `FILE_PATH`                      | Caminho do arquivo JSON                                                                                                            | `../transacoes1m.json`      |
| `MONGODB_URL`                    | URL de conexão com o MongoDB                                                                                                       | `mongodb://localhost:27017` |
| `DUPLICATE_DETECTION_WINDOW_MS`  | Janela de detecção de duplicatas em ms. Transações com mesmo pagador, recebedor e valor são consideradas duplicadas se ocorrerem dentro deste intervalo (10s). | `10000`                     |
| `BATCH_SIZE`                     | Quantidade de registros por lote                                                                                                   | `1000`                      |

---

## ⚙️ Como Funciona

1. **Leitura em stream** do arquivo JSON usando `fs` + `JSONStream.parse("*")`.
2. Para cada registro:
   - **Deduplicação** em memória: mantém um `Map` de chaves (`pagador-recebedor-valor`) com timestamps recentes e ignora duplicatas em até 10 segundos.
   - **Batch Insert**: registra transações válidas em um buffer e insere no MongoDB em lotes de `BATCH_SIZE` documentos.
3. Ao final do processamento, executa `flush()` para esvaziar o buffer restante.
4. **Índice composto** em `{ pagador, recebedor, valor, timestamp }` é garantido via `DatabaseService` para acelerar buscas.

---

## 🔍 Tratamento de Edge Cases

- **Conexão com MongoDB**: erros na conexão ou inserção são capturados e logados, garantindo `client.close()` no `finally`.

---

## 🚧 Considerações de Performance

- **Backpressure**: uso de `pipeline(stream, parser, writer)` garante controle do fluxo.
- **Batch Size**: configurado em `BATCH_SIZE` para equilibrar latência e throughput.
- **Índice composto**: criado em background para não bloquear operações.
- **Limpeza de memória**: `Deduplicator` filtra timestamps fora da janela antes de cada verificação.

---

## 🏗️ Possíveis Melhorias

- Paralelizar processamento com Worker Threads.
- Persistir estado de deduplicação em cache compartilhado (Redis) para múltiplas instâncias.
- Expor parâmetros via CLI (Commander) e incluir barra de progresso.

---
