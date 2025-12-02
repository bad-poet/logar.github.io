// Sample word database - in production, you'd load a larger list
const WORD_DATABASE = [
    // Common words with pre-calculated values
    {word: "light", values: {english: 56, reduced: 11, reverse: 61, jewish: 217, simple: 56, satantic: 221}},
    {word: "dark", values: {english: 34, reduced: 7, reverse: 29, jewish: 114, simple: 34, satantic: 199}},
    {word: "love", values: {english: 54, reduced: 9, reverse: 63, jewish: 194, simple: 54, satantic: 219}},
    {word: "life", values: {english: 32, reduced: 5, reverse: 40, jewish: 95, simple: 32, satantic: 197}},
    {word: "death", values: {english: 38, reduced: 11, reverse: 43, jewish: 212, simple: 38, satantic: 203}},
    {word: "time", values: {english: 47, reduced: 11, reverse: 52, jewish: 186, simple: 47, satantic: 212}},
    {word: "space", values: {english: 44, reduced: 8, reverse: 55, jewish: 203, simple: 44, satantic: 209}},
    {word: "mind", values: {english: 39, reduced: 12, reverse: 42, jewish: 115, simple: 39, satantic: 204}},
    {word: "soul", values: {english: 67, reduced: 13, reverse: 50, jewish: 175, simple: 67, satantic: 232}},
    {word: "heart", values: {english: 52, reduced: 7, reverse: 65, jewish: 218, simple: 52, satantic: 217}},
    {word: "truth", values: {english: 87, reduced: 15, reverse: 30, jewish: 392, simple: 87, satantic: 252}},
    {word: "power", values: {english: 77, reduced: 14, reverse: 40, jewish: 342, simple: 77, satantic: 242}},
    {word: "energy", values: {english: 74, reduced: 11, reverse: 43, jewish: 292, simple: 74, satantic: 239}},
    {word: "secret", values: {english: 70, reduced: 7, reverse: 47, jewish: 277, simple: 70, satantic: 235}},
    {word: "magic", values: {english: 33, reduced: 6, reverse: 48, jewish: 114, simple: 33, satantic: 198}},
    {word: "spirit", values: {english: 91, reduced: 10, reverse: 26, jewish: 371, simple: 91, satantic: 256}},
    {word: "water", values: {english: 67, reduced: 13, reverse: 50, jewish: 227, simple: 67, satantic: 232}},
    {word: "fire", values: {english: 38, reduced: 11, reverse: 43, jewish: 158, simple: 38, satantic: 203}},
    {word: "earth", values: {english: 52, reduced: 7, reverse: 65, jewish: 218, simple: 52, satantic: 217}},
    {word: "air", values: {english: 28, reduced: 10, reverse: 35, jewish: 109, simple: 28, satantic: 193}},
    // ... Add 10,000+ more words in production
];

// Helper function to generate database from word list
async function generateWordDatabase(wordList) {
    const database = [];
    
    wordList.forEach(word => {
        if (word.length < 3) return;
        
        const values = {
            english: calculateEnglishOrdinal(word),
            reduced: calculateEnglishReduced(word),
            reverse: calculateEnglishReverse(word),
            jewish: calculateJewishGematria(word),
            simple: calculateSimpleGematria(word),
            satantic: calculateSatanicGematria(word)
        };
        
        database.push({word: word.toLowerCase(), values});
    });
    
    return database;
}

// In production, you'd load a word list like:
// fetch('https://raw.githubusercontent.com/dwyl/english-words/master/words_alpha.txt')
//     .then(response => response.text())
//     .then(text => {
//         const words = text.split('\n').slice(0, 10000); // First 10k words
//         return generateWordDatabase(words);
//     });
