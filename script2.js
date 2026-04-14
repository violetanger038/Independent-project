/*
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
*/
const cards = [
    { id: 1, name: "Fire Dragon", atk: 5, hp: 5 },
    { id: 2, name: "Ice Shield", atk: 2, hp: 8 },
    { id: 3, name: "Earth Golem", atk: 3, hp: 10 },
    { id: 4, name: "Wind Spirit", atk: 4, hp: 6 },
    { id: 5, name: "Light Guardian", atk: 6, hp: 4 }
];

function createCardUI(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${card.name}</h3><p>ATK: ${card.atk} | HP: ${card.hp}</p>`;
    return div;
}

function drawCard() {
    // Select the button
    const deckButton = document.getElementById('deck');
    // Select the container
    const hand = document.querySelector('.player-hand');

    if (deckButton && hand) {
        deckButton.onclick = () => {
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            const cardUI = createCardUI(randomCard);
            hand.appendChild(cardUI);
        };
    } else {
        console.error("Deck or Hand element not found!");
    }
}

// Run initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    drawCard();
});