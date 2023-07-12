export default class GameState {
  constructor() {
    this.currentPlayer = 'player'; // Изначально текущий ход у игрока
    this._level = 1;
    this.score = 0;
  }

  switchPlayer() {
    // Переключаем текущего игрока
    // this.currentPlayer = this.currentPlayer === 'player' ? 'computer' : 'player';
    this.currentPlayer = 'player';
  }

  static from(object) {
    const gameState = new GameState();
    if (object && object.currentPlayer) {
      gameState.currentPlayer = object.currentPlayer;
    }
    return gameState;
  }

  get level() {
    return this._level;
  }

  set level(value) {
    if (typeof value === 'number' && value >= 1 && value <= 4) {
      this._level = value;
    } else {
      throw new Error('Invalid level value. Level must be between 1 and 4.');
    }
  }
}
