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
import GameStateService from './GameStateService';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCharacter = undefined;
    this.gameState = undefined;
    this._maxLevel = 3;
    // this._characterCount = 4;
    this._characterCount = 2;
  }

  init() {
    // add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this._startNewGame.bind(this));
    this.gamePlay.addSaveGameListener(this._saveGame.bind(this));
    this.gamePlay.addLoadGameListener(this._loadGame.bind(this));

    this._startNewGame();

    // load saved stated from stateService
    this.stateService = new GameStateService(localStorage);
  }

  _startNewGame() {
    this.gameState = new GameState();

    // команду игроку генерим только один раз - в начале игры
    const playerTypes = [Bowman, Swordsman, Magician];
    this.gameState.playerTeam = generateTeam(playerTypes, this._maxLevel, this._characterCount);

    this._startNewGameLevel();
  }

  _startNewGameLevel() {
    // первым всегда начинает игрок
    this.gameState.currentPlayer = 'player';

    const level = Object.keys(themes)[this.gameState.level - 1];
    this.gamePlay.drawUi(level);

    this.selectedCharacter = undefined;

    // teams building
    const enemyTypes = [Daemon, Vampire, Undead];

    this.gameState.enemyTeam = generateTeam(enemyTypes, this._maxLevel, this._characterCount);

    // Draws positions
    this.gameState.playerPositions = this._generatePositions(
      this.gameState.playerTeam.characters,
      5,
      6,
    );
    this.gameState.enemyPositions = this._generatePositions(
      this.gameState.enemyTeam.characters,
      7,
      8,
    );
    this.gameState.allPositionsCharacter = this.gameState.playerPositions
      .concat(this.gameState.enemyPositions);

    this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
  }

  _saveGame() {
    this.stateService.save({
      gameState: this.gameState,
    });
    console.log('saved');
  }

  _loadGame() {
    const { gameState } = this.stateService.load();
    this.gameState = GameState.fromObject(gameState);
    const level = Object.keys(themes)[this.gameState.level - 1];
    this.gamePlay.drawUi(level);
    this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
    this.gamePlay.updateCurrentScore(this.gameState.score);
    console.log('laoded');
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
    return this.gameState.allPositionsCharacter
      .find((position) => position.position === index);
  }

  _levelUp(isWin) {
    console.log('level up');
    if (this.gameState.level === 4 || isWin === false) {
      console.log('Game over');
    } else {
      this.gameState.level += 1;
      // повышаем уровень у выживших
      this.gameState.playerPositions.forEach((e) => e.character.levelUp(1));
    }

    // переинициализируем с новыми персонажами противника
    this._startNewGameLevel();
  }

  _moveCharacter(index) {
    const moveable = this.gamePlay.cells[index].classList.contains('selected-green');
    if (this.selectedCharacter && moveable) {
      this.gamePlay.deselectCell(this.selectedCharacter.position);
      this.gamePlay.deselectCell(index); // снять выделение хода
      this.selectedCharacter.position = index;
      this.gamePlay.selectCell(index); // установить выделение выбранного персонажа
      this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
    }
  }

  _calcDamageAndKill(targetCharacter, damage) {
    const { character: target, position: tergetPos } = targetCharacter;
    // уменьшаем количество жизней
    target.health -= damage;
    if (target.health <= 0) {
      // Атакованный персонаж умирает
      this.gameState.allPositionsCharacter = this.gameState.allPositionsCharacter.filter(
        (character) => character.position !== tergetPos,
      );
      this.gameState.playerPositions = this.gameState.playerPositions.filter(
        (character) => character.position !== tergetPos,
      );
      this.gameState.playerTeam.characters = this.gameState.playerTeam.characters.filter(
        (character) => character.health > 0,
      );
      this.gameState.enemyPositions = this.gameState.enemyPositions.filter(
        (character) => character.position !== tergetPos,
      );
      this.gameState.enemyTeam.characters = this.gameState.enemyTeam.characters.filter(
        (character) => character.health > 0,
      );
    }
  }

  onCellClick(index) {
    if (this.gameState.currentPlayer === 'player') {
      const clickedCharacter = this._getPositionCharacter(index);

      if (!clickedCharacter) {
        // кликнули на пустое поле. Делаем перемещение, если ранее выбран персонаж
        this._moveCharacter(index);
        this.gameState.switchPlayer();
        return;
      }

      if (!this.isPlayerCharacter(clickedCharacter.character)) {
        // Это персонаж противника. Проверяем возможность атаки
        if (this.selectedCharacter) {
          if (this.isAttackAllowed(this.selectedCharacter, clickedCharacter.position)) {
            const { character: attacker } = this.selectedCharacter;
            // const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
            const damage = 110; // todo del
            this.gamePlay.showDamage(index, damage).then(() => {
              // уменьшаем количество жизней и убираем мертвого персонажа
              this._calcDamageAndKill(clickedCharacter, damage);
              this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
              // если не осталось персонажей у противника, то делаем новый уровень
              if (this.gameState.enemyPositions.length === 0) {
                this._levelUp(true);
              }
              this.gameState.score += damage;
              this.gamePlay.updateCurrentScore(this.gameState.score);
            }, (err) => {
              console.log(err);
            });
          } else {
            console.log('attack not allowed');
          }
        } else {
          GamePlay.showError('Select a player character!');
        }
        this.gameState.switchPlayer();
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
    if (this.gameState.currentPlayer === 'player') {
      const targetCharacter = this._getPositionCharacter(index);

      // Если курсор на персонаже
      if (targetCharacter) {
        const { character } = targetCharacter;

        // всплывающая подсказка
        const tooltipMessage = GameController.formatToolTip`${character}`;
        this.gamePlay.showCellTooltip(tooltipMessage, index);
        this.gamePlay.setCursor(cursors.pointer);
      } else {
        this.gamePlay.setCursor(cursors.auto);
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
      }
    }
  }

  onCellLeave(index) {
    this.gamePlay.hideCellTooltip(index);

    if (this.selectedCharacter) {
      if (index !== this.selectedCharacter.position) {
        this.gamePlay.deselectCell(index);
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
    return this.gameState.playerTeam.characters.includes(character);
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
