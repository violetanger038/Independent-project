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
  { id: 1, name: "Fire Dragon", atk: 5, hp: 5, img: "pictures/fire-dragon.png" },
  { id: 2, name: "Ice Shield", atk: 2, hp: 8, img: "pictures/ice-shield.png" },
  { id: 3, name: "Earth Golem", atk: 3, hp: 10, img: "pictures/earth-golem.png" },
  { id: 4, name: "Wind Spirit", atk: 4, hp: 6, img: "pictures/wind-spirit.png" },
  { id: 5, name: "Light Guardian", atk: 6, hp: 4, img: "pictures/light-guardian.png" },
  { id: 6, name: "Dark Assassin", atk: 5, hp: 5, img: "pictures/dark-assassin.png" },
  { id: 7, name: "Mystic Elf", atk: 4, hp: 5, img: "pictures/mystic-elf.png" },
  { id: 8, name: "Shadow Ninja", atk: 5, hp: 5, img: "pictures/shadow-ninja.png" },
  { id: 9, name: "Arcane Wizard", atk: 3, hp: 6, img: "pictures/arcane-wizard.png" },
  { id: 10, name: "Celestial Phoenix", atk: 6, hp: 4, img: "pictures/celestial-phoenix.png" },
  { id: 11, name: "Frost Giant", atk: 7, hp: 5, img: "pictures/frost-giant.png" },
  { id: 12, name: "Thunder Beast", atk: 8, hp: 4, img: "pictures/thunder-beast.png" },
  { id: 13, name: "Winter Boar", atk: 9, hp: 3, img: "pictures/ice-boar.png" }
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
    this.gameWon = false;
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
     console.log('highlightSelectedAttacker', { selected: this.selectedAttacker, children: this.fieldEl.children.length });
     Array.from(this.fieldEl.children).forEach((el, i) => {
       if (i === Number(this.selectedAttacker)) el.classList.add('selected');
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
    this.checkIfGameWon();
  }
// --- status / UI creation ---
  updateStatus() {
    if (!this.statusEl) return;
    this.statusEl.innerHTML = `<p>Turn: ${this.turn} (Turn #${this.turnNumber}) — Mana: <span id="player-mana">${this.mana}</span></p>`;
  }

  createCardUI(card) {
    const div = document.createElement('div');
    div.className = 'card';
    div.dataset.id = card.id; // Store ID for logic

    // include image in the HTML so it isn't removed by innerHTML assignment
    const imgHtml = card.img
      ? `<img class="card-art" src="${card.img}" alt="${card.name}" onerror="this.style.display='none'">`
      : '';

    div.innerHTML = `${imgHtml}<h3>${card.name}</h3><p>ATK: ${card.atk} | HP: ${card.hp}</p>`;
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
  this.checkIfGameWon();
      // end opponent turn
      setTimeout(() => this.endTurn(), 600);
    }, 600);
  }
   // Check win state and stop the game if someone won (simple board-based rules)
   checkIfGameWon() {
     if (this.gameWon) return;
     // Player wins if opponent has no cards and player has at least one
     if (this.opponentField.length === 0 && this.field.length > 0) {
       this.gameWon = true;
       if (this.statusEl) this.statusEl.innerHTML = '<p>Player wins!</p><p>Restarting...</p>';
       // restart after short delay
       setTimeout(() => this.resetGame(), 1500);
       return;
     }
     // Opponent wins if player has no cards and opponent has at least one
     if (this.field.length === 0 && this.opponentField.length > 0) {
       this.gameWon = true;
       if (this.statusEl) this.statusEl.innerHTML = '<p>Opponent wins!</p><p>Restarting...</p>';
       // restart after short delay
       setTimeout(() => this.resetGame(), 1500);
       return;
     }
     // Draw if both sides empty
     if (this.field.length === 0 && this.opponentField.length === 0) {
       this.gameWon = true;
       if (this.statusEl) this.statusEl.innerHTML = '<p>Draw</p><p>Restarting...</p>';
       // restart after short delay
       setTimeout(() => this.resetGame(), 1500);
     }
   }
   resetGame() {
     this.field = [];
     this.hand = [];
     this.opponentField = [];
     this.turn = 'player';
     this.turnNumber = 1;
     this.mana = CONFIG.STARTING_MANA;
     this.gameWon = false;
     this.updateStatus();
     this.renderHand();
     this.renderField();
     this.renderOpponentField();
     this.startGame();
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

