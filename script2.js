const characters = {
    '1':pictures/one.png ,
    '2':pictures/two.png ,
    '3':pictures/three.png,
    '4':pictures/four.png,
    '5':pictures/five.png,
    '6':pictures/six.png,
    '7':pictures/seven.png,
    '8':pictures/eight.png,
    '9':pictures/nine.png,
    '10':pictures/ten.png
};

const characterMap = new Map();
characterMap.set(1, characters['1']);
characterMap.set(2, characters['2']);
characterMap.set(3, characters['3']);
characterMap.set(4, characters['4']);
characterMap.set(5, characters['5']);
characterMap.set(6, characters['6']);
characterMap.set(7, characters['7']);
characterMap.set(8, characters['8']);
characterMap.set(9, characters['9']);
characterMap.set(10, characters['10']);

let randomNumber = Math.floor(Math.random() * 10) + 1;
/*
// 1. Initial Setup
const deck = ['A♠', '2♠', '3♠', 'K♥', 'Q♦', 'J♣']; // Use your actual card objects here
let drawnCard = null;

const handSlots = document.querySelectorAll('.hand-slot');
const drawBtn = document.getElementById('draw-btn');
const displayArea = document.getElementById('drawn-card-display');

// 2. Draw Functionality
drawBtn.addEventListener('click', () => {
    if (deck.length > 0) {
        drawnCard = deck.pop(); // Removes and returns the last card in the array
        displayArea.textContent = `Drawn: ${drawnCard}`;
    } else {
        alert("No more cards in the deck!");
    }
});

// 3. Placement Functionality
handSlots.forEach((slot, index) => {
    slot.addEventListener('click', () => {
        if (drawnCard) {
            // Place the card in the clicked slot
            slot.textContent = drawnCard;
            
            // Clear the drawnCard variable so they can't place it again
            drawnCard = null;
            displayArea.textContent = "Card placed! Draw another.";
        } else {
            alert("Draw a card first!");
        }
    });
});
*/
