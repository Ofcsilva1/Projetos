// DADOS: carrega a base fictícia e guarda os filtros em um único lugar.
"use strict";

const state = {
  rows: [],
  filters: {
    month: "",
    sex: "",
    council: "",
    status: ""
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
  status: "Situação"
};

const detailFields = [
  ["entry", "Data de entrada"],
  ["sex", "Sexo"],
  ["ageBand", "Faixa etária"],
  ["council", "Conselho Tutelar"],
  ["origin", "Origem"],
  ["status", "Situação"],
  ["initial", "Atenção inicial"],
  ["psycho", "Atendimento psicossocial"],
  ["legal", "Orientação jurídico-social"],
  ["bo", "Boletim de ocorrência"]
];

// MÉTRICAS: calcula contagens e percentuais no mesmo recorte.
function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function valueOrMissing(value) {
  return hasValue(value) ? String(value) : "Não informado";
}

function monthOf(row) {
  return typeof row.entry === "string" ? row.entry.slice(0, 7) : "";
}

function validMonth(value) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

function monthLabel(value) {
  if (!validMonth(value)) {
    return "Mês não informado";
  }
  return monthFormat.format(new Date(value + "-01T00:00:00Z"));
}

function formatDate(value) {
  const date = new Date(String(value) + "T00:00:00Z");
  return Number.isNaN(date.valueOf()) ? "Não informada" : dateFormat.format(date);
}

function previousMonth(value) {
  const date = new Date(value + "-01T00:00:00Z");
  date.setUTCMonth(date.getUTCMonth() - 1);
  return date.toISOString().slice(0, 7);
}

function filteredRows(ignoreMonth = false) {
  return state.rows.filter((row) => {
    return Object.entries(state.filters).every(([key, selected]) => {
      if (!selected || (ignoreMonth && key === "month")) {
        return true;
      }
      return (key === "month" ? monthOf(row) : valueOrMissing(row[key])) === selected;
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
  const counts = new Map();
  rows.forEach((row) => {
    const value = valueOrMissing(row[key]);
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "pt-BR"));
}

function allMonths() {
  return [...new Set(state.rows.map(monthOf).filter(validMonth))].sort();
}

// FILTROS: preenche opções, mostra o recorte ativo e permite limpá-lo.
function populateFilters() {
  const options = {
    month: allMonths(),
    sex: groups(state.rows, "sex").map(([label]) => label),
    council: groups(state.rows, "council").map(([label]) => label),
    status: groups(state.rows, "status").map(([label]) => label)
  };
  document.querySelectorAll("[data-filter]").forEach((select) => {
    const key = select.dataset.filter;
    options[key].forEach((value) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = key === "month" ? monthLabel(value) : value;
      select.append(option);
    });
  });
}

function renderFilterSummary(rows) {
  const selectedMonth = state.filters.month;
  const period = selectedMonth ? monthLabel(selectedMonth) : "todo o período";
  const active = Object.entries(state.filters).filter(([, value]) => value);
  const extraCount = active.length - (selectedMonth ? 1 : 0);
  const extraText = extraCount
    ? " · " + extraCount + (
      selectedMonth
        ? (extraCount === 1 ? " outro filtro" : " outros filtros")
        : (extraCount === 1 ? " filtro ativo" : " filtros ativos")
    )
    : "";
  document.getElementById("selection-summary").textContent =
    numberFormat.format(rows.length) + " de " + numberFormat.format(state.rows.length) +
    " casos · " + period + extraText;

  const chips = document.getElementById("active-filters");
  chips.replaceChildren();
  active.forEach(([key, value]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-chip";
    button.dataset.removeFilter = key;
    button.textContent = filterLabels[key] + ": " + (key === "month" ? monthLabel(value) : value) + " ×";
    button.setAttribute("aria-label", "Remover filtro " + filterLabels[key] + ": " + value);
    chips.append(button);
  });
}

function setFilter(key, value) {
  state.filters[key] = state.filters[key] === value ? "" : value;
  state.page = 1;
  document.querySelector('[data-filter="' + key + '"]').value = state.filters[key];
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

// INDICADORES: mostra valores e a comparação mensal quando há referência.
function comparisonText() {
  const selected = state.filters.month;
  if (!selected) {
    return "Selecione um mês para comparar";
  }
  const previous = previousMonth(selected);
  if (!allMonths().includes(previous)) {
    return "Mês anterior fora da base";
  }
  const contextRows = filteredRows(true);
  const currentCount = contextRows.filter((row) => monthOf(row) === selected).length;
  const previousCount = contextRows.filter((row) => monthOf(row) === previous).length;
  const difference = currentCount - previousCount;
  const sign = difference > 0 ? "+" : "";
  const unit = Math.abs(difference) === 1 ? " caso" : " casos";
  return sign + numberFormat.format(difference) + unit + " vs. " + monthLabel(previous) +
    " (" + numberFormat.format(previousCount) + ")";
}

function renderKpis(rows) {
  const total = rows.length;
  const items = [
    ["Total de casos", numberFormat.format(total), comparisonText()],
    ["Cobertura psicossocial", percent(count(rows, "psycho", "Sim"), total), numberFormat.format(count(rows, "psycho", "Sim")) + " casos com atendimento registrado"],
    ["Casos femininos", percent(count(rows, "sex", "Feminino"), total), numberFormat.format(count(rows, "sex", "Feminino")) + " casos na seleção"],
    ["Casos com BO", percent(count(rows, "bo", "Sim"), total), numberFormat.format(count(rows, "bo", "Sim")) + " casos com boletim registrado"]
  ];
  const container = document.getElementById("kpi-grid");
  container.replaceChildren();
  items.forEach(([label, value, note], index) => {
    const card = document.createElement("article");
    card.className = "kpi" + (index === 0 ? " kpi-primary" : "");
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

// GRÁFICOS: barras e meses são botões para seleção por mouse ou teclado.
function renderTrend(rows) {
  const selectedMonth = state.filters.month;
  const months = selectedMonth
    ? [previousMonth(selectedMonth), selectedMonth].filter((month) => allMonths().includes(month))
    : allMonths();
  const contextRows = filteredRows(true);
  const values = months.map((month) => contextRows.filter((row) => monthOf(row) === month).length);
  const maximum = Math.max(...values, 1);
  const container = document.getElementById("trend-chart");
  container.replaceChildren();
  months.forEach((month, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "trend-item";
    button.dataset.chartKey = "month";
    button.dataset.chartValue = month;
    button.setAttribute("aria-pressed", String(selectedMonth === month));
    button.setAttribute("aria-label", monthLabel(month) + ": " + values[index] + " casos. Filtrar este mês.");
    const value = document.createElement("span");
    value.className = "trend-value";
    value.textContent = numberFormat.format(values[index]);
    const bar = document.createElement("span");
    bar.className = "trend-bar";
    bar.style.setProperty("--bar-ratio", String(values[index] / maximum));
    const label = document.createElement("span");
    label.className = "trend-label";
    label.textContent = monthLabel(month);
    button.append(value, bar, label);
    container.append(button);
  });
}

function renderBars(containerId, pairs, key, denominator, isPercent = false) {
  const container = document.getElementById(containerId);
  const maximum = isPercent ? 100 : Math.max(...pairs.map(([, value]) => value), 1);
  container.replaceChildren();
  pairs.forEach(([label, value]) => {
    const element = document.createElement(key ? "button" : "div");
    element.className = key ? "bar-button" : "bar-static";
    if (key) {
      element.type = "button";
      element.dataset.chartKey = key;
      element.dataset.chartValue = label;
      element.setAttribute("aria-pressed", String(state.filters[key] === label));
      element.setAttribute("aria-label", "Filtrar " + label + ": " + numberFormat.format(value) + " casos");
    }
    const caption = document.createElement("span");
    caption.className = "bar-caption";
    const name = document.createElement("span");
    name.className = "bar-name";
    name.textContent = label;
    const number = document.createElement("strong");
    number.textContent = isPercent ? percent(value, denominator) : numberFormat.format(value) + " · " + percent(value, denominator);
    caption.append(name, number);
    const track = document.createElement("span");
    track.className = "bar-track";
    const fill = document.createElement("span");
    fill.className = "bar-fill";
    fill.style.width = (isPercent ? (denominator ? value / denominator * 100 : 0) : value / maximum * 100) + "%";
    track.append(fill);
    element.append(caption, track);
    container.append(element);
  });
}

function renderCharts(rows) {
  renderTrend(rows);
  renderBars("status-chart", groups(rows, "status"), "status", rows.length);
  renderBars("council-chart", groups(rows, "council"), "council", rows.length);
  const care = [
    ["Atenção inicial", count(rows, "initial", "Sim")],
    ["Atendimento psicossocial", count(rows, "psycho", "Sim")],
    ["Orientação jurídico-social", count(rows, "legal", "Sim")]
  ];
  renderBars("care-chart", care, "", rows.length, true);
}

// DETALHES: pagina registros e abre uma janela com campos não identificáveis.
function renderTable(rows) {
  const body = document.getElementById("record-body");
  const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
  state.page = Math.min(state.page, totalPages);
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
  document.getElementById("record-count").textContent = numberFormat.format(rows.length) + " registros";
  document.getElementById("page-label").textContent = "Página " + state.page + " de " + totalPages;
  document.getElementById("prev-page").disabled = state.page === 1;
  document.getElementById("next-page").disabled = state.page === totalPages;
}

function openDetail(id, trigger) {
  const row = filteredRows().find((item) => String(item.id) === id);
  if (!row) {
    return;
  }
  state.lastDetailButton = trigger;
  document.getElementById("dialog-title").textContent = "Prontuário #" + String(row.id).padStart(4, "0");
  const list = document.getElementById("dialog-content");
  list.replaceChildren();
  detailFields.forEach(([key, label]) => {
    const wrapper = document.createElement("div");
    const term = document.createElement("dt");
    term.textContent = label;
    const description = document.createElement("dd");
    description.textContent = key === "entry" ? formatDate(row.entry) : valueOrMissing(row[key]);
    wrapper.append(term, description);
    list.append(wrapper);
  });
  document.getElementById("detail-dialog").showModal();
}

// APRESENTAÇÃO: atualiza todos os componentes após cada escolha.
function render() {
  const rows = filteredRows();
  renderFilterSummary(rows);
  document.getElementById("empty-state").hidden = rows.length !== 0;
  document.getElementById("results").hidden = rows.length === 0;
  if (rows.length) {
    renderKpis(rows);
    renderCharts(rows);
  }
  renderTable(rows);
}

function setupEvents() {
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
    const button = event.target.closest("[data-remove-filter]");
    if (button) {
      setFilter(button.dataset.removeFilter, state.filters[button.dataset.removeFilter]);
    }
  });
  document.querySelector(".dashboard-content").addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart-key]");
    if (button) {
      setFilter(button.dataset.chartKey, button.dataset.chartValue);
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

// INÍCIO: valida a base antes de exibir o dashboard.
async function start() {
  setupEvents();
  try {
    const response = await fetch("./dados-ficticios.json");
    if (!response.ok) {
      throw new Error("Resposta " + response.status);
    }
    const rows = await response.json();
    if (!Array.isArray(rows) || rows.some((row) => !hasValue(row.id) || !validMonth(monthOf(row)))) {
      throw new Error("Formato da base inválido");
    }
    state.rows = rows;
    populateFilters();
    const months = allMonths();
    document.getElementById("base-period").textContent =
      monthLabel(months[0]) + " a " + monthLabel(months[months.length - 1]);
    render();
  } catch (error) {
    document.getElementById("selection-summary").textContent =
      "Não foi possível carregar a base. Abra o projeto por um servidor local e tente novamente.";
    document.getElementById("results").hidden = true;
    document.getElementById("empty-state").hidden = true;
    document.getElementById("base-period").textContent = "Base indisponível";
    console.error("Falha ao carregar dados fictícios:", error);
  }
}

start();

