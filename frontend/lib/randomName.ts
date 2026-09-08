const adjectives = ['Smart', 'Chill', 'Happy', 'Brave', 'Swift', 'Calm', 'Witty', 'Bright', 'Lucky', 'Bold'];
const fruits = ['Apple', 'Mango', 'Banana', 'Cherry', 'Kiwi', 'Lemon', 'Peach', 'Berry', 'Melon', 'Grape'];

export function generateRandomName(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const fruit = fruits[Math.floor(Math.random() * fruits.length)];
  return `${adj} ${fruit}`;
}
