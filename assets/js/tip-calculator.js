document.addEventListener("DOMContentLoaded", function() {
    // Get DOM elements from the page
    const billAmountInput = document.getElementById("billAmount");
    const customTipInput = document.getElementById("customTip");
    const calculateBtn = document.getElementById("calculateBtn");
    const percentageButtons = document.querySelectorAll(".percentage-button");
    const customTipDiv = document.querySelector(".custom-tip");
    const resultDiv = document.getElementById("result");
    const billError = document.getElementById("billError");
    const tipError = document.getElementById("tipError");
    const percentageError = document.getElementById("percentageError");
    
    // Display elements
    const displayBill = document.getElementById("displayBill");
    const displayTipPercentage = document.getElementById("displayTipPercentage");
    const displayTip = document.getElementById("displayTip");
    const displayTotal = document.getElementById("displayTotal");
    
    let selectedPercentage = null;
    
    // Handle percentage button clicks
    percentageButtons.forEach(button => {
        button.addEventListener("click", function() {
            // Remove active class from all percentage buttons
            percentageButtons.forEach(btn => btn.classList.remove("active"));
            
            // Add active class to clicked button
            this.classList.add("active");
            
            // Get the percentage value
            const percentage = this.getAttribute("data-percentage");
            selectedPercentage = percentage;
            
            // Show or hide custom tip input
            if (percentage === "custom") {
                customTipDiv.style.display = "block";
            } else {
                customTipDiv.style.display = "none";
            }
        });
    });
    
    // Calculate tip when button is clicked
    calculateBtn.addEventListener("click", function() {
        // Reset error messages
        billError.style.display = "none";
        tipError.style.display = "none";
        percentageError.style.display = "none";
        
        // Validate bill amount
        const billAmount = parseFloat(billAmountInput.value);
        // If the bill amount is not a number or is less than or equal to 0, display an error message
        if (isNaN(billAmount) || billAmount <= 0) {
            billError.style.display = "block";
            return;
        }
        
        // Validate tip percentage
        let tipPercentage;
        if (selectedPercentage === "custom") {
            tipPercentage = parseFloat(customTipInput.value);
            // If the custom tip percentage is not a number or is less than 0, display an error message
            if (isNaN(tipPercentage) || tipPercentage < 0) {
                tipError.style.display = "block";
                return;
            }
        } else if (selectedPercentage === null) {
            // If no percentage is selected, highlight the error
            percentageError.style.display = "block";
            return;
        } else {
            tipPercentage = parseFloat(selectedPercentage);
        }
        
        // Calculate tip and total
        const tipAmount = billAmount * (tipPercentage / 100);
        const totalAmount = billAmount + tipAmount;
        
        // Display the results of the calculation
        displayBill.textContent = `£${billAmount.toFixed(2)}`;
        displayTipPercentage.textContent = `${tipPercentage}%`;
        displayTip.textContent = `£${tipAmount.toFixed(2)}`;
        displayTotal.textContent = `£${totalAmount.toFixed(2)}`;
        
        // Show the result div with the calculated values
        resultDiv.style.display = "block";
    });
});
