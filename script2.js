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
    this.playerTurn = true;
    this.gameWon = false;

    this.turn = 'player'; 
    this.turnNumber = 1;

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
    this.opponentFieldEl?.addEventListener('click', () => this.opponentDrawCard());
    this.handEl?.addEventListener('click', (e) => this.handleHandClick(e));
    this.fieldEl?.addEventListener('click', (e) => this.handleFieldClick(e));
  }

  handleFieldClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;
    const cardId = parseInt(cardEl.dataset.id);
    this.switchCardOrder(cardId);
  }
    updateStatus() {
    if (!this.statusEl) return;
    this.statusEl.innerHTML = `<p>Turn: ${this.turn} (Turn #${this.turnNumber}) — Mana: <span id="player-mana">${this.mana}</span></p>`;
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
    if (!this.opponentFieldEl) return;
    this.opponentFieldEl.innerHTML = '';
    this.opponentField.forEach(card => this.opponentFieldEl.appendChild(this.createCardUI(card)));
  }

  handleHandClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;
    const cardId = parseInt(cardEl.dataset.id);
    // Only allow playing cards on player's turn
    if (this.turn !== 'player') return;
    this.playCard(cardId);
  }

  switchCardOrder(cardId) {
    if (this.field.length >= CONFIG.MAX_FIELD || this.mana <= 0) return;

    const handIndex = this.hand.findIndex(c => c.id === cardId);
    const fieldIndex = this.field.findIndex(c => c.id === cardId);

    if (handIndex !== -1 && fieldIndex === -1) {
      const [cardToSwitch] = this.hand.splice(handIndex, 1);
      this.field.push(cardToSwitch);
    } else if (fieldIndex !== -1 && handIndex === -1) {
      const [cardToSwitch] = this.field.splice(fieldIndex, 1);
      this.hand.push(cardToSwitch);
      }
    this.mana--; // switching costs 1 mana
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
    cardAttack(cardId); {
    const fieldIndex = this.field.map(c => c.id).lastIndexOf(cardId);
    if (fieldIndex === -1) return;

    const attackingCard = this.field[fieldIndex];
    const opponentCard = this.opponentField[fieldIndex];
    if (!opponentCard) return;

    opponentCard.hp -= attackingCard.atk;
    attackingCard.hp -= opponentCard.atk;

    if (opponentCard.hp <= 0) {
      this.opponentField.splice(fieldIndex, 1);
      this.mana += 2; // reward
      this.drawCard();
    }
    if (attackingCard.hp <= 0) {
      this.field.splice(fieldIndex, 1);
      this.mana += 1; // reward
    }

    this.renderField();
    this.renderOpponentField();
  }
  startGame(); {
    // initial setup: player draws 3, opponent draws 2
    for (let i = 0; i < 3; i++) this.drawCard();
    for (let i = 0; i < 2; i++) this.opponentDrawCard();
    this.turn = 'player';
    this.turnNumber = 1;
    this.mana = CONFIG.STARTING_MANA;
    this.updateStatus();
    // Optionally auto-start player's turn logic here
  }

  startTurn(player); {
    this.turn = player;
    if (player === 'player') {
      // increase mana each player turn (example rule)
      this.mana = Math.min(10, CONFIG.STARTING_MANA + Math.floor(this.turnNumber / 1));
      this.updateStatus();
      // enable UI interactions automatically (already enabled by event handlers)
    } else {
      // opponent turn: simple AI with delays
      this.mana = Math.min(10, CONFIG.STARTING_MANA + Math.floor(this.turnNumber / 1));
      this.updateStatus();
      // Run opponent actions asynchronously
      setTimeout(() => this.opponentTurnLogic(), 700);
    }
  }
  endTurn(); {
    if (this.turn === 'player') {
      this.startTurn('opponent');
    } else {
      this.turnNumber++;
      this.startTurn('player');
    }
  }

  opponentTurnLogic(); {
    // Simple AI: draw, then try to play one card if possible, then attack
    this.opponentDrawCard();
    // play first playable card
    const playableIndex = this.opponentField.length < CONFIG.MAX_FIELD ? -1 : -1; // placeholder, opponent plays from hand not implemented
    // For simplicity, we'll have opponent try to summon from a draw directly into field if space:
    if (this.opponentField.length < CONFIG.MAX_FIELD && this.mana > 0) {
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      this.opponentField.push({ ...randomCard });
      this.mana--;
      this.renderOpponentField();
    }

    // Opponent attacks if possible (each opponent field card attacks corresponding player field index)
    setTimeout(() => {
      for (let i = 0; i < this.opponentField.length; i++) {
        if (i >= this.field.length) break;
        const opp = this.opponentField[i];
         const pl = this.field[i];
        pl.hp -= opp.atk;
        opp.hp -= pl.atk;
        if (pl.hp <= 0) this.field.splice(i, 1);
        if (opp.hp <= 0) this.opponentField.splice(i, 1);
      }
      this.renderField();
      this.renderOpponentField();
      // end opponent turn after actions
      setTimeout(() => this.endTurn(), 600);
    }, 600);
  }

  // Basic Rendering
  renderHand(); {
    if (!this.handEl) return;
    this.handEl.innerHTML = '';
    this.hand.forEach(card => this.handEl.appendChild(this.createCardUI(card)));
  }

  renderField(); {
    if (!this.fieldEl) return;
    this.fieldEl.innerHTML = '';
    this.field.forEach(card => this.fieldEl.appendChild(this.createCardUI(card)));
  }
}
// ...existing code
window.onload = () => {
  window.game = new CardGame();
  window.game.startGame();
  // Optionally expose endTurn to a UI button: document.getElementById('end-turn')?.addEventListener('click', () => window.game.endTurn());
};
}
