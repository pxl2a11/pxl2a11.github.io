const commonCSS = `
    .translit-textarea {
        width: 100%;
        min-height: 150px;
        padding: 0.75rem;
        border-radius: 0.5rem;
        border: 1px solid #d1d5db; /* gray-300 */
        background-color: #f9fafb; /* gray-50 */
        color: #111827; /* gray-900 */
        transition: border-color 0.2s, box-shadow 0.2s;
    }
    .dark .translit-textarea {
        background-color: #374151; /* dark:gray-700 */
        border-color: #4b5563; /* dark:gray-600 */
        color: #f3f4f6; /* dark:gray-200 */
    }
    .translit-textarea:focus {
        outline: none;
        border-color: #3b82f6; /* blue-500 */
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
    }
    .translit-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        background-color: #3b82f6;
        color: white;
        font-weight: 500;
        transition: background-color 0.2s;
        cursor: pointer;
    }
    .translit-btn:hover {
        background-color: #2563eb;
    }
`;

export function getHtml() {
    return `
        <style>${commonCSS}</style>
        <div class="space-y-4">
            <div>
                <label for="source-text" class="block text-sm font-medium mb-1">Исходный текст:</label>
                <textarea id="source-text" class="translit-textarea" placeholder="Введите текст здесь..."></textarea>
            </div>
            
            <div class="flex flex-wrap items-center justify-center gap-3">
                <button id="cyr-to-lat-btn" class="translit-btn">Кириллица → Латиница</button>
                <button id="lat-to-cyr-btn" class="translit-btn">Латиница → Кириллица</button>
            </div>

            <div>
                <label for="result-text" class="block text-sm font-medium mb-1">Результат:</label>
                <textarea id="result-text" class="translit-textarea" readonly placeholder="Результат появится здесь..."></textarea>
                 <button id="copy-btn" class="translit-btn mt-2">Копировать</button>
            </div>
        </div>
    `;
}

export function init() {
    const sourceText = document.getElementById('source-text');
    const resultText = document.getElementById('result-text');
    const cyrToLatBtn = document.getElementById('cyr-to-lat-btn');
    const latToCyrBtn = document.getElementById('lat-to-cyr-btn');
    const copyBtn = document.getElementById('copy-btn');

    const cyrToLatSchema = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'j', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'c',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shh', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    const latToCyrSchema = {
        'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х',
        'i': 'и', 'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п',
        'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'y': 'ы', 'z': 'з'
        // Двойные символы обрабатываются отдельно
    };

    function transliterate(text, direction) {
        text = text.toLowerCase();
        let result = text;
        
        if (direction === 'cyr-to-lat') {
            // Заменяем сложные случаи сначала
            result = result.replace(/ё/g, 'yo').replace(/ж/g, 'zh').replace(/ч/g, 'ch')
                         .replace(/ш/g, 'sh').replace(/щ/g, 'shh').replace(/ю/g, 'yu')
                         .replace(/я/g, 'ya').replace(/ь/g, '').replace(/ъ/g, '');
            // Затем простые буквы
            return result.split('').map(char => cyrToLatSchema[char] || char).join('');
        } else { // lat-to-cyr
            // Заменяем сложные случаи сначала
             result = result.replace(/yo/g, 'ё').replace(/zh/g, 'ж').replace(/ch/g, 'ч')
                         .replace(/shh/g, 'щ').replace(/sh/g, 'ш').replace(/yu/g, 'ю')
                         .replace(/ya/g, 'я');
            // Затем простые буквы
            return result.split('').map(char => latToCyrSchema[char] || char).join('');
        }
    }
    
    cyrToLatBtn.addEventListener('click', () => {
        resultText.value = transliterate(sourceText.value, 'cyr-to-lat');
    });

    latToCyrBtn.addEventListener('click', () => {
        resultText.value = transliterate(sourceText.value, 'lat-to-cyr');
    });

    copyBtn.addEventListener('click', () => {
        if (resultText.value) {
            navigator.clipboard.writeText(resultText.value).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Скопировано!';
                setTimeout(() => { copyBtn.textContent = originalText; }, 2000);
            });
        }
    });
}
