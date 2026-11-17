# Nexo — demonstração pública

Versão estática preparada para o GitHub Pages, com os temas claro e escuro do Nexo Laboratório.

## Recursos

- Cadastro e edição de prontuários fictícios em oito etapas.
- Filtros, indicadores, agenda, atendimentos, pendências e retornos.
- Importação de planilhas e exportações existentes.
- Pergunte ao Nexus com consultas locais sobre períodos e totais do serviço.
- Preferência de tema e dados salvos no navegador.

No GitHub Pages, o chat usa consultas locais e não chama um servidor de IA. O código da integração com Gemini e um `.env.example` sem chave real estão incluídos para execução local e preparação de uma futura hospedagem. Esta demonstração não usa Firebase, autenticação real ou dados de produção.

## Dados locais

Use somente dados fictícios. Cada visitante usa a base do seu próprio navegador; não há compartilhamento de prontuários entre visitantes. Exportar uma cópia é recomendado para conservar os registros de teste.

A migração da base anterior da aba é mantida quando ela está disponível. Os dados do localhost não são enviados automaticamente ao site publicado. Não limpe o armazenamento do navegador para atualizar o visual.

## Publicação

Os arquivos desta pasta correspondem ao caminho `sistema-casos/` no repositório `Ofcsilva1/Projetos`. O portfólio continua apontando para `https://ofcsilva1.github.io/Projetos/sistema-casos/`.

Não publique `.env`, credenciais, `node_modules` ou dados pessoais. O `.env.example` pode ser versionado porque contém somente a configuração de exemplo, sem chave preenchida. O GitHub Pages entrega arquivos estáticos e não executa o servidor Node.

## Execução local

Na pasta do projeto, execute `python -m http.server 8001 --bind 127.0.0.1` e abra `http://127.0.0.1:8001/`.

### Usar o Gemini localmente

1. Use Node.js 22.9 ou superior.
2. Copie `.env.example` para `.env`. No PowerShell: `Copy-Item .env.example .env`.
3. Preencha `GEMINI_API_KEY=` no arquivo `.env` com sua chave. Nunca envie esse arquivo ao GitHub.
4. Execute `npm start` e abra `http://127.0.0.1:8000/`.

Com o servidor configurado, o seletor libera a opção Gemini. As perguntas são enviadas ao provedor para interpretação; as contagens continuam sendo feitas com a base fictícia do navegador. Após mudar a chave, reinicie o servidor.

### Gemini no site público — etapa pendente

Adicionar uma chave ao exemplo não ativa a IA no GitHub Pages. Ainda é necessário hospedar uma API, guardar a chave nas variáveis privadas dessa hospedagem e conectar o frontend ao endereço da API.

O servidor incluído foi projetado para o laboratório local: atende somente em `127.0.0.1` e valida origem e token locais. Não está pronto para exposição pública. A futura integração deverá adaptar origem/CORS, autenticação, autorização e limites de uso antes de receber visitantes. Não use dados reais nesta demonstração.

## Testes

Instale as dependências de desenvolvimento e execute `npm test`. Os testes usam dados fictícios, chaves sintéticas e respostas simuladas, sem acessar a API real do Gemini. É necessário ter um navegador compatível com Playwright instalado; `NEXO_BROWSER_PATH` permite indicar o executável local.

O código do sistema de origem permanece em `https://github.com/Ofcsilva1/Proteja`.
