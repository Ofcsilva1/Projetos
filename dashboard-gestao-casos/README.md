# Gestão de Casos · Projeto Proteja

Website demonstrativo do dashboard de Gestão de Casos para portfólio. A interface usa HTML, CSS e JavaScript sem dependências de produção.

A paleta de azul marinho e índigo foi adaptada do `style.css` do site Proteja. A organização dos indicadores parte do dashboard GBS existente e da capa do relatório Power BI fornecida.

**Demonstração com dados fictícios.** Os 500 registros em `dados-ficticios.json` foram extraídos da base sintética já embutida no arquivo `Dashboard_GBS- prontuario.html` de `Ofcsilva1/Projetos`. Nenhum prontuário real, nome, CPF ou credencial é necessário.

## Executar

Na raiz do workspace:

```powershell
python -m http.server 8000
```

Abra `http://localhost:8000/dashboard-gestao-casos/`. Um servidor local é necessário para carregar o arquivo JSON com `fetch`.

## Atualizar os dados

Substitua `dados-ficticios.json` apenas por uma base autorizada para apresentação pública. Mantenha um objeto por caso, com `id` e `entry` no formato `AAAA-MM-DD`. Os filtros e indicadores usam `sex`, `council`, `status`, `psycho`, `bo`, `initial` e `legal`. As respostas afirmativas usam o texto `Sim`; valores vazios aparecem como “Não informado” nas distribuições e não são contados como “Não”.

Antes de trocar a base, revise a permissão de publicação e a ausência de dados pessoais. Se usar dados reais autorizados, retire o selo “Demonstração com dados fictícios” somente após atualizar também este README e validar os totais.

## Regras desta versão

| Indicador | Cálculo |
| --- | --- |
| Total de casos | Quantidade de linhas do recorte, uma por caso |
| Cobertura psicossocial | Casos com `psycho = Sim` / total do recorte |
| Casos femininos | Casos com `sex = Feminino` / total do recorte |
| Casos com BO | Casos com `bo = Sim` / total do recorte |
| Atendimentos registrados | `Sim` no respectivo campo / total do recorte |
| Comparação mensal | Entradas no mês selecionado menos entradas no mês anterior, com os demais filtros mantidos |

O percentual usa o total do recorte como denominador. Quando o denominador é zero, a interface mostra “—”. A comparação mensal aparece apenas se o mês anterior existir na base. Os filtros se combinam por interseção. O gráfico de tempo mostra os dois meses envolvidos durante a comparação; sem mês escolhido, mostra toda a série.

## Origem e limite de fidelidade

O arquivo HTML do dashboard no repositório `Projetos` foi a fonte verificável para as colunas e as regras de demonstração. A captura fornecida do Power BI confirma o tema “Visão Geral e Performance de Casos Integrados”, o projeto Proteja, a autoria GBS, o uso de Power BI e Power Query e o período **junho de 2024 a abril de 2026** do relatório original. A base fictícia disponível cobre **janeiro de 2025 a janeiro de 2026**; por isso, não reproduz os totais daquele relatório.

Não havia modelo Power BI Desktop conectado ao servidor de autoria local. Medidas DAX, relacionamentos, regras de segurança, tratamento de vazios e totais do relatório original não puderam ser confirmados. A comparação numérica do total geral e de dois recortes com o Power BI depende do PBIX/PBIP ou de uma tabela de referência autorizada. Esta página não declara equivalência entre números fictícios e números reais.

## Revisão antes de publicar

Confira em navegador desktop e celular: carregamento da base, quatro filtros, seleção nas barras e meses, limpeza, recorte vazio, paginação, detalhe por teclado, contraste e ausência de rolagem horizontal na página. A publicação do site ou a alteração do relatório Power BI não fazem parte desta pasta.

