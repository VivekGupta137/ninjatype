const ninjaWords = ['Falcon', 'Shadow', 'Comet', 'Panda', 'Phoenix', 'Storm', 'Lotus', 'Tiger', 'Mango', 'Pixel', 'Rocket', 'Otter', 'Spark', 'Echo', 'Cobra', 'Moon', 'Maple', 'Raven', 'Nova', 'Breeze', 'Bamboo', 'Cloud', 'Fox', 'Orchid'];
const starWarsWords = ['Jedi', 'Sith', 'Mandalorian', 'Wookiee', 'Skywalker', 'Kenobi', 'Yoda', 'Vader', 'Rebel', 'Padawan', 'Ewok', 'Droid', 'Falcon', 'Tatooine', 'Naboo', 'Endor', 'Hoth', 'Coruscant', 'Mustafar', 'Alderaan', 'Dagobah', 'Ahsoka', 'Grogu', 'Leia', 'Solo', 'Chewbacca', 'R2D2', 'BB8', 'Rogue', 'Lightsaber', 'Force', 'Sabacc'];
const pick = (words: string[]) => words[Math.floor(Math.random() * words.length)];
export const defaultNickname = () => `Ninja-${pick(ninjaWords)}`;
export const defaultRoomName = (previous = '') => `The-${pick(starWarsWords.filter(word => `The-${word}` !== previous))}`;
