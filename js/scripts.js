// DOM Elements
const loadingOverlay = document.getElementById('loadingOverlay');
const alertOverlay = document.getElementById('alertOverlay');
const alertIcon = document.getElementById('alertIcon');
const alertTitle = document.getElementById('alertTitle');
const alertMessage = document.getElementById('alertMessage');
const alertOk = document.getElementById('alertOk');
const popupOverlay = document.getElementById('popupOverlay');
const addBtn = document.getElementById('addBtn');
const closeBtn = document.getElementById('closeBtn');
const transactionForm = document.getElementById('transactionForm');
const amountInput = document.getElementById('amount');
const transactionsList = document.getElementById('transactionsList');
const finalAmount = document.getElementById('finalAmount');

// Track transactions
let transactions = [];
let balance = 0;

// Init custom datepicker
flatpickr("#date", {
    dateFormat: "d/m/Y H:i:S",
    enableTime: true,
    time_24hr: true,
    defaultDate: new Date()
});

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    // Hide loading screen after delay
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
    }, 1500);

    // Load sample transactions
    loadSampleTransactions();
    updateFinalAmount();
});

// Show alert function with icons
function showAlert(type, title, message) {
    // Set icon based on alert type
    alertIcon.innerHTML = '';
    const icon = document.createElement('i');

    switch (type.toLowerCase()) {
        case 'error':
            icon.className = 'fas fa-exclamation-circle';
            alertIcon.className = 'alert-icon error';
            break;
        case 'success':
            icon.className = 'fas fa-check-circle';
            alertIcon.className = 'alert-icon success';
            break;
        case 'warning':
            icon.className = 'fas fa-exclamation-triangle';
            alertIcon.className = 'alert-icon warning';
            break;
        case 'info':
            icon.className = 'fas fa-info-circle';
            alertIcon.className = 'alert-icon info';
            break;
        default:
            icon.className = 'fas fa-exclamation-circle';
            alertIcon.className = 'alert-icon';
    }

    alertIcon.appendChild(icon);
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertOverlay.classList.add('active');
}

// Close alert
alertOk.addEventListener('click', function () {
    alertOverlay.classList.remove('active');
});

// Handle locked month cards
document.querySelectorAll('.month-card.locked').forEach(card => {
    card.addEventListener('click', function () {
        showAlert('error', 'Book Locked', 'This month is locked and cannot be modified.');
    });
});

// Currency formatting for amount input
amountInput.addEventListener('input', function (e) {
    let value = this.value.replace(/[^\d-]/g, '');

    // Handle negative sign
    const isNegative = value.startsWith('-');
    value = value.replace(/-/g, '');

    if (value) {
        const formattedValue = (isNegative ? '-' : '') +
            parseInt(value || '0').toLocaleString('id-ID');
        this.value = formattedValue;
    } else {
        this.value = '';
    }
});

// Form submission
transactionForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const amount = parseCurrency(amountInput.value);
    const description = document.getElementById('description').value;
    const type = document.getElementById('type').value;
    const flatpickrInstance = document.getElementById('date')._flatpickr;
    const selectedDate = flatpickrInstance.selectedDates[0];
    if (!selectedDate) {
        showAlert('error', 'Error', 'Please select a valid date');
        return;
    }
    const date = selectedDate;

    if (!amount || !description || !type) {
        showAlert('error', 'Error', 'Please fill all fields');
        return;
    }

    // Add transaction to list
    addTransaction(amount, description, type, date);

    // Show success message
    showAlert('success', 'Success',
        `Transaction added: Rp. ${formatCurrency(amount)}\n${description}`);

    // Reset form and close popup
    this.reset();
    popupOverlay.classList.remove('active');
});

// Popup controls
addBtn.addEventListener('click', function () {
    popupOverlay.classList.add('active');
});

closeBtn.addEventListener('click', function () {
    popupOverlay.classList.remove('active');
});

popupOverlay.addEventListener('click', function (e) {
    if (e.target === popupOverlay) {
        popupOverlay.classList.remove('active');
    }
});

// Currency parsing and formatting functions
function parseCurrency(formattedValue) {
    const isNegative = formattedValue.startsWith('-');
    const absoluteValue = parseInt(formattedValue.replace(/[^\d]/g, ''), 10) || 0;
    return isNegative ? -absoluteValue : absoluteValue;
}

function formatCurrency(amount) {
    const isNegative = amount < 0;
    const absoluteValue = Math.abs(amount);
    return (isNegative ? '-' : '') + absoluteValue.toLocaleString('id-ID');
}

// Transaction management
function addTransaction(amount, description, type, date) {
    const transaction = {
        amount,
        description,
        type,
        date
    };

    transactions.push(transaction);

    if (type === 'credit') {
        balance += amount;
    } else {
        balance -= amount;
    }

    renderTransactions();
    updateFinalAmount();
}

function renderTransactions() {
    transactionsList.innerHTML = '';

    transactions.forEach(transaction => {
        const row = document.createElement('tr');

        const dateObj = new Date(transaction.date);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        const date = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;

        row.innerHTML = `
                    <td data-label="Description">${transaction.description}</td>
                    <td data-label="Date">${date}</td>
                    <td class="debit-amount" data-label="Debit">
                        ${transaction.type === 'debit' ? `Rp. ${formatCurrency(Math.abs(transaction.amount))}` : '-'}
                    </td>
                    <td class="credit-amount" data-label="Credit">
                        ${transaction.type === 'credit' ? `Rp. ${formatCurrency(transaction.amount)}` : '-'}
                    </td>
                `;

        transactionsList.appendChild(row);
    });
}

function updateFinalAmount() {
    const formattedBalance = formatCurrency(balance);
    finalAmount.textContent = `Rp. ${formattedBalance}`;

    // Color the final amount based on balance
    if (balance < 0) {
        finalAmount.className = 'final-amount debit-amount';
    } else if (balance > 0) {
        finalAmount.className = 'final-amount credit-amount';
    } else {
        finalAmount.className = 'final-amount';
    }
}

function loadSampleTransactions() {
    const sampleTransactions = [
        { amount: 2500000, description: 'Project Payment', type: 'credit' },
        { amount: 1500000, description: 'Client Invoice', type: 'credit' },
        { amount: 1500000, description: 'Office Supplies', type: 'debit' }
    ];

    // Add sample transactions with realistic dates
    const today = new Date();
    sampleTransactions.forEach((tx, index) => {
        const txDate = new Date(today);
        txDate.setDate(today.getDate() - index);

        addTransaction(
            tx.amount,
            tx.description,
            tx.type,
            txDate
        );
    });
}