import themes from './themes';
import Daemon from './characters/daemon';
import Vampire from './characters/vampire';
import Undead from './characters/undead';
import Swordsman from './characters/swordsman';
import Magician from './characters/magician';
import Bowman from './characters/bowman';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
  }

  init() {
    this.gamePlay.drawUi(themes.arctic);

    // teams building
    const playerTypes = [Bowman, Swordsman, Magician];
    const enemyTypes = [Daemon, Vampire, Undead];
    const maxLevel = 3;
    const characterCount = 4;

    this.playerTeam = generateTeam(playerTypes, maxLevel, characterCount);
    this.enemyTeam = generateTeam(enemyTypes, maxLevel, characterCount);

    // Draws positions
    const playerPositions = this._generatePositions(this.playerTeam.characters, 1, 2);
    const enemyPositions = this._generatePositions(this.enemyTeam.characters, 7, 8);
    this.allPositions = playerPositions.concat(enemyPositions);

    this.gamePlay.redrawPositions(this.allPositions);

    // TODO: add event listeners to gamePlay events
    // TODO: load saved stated from stateService
  }

  /**
   * формирование позиций в виде массива объектов PositionedCharacter
   *
   * @param {*} characters
   * @returns
   */
  _generatePositions(characters, startColumn, endColumn) {
    const positions = [];
    const positionsCharacter = [];
    characters.forEach((character) => {
      // Генерация случайной позиции в столбцах
      const position = this.getRandomPositionInColumn(positions, startColumn, endColumn);
      positions.push(position);
      const positionedCharacter = new PositionedCharacter(character, position);
      positionsCharacter.push(positionedCharacter);
    });

    return positionsCharacter;
  }

  /**
   * Вычисление позиции в одномерном массиве
   *
   * @param {*} positions массив уже сгенерированных позиций (для генерации уникальной позиции)
   * @param {*} startColumn
   * @param {*} endColumn
   * @returns
   */
  getRandomPositionInColumn(positions, startColumn, endColumn) {
    let position;

    do {
      // Случайная строка
      const row = GameController.getRandomNumber(0, this.gamePlay.boardSize - 1);
      // Случайный столбец
      const column = GameController.getRandomNumber(startColumn, endColumn);
      position = row * this.gamePlay.boardSize + column - 1;
    } while (positions.includes(position));

    return position;
  }

  static getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  // eslint-disable-next-line class-methods-use-this
  onCellClick(index) {
    // TODO: react to click
  }

  // eslint-disable-next-line class-methods-use-this
  onCellEnter(index) {
    // TODO: react to mouse enter
  }

  // eslint-disable-next-line class-methods-use-this
  onCellLeave(index) {
    // TODO: react to mouse leave
  }
}
