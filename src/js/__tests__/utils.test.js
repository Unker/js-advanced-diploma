import { calcTileType } from '../utils';

describe('calcTileType', () => {
  it('should return the correct cell type for a 3x3 board', () => {
    expect(calcTileType(0, 3)).toBe('top-left');
    expect(calcTileType(1, 3)).toBe('top');
    expect(calcTileType(2, 3)).toBe('top-right');
    expect(calcTileType(3, 3)).toBe('left');
    expect(calcTileType(4, 3)).toBe('center');
    expect(calcTileType(5, 3)).toBe('right');
    expect(calcTileType(6, 3)).toBe('bottom-left');
    expect(calcTileType(7, 3)).toBe('bottom');
    expect(calcTileType(8, 3)).toBe('bottom-right');
  });

  test('should return the correct cell type for a 5x5 board', () => {
    expect(calcTileType(0, 5)).toBe('top-left');
    expect(calcTileType(1, 5)).toBe('top');
    expect(calcTileType(2, 5)).toBe('top');
    expect(calcTileType(3, 5)).toBe('top');
    expect(calcTileType(4, 5)).toBe('top-right');
    expect(calcTileType(5, 5)).toBe('left');
    expect(calcTileType(6, 5)).toBe('center');
    expect(calcTileType(9, 5)).toBe('right');
    expect(calcTileType(20, 5)).toBe('bottom-left');
    expect(calcTileType(21, 5)).toBe('bottom');
    expect(calcTileType(24, 5)).toBe('bottom-right');
  });

  test('should return the correct cell type for a 8x8 board', () => {
    expect(calcTileType(0, 8)).toBe('top-left');
    expect(calcTileType(1, 8)).toBe('top');
    expect(calcTileType(7, 8)).toBe('top-right');
    expect(calcTileType(56, 8)).toBe('bottom-left');
    expect(calcTileType(63, 8)).toBe('bottom-right');
    expect(calcTileType(57, 8)).toBe('bottom');
    expect(calcTileType(15, 8)).toBe('right');
    expect(calcTileType(48, 8)).toBe('left');
    expect(calcTileType(28, 8)).toBe('center');
  });
});
