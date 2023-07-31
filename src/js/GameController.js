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
import cursors from './cursors';
import GameStateService from './GameStateService';
import GamePlay from './GamePlay';
import {
  saveGame, loadGame, getRandomNumber, manhattanDistance,
} from './utils';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selectedCharacter = undefined;
    this.gameState = undefined;
    this._maxLevel = 3;
    this._characterCount = 4;
  }

  init() {
    // add event listeners to gamePlay events
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addNewGameListener(this.#startNewGame.bind(this));
    this.gamePlay.addSaveGameListener(saveGame.bind(this, this));
    this.gamePlay.addLoadGameListener(loadGame.bind(this, this, GamePlay.showError));

    this.#startNewGame();
    window.gs = this.gameState;
    // load saved stated from stateService
    this.stateService = new GameStateService(localStorage);

    this.startTimer();
  }

  #startNewGame() {
    this.gameState = new GameState();

    // команду игроку генерим только один раз - в начале игры
    const playerTypes = [Bowman, Swordsman, Magician];
    this.gameState.playerTeam = generateTeam(playerTypes, this._maxLevel, this._characterCount);

    this.#startNewGameLevel();
  }

  #startNewGameLevel() {
    // первым всегда начинает игрок
    this.gameState.currentPlayer = 'player';

    const level = Object.keys(themes)[this.gameState.level - 1];
    this.gamePlay.drawUi(level);

    this.loadMaxScore();

    this.selectedCharacter = undefined;

    // teams building
    const enemyTypes = [Daemon, Vampire, Undead];

    this.gameState.enemyTeam = generateTeam(enemyTypes, this._maxLevel, this._characterCount);

    // Get positions
    this.gameState.playerPositions = this.generatePositions(
      this.gameState.playerTeam.characters,
      5,
      6,
    );
    this.gameState.enemyPositions = this.generatePositions(
      this.gameState.enemyTeam.characters,
      7,
      8,
    );

    this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);

    this.gamePlay.updateMaxScore(this.gameState.maxScore);
  }

  #updateMaxScore(currentScore) {
    if (currentScore > this.gameState.maxScore) {
      this.gameState.maxScore = currentScore;
    }
    // отобразим
    this.gamePlay.updateMaxScore(this.gameState.maxScore);
    // сохраним
    this.stateService.saveMaxScore({
      maxScore: this.gameState.maxScore,
    });
  }

  loadMaxScore() {
    const { maxScore } = this.stateService.loadMaxScore();
    if (maxScore) {
      this.gameState.maxScore = maxScore;
      this.gamePlay.updateMaxScore(maxScore);
    }
  }

  #saveMaxScore() {
    this.stateService.save({
      maxScore: this.gameState.maxScore,
    });
  }

  /**
   * формирование позиций в виде массива объектов PositionedCharacter
   *
   * @param {*} characters
   * @returns
   */
  generatePositions(characters, startColumn, endColumn) {
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
      const row = getRandomNumber(0, this.gamePlay.boardSize - 1);
      // Случайный столбец
      const column = getRandomNumber(startColumn, endColumn);
      position = row * this.gamePlay.boardSize + column - 1;
    } while (positions.includes(position));

    return position;
  }

  // получить персонажа по номеру позиции
  #getCharacterFromPosition(index) {
    return this.gameState.allPositionsCharacter
      .find((position) => position.position === index);
  }

  // получить номер позиции по персонажу
  #getPositionFromCharacter(character) {
    const positionedCharacter = this.gameState.allPositionsCharacter
      .find((pasChar) => pasChar.character === character);
    return positionedCharacter.position;
  }

  #levelUp(isWin) {
    console.log('level up');
    if (this.gameState.level === 4 || isWin === false) {
      console.log('Game over');
    } else {
      this.gameState.level += 1;
      // повышаем уровень у выживших
      this.gameState.playerPositions.forEach((e) => e.character.levelUp(1));
    }
  }

  #moveCharacter(index) {
    const moveable = this.gamePlay.cells[index].classList.contains('selected-green');
    if (this.selectedCharacter && moveable) {
      this.deselectAllCells();
      this.selectedCharacter.position = index;
      this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
      this.gameState.switchPlayer();
    }
  }

  async #calcDamageAndKill(targetCharacter, damage) {
    const { character: target, position: tergetPos } = targetCharacter;
    // уменьшаем количество жизней
    target.health -= damage;
    if (target.health <= 0) {
      // Атакованный персонаж умирает
      await this.gamePlay.showDeath(tergetPos);
      this.gameState.playerPositions = this.gameState.playerPositions.filter(
        (character) => character.position !== tergetPos,
      );
      this.gameState.enemyPositions = this.gameState.enemyPositions.filter(
        (character) => character.position !== tergetPos,
      );
    }
    this.gameState.playerTeam.refresh();
    this.gameState.enemyTeam.refresh();
  }

  // выполнение атаки персонажа
  async #executeAttack(attackerPosChar, targetPosChar) {
    const { character: attacker } = attackerPosChar;
    const { character: target } = targetPosChar;
    const damage = Math.max(attacker.attack - target.defence, attacker.attack * 0.1);
    if (this.gameState.isPlayerState) {
      this.gameState.score += damage;
    } else {
      this.gameState.score -= damage;
    }
    this.gamePlay.updateCurrentScore(this.gameState.score);
    this.#updateMaxScore(this.gameState.score);

    await this.gamePlay.showDamage(targetPosChar.position, damage);
    // уменьшаем количество жизней и убираем мертвого персонажа
    await this.#calcDamageAndKill(targetPosChar, damage);
    this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);

    // если не осталось персонажей у противника, то делаем новый уровень
    if (this.gameState.enemyPositions.length === 0) {
      this.#levelUp(true);
      // переинициализируем с новыми персонажами противника
      this.#startNewGameLevel();
    }

    // если не осталось персонажей у игрока, то игра завершается
    if (this.gameState.playerPositions.length === 0) {
      // todo
      console.log('You lose');
    }
  }

  async onCellClick(index) {
    if (this.gameState.isComputerState) {
      // ход противника. Игнорируем событие
      return;
    }

    // Удаляем ранее отображенные поля хода
    this.hideMoveableCells();

    const clickedCharacter = this.#getCharacterFromPosition(index);

    if (!clickedCharacter) {
      // кликнули на пустое поле. Делаем перемещение, если ранее выбран персонаж
      this.#moveCharacter(index);
      return;
    }

    if (this.isEnemyCharacter(clickedCharacter.character)) {
      // кликнули на персонаж противника. Проверяем возможность атаки
      if (this.selectedCharacter) {
        if (this.isAttackAllowed(this.selectedCharacter, clickedCharacter.position)) {
          await this.#executeAttack(this.selectedCharacter, clickedCharacter);

          // снять выделения персонажей
          this.deselectAllCells();
          this.selectedCharacter = null;

          this.gameState.switchPlayer();
        } else {
          console.log('attack not allowed');
        }
      } else {
        // кликнули по противнику не выбрав атакующего персонажа
        this.gamePlay.showMessage(index, '\u26A0');
      }
    } else {
      // Кликнули по персонажу игрока

      // Проверяем, есть ли уже выбранный персонаж
      if (this.selectedCharacter) {
        this.gamePlay.deselectCell(this.selectedCharacter.position);
      }

      // Выделяем текущую ячейку
      this.gamePlay.selectCell(index);

      this.selectedCharacter = clickedCharacter;
      this.showAttackCell();

      // подсветить доступные хода
      const possibleMoves = this.findPossibleMoves(this.selectedCharacter);
      possibleMoves.map((idx) => this.gamePlay.showMoveableCell(idx));
    }
  }

  onCellEnter(index) {
    const targetCharacter = this.#getCharacterFromPosition(index);

    // Если курсор на персонаже, то отобразим информацию о персонаже
    if (targetCharacter) {
      const { character } = targetCharacter;

      // всплывающая подсказка
      const tooltipMessage = GameController.formatToolTip`${character}`;
      this.gamePlay.showCellTooltip(tooltipMessage, index);
      this.gamePlay.setCursor(cursors.pointer);
    } else {
      this.gamePlay.setCursor(cursors.auto);
    }

    if (this.gameState.isComputerState) {
      this.selectedCharacter = null;
    }

    if (this.gameState.isPlayerState) {
      // Если выбран персонаж, то проверяем доступные ходы перемещения и атак
      if (this.selectedCharacter) {
        // Проверяем возможные действия для выбранного персонажа
        if (targetCharacter && this.isPlayerCharacter(targetCharacter.character)) {
          // перевыбор персонажа
          this.gamePlay.setCursor(cursors.pointer);
        } else if (targetCharacter
          && this.isAttackAllowed(this.selectedCharacter, targetCharacter.position)
        ) {
          // атака противника
          this.gamePlay.setCursor(cursors.crosshair);
          this.gamePlay.selectCell(index, 'red');
        } else if (this.isMoveAllowed(this.selectedCharacter, index)) {
          // ход персонажа
          this.gamePlay.setCursor(cursors.pointer);
          this.gamePlay.selectCell(index, 'green');
        } else {
          // действие недоступно
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

  showAttackCell() {
    if (this.selectedCharacter) {
      for (let index = 0; index < this.gamePlay.boardSize ** 2; index += 1) {
        if (this.isAttackAllowed(this.selectedCharacter, index)) {
          this.gamePlay.showAttackCell(index);
        } else {
          this.gamePlay.hideAttackCell(index);
        }
      }
    }
  }

  hideMoveableCells() {
    for (let index = 0; index < this.gamePlay.boardSize ** 2; index += 1) {
      this.gamePlay.hideMoveableCell(index);
    }
  }

  deselectAllCells() {
    for (let index = 0; index < this.gamePlay.boardSize ** 2; index += 1) {
      this.gamePlay.deselectCell(index);
    }
  }

  isPlayerCharacter(character) {
    return this.gameState.playerTeam.has(character);
  }

  isEnemyCharacter(character) {
    return this.gameState.enemyTeam.has(character);
  }

  isAttackAllowed(selectedPositionedCharacter, targetPosition) {
    if (selectedPositionedCharacter.position === targetPosition) {
      return false;
    }

    const { character } = selectedPositionedCharacter;
    const { position } = selectedPositionedCharacter;
    const { rowDistance, columnDistance } = this.#calcDistance(position, targetPosition);

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

  #calcDistance(currentPosition, targetPosition) {
    const targetRow = Math.floor(targetPosition / this.gamePlay.boardSize);
    const targetColumn = targetPosition % this.gamePlay.boardSize;
    const currentRow = Math.floor(currentPosition / this.gamePlay.boardSize);
    const currentColumn = currentPosition % this.gamePlay.boardSize;

    const rowDistance = Math.abs(targetRow - currentRow);
    const columnDistance = Math.abs(targetColumn - currentColumn);

    return { rowDistance, columnDistance };
  }

  isMoveAllowed(selectedPosCharacter, targetPosition) {
    // перемещение на другого персонажа недопустимо
    if (this.#getCharacterFromPosition(targetPosition)) {
      return false;
    }

    const { character } = selectedPosCharacter;
    const { position } = selectedPosCharacter;
    const { rowDistance, columnDistance } = this.#calcDistance(position, targetPosition);

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

  findPossibleMoves(startPosChar) {
    const { boardSize } = this.gamePlay;
    const possibleMoves = [];
    for (let index = 0; index < boardSize ** 2; index += 1) {
      if (this.isMoveAllowed(startPosChar, index)) {
        possibleMoves.push(index);
      }
    }
    return possibleMoves;
  }

  async #attackOneByOne(attacker, targets, step) {
    if (step >= targets.length) {
      return; // переблали всех или принудительно завешили
    }

    const targetCharacter = targets[step];
    if (this.isAttackAllowed(attacker, targetCharacter.position)) {
      this.isAttacking = true;
      this.isAttackDone = true;
      await this.#executeAttack(attacker, targetCharacter);

      this.isAttacking = false;
      return; // принудительно завершим рекурсивный обход
    }

    this.#attackOneByOne(attacker, targets, step + 1);
  }

  indexToRowCol(index) {
    const row = Math.floor(index / this.gamePlay.boardSize);
    const col = index % this.gamePlay.boardSize;
    return { row, col };
  }

  rowColToIndex(row, col) {
    return row * this.gamePlay.boardSize + col;
  }

  findNearestCharacter(startPos, targetCharacters) {
    let minDistance = Infinity;
    let nearestCharacter = null;

    for (const character of targetCharacters) {
      const characterPos = this.indexToRowCol(character.position);
      const distance = manhattanDistance(startPos, characterPos);

      if (distance < minDistance) {
        minDistance = distance;
        nearestCharacter = character;
      }
    }

    return nearestCharacter;
  }

  findPossibleDestinations(startPosChar, moveDistance) {
    const startPos = this.indexToRowCol(startPosChar.position);
    const { boardSize } = this.gamePlay;
    const possibleDestinations = [];
    for (let row = 0; row < boardSize; row += 1) {
      for (let col = 0; col < boardSize; col += 1) {
        const pos = { row, col };
        const distance = manhattanDistance(startPos, pos);
        if (distance <= moveDistance
          && this.isMoveAllowed(startPosChar, this.rowColToIndex(row, col))
        ) {
          possibleDestinations.push(pos);
        }
      }
    }
    return possibleDestinations;
  }

  moveTowardsNearestCharacter(attackerPosChar, targetCharacters) {
    const attacker = attackerPosChar.character;
    const attackerPos = this.indexToRowCol(attackerPosChar.position);
    const nearestCharacter = this.findNearestCharacter(attackerPos, targetCharacters);

    if (!nearestCharacter) {
      // No target characters found, no movement needed
      return;
    }

    const possibleDestinations = this.findPossibleDestinations(
      attackerPosChar,
      attacker.moveDistance,
    );

    if (possibleDestinations.length === 0) {
      // The attacker cannot move anywhere, no movement needed
      return;
    }

    // Find the destination closest to the nearestCharacter
    let minDistance = Infinity;
    let destination = null;
    const targetPosition = this.indexToRowCol(nearestCharacter.position);
    for (const pos of possibleDestinations) {
      const distance = manhattanDistance(pos, targetPosition);
      if (distance < minDistance) {
        minDistance = distance;
        destination = pos;
      }
    }

    // Move the attacker to the selected destination
    const destinationIndex = this.rowColToIndex(destination.row, destination.col);
    // eslint-disable-next-line no-param-reassign
    attackerPosChar.position = destinationIndex;
  }

  startTimer() {
    this.isAttacking = false; // Флаг для проверки, идет ли атака
    this.isAttackDone = false; // признак совершения атаки - перемещение не нужно

    // таймер хода компьютера
    this.intervalComputer = setInterval(async () => {
      if (this.gameState.isComputerState && !this.isAttacking) {
        // ход компьютера
        this.deselectAllCells();
        this.isAttackDone = false;
        // 1. Выбираем персонажа компьютера с максимальным уроном
        const computerCharacter = PositionedCharacter.getMaxAttackCharacter(
          this.gameState.enemyPositions,
        );

        // 2. Персонажа игрока с атакой по убыванию
        const targetCharacters = PositionedCharacter.sortByAttack(this.gameState.playerPositions);

        // 3. По возможности нанести урон персонажу с максимальной атакой
        await this.#attackOneByOne(computerCharacter, targetCharacters, 0);

        // 4. Если некому наносить урон, то делаем перемещение в сторону ближайшего персонажа
        if (!this.isAttackDone) {
          this.moveTowardsNearestCharacter(computerCharacter, targetCharacters);
          this.gamePlay.redrawPositions(this.gameState.allPositionsCharacter);
        }

        this.gameState.switchPlayer();
      }
    }, 100);
  }
}
