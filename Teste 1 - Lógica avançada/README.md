# Solução para o Teste de Lógica Avançada: Processamento de Transações Bancárias

## Introdução
Este projeto foi desenvolvido como solução ao Teste 1, que exige o processamento de 1 milhão de transações bancárias contidas no arquivo `transacoes1m.json`. O objetivo é identificar e ignorar transações duplicadas — definidas como aquelas com o mesmo valor, pagador e recebedor, e uma diferença de tempo de no máximo 10 segundos — inserindo apenas as transações únicas em um banco de dados. A solução foi projetada para ser eficiente, escalável e otimizada para performance, exibindo o tempo de execução ao final do processo.

O projeto utiliza uma arquitetura modular em TypeScript, com Node.js como runtime, e PostgreSQL como banco de dados. Ele suporta arquivos de diferentes tamanhos, desde o arquivo de teste `transacoes1k.json` o arquivo principal `transacoes1m.json` até arquivos maiores, adaptando-se dinamicamente ao volume de dados.


##### Obs: No arquivo `env-example` a variável `AVAILABLE_MEMORY` define a quantidade de memória disponível para a escolha do método de executar, por padrão eu deixei um valor menor que o arquivo de 1 milhão de transações. Para testar o método de chunks.
---

## Sumário

- [Instalação e execução](./docs/installing-and-running.md)
- [Justificativas Técnicas](./docs/justificativas-tecnicas.md)
- [Estrutura do Projeto](./docs/estrutura-do-projeto.md)