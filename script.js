class GematriaSimilarity {
    constructor() {
        this.inputText = document.getElementById('text-input');
        this.resultsContainer = document.getElementById('results-container');
        this.wordCount = document.getElementById('word-count');
        this.matchCount = document.getElementById('match-count');
        this.detailsSection = document.getElementById('word-details');
        this.detailsContent = document.getElementById('details-content');
        this.analyzeBtn = document.getElementById('analyze-btn');
        
        this.currentMatches = [];
        this.selectedWord = null;
        
        this.initEventListeners();
    }

    initEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.analyze());
        this.inputText.addEventListener('keyup', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyze();
            }
        });
    }

    analyze() {
        const text = this.inputText.value.trim();
        if (!text) {
            this.showMessage('Please enter some text to analyze', 'error');
            return;
        }

        const systems = this.getSelectedSystems();
        if (systems.length === 0) {
            this.showMessage('Please select at least one gematria system', 'error');
            return;
        }

        this.analyzeBtn.disabled = true;
        this.analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';

        setTimeout(() => {
            try {
                this.processText(text, systems);
            } catch (error) {
                this.showMessage('An error occurred during analysis', 'error');
                console.error(error);
            } finally {
                this.analyzeBtn.disabled = false;
                this.analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Find Similar Words';
            }
        }, 50);
    }

    getSelectedSystems() {
        const systems = [];
        const systemIds = [
            'sys-english',
            'sys-reduced', 
            'sys-reverse',
            'sys-jewish',
            'sys-simple',
            'sys-satantic'
        ];

        systemIds.forEach(id => {
            if (document.getElementById(id).checked) {
                systems.push(id.replace('sys-', ''));
            }
        });

        return systems;
    }

    processText(text, systems) {
        // Clean and extract words
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0);

        this.wordCount.textContent = `${words.length} words analyzed`;

        // Calculate values for each input word
        const inputWords = [];
        const uniqueWords = [...new Set(words)]; // Remove duplicates
        
        uniqueWords.forEach(word => {
            if (word.length < parseInt(document.getElementById('min-length').value)) {
                return;
            }

            const values = this.calculateWordValues(word, systems);
            inputWords.push({
                word,
                values,
                length: word.length
            });
        });

        // Find similar words
        this.currentMatches = this.findSimilarWords(inputWords, systems);
        this.matchCount.textContent = `${this.currentMatches.length} matches found`;
        
        this.displayResults(this.currentMatches);
    }

    calculateWordValues(word, systems) {
        const values = {};
        
        systems.forEach(system => {
            switch(system) {
                case 'english':
                    values[system] = this.englishOrdinal(word);
                    break;
                case 'reduced':
                    values[system] = this.englishReduced(word);
                    break;
                case 'reverse':
                    values[system] = this.englishReverse(word);
                    break;
                case 'jewish':
                    values[system] = this.jewishGematria(word);
                    break;
                case 'simple':
                    values[system] = this.simpleGematria(word);
                    break;
                case 'satantic':
                    values[system] = this.satanicGematria(word);
                    break;
            }
        });
        
        return values;
    }

    englishOrdinal(word) {
        return word.split('').reduce((sum, char) => {
            const code = char.charCodeAt(0) - 96;
            return sum + (code >= 1 && code <= 26 ? code : 0);
        }, 0);
    }

    englishReduced(word) {
        const total = this.englishOrdinal(word);
        return this.reduceNumber(total);
    }

    englishReverse(word) {
        return word.split('').reduce((sum, char) => {
            const code = 27 - (char.charCodeAt(0) - 96);
            return sum + (code >= 1 && code <= 26 ? code : 0);
        }, 0);
    }

    jewishGematria(word) {
        const mapping = {
            'a': 1, 'b': 2, 'c': 3, 'd': 4, 'e': 5,
            'f': 6, 'g': 7, 'h': 8, 'i': 9,
            'j': 600, 'k': 10, 'l': 20, 'm': 30, 'n': 40,
            'o': 50, 'p': 60, 'q': 70, 'r': 80, 's': 90,
            't': 100, 'u': 200, 'v': 700, 'w': 900,
            'x': 300, 'y': 400, 'z': 500
        };
        
        return word.split('').reduce((sum, char) => {
            return sum + (mapping[char] || 0);
        }, 0);
    }

    simpleGematria(word) {
        return word.split('').reduce((sum, char) => {
            const code = char.charCodeAt(0) - 96;
            return sum + (code >= 1 && code <= 26 ? code : 0);
        }, 0);
    }

    satanicGematria(word) {
        return word.split('').reduce((sum, char) => {
            const code = char.charCodeAt(0) - 96;
            return sum + (code >= 1 && code <= 26 ? code + 35 : 0);
        }, 0);
    }

    reduceNumber(num) {
        while (num > 9 && num !== 11 && num !== 22 && num !== 33) {
            num = num.toString().split('').reduce((a, b) => parseInt(a) + parseInt(b), 0);
        }
        return num;
    }

    findSimilarWords(inputWords, systems) {
        const threshold = parseInt(document.getElementById('threshold').value);
        const maxResults = parseInt(document.getElementById('max-results').value);
        const matches = [];

        inputWords.forEach(inputWord => {
            const wordMatches = [];
            
            // Compare with each word in database
            WORD_DATABASE.forEach(dbWord => {
                if (dbWord.word === inputWord.word) return; // Skip same word
                
                let similarityScore = 0;
                let totalDifference = 0;
                
                systems.forEach(system => {
                    const inputValue = inputWord.values[system];
                    const dbValue = dbWord.values[system];
                    const diff = Math.abs(inputValue - dbValue);
                    
                    if (diff <= threshold) {
                        similarityScore++;
                    }
                    totalDifference += diff;
                });
                
                if (similarityScore > 0) {
                    wordMatches.push({
                        word: dbWord.word,
                        values: dbWord.values,
                        similarityScore,
                        totalDifference,
                        length: dbWord.word.length
                    });
                }
            });

            // Sort and limit matches for this word
            wordMatches.sort((a, b) => {
                if (b.similarityScore !== a.similarityScore) {
                    return b.similarityScore - a.similarityScore;
                }
                return a.totalDifference - b.totalDifference;
            });

            matches.push({
                inputWord: inputWord.word,
                inputValues: inputWord.values,
                matches: wordMatches.slice(0, maxResults)
            });
        });

        // Sort by number of matches
        matches.sort((a, b) => b.matches.length - a.matches.length);
        
        return matches;
    }

    displayResults(matches) {
        if (matches.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle fa-3x"></i>
                    <p>No similar words found. Try adjusting the similarity threshold or selecting more systems.</p>
                </div>
            `;
            this.detailsSection.style.display = 'none';
            return;
        }

        let html = '';
        
        matches.forEach(matchGroup => {
            if (matchGroup.matches.length === 0) return;
            
            html += `
                <div class="match-group">
                    <div class="input-word-header">
                        <h4>Input word: <span class="input-word">"${matchGroup.inputWord}"</span></h4>
                        <div class="input-values">
                            ${Object.entries(matchGroup.inputValues).map(([system, value]) => `
                                <span class="value-tag">${system}: ${value}</span>
                            `).join('')}
                        </div>
                    </div>
                    <div class="matches-grid">
            `;
            
            matchGroup.matches.forEach(match => {
                const isExact = Object.entries(matchGroup.inputValues).every(
                    ([system, value]) => Math.abs(value - match.values[system]) === 0
                );
                
                html += `
                    <div class="word-card ${isExact ? 'highlighted' : ''}" 
                         data-word="${match.word}"
                         data-input="${matchGroup.inputWord}">
                        <div class="word-header">
                            <span class="word-text">${match.word}</span>
                            <span class="word-match">
                                ${match.similarityScore}/${Object.keys(matchGroup.inputValues).length} systems
                            </span>
                        </div>
                        <div class="systems-grid">
                            ${Object.entries(match.values).map(([system, value]) => {
                                const inputValue = matchGroup.inputValues[system];
                                const diff = Math.abs(value - inputValue);
                                const diffClass = diff === 0 ? 'exact' : diff <= 2 ? 'close' : 'far';
                                
                                return `
                                    <div class="system-value">
                                        <div class="value ${diffClass}">${value}</div>
                                        <div class="system-name">${system}</div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        ${isExact ? '<div class="exact-match-label">Exact Match!</div>' : ''}
                    </div>
                `;
            });
            
            html += `</div></div>`;
        });

        this.resultsContainer.innerHTML = html;
        this.detailsSection.style.display = 'none';

        // Add click listeners to word cards
        document.querySelectorAll('.word-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const word = card.dataset.word;
                const inputWord = card.dataset.input;
                this.showWordDetails(word, inputWord);
            });
        });
    }

    showWordDetails(word, inputWord) {
        const wordData = WORD_DATABASE.find(w => w.word === word);
        const matchGroup = this.currentMatches.find(m => m.inputWord === inputWord);
        const match = matchGroup.matches.find(m => m.word === word);
        
        if (!wordData || !match) return;

        this.selectedWord = word;
        
        let detailsHtml = `
            <div class="detail-header">
                <h4>${word} ↔ ${inputWord}</h4>
                <p>Similarity: ${match.similarityScore}/${Object.keys(matchGroup.inputValues).length} systems match</p>
            </div>
            
            <div class="comparison-table">
        `;

        Object.entries(wordData.values).forEach(([system, value]) => {
            const inputValue = matchGroup.inputValues[system];
            const diff = Math.abs(value - inputValue);
            const diffText = diff === 0 ? 'Exact' : diff <= 2 ? 'Close' : 'Far';
            const diffClass = diff === 0 ? 'exact' : diff <= 2 ? 'close' : 'far';
            
            detailsHtml += `
                <div class="detail-row">
                    <span class="system">${system.toUpperCase()}</span>
                    <span class="values">
                        <span class="value">${value}</span>
                        <span class="separator">vs</span>
                        <span class="value">${inputValue}</span>
                    </span>
                    <span class="difference ${diffClass}">${diffText} (${diff})</span>
                </div>
            `;
        });

        detailsHtml += `</div>`;
        
        this.detailsContent.innerHTML = detailsHtml;
        this.detailsSection.style.display = 'block';
        
        // Scroll to details
        this.detailsSection.scrollIntoView({ behavior: 'smooth' });
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${message}
        `;
        
        document.querySelector('.input-section').appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 5000);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new GematriaSimilarity();
});
