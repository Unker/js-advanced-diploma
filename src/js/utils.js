import GameState from './GameState';
import themes from './themes';

/**
 * @param index - индекс поля
 * @param boardSize - размер квадратного поля (в длину или ширину)
 * @returns строка - тип ячейки на поле:
 *
 * top-left
 * top-right
 * top
 * bottom-left
 * bottom-right
 * bottom
 * right
 * left
 * center
 *
 * @example
 * ```js
 * calcTileType(0, 8); // 'top-left'
 * calcTileType(1, 8); // 'top'
 * calcTileType(63, 8); // 'bottom-right'
 * calcTileType(7, 7); // 'left'
 * ```
 * */
export function calcTileType(index, boardSize) {
  const row = Math.floor(index / boardSize);
  const col = index % boardSize;
  let cellType;

  if (row === 0 && col === 0) {
    cellType = 'top-left';
  } else if (row === 0 && col === boardSize - 1) {
    cellType = 'top-right';
  } else if (row === 0) {
    cellType = 'top';
  } else if (row === boardSize - 1 && col === 0) {
    cellType = 'bottom-left';
  } else if (row === boardSize - 1 && col === boardSize - 1) {
    cellType = 'bottom-right';
  } else if (row === boardSize - 1) {
    cellType = 'bottom';
  } else if (col === 0) {
    cellType = 'left';
  } else if (col === boardSize - 1) {
    cellType = 'right';
  } else {
    cellType = 'center';
  }

  return cellType;
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}

/**
 *
 * @param gameController - instance of GameController
 */
export function saveGame(gameController) {
  gameController.stateService.save({
    gameState: gameController.gameState,
  });
  console.log('saved');
}

/**
 *
 * @param gameController  - instance of GameController
 */
export function loadGame(gameController, error) {
  const gc = gameController;
  const { gameState } = gc.stateService.load();
  if (gameState) {
    gc.gameState = GameState.fromObject(gameState);
    const level = Object.keys(themes)[gc.gameState.level - 1];
    gc.gamePlay.drawUi(level);
    gc.gamePlay.redrawPositions(gc.gameState.allPositionsCharacter);
    gc.gamePlay.updateCurrentScore(gc.gameState.score);
    gc.loadMaxScore();
    console.log('laoded');
  } else {
    error('Failed to load game state');
  }
}

export function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
