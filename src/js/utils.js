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

  if (row === 0 && col === 0) {
    return 'top-left';
  } else if (row === 0 && col === boardSize - 1) {
    return 'top-right';
  } else if (row === 0) {
    return 'top';
  } else if (row === boardSize - 1 && col === 0) {
    return 'bottom-left';
  } else if (row === boardSize - 1 && col === boardSize - 1) {
    return 'bottom-right';
  } else if (row === boardSize - 1) {
    return 'bottom';
  } else if (col === 0) {
    return 'left';
  } else if (col === boardSize - 1) {
    return 'right';
  } else {
    return 'center';
  }
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
