/* Expense Tracker — vanilla JS, persisted to localStorage. */
(function () {
  "use strict";

  const STORAGE_KEY = "expense-tracker:expenses";

  const CATEGORY_META = {
    Food: { emoji: "🍔", color: "var(--cat-food)" },
    Transport: { emoji: "🚗", color: "var(--cat-transport)" },
    Housing: { emoji: "🏠", color: "var(--cat-housing)" },
    Utilities: { emoji: "💡", color: "var(--cat-utilities)" },
    Entertainment: { emoji: "🎬", color: "var(--cat-entertainment)" },
    Health: { emoji: "⚕️", color: "var(--cat-health)" },
    Shopping: { emoji: "🛍️", color: "var(--cat-shopping)" },
    Education: { emoji: "📚", color: "var(--cat-education)" },
    Travel: { emoji: "✈️", color: "var(--cat-travel)" },
    Other: { emoji: "📦", color: "var(--cat-other)" },
  };

  const currencyFmt = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  });

  // ---------- State ----------

  let expenses = loadExpenses();
  let filters = { search: "", category: "", month: "" };

  function loadExpenses() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter(
            (e) =>
              e &&
              typeof e.id === "string" &&
              typeof e.description === "string" &&
              typeof e.amount === "number" &&
              typeof e.date === "string" &&
              typeof e.category === "string"
          )
        : [];
    } catch {
      return [];
    }
  }

  function saveExpenses() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  }

  // ---------- DOM ----------

  const $ = (id) => document.getElementById(id);

  const form = $("expense-form");
  const idInput = $("expense-id");
  const descInput = $("description");
  const amountInput = $("amount");
  const dateInput = $("date");
  const categoryInput = $("category");
  const notesInput = $("notes");
  const submitBtn = $("submit-btn");
  const cancelEditBtn = $("cancel-edit-btn");
  const formTitle = $("form-title");
  const listEl = $("expense-list");
  const emptyState = $("empty-state");
  const searchInput = $("search");
  const filterCategory = $("filter-category");
  const filterMonth = $("filter-month");
  const filterSummary = $("filter-summary");
  const chartEl = $("category-chart");
  const chartEmpty = $("chart-empty");
  const chartScope = $("chart-scope");

  // ---------- Helpers ----------

  function todayISO() {
    const d = new Date();
    return [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, "0"),
      String(d.getDate()).padStart(2, "0"),
    ].join("-");
  }

  function monthKey(isoDate) {
    return isoDate.slice(0, 7); // "YYYY-MM"
  }

  function formatMonth(key) {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }

  function formatDate(isoDate) {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function getFiltered() {
    const q = filters.search.trim().toLowerCase();
    return expenses
      .filter((e) => {
        if (filters.category && e.category !== filters.category) return false;
        if (filters.month && monthKey(e.date) !== filters.month) return false;
        if (
          q &&
          !e.description.toLowerCase().includes(q) &&
          !(e.notes || "").toLowerCase().includes(q)
        )
          return false;
        return true;
      })
      .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }

  // ---------- Rendering ----------

  function render() {
    renderSummary();
    renderMonthOptions();
    renderList();
    renderChart();
  }

  function renderSummary() {
    const today = todayISO();
    const thisMonth = monthKey(today);
    let monthTotal = 0;
    let todayTotal = 0;
    let total = 0;

    for (const e of expenses) {
      total += e.amount;
      if (monthKey(e.date) === thisMonth) monthTotal += e.amount;
      if (e.date === today) todayTotal += e.amount;
    }

    $("sum-month").textContent = currencyFmt.format(monthTotal);
    $("sum-today").textContent = currencyFmt.format(todayTotal);
    $("sum-total").textContent = currencyFmt.format(total);
    $("sum-count").textContent = String(expenses.length);
  }

  function renderMonthOptions() {
    const months = [...new Set(expenses.map((e) => monthKey(e.date)))].sort().reverse();
    const current = filterMonth.value;
    filterMonth.innerHTML = '<option value="">All months</option>';
    for (const m of months) {
      const opt = document.createElement("option");
      opt.value = m;
      opt.textContent = formatMonth(m);
      filterMonth.appendChild(opt);
    }
    if (months.includes(current)) filterMonth.value = current;
    else filters.month = filterMonth.value = "";
  }

  function renderList() {
    const items = getFiltered();
    listEl.innerHTML = "";
    emptyState.classList.toggle("hidden", expenses.length > 0);

    const hasFilter = filters.search || filters.category || filters.month;
    if (hasFilter) {
      const filteredTotal = items.reduce((s, e) => s + e.amount, 0);
      filterSummary.textContent = `${items.length} matching expense${
        items.length === 1 ? "" : "s"
      } · ${currencyFmt.format(filteredTotal)}`;
      filterSummary.classList.remove("hidden");
    } else {
      filterSummary.classList.add("hidden");
    }

    if (expenses.length > 0 && items.length === 0) {
      const li = document.createElement("li");
      li.className = "empty-state";
      li.textContent = "No expenses match your filters.";
      listEl.appendChild(li);
      return;
    }

    for (const e of items) {
      const meta = CATEGORY_META[e.category] || CATEGORY_META.Other;
      const li = document.createElement("li");
      li.className = "expense-item";

      const dot = document.createElement("span");
      dot.className = "cat-dot";
      dot.style.background = meta.color;

      const main = document.createElement("div");
      main.className = "expense-main";

      const desc = document.createElement("div");
      desc.className = "expense-desc";
      desc.textContent = e.description;

      const metaLine = document.createElement("div");
      metaLine.className = "expense-meta";
      metaLine.textContent = `${meta.emoji} ${e.category} · ${formatDate(e.date)}`;

      main.appendChild(desc);
      main.appendChild(metaLine);

      if (e.notes) {
        const notes = document.createElement("div");
        notes.className = "expense-notes";
        notes.textContent = e.notes;
        main.appendChild(notes);
      }

      const amount = document.createElement("span");
      amount.className = "expense-amount";
      amount.textContent = currencyFmt.format(e.amount);

      const actions = document.createElement("div");
      actions.className = "expense-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "icon-btn";
      editBtn.title = "Edit";
      editBtn.textContent = "✏️";
      editBtn.addEventListener("click", () => startEdit(e.id));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "icon-btn delete";
      deleteBtn.title = "Delete";
      deleteBtn.textContent = "🗑️";
      deleteBtn.addEventListener("click", () => deleteExpense(e.id));

      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      li.appendChild(dot);
      li.appendChild(main);
      li.appendChild(amount);
      li.appendChild(actions);
      listEl.appendChild(li);
    }
  }

  function renderChart() {
    // Chart respects the month filter so users can inspect a single month.
    const scoped = filters.month
      ? expenses.filter((e) => monthKey(e.date) === filters.month)
      : expenses;

    chartScope.textContent = filters.month ? `— ${formatMonth(filters.month)}` : "— all time";

    const totals = new Map();
    for (const e of scoped) {
      totals.set(e.category, (totals.get(e.category) || 0) + e.amount);
    }

    const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    chartEl.innerHTML = "";
    chartEmpty.classList.toggle("hidden", rows.length > 0);
    if (rows.length === 0) return;

    const max = rows[0][1];
    const grand = rows.reduce((s, [, v]) => s + v, 0);

    for (const [category, value] of rows) {
      const meta = CATEGORY_META[category] || CATEGORY_META.Other;

      const row = document.createElement("div");
      row.className = "chart-row";

      const label = document.createElement("span");
      label.className = "chart-label";
      label.textContent = `${meta.emoji} ${category}`;

      const track = document.createElement("div");
      track.className = "chart-track";
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.style.width = `${(value / max) * 100}%`;
      bar.style.background = meta.color;
      track.appendChild(bar);

      const val = document.createElement("span");
      val.className = "chart-value";
      val.textContent = `${currencyFmt.format(value)} (${Math.round((value / grand) * 100)}%)`;

      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(val);
      chartEl.appendChild(row);
    }
  }

  // ---------- Actions ----------

  function resetForm() {
    form.reset();
    idInput.value = "";
    dateInput.value = todayISO();
    formTitle.textContent = "Add Expense";
    submitBtn.textContent = "Add Expense";
    cancelEditBtn.classList.add("hidden");
  }

  function startEdit(id) {
    const e = expenses.find((x) => x.id === id);
    if (!e) return;
    idInput.value = e.id;
    descInput.value = e.description;
    amountInput.value = e.amount;
    dateInput.value = e.date;
    categoryInput.value = e.category;
    notesInput.value = e.notes || "";
    formTitle.textContent = "Edit Expense";
    submitBtn.textContent = "Save Changes";
    cancelEditBtn.classList.remove("hidden");
    descInput.focus();
  }

  function deleteExpense(id) {
    const e = expenses.find((x) => x.id === id);
    if (!e) return;
    if (!confirm(`Delete "${e.description}" (${currencyFmt.format(e.amount)})?`)) return;
    expenses = expenses.filter((x) => x.id !== id);
    if (idInput.value === id) resetForm();
    saveExpenses();
    render();
  }

  function exportCSV() {
    const header = ["Date", "Description", "Category", "Amount", "Notes"];
    const escape = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const rows = [...expenses]
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
      .map((e) =>
        [e.date, e.description, e.category, e.amount.toFixed(2), e.notes || ""]
          .map(escape)
          .join(",")
      );
    const csv = [header.map(escape).join(","), ...rows].join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expenses-${todayISO()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ---------- Events ----------

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const amount = Math.round(parseFloat(amountInput.value) * 100) / 100;
    if (!Number.isFinite(amount) || amount <= 0) {
      amountInput.focus();
      return;
    }

    const data = {
      description: descInput.value.trim(),
      amount,
      date: dateInput.value,
      category: categoryInput.value,
      notes: notesInput.value.trim(),
    };
    if (!data.description || !data.date) return;

    const editingId = idInput.value;
    if (editingId) {
      const idx = expenses.findIndex((x) => x.id === editingId);
      if (idx !== -1) expenses[idx] = { ...expenses[idx], ...data };
    } else {
      expenses.push({ id: uid(), ...data });
    }

    saveExpenses();
    resetForm();
    render();
  });

  cancelEditBtn.addEventListener("click", resetForm);

  searchInput.addEventListener("input", () => {
    filters.search = searchInput.value;
    renderList();
  });

  filterCategory.addEventListener("change", () => {
    filters.category = filterCategory.value;
    renderList();
  });

  filterMonth.addEventListener("change", () => {
    filters.month = filterMonth.value;
    renderList();
    renderChart();
  });

  $("export-btn").addEventListener("click", exportCSV);

  // ---------- Init ----------

  dateInput.value = todayISO();
  render();
})();
