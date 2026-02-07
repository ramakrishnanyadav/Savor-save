import { FoodExpense } from '@/types/expense';
import { format } from 'date-fns';

export function exportToCSV(expenses: FoodExpense[], filename: string = 'expenses.csv') {
  // Create CSV header
  const headers = [
    'Date',
    'Description',
    'Amount',
    'Category',
    'Meal Type',
    'Status',
    'Type',
    'Restaurant',
    'Notes',
  ];

  // Create CSV rows
  const rows = expenses.map(expense => [
    format(expense.date, 'yyyy-MM-dd HH:mm:ss'),
    expense.foodName,
    expense.amount.toFixed(2),
    expense.category,
    expense.mealType,
    expense.status || 'completed',
    expense.transactionType || 'expense',
    expense.restaurant || '',
    expense.notes || '',
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(expenses: FoodExpense[], filename: string = 'expenses.json') {
  const jsonContent = JSON.stringify(expenses, null, 2);
  
  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateExpenseReport(expenses: FoodExpense[]) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const byMealType = expenses.reduce((acc, e) => {
    acc[e.mealType] = (acc[e.mealType] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return {
    summary: {
      totalExpenses: expenses.length,
      totalAmount: total,
      averageAmount: total / (expenses.length || 1),
      period: {
        from: expenses.length > 0 ? format(new Date(Math.min(...expenses.map(e => e.date.getTime()))), 'yyyy-MM-dd') : '',
        to: expenses.length > 0 ? format(new Date(Math.max(...expenses.map(e => e.date.getTime()))), 'yyyy-MM-dd') : '',
      }
    },
    byCategory,
    byMealType,
    expenses: expenses.map(e => ({
      date: format(e.date, 'yyyy-MM-dd HH:mm:ss'),
      description: e.foodName,
      amount: e.amount,
      category: e.category,
      mealType: e.mealType,
    }))
  };
}

export function printExpenses(expenses: FoodExpense[]) {
  const report = generateExpenseReport(expenses);
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        h1 { color: #ef4444; }
        h2 { color: #3b82f6; margin-top: 30px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
        }
        .summary {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
        }
        .total {
          font-weight: bold;
          font-size: 24px;
          color: #ef4444;
        }
        @media print {
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>💰 Expense Report</h1>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">
          <span>Total Expenses:</span>
          <span>${report.summary.totalExpenses}</span>
        </div>
        <div class="summary-item">
          <span>Period:</span>
          <span>${report.summary.period.from} to ${report.summary.period.to}</span>
        </div>
        <div class="summary-item">
          <span>Average Amount:</span>
          <span>₹${report.summary.averageAmount.toFixed(2)}</span>
        </div>
        <div class="summary-item total">
          <span>Total Amount:</span>
          <span>₹${report.summary.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <h2>By Category</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(report.byCategory).map(([cat, amount]) => `
            <tr>
              <td>${cat}</td>
              <td>₹${amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>By Meal Type</h2>
      <table>
        <thead>
          <tr>
            <th>Meal Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(report.byMealType).map(([meal, amount]) => `
            <tr>
              <td>${meal}</td>
              <td>₹${amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>All Expenses</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Meal</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          ${report.expenses.map(e => `
            <tr>
              <td>${e.date}</td>
              <td>${e.description}</td>
              <td>${e.category}</td>
              <td>${e.mealType}</td>
              <td>₹${e.amount.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <button onclick="window.print()" style="margin-top: 30px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        Print Report
      </button>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
