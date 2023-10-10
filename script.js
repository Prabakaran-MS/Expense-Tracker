// Updated variable names
let timeFrameSelect = document.getElementById('timeFrameSelect');
let expenseDateInput = document.getElementById('expenseDate');
let expenseCategoryInput = document.getElementById('expenseCategory');
let expenseDescriptionInput = document.getElementById('expenseDescription');
let expenseAmountInput = document.getElementById('expenseAmount');
let expenseList = document.getElementById('expenseList');
let weekTotal = document.getElementById('weekTotal');
let monthTotal = document.getElementById('monthTotal');
let yearTotal = document.getElementById('yearTotal');
let overallTotal = document.getElementById('overallTotal');
const expenseChartCanvas = document.getElementById("expenseChartCanvas").getContext("2d");
const rupeeSymbol = '\u20B9';
var expenses = [];
let expenseChart;

// Updated function names and variable names
function addExpense() {
    date = expenseDateInput.value;
    category = expenseCategoryInput.value;
    description = expenseDescriptionInput.value || "";
    amount = parseFloat(expenseAmountInput.value);

    if (date === "" || category === "" || isNaN(amount)) {
        alert("Please fill in all fields with valid values.");
        return;
    }
    const transaction = {
        date: date,
        category: category,
        description: description,
        amount: amount
    };
    expenses.push(transaction);
    expenses.sort(compareDatesDesc);
    saveExpenses();
    renderPage();
    resetForm();
}

function compareDatesDesc(a, b) {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);

    if (dateA > dateB) {
        return -1;
    } else if (dateA < dateB) {
        return 1;
    } else {
        return 0;
    }
}

function resetForm() {
    expenseDateInput.value = "";
    expenseCategoryInput.value = "";
    expenseDescriptionInput.value = "";
    expenseAmountInput.value = "";
}

function renderPage() {
    expenseList.innerHTML = "";
    expenses.forEach((transaction, index) => {
        const expenseItem = createExpenseElement(transaction, index);
        expenseList.appendChild(expenseItem);
    });
    displayTotals();
    displayExpenseChart();
}

function createExpenseElement(transaction, index) {
    const item = document.createElement('li');

    const dateElement = document.createElement('span');
    dateElement.innerHTML = transaction.date;

    const categoryElement = document.createElement('span');
    categoryElement.innerHTML = transaction.category;

    const amountElement = document.createElement('span');
    amountElement.innerHTML = `${rupeeSymbol}${transaction.amount}`;

    const actionElement = document.createElement('button');
    actionElement.textContent = 'Delete';
    actionElement.addEventListener('click', function() {
        handleDeleteButtonClick(index);
    });

    item.appendChild(dateElement);
    item.appendChild(categoryElement);
    item.appendChild(amountElement);
    item.appendChild(actionElement);

    return item;
}

function handleDeleteButtonClick(index) {
    expenses.splice(index, 1);
    saveExpenses();
    renderPage();
}

function getTransactionsInDateRange(startYear, endYear, startMonth, endMonth, startDate, endDate) {
    const startInterval = new Date(startYear, startMonth, startDate);
    const endInterval = new Date(endYear, endMonth, endDate);

    const filteredExpenses = expenses.filter((expense) => {
        let currentInterval = new Date(expense.date);
        return currentInterval >= startInterval && currentInterval <= endInterval;
    });
    return filteredExpenses;
}

function displayTotalAmount(expense) {
    return `${rupeeSymbol}${expense.reduce((acc, expense) => acc + expense.amount, 0).toFixed(2)}`;
}

function displayTotals() {
    const now = new Date();

    const weekExpenses = getTransactionsInDateRange(now.getFullYear(), now.getFullYear(),
        now.getMonth(), now.getMonth(),
        now.getDate() - now.getDay(), now.getDate() - now.getDay() + 6);

    const monthExpenses = getTransactionsInDateRange(now.getFullYear(), now.getFullYear(),
        now.getMonth(), (now.getMonth() + 1) % 12,
        1, 0);

    const yearExpenses = getTransactionsInDateRange(now.getFullYear(), now.getFullYear() + 1,
        0, 0,
        1, 0);

    weekTotal.innerHTML = displayTotalAmount(weekExpenses);
    monthTotal.innerHTML = displayTotalAmount(monthExpenses);
    yearTotal.innerHTML = displayTotalAmount(yearExpenses);
    overallTotal.innerHTML = displayTotalAmount(expenses);
}

function displayExpenseChart() {
    const now = new Date();
    const timeFrame = timeFrameSelect.value;
    let labels = [];
    let data = [];

    if (expenseChart) {
        expenseChart.destroy();
    }

    switch (timeFrame) {
        case 'week':
            {
                const transaction = getTransactionsInDateRange(now.getFullYear(), now.getFullYear(),
                    now.getMonth(), now.getMonth(),
                    now.getDate() - now.getDay(), now.getDate() - now.getDay() + 6);
                labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                data = Array(7).fill(0);
                transaction.forEach(expense => {
                    const expenseDate = new Date(expense.date);
                    data[expenseDate.getDay()] += expense.amount;
                });
            };
            break;

        case 'month':
            {
                const transaction = getTransactionsInDateRange(now.getFullYear(), now.getFullYear(),
                    now.getMonth(), (now.getMonth() + 1) % 12,
                    1, 0);
                labels = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
                data = Array(31).fill(0);
                transaction.forEach(expense => {
                    const expenseDate = new Date(expense.date);
                    data[expenseDate.getDate() - 1] += expense.amount;
                });
            };
            break;

        case 'year':
            {
                const transaction = getTransactionsInDateRange(now.getFullYear(), now.getFullYear() + 1,
                    0, 0,
                    1, 0);
                labels = [
                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
                ];
                data = Array(12).fill(0);
                transaction.forEach(expense => {
                    const expenseDate = new Date(expense.date);
                    data[expenseDate.getMonth()] += expense.amount;
                });
            };
            break;
        default:
            console.log("Fatal error: Choosing Time Frame");
    }

    expenseChart = new Chart(expenseChartCanvas, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Expense",
                data: data,
                backgroundColor: "rgba(0, 123, 255, 0.5)",
                borderColor: "rgba(0, 123, 255, 1)",
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Expense"
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: "Time Frame"
                    }
                }
            }
        }
    });
}

function saveExpenses() {
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function loadPage() {
    const savedExpenses = JSON.parse(localStorage.getItem('expenses'));
    if (savedExpenses) {
        expenses = savedExpenses;
        renderPage();
    }
}

loadPage();