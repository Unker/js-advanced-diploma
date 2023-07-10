import themes from './themes';
import Daemon from './characters/daemon';
import Vampire from './characters/vampire';
import Undead from './characters/undead';
import Swordsman from './characters/swordsman';
import Magician from './characters/magician';
import Bowman from './characters/bowman';
import Character from './Character';
import { generateTeam } from './generators';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import GamePlay from './GamePlay';
import cursors from './cursors';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCharacter = undefined;
    this.playerTeam = undefined;
    this.enemyTeam = undefined;
    this.allPositionsCharacter = undefined;
    this.gameState = undefined;
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
    const playerPositions = this._generatePositions(this.playerTeam.characters, 5, 6);
    const enemyPositions = this._generatePositions(this.enemyTeam.characters, 7, 8);
    this.allPositionsCharacter = playerPositions.concat(enemyPositions);

    this.gamePlay.redrawPositions(this.allPositionsCharacter);

    // add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));

    this.gameState = new GameState();

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

  _getPositionCharacter(index) {
    return this.allPositionsCharacter
      .find((position) => position.position === index);
  }

  onCellClick(index) {
    if (this.gameState.currentPlayer === 'player') {
      const clickedCharacter = this._getPositionCharacter(index);

      if (!clickedCharacter) {
        // кликнули на пустое поле. Делаем перемещение, если ранее выбран персонаж
        const moveable = this.gamePlay.cells[index].classList.contains('selected-green');
        if (this.selectedCharacter && moveable) {
          this.gamePlay.deselectCell(this.selectedCharacter.position);
          this.gamePlay.deselectCell(index);
          this.selectedCharacter.position = index;
          this.gamePlay.redrawPositions(this.allPositionsCharacter);
        }
        return;
      }

      if (!this.isPlayerCharacter(clickedCharacter.character)) {
        // Это персонаж противника. Проверяем возможность атаки
        if (this.selectedCharacter) {
          if (this.isAttackAllowed(this.selectedCharacter, clickedCharacter.position)) {
            console.log('attack');
          } else {
            console.log('attack not allowed');
          }
        } else {
          GamePlay.showError('Select a player character!');
        }
        return;
      }

      // Проверяем, есть ли уже выбранный персонаж
      if (this.selectedCharacter) {
        this.gamePlay.deselectCell(this.selectedCharacter.position);
      }

      // Выделяем текущую ячейку
      this.gamePlay.selectCell(index);

      this.selectedCharacter = clickedCharacter;
    }
  }

  onCellEnter(index) {
    const targetCharacter = this._getPositionCharacter(index);

    // Если курсор на персонаже
    if (targetCharacter) {
      const { character } = targetCharacter;

      // всплывающая подсказка
      const tooltipMessage = GameController.formatToolTip`${character}`;
      this.gamePlay.showCellTooltip(tooltipMessage, index);
    }

    // Если выбран персонаж, то проверяем доступные ходы перемещения и атак
    if (this.selectedCharacter) {
      // Проверяем возможные действия для выбранного персонажа
      if (targetCharacter && this.isPlayerCharacter(targetCharacter.character)) {
        this.gamePlay.setCursor(cursors.pointer);
      } else if (targetCharacter
          && this.isAttackAllowed(this.selectedCharacter, targetCharacter.position)
      ) {
        this.gamePlay.setCursor(cursors.crosshair);
        this.gamePlay.selectCell(index, 'red');
      } else if (this.isMoveAllowed(this.selectedCharacter, index)) {
        this.gamePlay.setCursor(cursors.pointer);
        this.gamePlay.selectCell(index, 'green');
      } else {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    } else {
      this.gamePlay.setCursor(cursors.pointer);
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);

    if (this.gameState.currentPlayer === 'player') {
      if (this.selectedCharacter) {
        if (index !== this.selectedCharacter.position) {
          this.gamePlay.deselectCell(index);
        }
      }
    }
  }

  static formatToolTip(strings, ...values) {
    const result = [];

    for (let i = 0; i < strings.length; i += 1) {
      result.push(strings[i]);

      if (i < values.length) {
        const value = values[i];

        if (value instanceof Character) {
          const {
            level, attack, defence, health,
          } = value;
          result.push(`${String.fromCodePoint(0x1F396)} ${level} `);
          result.push(`\u2694 ${attack} `);
          result.push(`${String.fromCodePoint(0x1F6E1)} ${defence} `);
          result.push(`\u2764 ${health}`);
        } else {
          result.push(value);
        }
      }
    }

    return result.join('');
  }

  isPlayerCharacter(character) {
    return this.playerTeam.characters.includes(character);
  }

  isAttackAllowed(selectedCharacter, targetPosition) {
    if (selectedCharacter.position === targetPosition) {
      return false;
    }

    const { character } = selectedCharacter;
    const { position } = selectedCharacter;
    const { rowDistance, columnDistance } = this._calcDistance(position, targetPosition);

    switch (character.constructor) {
      case Swordsman:
      case Undead:
      case Bowman:
      case Vampire:
      case Magician:
      case Daemon:
        return rowDistance <= character.attackDistance
          && columnDistance <= character.attackDistance;
      default:
        return false;
    }
  }

  _calcDistance(currentPosition, targetPosition) {
    const targetRow = Math.floor(targetPosition / this.gamePlay.boardSize);
    const targetColumn = targetPosition % this.gamePlay.boardSize;
    const currentRow = Math.floor(currentPosition / this.gamePlay.boardSize);
    const currentColumn = currentPosition % this.gamePlay.boardSize;

    const rowDistance = Math.abs(targetRow - currentRow);
    const columnDistance = Math.abs(targetColumn - currentColumn);

    return { rowDistance, columnDistance };
  }

  isMoveAllowed(selectedCharacter, targetPosition) {
    // перемещение на другого персонажа недопустимо
    if (this._getPositionCharacter(targetPosition)) {
      return false;
    }

    const { character } = selectedCharacter;
    const { position } = selectedCharacter;
    const { rowDistance, columnDistance } = this._calcDistance(position, targetPosition);

    switch (character.constructor) {
      case Swordsman:
      case Undead:
      case Bowman:
      case Vampire:
      case Magician:
      case Daemon:
        return rowDistance <= character.moveDistance
          && columnDistance <= character.moveDistance
          && (rowDistance === 0 || columnDistance === 0 || rowDistance === columnDistance);
      default:
        return false;
    }
  }
}
