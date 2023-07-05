import Team from './Team';

/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  while (true) {
    const RandomType = allowedTypes[Math.floor(Math.random() * allowedTypes.length)];
    const randomLevel = Math.floor(Math.random() * maxLevel) + 1;
    const character = new RandomType(randomLevel);
    yield character;
  }
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей.
 * Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const teamCharacters = [];

  const generator = characterGenerator(allowedTypes, maxLevel);
  for (let i = 0; i < characterCount; i += 1) {
    const character = generator.next().value;
    teamCharacters.push(character);
  }

  return new Team(teamCharacters);
}
