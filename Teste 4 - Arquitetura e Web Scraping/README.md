# Teste 4 - Arquitetura e Web Scraping

## Definição da Arquitetura

**Resumo da solução:**  
Cada site terá um **Step Function** que dispara um evento em **SQS**, entregando a URL e credenciais. De SQS partem dois fluxos:

1. **Python (Scrapy + Selenium)** (ECS Fargate Spot) baixam os PDFs—login, captcha, formulários, paginação—e armazenam em S3.  
2. **Node.js (Typescript)** (AWS + Serverless Framework) pega o PDF do S3, executa OCR (Tesseract ou Textract), extrai entidades (CPF/CNPJ/Name), associa nome↔documento e persiste em RDS PostgreSQL + OpenSearch.

---

## Servidores necessários

- **Orquestração:** AWS Step Functions + SQS  
- **Scraping:** Python Containers (ECS Fargate Spot)  
- **OCR & Matching:** AWS Lambda (Tesseract layer) + Node.js no Fargate  
- **Banco de Dados:** RDS PostgreSQL (metadados) + Amazon OpenSearch (full-text)  
- **Cache:** ElastiCache Redis (tokens, debounce de URLs)  

---

## Cloud vs. On-Premises

- **Cloud (AWS):**  
  - **Agilidade** no provisionamento via IaC (Terraform/CDK)  
  - **Pay-per-use**: pague só o que usar (Lambda, Fargate Spot)  
  - **Gerenciado**: SQS, RDS, OpenSearch, Redis  
- **On-Premises:**  
  - Apenas para cenários de compliance extremo ou dados sensíveis; geralmente a cloud resolve a maioria dos casos com menor TCO.

---

## Escalabilidade & Paralelismo

- **Serverless + Fila (SQS):** desacopla produtores e consumidores, escala horizontalmente conforme tamanho da fila.  
- **Fargate Spot:** containers Python até 70% mais barato para scraping em massa.  
- **Lambda Scale-to-Zero:** OCR e Matching só consomem recursos durante a execução.

---

## Balanceamento de Carga & Recuperação de Falhas

- **SQS DLQ:** mensagens com falha vão para Dead-Letter Queue e são reprocessadas manualmente.  
- **Retries & Backoff:** configurados no AWS SDK e Step Functions.  
- **Health Checks:** ECS service auto-recicla tarefas com falha.

---

## Tecnologias e Vantagens

- **Python (Scrapy + Playwright)**  
  - Automação robusta de browser em containers  
  - Fargate Spot reduz custo em até 70%  
- **Node.js (TypeScript + Lambda / Fargate)**  
  - Orquestração e matching I/O-intenso, não-bloqueante  
  - Lambda pay-per-invoke, sem servidores ociosos  
- **AWS SQS**  
  - Gerenciado, alta durabilidade, retries automáticos  
- **RDS PostgreSQL**  
  - ACID, relacionamento forte, particionamento por data  
- **Amazon OpenSearch**  
  - Busca full-text com baixa latência  
- **ElastiCache Redis**  
  - TTL e debounce de URLs, acelera verificações frequentes  

---

## Modelagem do Banco de Dados

```sql
-- Documentos processados
CREATE TABLE pdfs (
    id UUID PRIMARY KEY,
    url TEXT NOT NULL,
    content TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'processed', 'failed'))
);

-- Dados extraídos
CREATE TABLE entities (
    pdf_id UUID REFERENCES pdfs(id),
    name VARCHAR(200),
    document_type VARCHAR(10),
    document_number VARCHAR(50),
    confidence INTEGER  -- 0-100%
);

-- Índices para performance
CREATE INDEX idx_entities_document ON entities(document_type, document_number);
```