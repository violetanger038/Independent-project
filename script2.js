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
// --- Constants & Config ---
const CONFIG = {
  MAX_HAND: 5,
  MAX_FIELD: 5,
  STARTING_MANA: 2,
};
const playerTurn = true;
const gameWon = false;


const cards = [
  { id: 1, name: "Fire Dragon", atk: 5, hp: 5 },
  { id: 2, name: "Ice Shield", atk: 2, hp: 8 },
  { id: 3, name: "Earth Golem", atk: 3, hp: 10 },
  { id: 4, name: "Wind Spirit", atk: 4, hp: 6 },
  { id: 5, name: "Light Guardian", atk: 6, hp: 4 }
];

// --- Game Logic Class ---
class CardGame {
  constructor() {
    this.hand = [];
    this.field = [];
    this.opponentField = [];
    this.mana = CONFIG.STARTING_MANA;
    
    // DOM Elements
    this.handEl = document.getElementById('player-hand');
    this.fieldEl = document.getElementById('player-field');
    this.opponentFieldEl = document.getElementById('opponent-field');
    this.deckBtn = document.getElementById('deck');
    this.statusEl = document.getElementById('player-status');
    this.init();
    this.updateStatus();

  }

  init() {
    this.deckBtn?.addEventListener('click', () => this.drawCard());
    this.opponentFieldEl.addEventListener('click', () => this.opponentDrawCard());
    this.handEl.addEventListener('click', (e) => this.handleHandClick(e));
    this.fieldEl.addEventListener('click', (e) => this.handleFieldClick(e));

  }

  handleFieldClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;

    const cardId = parseInt(cardEl.dataset.id);
    this.switchCardOrder(cardId);
  }

  updateStatus() {
    this.statusEl.innerHTML = `<p>Mana: <span id="player-mana">${this.mana}</span></p>`;
  }

  createCardUI(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${card.name}</h3><p>ATK: ${card.atk} | HP: ${card.hp}</p>`;
    div.dataset.id = card.id; // Store ID for logic
    return div;
  }

  drawCard() {
    if (this.hand.length >= CONFIG.MAX_HAND) return console.log("Hand full!");

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    this.hand.push({ ...randomCard });
    this.renderHand();
  }
  opponentDrawCard() {
    if (this.opponentField.length >= CONFIG.MAX_FIELD) return;
    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    this.opponentField.push({ ...randomCard });
    this.renderOpponentField();
  }
  renderOpponentField() {
    this.opponentFieldEl.innerHTML = '';
    this.opponentField.forEach(card => this.opponentFieldEl.appendChild(this.createCardUI(card)));
  }

  handleHandClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;
    
    const cardId = parseInt(cardEl.dataset.id);
    this.playCard(cardId);
  }
  switchCardOrder(cardId) {
    if (this.field.length >= CONFIG.MAX_FIELD || this.mana <= 0) return;

    const handIndex = this.hand.findIndex(c => c.id === cardId);
    const fieldIndex = this.field.findIndex(c => c.id === cardId);

    if (handIndex !== -1 && fieldIndex === -1) {
      // Card is in hand, move to field
      const [cardToSwitch] = this.hand.splice(handIndex, 1);
      this.field.push(cardToSwitch);
    } else if (fieldIndex !== -1 && handIndex === -1) {
      // Card is in field, move to hand
      const [cardToSwitch] = this.field.splice(fieldIndex, 1);
      this.hand.push(cardToSwitch);
    }
    this.mana--; // Assume switching costs 1 mana
    this.updateStatus();
    this.renderHand();
    this.renderField();
  }


  playCard(cardId) {
    if (this.field.length >= CONFIG.MAX_FIELD || this.mana <= 0) return;

    const cardIndex = this.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [cardToPlay] = this.hand.splice(cardIndex, 1);
    this.field.push(cardToPlay);
    this.mana--;
    this.updateStatus();
    
    this.renderField();
    this.renderHand();
    this.cardAttack(cardId);
    console.log(`Played ${cardToPlay.name}. Mana remaining: ${this.mana}`);
  }
  cardAttack(cardId) {
         const fieldIndex = this.field.map(c => c.id).lastIndexOf(cardId);
    if (fieldIndex === -1) return;

   const attackingCard = this.field[fieldIndex];
    const opponentCard = this.opponentField[fieldIndex];
    if (!opponentCard) return;

    opponentCard.hp -= attackingCard.atk;
    attackingCard.hp -= opponentCard.atk;
    if (opponentCard.hp <= 0) {
      this.opponentField.splice(fieldIndex, 1);
      this.mana += 2; // Reward for destroying opponent's card
      this.drawCard();
    }
    if (attackingCard.hp <= 0) {
      this.field.splice(fieldIndex, 1);
      this.mana += 1; // Reward for destroying own card
    }

    this.renderField();
    this.renderOpponentField();
  }

  // Basic Rendering
  renderHand() {
    this.handEl.innerHTML = '';
    this.hand.forEach(card => this.handEl.appendChild(this.createCardUI(card)));
  }

  renderField() {
    this.fieldEl.innerHTML = '';
    this.field.forEach(card => this.fieldEl.appendChild(this.createCardUI(card)));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.game =new CardGame();
  while (!gameWon) {
  if (playerTurn) {
    drawCard();
    drawCard();
    drawCard();
   
    opponentDrawCard();
    opponentDrawCard();
    while (CONFIG.STARTING_MANA > 0) {
    
      if (opponentField.length === 0) {
        gameWon = true;
        console.log("Player wins!");
      } else if (field.length === 0) {
        gameWon = true;
        console.log("Opponent wins!");
      } else {
        return;
      }
      playerTurn = false;
    }

    // Player's turn logic
  } else {
    while (!gameWon) {
      if (opponentField.length < 2) {
        opponentDrawCard();
      }
      CONFIG.STARTING_MANA += 2;
      playerTurn = true;
    }
    // Opponent's turn logic
  }
}
});
