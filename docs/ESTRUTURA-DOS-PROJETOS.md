# Organização recomendada por tipo de projeto

A pasta de cada projeto deve preservar sua organização funcional. Use as sugestões como **referência**, não como instrução automática para mover arquivos existentes.

## 1. Projetos Power BI

```text
dashboard-vendas/
├── README.md
├── powerbi/              # Arquivos .pbip, Report e SemanticModel
├── docs/                 # Metodologia, dicionário de dados
├── assets/               # Capturas de tela
├── relatorios/           # PDFs públicos ou demonstrativos
└── data/sample/          # Somente bases públicas/sintéticas
```

Documentar a fonte, o tratamento dos dados, as métricas DAX, limitações e o acesso ao relatório publicado. Não compartilhar credenciais, conexões privadas nem dados sensíveis.

## 2. Sistema web (ex.: Proteja)

```text
sistema/
├── README.md
├── docs/                 # Funcionalidades, decisões técnicas, fluxos
├── assets/               # Capturas usando dados fictícios
├── tests/                # Testes, se existentes
└── arquivos-da-aplicacao # Manter caminhos atuais até revisão técnica
```

**Não mover** `index.html`, `script.js`, CSS ou arquivos vinculados sem testar referências, autenticação, regras de segurança, deploy e GitHub Pages. Se o banco puder conter dados reais, não abrir acesso público aos registros. Credenciais e segredos jamais devem entrar no Git.

## 3. Dashboard HTML / aplicação web

```text
dashboard-web/
├── README.md
├── src/                  # Se já houver etapa de compilação
├── public/               # Recursos públicos, se a ferramenta usar
├── assets/               # Imagens e capturas
├── docs/                 # Metodologia e indicadores
└── data/sample/          # Dataset fictício
```

Se for HTML estático, respeitar a estrutura atual até validar o deploy.

## 4. Análise de dados com Python / SQL

```text
analise/
├── README.md
├── notebooks/
├── sql/
├── src/
├── data/sample/
├── outputs/
└── docs/
```

Incluir objetivo, dicionário de dados, metodologia, principais conclusões e instruções para reproduzir a análise.

## 5. PDFs e relatórios

Guardar PDFs ao lado do projeto que os gerou (`docs/` ou `relatorios/`), com link no README. Não acumular relatórios sem explicação na raiz de um repositório genérico.

## Links para currículo

Manter **perfil/portfólio** no cabeçalho e **links diretos verificados** para cada demonstração nos projetos selecionados. Renomeações e mudanças de endereço exigem revisão de todos os links usados no currículo, LinkedIn e README.
