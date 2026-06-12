# 💸 Expense Tracker

A lightweight, zero-dependency expense tracker that runs entirely in the browser. No build step, no server, no accounts — your data is stored locally in your browser via `localStorage` and never leaves your device.

## Features

- **Add, edit, and delete expenses** with description, amount, date, category, and optional notes
- **10 categories** (Food, Transport, Housing, Utilities, Entertainment, Health, Shopping, Education, Travel, Other), each color-coded
- **Summary cards** for today, the current month, all-time total, and transaction count
- **Search and filtering** by text, category, and month — with a running total of the filtered results
- **Spending-by-category chart** with percentages, scoped to the selected month or all time
- **CSV export** of all expenses for use in spreadsheets
- **Responsive layout** that works on desktop and mobile

## Getting Started

No installation required. Either:

1. **Open directly** — double-click `index.html` (or open it in any modern browser), or
2. **Serve locally** (avoids any browser restrictions on `file://` URLs):

   ```sh
   # Python
   python3 -m http.server 8000

   # or Node
   npx serve .
   ```

   Then visit <http://localhost:8000>.

## Project Structure

```
index.html   Markup: form, expense list, summary cards, chart
styles.css   All styling (CSS custom properties, responsive grid)
app.js       Application logic: state, rendering, persistence, CSV export
```

## Data & Privacy

Expenses are persisted under the `expense-tracker:expenses` key in `localStorage`. Clearing your browser's site data will erase them — use **Export CSV** to back up first.
