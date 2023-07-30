import Team from './Team';
import PositionedCharacter from './PositionedCharacter';
import Undead from './characters/undead';
import Vampire from './characters/vampire';
import Swordsman from './characters/swordsman';
import Magician from './characters/magician';
import Bowman from './characters/bowman';
import Daemon from './characters/daemon';

export default class GameState {
  constructor() {
    this.currentPlayer = 'player'; // Изначально текущий ход у игрока
    this._level = 1;
    this._score = 0;
    this.maxScore = 0;
    this.playerTeam = undefined;
    this.enemyTeam = undefined;
    this.playerPositions = [];
    this.enemyPositions = [];
  }

  get allPositionsCharacter() {
    return this.playerPositions.concat(this.enemyPositions);
  }

  get score() {
    return this._score;
  }

  set score(value) {
    this._score = value;
    this._score = Math.max(0, this._score);
  }

  static #createCharater(object) {
    if (object) {
      switch (object.type) {
        case 'undead':
          return new Undead(object._level);
        case 'vampire':
          return new Vampire(object._level);
        case 'swordsman':
          return new Swordsman(object._level);
        case 'magician':
          return new Magician(object._level);
        case 'bowman':
          return new Bowman(object._level);
        case 'daemon':
          return new Daemon(object._level);
        default:
          throw new Error(`Unknown character type: ${object.type}`);
      }
    }
    return undefined;
  }

  static fromObject(object) {
    const gameState = new GameState();
    Object.assign(gameState, object);

    if (!object) {
      return gameState;
    }

    gameState.playerTeam = new Team();
    object.playerTeam.members.map((characterObject) => {
      gameState.playerTeam.add(GameState.#createCharater(characterObject));
      return null;
    });
    gameState.playerPositions = [];
    gameState.playerTeam.characters.forEach((character, index) => {
      const { position } = object.playerPositions[index];
      const positionedCharacter = new PositionedCharacter(character, position);
      gameState.playerPositions.push(positionedCharacter);
    });

    gameState.enemyTeam = new Team();
    object.enemyTeam.members.map((characterObject) => {
      gameState.enemyTeam.add(GameState.#createCharater(characterObject));
      return null;
    });
    gameState.enemyPositions = [];
    gameState.enemyTeam.characters.forEach((character, index) => {
      const { position } = object.enemyPositions[index];
      const positionedCharacter = new PositionedCharacter(character, position);
      gameState.enemyPositions.push(positionedCharacter);
    });

    return gameState;
  }

  get isPlayerState() {
    return this.currentPlayer === 'player';
  }

  get isComputerState() {
    return this.currentPlayer === 'computer';
  }

  switchPlayer() {
    // Переключаем текущего игрока
    this.currentPlayer = this.isPlayerState ? 'computer' : 'player';
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
