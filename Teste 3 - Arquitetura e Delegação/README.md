# Teste 3 – Arquitetura e Delegação de Tarefas
Este teste avalia sua habilidade de definir uma arquitetura escalável, resiliente e de delegar tarefas de forma eficiente em um time com 1 desenvolvedor pleno e 2 juniores.


## Parte 1 – Definição da Arquitetura

Visão Geral da Solução:
```cmd
[API Gateway] → [Serviço de Upload] → [Fila de Mensagens] → [Workers de Processamento] → [Banco de Dados] → [Serviço de Email]
```

**Tecnologias Selecionadas:**
- **Fila de Mensagens:** Amazon SQS (gerenciado, simples e escalável)  
- **Armazenamento de PDFs:** Amazon S3 (durável e econômico)  
- **OCR:** AWS Textract (serviço gerenciado com alta precisão)  
- **API:** Node.js + Express (leve e ideal para I/O)  
- **Infraestrutura de Execução:** AWS Lambda (serverless) e ECS Fargate (containers)  
- **Banco de Dados:** Amazon DynamoDB (para textos extraídos) / RDS PostgreSQL (metadados)  
- **Notificação:** AWS SES (envio de emails)  
- **Observabilidade:** CloudWatch + Grafana  

---

---

Parte 2 – Delegação de Tarefas

- A API recebe um PDF e armazena o arquivo em um bucket S3 ou similar. **(Pleno)**
- Uma fila assíncrona processa os PDFs, convertendo-os em texto usando OCR (Tesseract, AWS Textract, etc.). **(Sênior)**
- O texto extraído é salvo no banco de dados, vinculado ao usuário que enviou o PDF. **(Júnior)**
- Após a extração, o sistema dispara um email ao usuário notificando que seu arquivo foi processado. **(Júnior)**
- A arquitetura deve ser escalável e suportar picos de tráfego. **(Sênior)**

Justificativa:
- Sênior foca em visão de infra, segurança e automação.
- Pleno integra front-end e back-end, configurando APIs e mensagens.
- Juniores trabalham em partes isoladas (OCR e email) com contratos claros.
- Entregas incrementais facilitam mentoria, reforçam boas práticas e mantêm motivação.
