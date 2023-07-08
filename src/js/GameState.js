export default class GameState {
  constructor() {
    this.currentPlayer = 'player'; // Изначально текущий ход у игрока
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 'player' ? 'computer' : 'player'; // Переключаем текущего игрока
  }

  static from(object) {
    const gameState = new GameState();
    if (object && object.currentPlayer) {
      gameState.currentPlayer = object.currentPlayer;
    }
    return gameState;
  }
}
