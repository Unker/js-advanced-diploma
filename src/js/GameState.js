import Team from './Team';
import PositionedCharacter from './PositionedCharacter';

export default class GameState {
  constructor() {
    this.currentPlayer = 'player'; // Изначально текущий ход у игрока
    this._level = 1;
    this.score = 0;
    this.maxScore = 0;
    this.playerTeam = undefined;
    this.enemyTeam = undefined;
    this.playerPositions = [];
    this.enemyPositions = [];
    this.allPositionsCharacter = [];
  }

  static fromObject(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);

    if (!object) {
      return gameState;
    }

    gameState.playerTeam = Team.fromObject(object.playerTeam);
    gameState.enemyTeam = Team.fromObject(object.enemyTeam);

    gameState.playerPositions = [];
    gameState.playerTeam.characters.forEach((character, index) => {
      const { position } = object.playerPositions[index];
      const positionedCharacter = new PositionedCharacter(character, position);
      gameState.playerPositions.push(positionedCharacter);
    });

    gameState.enemyPositions = [];
    gameState.enemyTeam.characters.forEach((character, index) => {
      const { position } = object.enemyPositions[index];
      const positionedCharacter = new PositionedCharacter(character, position);
      gameState.enemyPositions.push(positionedCharacter);
    });

    gameState.allPositionsCharacter = gameState.playerPositions.concat(gameState.enemyPositions);

    return gameState;
  }

  switchPlayer() {
    // Переключаем текущего игрока
    // this.currentPlayer = this.currentPlayer === 'player' ? 'computer' : 'player';
    this.currentPlayer = 'player';
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
