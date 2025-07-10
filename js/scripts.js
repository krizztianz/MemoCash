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

const addPeriodBtn = document.getElementById("addPeriodBtn");
const periodPopup = document.getElementById("periodPopup");
const closePeriodBtn = document.getElementById("closePeriodBtn");
const periodForm = document.getElementById("periodForm");
const monthSelect = document.getElementById("month");
const yearSelect = document.getElementById("year");
const monthsGrid = document.querySelector(".months-grid");

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

    // Load sample books (if grid kosong)
    loadSampleBooks();

    // Sembunyikan tombol "Add Period" jika sudah ada buku
    const existingCards = document.querySelectorAll('.month-card');
    if (existingCards.length > 0) {
        if (addPeriodBtn) {
            addPeriodBtn.style.display = 'none';
        }
    }

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
if(amountInput) {
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
}

// Form submission
if(transactionForm) {
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
}

// Popup controls
if(addBtn) {
    addBtn.addEventListener('click', function () {
        if(popupOverlay) {
            popupOverlay.classList.add('active');
        }
    });
}

if(closeBtn) {
    closeBtn.addEventListener('click', function () {
        if(popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });
}

if(popupOverlay) {
    popupOverlay.addEventListener('click', function (e) {
        if (e.target === popupOverlay) {
            popupOverlay.classList.remove('active');
        }
    });
}

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
    if(transactionsList) {
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
}

function updateFinalAmount() {
    if(finalAmount) {
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

function loadSampleBooks() {
    const monthsGrid = document.querySelector(".months-grid");

    // Cek apakah sudah ada buku
    const existingCards = monthsGrid.querySelectorAll('.month-card');
    if (existingCards.length > 0) return;

    const sampleBooks = [
        { month: "January", year: 2025, locked: true },
        { month: "February", year: 2025, locked: true },
        { month: "March", year: 2025, locked: true },
        { month: "April", year: 2025, locked: true },
        { month: "May", year: 2025, locked: true },
        { month: "June", year: 2025, locked: false } // Unlocked book
    ];

    sampleBooks.forEach(book => {
        const card = document.createElement("div");
        card.className = "month-card";
        if (book.locked) {
            card.classList.add("locked");
        }
        card.textContent = `${book.month} ${book.year}`;
        monthsGrid.appendChild(card);
    });
}

// Isi dropdown tahun: tahun ini & tahun depan
const currentYear = new Date().getFullYear();
[ currentYear, currentYear + 1 ].forEach((year) => {
    const opt = document.createElement("option");
    opt.value = year;
    opt.textContent = year;
    yearSelect.appendChild(opt);
});

// Buka popup
addPeriodBtn?.addEventListener("click", () => {
    periodPopup.classList.add("active");
});

// Tutup popup
closePeriodBtn?.addEventListener("click", () => {
    periodPopup.classList.remove("active");
});

// Submit Add Period
periodForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const month = parseInt(monthSelect.value);
    const year = parseInt(yearSelect.value);

    if (!month || !year) {
        showAlert("error", "Validation Error", "Please select month and year.");
        return;
    }

    const monthNames = [ "", "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December" ];

    const newCard = document.createElement("div");
    newCard.className = "month-card";
    newCard.textContent = `${monthNames[month]} ${year}`;
    monthsGrid.appendChild(newCard);

    periodPopup.classList.remove("active");
});

// Handle unlocked month-card click → pindah ke transaction.html
document.addEventListener("click", function (e) {
    const card = e.target.closest(".month-card");

    if (card && !card.classList.contains("locked")) {
        // Simpan periode ke localStorage
        const selectedPeriod = card.textContent.trim(); // Contoh: "June 2025"
        localStorage.setItem("selectedPeriod", selectedPeriod);

        // Arahkan ke halaman transaksi
        window.location.href = "transaction.html";
    }
});