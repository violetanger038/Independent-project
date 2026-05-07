window.addEventListener('error', (e) => {
  console.error('Unhandled error:', e.message, 'at', e.filename + ':' + e.lineno);
});
window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
});

// newer
const CONFIG = {
  MAX_HAND: 5,
  MAX_FIELD: 5,
  STARTING_MANA: 5,
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

    this.turn = 'player';
    this.turnNumber = 1;
// selection state for attacks
    this.selectedAttacker = null;

    // DOM Elements
    this.handEl = document.getElementById('player-hand');
    this.fieldEl = document.getElementById('player-field');
    this.opponentFieldEl = document.getElementById('opponent-field');
    this.deckBtn = document.getElementById('deck');
    this.statusEl = document.getElementById('player-status');

     // initialize event handlers and update UI
     this.init();
     this.updateStatus();

    this.init();
    this.updateStatus();
  }
init() {
    this.deckBtn?.addEventListener('click', () => this.drawCard());
    // opponent field should handle clicks for choosing a target
    this.opponentFieldEl?.addEventListener('click', (e) => this.handleOpponentFieldClick(e));
    this.handEl?.addEventListener('click', (e) => this.handleHandClick(e));
    this.fieldEl?.addEventListener('click', (e) => this.handleFieldClick(e));
  }
  // --- UI handlers ---
  handleFieldClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;

    const idx = parseInt(cardEl.dataset.index);
    if (Number.isNaN(idx)) return;

    // Alt+click to switch card back to hand (preserve previous behavior)
    if (event.altKey) {
      const id = parseInt(cardEl.dataset.id);
      this.switchCardOrder(id);
      return;
    }

    // Only allow selecting an attacker on player's turn
    if (this.turn !== 'player') return;

    // Toggle selection
    if (this.selectedAttacker === idx) {
      this.selectedAttacker = null;
    } else {
      this.selectedAttacker = idx;
    }
    this.highlightSelectedAttacker();
  }
  handleOpponentFieldClick(event) {
    const cardEl = event.target.closest('.card');
    if (!cardEl) return;
    const targetIdx = parseInt(cardEl.dataset.index);
    if (Number.isNaN(targetIdx)) return;

    // Must have an attacker selected and must be player's turn
    if (this.turn !== 'player' || this.selectedAttacker === null) return;

    this.performAttack(this.selectedAttacker, targetIdx);
    // clear selection after attack
    this.selectedAttacker = null;
    this.highlightSelectedAttacker();
  }
 handleHandClick(event) {
     const cardEl = event.target.closest('.card');
     if (!cardEl) return;
     const cardId = parseInt(cardEl.dataset.id);
     if (Number.isNaN(cardId)) return;
     if (this.turn !== 'player') return;
     this.playCard(cardId);
   }
highlightSelectedAttacker() {
    if (!this.fieldEl) return;
    Array.from(this.fieldEl.children).forEach((el, i) => {
      if (i === this.selectedAttacker) el.classList.add('selected');
      else el.classList.remove('selected');
    });
  }
  // perform attack from attackerIndex -> defenderIndex
  performAttack(attackerIndex, defenderIndex) {
    if (!this.field[attackerIndex] || !this.opponentField[defenderIndex]) return;
    const attackingCard = this.field[attackerIndex];
    const opponentCard = this.opponentField[defenderIndex];

    opponentCard.hp -= attackingCard.atk;
    attackingCard.hp -= opponentCard.atk;

    if (opponentCard.hp <= 0) {
      this.opponentField.splice(defenderIndex, 1);
      this.mana += 2;
      this.drawCard();
    }
    if (attackingCard.hp <= 0) {
      this.field.splice(attackerIndex, 1);
      this.mana += 1;
    }

    this.renderField();
    this.renderOpponentField();
    this.updateStatus();
  }
// --- status / UI creation ---
  updateStatus() {
    if (!this.statusEl) return;
    this.statusEl.innerHTML = `<p>Turn: ${this.turn} (Turn #${this.turnNumber}) — Mana: <span id="player-mana">${this.mana}</span></p>`;
  }

  createCardUI(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<h3>${card.name}</h3><p>ATK: ${card.atk} | HP: ${card.hp}</p>`;
    div.dataset.id = card.id; // Store ID for logic
    // data-index will be set by render functions
    return div;
  }
// --- card drawing / play ---
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
// play card from hand to field (player)
  playCard(cardId) {
    if (this.turn !== 'player') return;
    if (this.field.length >= CONFIG.MAX_FIELD || this.mana <= 0) return;
    const cardIndex = this.hand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return;

    const [cardToPlay] = this.hand.splice(cardIndex, 1);
    this.field.push(cardToPlay);
    this.mana--;
    this.updateStatus();
    this.renderField();
    this.renderHand();
  }
  // move card between hand and field (by id, first instance)
  switchCardOrder(cardId) {
    if (this.mana <= 0) return;
    const handIndex = this.hand.findIndex(c => c.id === cardId);
    const fieldIndex = this.field.findIndex(c => c.id === cardId);

    if (handIndex !== -1 && this.field.length < CONFIG.MAX_FIELD) {
      const [cardToSwitch] = this.hand.splice(handIndex, 1);
      this.field.push(cardToSwitch);
    } else if (fieldIndex !== -1) {
      const [cardToSwitch] = this.field.splice(fieldIndex, 1);
      this.hand.push(cardToSwitch);
    } else {
      return;
    }

    this.mana--;
    this.updateStatus();
    this.renderHand();
    this.renderField();
  }
// --- simple opponent AI & turns ---
  startGame() {
    // initial setup: player draws 3, opponent draws 2
    for (let i = 0; i < 3; i++) this.drawCard();
    for (let i = 0; i < 2; i++) this.opponentDrawCard();
    this.turn = 'player';
    this.turnNumber = 1;
    this.mana = CONFIG.STARTING_MANA;
    this.updateStatus();
  }

  startTurnForPlayer() {
    this.turn = 'player';
    this.mana = CONFIG.STARTING_MANA;
    this.updateStatus();
  }
  endTurn() {
    // clear selection when ending turn
    this.selectedAttacker = null;
    this.highlightSelectedAttacker();

    if (this.turn === 'player') {
      this.turn = 'opponent';
      this.mana = CONFIG.STARTING_MANA;
      this.updateStatus();
      // let opponent act after a short delay
      setTimeout(() => this.opponentTurnLogic(), 500);
    } else {
      // opponent ended turn, back to player
      this.turnNumber++;
      this.turn = 'player';
      this.mana = CONFIG.STARTING_MANA;
      this.updateStatus();
    }
  }
opponentTurnLogic() {
    // opponent simple actions: draw, try to summon, then attack
    this.opponentDrawCard();

    // Summon if space and mana
    if (this.opponentField.length < CONFIG.MAX_FIELD && this.mana > 0) {
      const randomCard = cards[Math.floor(Math.random() * cards.length)];
      this.opponentField.push({ ...randomCard });
      this.mana--;
      this.renderOpponentField();
    }

    // Attack phase (delay for UX)
    setTimeout(() => {
      // iterate backwards when splicing
      for (let i = this.opponentField.length - 1; i >= 0; i--) {
        if (!this.field[i]) continue;
        const opp = this.opponentField[i];
        const pl = this.field[i];
        pl.hp -= opp.atk;
        opp.hp -= pl.atk;
        if (pl.hp <= 0) this.field.splice(i, 1);
        if (opp.hp <= 0) this.opponentField.splice(i, 1);
      }
  this.renderField();
      this.renderOpponentField();
      // end opponent turn
      setTimeout(() => this.endTurn(), 600);
    }, 600);
  }
  // Basic Rendering
  renderOpponentField() {
    if (!this.opponentFieldEl) return;
    this.opponentFieldEl.innerHTML = '';
    this.opponentField.forEach((card, i) => {
      const el = this.createCardUI(card);
      el.dataset.index = i;
      this.opponentFieldEl.appendChild(el);
    });
  }
renderHand() {
    if (!this.handEl) return;
    this.handEl.innerHTML = '';
    this.hand.forEach((card, i) => {
      const el = this.createCardUI(card);
      el.dataset.index = i;
      this.handEl.appendChild(el);
    });
  }

  renderField() {
    if (!this.fieldEl) return;
    this.fieldEl.innerHTML = '';
    this.field.forEach((card, i) => {
      const el = this.createCardUI(card);
      el.dataset.index = i;
      this.fieldEl.appendChild(el);
    });
    this.highlightSelectedAttacker();
  }
} // end class CardGame
window.onload = () => {
  window.game = new CardGame();
  window.game.startGame();
  document.getElementById('end-turn')?.addEventListener('click', () => window.game.endTurn());
};