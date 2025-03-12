// Class to create an Expense object
class Expense {
    constructor(id, description, amount, category, date) {
        this.id = id;
        this.description = description;
        this.amount = amount;
        this.category = category;
        this.date = date;
    }

    // Method to format the amount as a currency
    getFormattedAmount() {
        return new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP"
        }).format(this.amount);
    }

    // Method to format the date as a string
    getFormattedDate() {
        // Create a new Date object directly from the date string
        return new Intl.DateTimeFormat("en-GB").format(new Date(this.date));
    }
}

// ExpenseManager class to manage expenses
class ExpenseManager {
    constructor() {
        this.expenses = [];
        this.categories = ["Food", "Transport", "Entertainment", "Housing", "Utilities", "Other"];
    }

    // Load expenses from local storage
    loadExpenses() {
        return new Promise((resolve) => {
            const storedExpenses = localStorage.getItem("expenses");
            if (storedExpenses) {
                // Parse the stored JSON string to an array of objects
                const parsedExpenses = JSON.parse(storedExpenses);
                this.expenses = parsedExpenses.map(expense => {
                    // Ensure the date is properly formatted
                    const formattedDate = new Date(expense.date).toISOString().split('T')[0];
                    return new Expense(
                        expense.id,
                        expense.description,
                        parseFloat(expense.amount),
                        expense.category,
                        formattedDate
                    );
                });
            }

            // Simulate network request
            setTimeout(() => {
                resolve(this.expenses);
            }, 1000);
        });
    }

    // Save expenses to local storage
    saveExpenses() {
        return new Promise((resolve) => {
            localStorage.setItem("expenses", JSON.stringify(this.expenses));

            // Simulate network request as not using a real API
            setTimeout(() => {
                resolve(true);
            }, 500);
        });
    }

    // Add a new expense
    async addExpense(description, amount, category, date) {
        const id = Date.now().toString();
        const newExpense = new Expense(id, description, amount, category, date);

        this.expenses.push(newExpense);
        await this.saveExpenses();
        return newExpense;
    }

    // Delete an expense by ID
    async deleteExpense(id) {
        this.expenses = this.expenses.filter(expense => expense.id !== id);
        await this.saveExpenses();
    }

    // Get total amount spent for all expenses
    getTotalAmount() {
        return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    // Get total amount spent for a specific category
    getExpensesByCategory() {
        const categoryTotals = {};

        // Initialize all categories to 0
        this.categories.forEach(category => {
            categoryTotals[category] = 0;
        });

        // Sum up expenses for each category
        this.expenses.forEach(expense => {
            // Ensure we're working with numbers
            const amount = parseFloat(expense.amount) || 0;
            categoryTotals[expense.category] += amount;
        });

        return categoryTotals;
    }

    // Simulate fetching exchange rates from an API as not using a real API
    async getExchangeRates() {
        // This would be an API call in a real application but don't have a real API to call
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    GBP: 1,
                    USD: 1.37,
                    EUR: 1.16
                });
            }, 1000);
        });
    }
}

// UI class to manage the user interface and DOM interactions
class UIController {
    constructor(expenseManager) {
        this.expenseManager = expenseManager;
        this.initializeElements();
        this.initializeEventListeners();
        this.currentCurrency = "GBP";
        this.exchangeRates = null;
    }

    // Initialize elements
    initializeElements() {
        this.expenseForm = document.getElementById("expense-form");
        this.descriptionInput = document.getElementById("description");
        this.amountInput = document.getElementById("amount");
        this.categorySelect = document.getElementById("category");
        this.dateInput = document.getElementById("date");

        // Display elements
        this.expenseList = document.getElementById("expense-list");
        this.totalAmount = document.getElementById("total-amount");
        this.loadingIndicator = document.getElementById("loading-indicator");
        this.currencySelect = document.getElementById("currency-select");
        this.statsContainer = document.getElementById("stats-container");

        // Initialize date input with today's date
        const today = new Date().toISOString().split("T")[0];
        this.dateInput.value = today;

        // Populate category select options
        this.populateCategorySelect();
    }

    // Initialize event listeners
    initializeEventListeners() {
        this.expenseForm.addEventListener("submit", this.handleFormSubmit.bind(this));
        this.expenseList.addEventListener("click", this.handleExpenseDelete.bind(this));
        this.currencySelect.addEventListener("change", this.handleCurrencyChange.bind(this));
    }

    // Populate category select options
    populateCategorySelect() {
        this.expenseManager.categories.forEach(category => {
            const option = document.createElement("option");
            option.value = category;
            option.textContent = category;
            this.categorySelect.appendChild(option);
        });
    }

    // Handle form submission
    async handleFormSubmit(event) {
        event.preventDefault();

        const description = this.descriptionInput.value;
        // Parse amount as float immediately
        const amount = parseFloat(this.amountInput.value);
        const category = this.categorySelect.value;
        const date = this.dateInput.value;

        // Validate amount is a number
        if (description && !isNaN(amount) && category && date) {
            this.showLoading(true);

            try {
                const newExpense = await this.expenseManager.addExpense(description, amount, category, date);
                this.addExpenseToList(newExpense);
                this.clearForm();
                // Force refresh of totals
                const total = this.expenseManager.getTotalAmount();
                this.updateTotalAmount();
                this.updateStats();
            } catch (error) {
                console.error("An error occurred while adding the expense:", error);
                alert("An error occurred while adding the expense. Please try again.");
            } finally {
                this.showLoading(false);
            }
        } else {
            alert("Please fill in all fields with valid values.");
        }
    }

    // Add an expense to the UI list
    addExpenseToList(expense) {
        const listItem = document.createElement("li");
        listItem.className = "expense-item";
        listItem.dataset.id = expense.id;

        // Format the amount based on the current currency
        let displayAmount = expense.getFormattedAmount();
        // Convert the amount to the current currency if it's not GBP
        if (this.currentCurrency !== "GBP" && this.exchangeRates) {
            const convertedAmount = expense.amount * this.exchangeRates[this.currentCurrency];
            displayAmount = new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: this.currentCurrency
            }).format(convertedAmount);
        }

        listItem.innerHTML = `
            <div class="expense-info">
                <div class="expense-description">${expense.description}</div>
                <div class="expense-details">
                    <span class="expense-category">${expense.category}</span>
                    <span class="expense-date">${expense.getFormattedDate()}</span>
                </div>
            </div>
            <div class="expense-amount">${displayAmount}</div>
            <button class="delete-btn" data-id="${expense.id}">Delete</button>
        `;

        this.expenseList.appendChild(listItem);
    }

    // Handle expense deletion
    async handleExpenseDelete(event) {
        if (event.target.classList.contains("delete-btn")) {
            const id = event.target.dataset.id;
            const listItem = event.target.closest("li");

            this.showLoading(true);

            // Error handling for deleting an expense
            try {
                await this.expenseManager.deleteExpense(id);
                listItem.remove();
                this.updateTotalAmount();
                this.updateStats();
            } catch (error) {
                console.error("An error occurred while deleting the expense:", error);
                alert("An error occurred while deleting the expense. Please try again.");
            } finally {
                this.showLoading(false);
            }
        }
    }

    // Update the total amount displayed
    updateTotalAmount() {
        const total = this.expenseManager.getTotalAmount();

        let displayTotal = new Intl.NumberFormat("en-GB", {
            style: "currency",
            currency: "GBP"
        }).format(total);

        // Convert the total to the current currency if it's not GBP
        if (this.currentCurrency !== "GBP" && this.exchangeRates) {
            const convertedTotal = total * this.exchangeRates[this.currentCurrency];
            displayTotal = new Intl.NumberFormat("en-GB", {
                style: "currency",
                currency: this.currentCurrency
            }).format(convertedTotal);
        }

        this.totalAmount.textContent = displayTotal;
    }

    // Update the statistics displayed
    updateStats() {
        const categoryTotals = this.expenseManager.getExpensesByCategory();
        const totalExpenses = this.expenseManager.getTotalAmount();
        this.statsContainer.innerHTML = "";

        // Display the total amount spent for each category
        for (const [category, total] of Object.entries(categoryTotals)) {
            if (total > 0) {
                // Calculate percentage of total expenses
                const percentage = ((total / totalExpenses) * 100).toFixed(1);

                // Format the total amount based on the current currency
                let displayTotal = new Intl.NumberFormat("en-GB", {
                    style: "currency",
                    currency: "GBP"
                }).format(total);

                if (this.currentCurrency !== "GBP" && this.exchangeRates) {
                    const convertedTotal = total * this.exchangeRates[this.currentCurrency];
                    displayTotal = new Intl.NumberFormat("en-GB", {
                        style: "currency",
                        currency: this.currentCurrency
                    }).format(convertedTotal);
                }

                const statElement = document.createElement("div");
                statElement.className = "stat-item";
                statElement.innerHTML = `
                    <div class="stat-category">${category}</div>
                    <div class="stat-bar-container">
                        <div class="stat-bar" style="width: ${percentage}%"></div>
                    </div>
                    <div class="stat-total">${displayTotal} (${percentage}%)</div>
                `;

                this.statsContainer.appendChild(statElement);
            }
        }
    }

    // Handle currency change
    async handleCurrencyChange(event) {
        this.currentCurrency = event.target.value;

        this.showLoading(true);

        // Error handling for fetching exchange rates
        try {
            // Fetch exchange rates if not already cached from a previous request
            if (!this.exchangeRates) {
                this.exchangeRates = await this.expenseManager.getExchangeRates();
            }

            // Update the total amount and each expense amount
            this.clearExpenseList();
            this.loadExpenses();
        } catch (error) {
            console.error("An error occurred while fetching exchange rates:", error);
            alert("An error occurred while fetching exchange rates. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }

    // Clear the form fields#
    clearForm() {
        this.descriptionInput.value = "";
        this.amountInput.value = "";
        this.categorySelect.value = "";
        this.dateInput.value = new Date().toISOString().split("T")[0];
        this.descriptionInput.focus();
    }

    // Clear the expense list
    clearExpenseList() {
        this.expenseList.innerHTML = "";
    }

    // Show or hide the loading indicator
    showLoading(isLoading) {
        this.loadingIndicator.style.display = isLoading ? "block" : "none";
    }

    // Load expenses and update the UI
    async loadExpenses() {
        this.showLoading(true);

        // Error handling for loading expenses
        try {
            const expenses = await this.expenseManager.loadExpenses();

            this.clearExpenseList();
            expenses.forEach(expense => this.addExpenseToList(expense));
            this.updateTotalAmount();
            this.updateStats();
        } catch (error) {
            console.error("An error occurred while loading expenses:", error);
            alert("An error occurred while loading expenses. Please try again.");
        } finally {
            this.showLoading(false);
        }
    }
}

// Initialize the application
document.addEventListener("DOMContentLoaded", async () => {
    let ui; // Declare ui in the outer scope
    try {
        console.log("Initializing application...");
        const expenseManager = new ExpenseManager();
        ui = new UIController(expenseManager); // Assign to the outer scope variable
        
        ui.showLoading(true);
        console.log("Fetching exchange rates...");
        ui.exchangeRates = await expenseManager.getExchangeRates();
        console.log("Loading expenses...");
        await ui.loadExpenses();
    } catch (error) {
        console.error("Detailed initialization error:", error);
        alert("An error occurred while initializing the application. Please try again.");
    } finally {
        if (ui) ui.showLoading(false); // Check if ui exists before calling
    }
});