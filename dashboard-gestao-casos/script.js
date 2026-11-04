// DADOS: guarda a base fictícia e um único estado de filtros para toda a página.
"use strict";

const state = {
  rows: [],
  filters: {
    month: "",
    sex: "",
    council: "",
    status: "",
    ageBand: "",
    race: "",
    sexual: ""
  },
  page: 1,
  pageSize: 10,
  lastDetailButton: null
};

const numberFormat = new Intl.NumberFormat("pt-BR");
const percentFormat = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1
});
const monthFormat = new Intl.DateTimeFormat("pt-BR", {
  month: "short",
  year: "numeric",
  timeZone: "UTC"
});
const dateFormat = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC"
});

const filterLabels = {
  month: "Mês de entrada",
  sex: "Sexo",
  council: "Conselho Tutelar",
  status: "Situação",
  ageBand: "Faixa etária",
  race: "Raça/cor",
  sexual: "Violência sexual"
};

const colors = {
  teal: "#12999d",
  indigo: "#6171d7",
  amber: "#d6a04d",
  coral: "#c97d82",
  violet: "#9786bd",
  slate: "#8497a8"
};

const detailFields = [
  ["entry", "Data de entrada"],
  ["sex", "Sexo"],
  ["ageBand", "Faixa etária"],
  ["race", "Raça/cor"],
  ["council", "Conselho Tutelar"],
  ["origin", "Origem"],
  ["status", "Situação"],
  ["sexual", "Violência sexual"],
  ["other", "Outras violências"],
  ["relation", "Relação suspeito × vítima"],
  ["initial", "Atenção inicial"],
  ["psycho", "Atendimento psicossocial"],
  ["legal", "Orientação jurídico-social"],
  ["plan", "Plano individual"],
  ["bo", "Boletim de ocorrência"]
];

// MÉTRICAS: conta cada caso uma vez e deixa percentuais sem denominador vazios.
function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function valueOrMissing(value) {
  return hasValue(value) ? String(value) : "Não informado";
}

function validMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function monthOf(row) {
  return typeof row.entry === "string" ? row.entry.slice(0, 7) : "";
}

function monthLabel(value) {
  return validMonth(value)
    ? monthFormat.format(new Date(value + "-01T00:00:00Z"))
    : "Mês não informado";
}

function shortMonthLabel(value) {
  return validMonth(value)
    ? value.slice(5, 7) + "/" + value.slice(2, 4)
    : "—";
}

function previousMonth(value) {
  const date = new Date(value + "-01T00:00:00Z");
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
    return "Não informada";
  }
  const date = new Date(value + "T00:00:00Z");
  return Number.isNaN(date.valueOf()) ? "Não informada" : dateFormat.format(date);
}

function filteredRows(ignoreMonth = false) {
  return state.rows.filter((row) => {
    return Object.entries(state.filters).every(([key, selected]) => {
      if (!selected || (ignoreMonth && key === "month")) {
        return true;
      }
      const current = key === "month" ? monthOf(row) : valueOrMissing(row[key]);
      return current === selected;
    });
  });
}

function count(rows, key, value) {
  return rows.filter((row) => valueOrMissing(row[key]) === value).length;
}

function percent(numerator, denominator) {
  return denominator ? percentFormat.format(numerator / denominator) : "—";
}

function groups(rows, key) {
  const values = new Map();
  rows.forEach((row) => {
    const label = valueOrMissing(row[key]);
    values.set(label, (values.get(label) || 0) + 1);
  });
  return [...values].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function allMonths() {
  return [...new Set(state.rows.map(monthOf).filter(validMonth))].sort();
}

function sexualIncidence(rows) {
  return rows.filter((row) => hasValue(row.sexual) && row.sexual !== "Não se aplica").length;
}

function monthComparison() {
  const selected = state.filters.month;
  if (!selected) {
    return "Escolha um mês para comparar com o anterior.";
  }
  const previous = previousMonth(selected);
  if (!allMonths().includes(previous)) {
    return "O mês anterior está fora da base demonstrativa.";
  }
  const context = filteredRows(true);
  const currentCount = context.filter((row) => monthOf(row) === selected).length;
  const previousCount = context.filter((row) => monthOf(row) === previous).length;
  const delta = currentCount - previousCount;
  const sign = delta > 0 ? "+" : "";
  const unit = Math.abs(delta) === 1 ? " caso" : " casos";
  return sign + numberFormat.format(delta) + unit + " em relação a " +
    monthLabel(previous) + " (" + numberFormat.format(previousCount) + ")";
}

// FILTROS: preenche as opções e permite combinações por interseção.
function populateFilters() {
  const optionSets = {
    month: allMonths(),
    sex: groups(state.rows, "sex").map(([label]) => label),
    council: groups(state.rows, "council").map(([label]) => label),
    status: groups(state.rows, "status").map(([label]) => label),
    ageBand: groups(state.rows, "ageBand").map(([label]) => label)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)),
    race: groups(state.rows, "race").map(([label]) => label),
    sexual: groups(state.rows, "sexual").map(([label]) => label)
  };
  document.querySelectorAll("[data-filter]").forEach((select) => {
    const key = select.dataset.filter;
    optionSets[key].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = key === "month" ? monthLabel(value) : value;
      select.append(option);
    });
  });
}

function renderFilterSummary(rows) {
  const active = Object.entries(state.filters).filter(([, value]) => value);
  const period = state.filters.month ? monthLabel(state.filters.month) : "todo o período";
  document.getElementById("selection-summary").textContent =
    numberFormat.format(rows.length) + " de " + numberFormat.format(state.rows.length) +
    " casos · " + period + (active.length ? " · " +
      active.length + (active.length === 1 ? " filtro ativo" : " filtros ativos") : "");
  const chips = document.getElementById("active-filters");
  chips.replaceChildren();
  active.forEach(([key, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.removeFilter = key;
    button.textContent = filterLabels[key] + ": " +
      (key === "month" ? monthLabel(value) : value) + " ×";
    button.setAttribute("aria-label", "Remover filtro " + filterLabels[key] + ": " + value);
    chips.append(button);
  });
}

function setFilter(key, value) {
  if (!Object.hasOwn(state.filters, key)) {
    return;
  }
  state.filters[key] = state.filters[key] === value ? "" : value;
  document.querySelector('[data-filter="' + key + '"]').value = state.filters[key];
  state.page = 1;
  render();
}

function clearFilters() {
  Object.keys(state.filters).forEach((key) => {
    state.filters[key] = "";
    document.querySelector('[data-filter="' + key + '"]').value = "";
  });
  state.page = 1;
  render();
}

// INDICADORES: seis cartões mostram contagem, cobertura e incidência verificáveis.
function renderKpis(rows) {
  const total = rows.length;
  const active = count(rows, "status", "Ativo");
  const psycho = count(rows, "psycho", "Sim");
  const plans = count(rows, "plan", "Sim");
  const reports = count(rows, "bo", "Sim");
  const sexual = sexualIncidence(rows);
  const items = [
    ["Total de casos", numberFormat.format(total), state.filters.month ? monthComparison() : "Registros na seleção atual", colors.teal],
    ["Casos ativos", numberFormat.format(active), percent(active, total) + " da seleção", colors.indigo],
    ["Cobertura psicossocial", percent(psycho, total), numberFormat.format(psycho) + " com atendimento", colors.teal],
    ["Plano individual", percent(plans, total), numberFormat.format(plans) + " planos registrados", colors.amber],
    ["Casos com BO", percent(reports, total), numberFormat.format(reports) + " boletins registrados", colors.coral],
    ["Violência sexual registrada", percent(sexual, total), numberFormat.format(sexual) + " casos classificados", colors.violet]
  ];
  const container = document.getElementById("kpi-grid");
  container.replaceChildren();
  items.forEach(([label, value, note, color]) => {
    const card = document.createElement("article");
    card.className = "kpi";
    card.style.setProperty("--kpi-color", color);
    const labelNode = document.createElement("span");
    labelNode.className = "kpi-label";
    labelNode.textContent = label;
    const valueNode = document.createElement("strong");
    valueNode.className = "kpi-value";
    valueNode.textContent = value;
    const noteNode = document.createElement("span");
    noteNode.className = "kpi-note";
    noteNode.textContent = note;
    card.append(labelNode, valueNode, noteNode);
    container.append(card);
  });
}

// GRÁFICO DE TENDÊNCIA: uma linha mostra a evolução e pontos aplicam mês.
function svgNode(tag, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([name, value]) => element.setAttribute(name, String(value)));
  return element;
}

function renderTrend() {
  const selected = state.filters.month;
  const months = selected
    ? [previousMonth(selected), selected].filter((month) => allMonths().includes(month))
    : allMonths();
  const context = filteredRows(true);
  const values = months.map((month) =>
    context.filter((row) => monthOf(row) === month).length);
  const maximum = Math.max(10, Math.ceil(Math.max(...values, 1) / 10) * 10);
  const width = 650;
  const height = 210;
  const left = 34;
  const right = 14;
  const top = 18;
  const bottom = 36;
  const x = (index) => left + index * (width - left - right) / Math.max(months.length - 1, 1);
  const y = (value) => height - bottom - value / maximum * (height - top - bottom);
  const line = values.map((value, index) =>
    (index ? " L" : "M") + x(index) + " " + y(value)).join("");
  const area = line + " L" + x(months.length - 1) + " " + y(0) +
    " L" + x(0) + " " + y(0) + " Z";
  const container = document.getElementById("trend-chart");
  container.replaceChildren();
  const svg = svgNode("svg", {
    viewBox: "0 0 " + width + " " + height,
    role: "group",
    "aria-label": "Casos por mês: " +
      months.map((month, index) => monthLabel(month) + " " + values[index]).join("; ")
  });
  const defs = svgNode("defs");
  const gradient = svgNode("linearGradient", {
    id: "trend-area-fill",
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  });
  gradient.append(
    svgNode("stop", { offset: "0%", "stop-color": "#3ab7b6", "stop-opacity": "0.34" }),
    svgNode("stop", { offset: "100%", "stop-color": "#3ab7b6", "stop-opacity": "0.02" })
  );
  defs.append(gradient);
  svg.append(defs);
  [0, 0.5, 1].forEach((step) => {
    const value = Math.round(maximum * step);
    svg.append(svgNode("line", {
      class: "trend-grid",
      x1: left,
      x2: width - right,
      y1: y(value),
      y2: y(value)
    }));
    const label = svgNode("text", {
      class: "trend-axis-text",
      x: left - 7,
      y: y(value) + 3,
      "text-anchor": "end"
    });
    label.textContent = numberFormat.format(value);
    svg.append(label);
  });
  svg.append(svgNode("path", { class: "trend-area", d: area }));
  svg.append(svgNode("path", { class: "trend-line", d: line }));
  months.forEach((month, index) => {
    const value = values[index];
    const circle = svgNode("circle", {
      class: "trend-point",
      cx: x(index),
      cy: y(value),
      r: 5,
      tabindex: 0,
      role: "button",
      "aria-label": "Filtrar " + monthLabel(month) + ": " + value + " casos",
      "aria-pressed": selected === month
    });
    circle.dataset.chartKey = "month";
    circle.dataset.chartValue = month;
    const title = svgNode("title");
    title.textContent = monthLabel(month) + ": " + value + " casos";
    circle.append(title);
    svg.append(circle);
    const valueLabel = svgNode("text", {
      class: "trend-value-text",
      x: x(index),
      y: y(value) - 12,
      "text-anchor": "middle"
    });
    valueLabel.textContent = numberFormat.format(value);
    svg.append(valueLabel);
    if (months.length < 7 || index % 2 === 0 || index === months.length - 1) {
      const axisLabel = svgNode("text", {
        class: "trend-axis-text",
        x: x(index),
        y: height - 13,
        "text-anchor": index === 0 ? "start" :
          index === months.length - 1 ? "end" : "middle"
      });
      axisLabel.textContent = shortMonthLabel(month);
      svg.append(axisLabel);
    }
  });
  container.append(svg);
  const mobile = document.getElementById("trend-mobile");
  mobile.replaceChildren();
  months.forEach((month, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.chartKey = "month";
    button.dataset.chartValue = month;
    button.setAttribute("aria-pressed", String(selected === month));
    button.setAttribute("aria-label", "Filtrar " + monthLabel(month) + ": " + values[index] + " casos");
    const label = document.createElement("span");
    label.textContent = monthLabel(month);
    const track = document.createElement("span");
    track.className = "mobile-trend-track";
    const fill = document.createElement("span");
    fill.className = "mobile-trend-fill";
    fill.style.width = Math.max(2, values[index] / maximum * 100) + "%";
    track.append(fill);
    const value = document.createElement("span");
    value.className = "mobile-trend-value";
    value.textContent = numberFormat.format(values[index]);
    button.append(label, track, value);
    mobile.append(button);
  });
  document.getElementById("comparison-text").textContent = monthComparison();
}

// GRÁFICOS DE ROSCA: a legenda também é controle de filtro por teclado.
function renderDonut(containerId, pairs, key, palette) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  const sum = pairs.reduce((total, [, value]) => total + value, 0);
  let cursor = 0;
  const stops = pairs.map(([label, value], index) => {
    const start = cursor;
    cursor += sum ? value / sum * 100 : 0;
    return (palette[index % palette.length] || colors.slate) +
      " " + start + "% " + cursor + "%";
  });
  const ring = document.createElement("div");
  ring.className = "donut-ring";
  ring.style.background = "conic-gradient(" + stops.join(",") + ")";
  ring.setAttribute("role", "img");
  ring.setAttribute("aria-label", pairs.map(([label, value]) =>
    label + ": " + numberFormat.format(value)).join("; "));
  const center = document.createElement("div");
  center.className = "donut-center";
  const number = document.createElement("strong");
  number.textContent = numberFormat.format(sum);
  const caption = document.createElement("span");
  caption.textContent = "casos";
  center.append(number, caption);
  ring.append(center);
  const legend = document.createElement("div");
  legend.className = "donut-legend";
  pairs.forEach(([label, value], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "legend-button";
    button.dataset.chartKey = key;
    button.dataset.chartValue = label;
    button.setAttribute("aria-pressed", String(state.filters[key] === label));
    button.setAttribute("aria-label", "Filtrar " + label + ": " + value + " casos");
    const swatch = document.createElement("span");
    swatch.className = "legend-swatch";
    swatch.style.setProperty("--item-color", palette[index % palette.length]);
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("strong");
    amount.textContent = percent(value, sum);
    button.append(swatch, name, amount);
    legend.append(button);
  });
  container.append(ring, legend);
}

// GRÁFICOS DE BARRAS: o comprimento parte sempre de zero.
function renderBars(containerId, pairs, key, palette) {
  const container = document.getElementById(containerId);
  container.replaceChildren();
  const denominator = pairs.reduce((total, [, value]) => total + value, 0);
  const maximum = Math.max(...pairs.map(([, value]) => value), 1);
  pairs.forEach(([label, value], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "bar-button";
    button.dataset.chartKey = key;
    button.dataset.chartValue = label;
    button.setAttribute("aria-pressed", String(state.filters[key] === label));
    button.setAttribute("aria-label", "Filtrar " + label + ": " + value + " casos");
    const caption = document.createElement("span");
    caption.className = "bar-caption";
    const name = document.createElement("span");
    name.textContent = label;
    const amount = document.createElement("strong");
    amount.textContent = numberFormat.format(value) + " · " + percent(value, denominator);
    caption.append(name, amount);
    const track = document.createElement("span");
    track.className = "bar-track";
    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.width = value / maximum * 100 + "%";
    fill.style.setProperty("--bar-color", palette[index % palette.length]);
    track.append(fill);
    button.append(caption, track);
    container.append(button);
  });
}

// GRÁFICO DE FAIXA ETÁRIA: colunas com rótulos e valor em cada grupo.
function renderAge(rows) {
  const pairs = groups(rows, "ageBand").sort((a, b) =>
    parseInt(a[0], 10) - parseInt(b[0], 10));
  const maximum = Math.max(...pairs.map(([, value]) => value), 1);
  const palette = [colors.teal, colors.indigo, colors.amber, colors.coral, colors.violet];
  const container = document.getElementById("age-chart");
  container.replaceChildren();
  pairs.forEach(([label, value], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "column-button";
    button.dataset.chartKey = "ageBand";
    button.dataset.chartValue = label;
    button.setAttribute("aria-pressed", String(state.filters.ageBand === label));
    button.setAttribute("aria-label", "Filtrar " + label + ": " + value + " casos");
    const amount = document.createElement("span");
    amount.className = "column-value";
    amount.textContent = numberFormat.format(value);
    const fill = document.createElement("span");
    fill.className = "column-fill";
    fill.style.setProperty("--column-height", Math.max(2, value / maximum * 125) + "px");
    fill.style.setProperty("--column-color", palette[index % palette.length]);
    const name = document.createElement("span");
    name.className = "column-label";
    name.textContent = label.replace(" anos", "");
    button.append(amount, fill, name);
    container.append(button);
  });
}

// COBERTURA: apresenta "Sim" sobre o total, sem reclassificar vazios.
function renderCoverage(rows) {
  const items = [
    ["Atenção inicial", "initial", colors.teal],
    ["Atendimento psicossocial", "psycho", colors.indigo],
    ["Orientação jurídico-social", "legal", colors.amber]
  ];
  const container = document.getElementById("care-chart");
  container.replaceChildren();
  items.forEach(([label, key, color]) => {
    const value = count(rows, key, "Sim");
    const wrapper = document.createElement("div");
    wrapper.className = "coverage-row";
    const top = document.createElement("div");
    top.className = "coverage-top";
    const name = document.createElement("span");
    name.textContent = label;
    const rate = document.createElement("strong");
    rate.textContent = percent(value, rows.length);
    top.append(name, rate);
    const track = document.createElement("div");
    track.className = "coverage-track";
    const fill = document.createElement("span");
    fill.className = "coverage-fill";
    fill.style.width = rows.length ? value / rows.length * 100 + "%" : "0%";
    fill.style.setProperty("--coverage-color", color);
    track.append(fill);
    const note = document.createElement("span");
    note.className = "coverage-note";
    note.textContent = numberFormat.format(value) + " de " +
      numberFormat.format(rows.length) + " casos com “Sim” registrado";
    wrapper.append(top, track, note);
    container.append(wrapper);
  });
}

// TERRITÓRIO: identifica a maior contagem e registra empates.
function renderTopCouncil(rows) {
  const pairs = groups(rows, "council");
  const top = pairs[0];
  const tied = pairs.filter(([, value]) => value === top[1]);
  document.getElementById("top-council").textContent =
    tied.length > 1 ? tied.map(([label]) => label).join(" / ") : top[0];
  document.getElementById("top-council-note").textContent =
    numberFormat.format(top[1]) + " casos" +
    (tied.length > 1 ? " por conselho · empate no recorte" : " · " +
      percent(top[1], rows.length) + " do recorte");
}

// DETALHES: pagina os registros e abre um diálogo sem campos pessoais.
function renderTable(rows) {
  const body = document.getElementById("record-body");
  const pages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, pages);
  const start = (state.page - 1) * state.pageSize;
  body.replaceChildren();
  rows.slice(start, start + state.pageSize).forEach((row) => {
    const tr = document.createElement("tr");
    const cells = [
      "#" + String(row.id).padStart(4, "0"),
      formatDate(row.entry),
      valueOrMissing(row.sex),
      valueOrMissing(row.council),
      valueOrMissing(row.status),
      valueOrMissing(row.psycho)
    ];
    cells.forEach((value) => {
      const td = document.createElement("td");
      td.textContent = value;
      tr.append(td);
    });
    const actionCell = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.detailId = String(row.id);
    button.textContent = "Abrir";
    button.setAttribute("aria-label", "Abrir detalhe do prontuário " + row.id);
    actionCell.append(button);
    tr.append(actionCell);
    body.append(tr);
  });
  if (!rows.length) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 7;
    td.textContent = "Nenhum registro neste recorte.";
    tr.append(td);
    body.append(tr);
  }
  document.getElementById("record-count").textContent =
    numberFormat.format(rows.length) + " registros";
  document.getElementById("page-label").textContent =
    "Página " + state.page + " de " + pages;
  document.getElementById("prev-page").disabled = state.page === 1;
  document.getElementById("next-page").disabled = state.page === pages;
}

function openDetail(id, trigger) {
  const row = filteredRows().find((item) => String(item.id) === id);
  if (!row) {
    return;
  }
  state.lastDetailButton = trigger;
  document.getElementById("dialog-title").textContent =
    "Prontuário #" + String(row.id).padStart(4, "0");
  const list = document.getElementById("dialog-content");
  list.replaceChildren();
  detailFields.forEach(([key, label]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const value = document.createElement("dd");
    value.textContent = key === "entry" ? formatDate(row.entry) : valueOrMissing(row[key]);
    wrapper.append(term, value);
    list.append(wrapper);
  });
  document.getElementById("detail-dialog").showModal();
}

// APRESENTAÇÃO: atualiza todos os gráficos e cartões a partir do mesmo recorte.
function render() {
  const rows = filteredRows();
  renderFilterSummary(rows);
  document.getElementById("empty-state").hidden = rows.length !== 0;
  document.getElementById("analysis-results").hidden = rows.length === 0;
  if (rows.length) {
    renderKpis(rows);
    renderTrend();
    renderDonut("status-chart", groups(rows, "status"), "status",
      [colors.teal, colors.amber, colors.indigo]);
    renderAge(rows);
    renderDonut("sex-chart", groups(rows, "sex"), "sex",
      [colors.indigo, colors.coral, colors.slate]);
    renderBars("race-chart", groups(rows, "race"), "race",
      [colors.indigo, colors.teal, colors.violet, colors.amber, colors.coral]);
    renderCoverage(rows);
    renderDonut("plan-chart", groups(rows, "plan"), "plan",
      [colors.slate, colors.teal, colors.amber]);
    renderBars("sexual-chart", groups(rows, "sexual"), "sexual",
      [colors.slate, colors.coral, colors.violet]);
    renderBars("relation-chart", groups(rows, "relation"), "relation",
      [colors.indigo, colors.teal, colors.amber, colors.coral, colors.violet]);
    renderBars("council-chart", groups(rows, "council"), "council",
      [colors.indigo, colors.teal, colors.amber]);
    renderTopCouncil(rows);
  }
  renderTable(rows);
}

// NAVEGAÇÃO: a barra lateral vira um menu fechado no celular.
function setMenu(open) {
  const menu = document.getElementById("sidebar");
  const button = document.getElementById("menu-button");
  menu.classList.toggle("is-open", open);
  button.setAttribute("aria-expanded", String(open));
  button.setAttribute("aria-label", open ? "Fechar navegação" : "Abrir navegação");
  document.getElementById("sidebar-overlay").hidden = !open;
  if (open) {
    menu.querySelector("a").focus();
  } else {
    button.focus();
  }
}

function setupNavigation() {
  const button = document.getElementById("menu-button");
  button.addEventListener("click", () =>
    setMenu(button.getAttribute("aria-expanded") !== "true"));
  document.getElementById("sidebar-overlay").addEventListener("click", () =>
    setMenu(false));
  document.querySelectorAll(".sidebar-nav a").forEach((link) => {
    link.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-nav a").forEach((item) =>
        item.removeAttribute("aria-current"));
      link.setAttribute("aria-current", "page");
      if (window.matchMedia("(max-width: 900px)").matches) {
        setMenu(false);
      }
    });
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setMenu(false);
    }
  });
}

// EVENTOS: botões dos gráficos, tabela e filtros acionam o mesmo estado.
function setupEvents() {
  setupNavigation();
  document.querySelectorAll("[data-filter]").forEach((select) => {
    select.addEventListener("change", () => {
      state.filters[select.dataset.filter] = select.value;
      state.page = 1;
      render();
    });
  });
  document.getElementById("clear-filters").addEventListener("click", clearFilters);
  document.getElementById("empty-clear").addEventListener("click", clearFilters);
  document.getElementById("active-filters").addEventListener("click", (event) => {
    const chip = event.target.closest("[data-remove-filter]");
    if (chip) {
      setFilter(chip.dataset.removeFilter, state.filters[chip.dataset.removeFilter]);
    }
  });
  document.getElementById("analysis-results").addEventListener("click", (event) => {
    const control = event.target.closest("[data-chart-key]");
    if (control) {
      setFilter(control.dataset.chartKey, control.dataset.chartValue);
    }
  });
  document.getElementById("analysis-results").addEventListener("keydown", (event) => {
    const control = event.target.closest("circle[data-chart-key]");
    if (control && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      setFilter(control.dataset.chartKey, control.dataset.chartValue);
    }
  });
  document.getElementById("prev-page").addEventListener("click", () => {
    state.page -= 1;
    renderTable(filteredRows());
  });
  document.getElementById("next-page").addEventListener("click", () => {
    state.page += 1;
    renderTable(filteredRows());
  });
  document.getElementById("record-body").addEventListener("click", (event) => {
    const button = event.target.closest("[data-detail-id]");
    if (button) {
      openDetail(button.dataset.detailId, button);
    }
  });
  const dialog = document.getElementById("detail-dialog");
  document.getElementById("close-dialog").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => state.lastDetailButton?.focus());
}

// INÍCIO: valida o arquivo antes de mostrar os dados no dashboard.
async function start() {
  setupEvents();
  try {
    const response = await fetch("./dados-ficticios.json");
    if (!response.ok) {
      throw new Error("Resposta " + response.status);
    }
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.some((row) =>
      !hasValue(row.id) || !validMonth(monthOf(row)))) {
      throw new Error("Formato da base inválido");
    }
    state.rows = rows;
    populateFilters();
    const months = allMonths();
    const period = monthLabel(months[0]) + " a " +
      monthLabel(months[months.length - 1]);
    document.getElementById("base-period").textContent = period;
    document.getElementById("topbar-period").textContent = period;
    render();
  } catch (error) {
    document.getElementById("selection-summary").textContent =
      "Não foi possível carregar a base. Abra a página por um servidor local.";
    document.getElementById("analysis-results").hidden = true;
    document.getElementById("empty-state").hidden = true;
    document.querySelectorAll("[data-filter]").forEach((select) => {
      select.disabled = true;
    });
    document.getElementById("base-period").textContent = "Base indisponível";
    document.getElementById("topbar-period").textContent = "Base indisponível";
    console.error("Falha ao carregar dados fictícios:", error);
  }
}

start();

