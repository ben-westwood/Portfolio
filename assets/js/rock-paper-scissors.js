document.addEventListener("DOMContentLoaded", function() {
    const choices = document.querySelectorAll(".choice");
    const resultDisplay = document.getElementById("resultDisplay");
    const playerScoreDisplay = document.getElementById("playerScore");
    const computerScoreDisplay = document.getElementById("computerScore");
    const historyList = document.getElementById("historyList");
    const resetBtn = document.getElementById("resetBtn");

    let playerScore = 0;
    let computerScore = 0;

    // Game logic for Rock, Paper, Scissors
    function computerChoice() {
        const options = ["rock", "paper", "scissors"];
        return options[Math.floor(Math.random() * options.length)];
    }

    function determineWinner(playerSelection, computerSelection) {
        if (playerSelection === computerSelection) return "Tie";

        // Win conditions for the player
        const winConditions = {
            rock: "scissors",
            paper: "rock",
            scissors: "paper"
        };

        return winConditions[playerSelection] === computerSelection ? "Player" : "Computer";
    }

    function addToHistory(playerChoice, computerChoice, result) {
        const listItem = document.createElement("li");
        listItem.textContent = `Player: ${playerChoice} | Computer: ${computerChoice} | Result: ${result}`;
        historyList.insertBefore(listItem, historyList.firstChild);

        // List should only have 5 items
        if (historyList.children.length > 5) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    function playGame(playerSelection) {
        // Remove previous result after selection
        choices.forEach(choice => choice.classList.remove("active"));

        // Mark the player's choice
        document.querySelector(`[data-choice="${playerSelection}"]`).classList.add("active");

        const computerSelection = computerChoice();
        const result = determineWinner(playerSelection, computerSelection);

        // Update the result display and scores
        if (result === "Player") {
            playerScore++;
            playerScoreDisplay.textContent = playerScore;
        } else if (result === "Computer") {
            computerScore++;
            computerScoreDisplay.textContent = computerScore;
        }

        // Display the result and update the scores
        resultDisplay.textContent = result === "Tie" ? "It's a tie!" : `${result} wins! ${playerSelection.charAt(0).toUpperCase() + playerSelection.slice(1).toLowerCase()} vs ${computerSelection.charAt(0).toUpperCase() + computerSelection.slice(1).toLowerCase()}`;

        // Add to history
        addToHistory(playerSelection, computerSelection, result);
    }

    // Event listener for each choice
    choices.forEach(choice => {
        choice.addEventListener("click", function() {
            playGame(choice.getAttribute("data-choice"));
        });
    });

    // Reset the game   
    resetBtn.addEventListener("click", function() {
        playerScore = 0;
        computerScore = 0;
        playerScoreDisplay.textContent = "0";
        computerScoreDisplay.textContent = "0";
        resultDisplay.textContent = "Pick your option";
        historyList.innerHTML = "";
        choices.forEach(choice => choice.classList.remove("active"));
    });
});