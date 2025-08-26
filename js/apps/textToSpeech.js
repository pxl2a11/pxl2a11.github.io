// js/apps/textToSpeech.js

let speechSynthesis = window.speechSynthesis;
let utterance;
let voiceSelect, textInput, rateSlider, pitchSlider, highlighter;

function populateVoiceList() {
    if (!speechSynthesis) return;
    const voices = speechSynthesis.getVoices();
    if (voiceSelect) {
        voiceSelect.innerHTML = '';
        voices.forEach(voice => {
            if (voice.lang.includes('ru') || voice.lang.includes('en')) {
                const option = document.createElement('option');
                option.textContent = `${voice.name} (${voice.lang})`;
                option.setAttribute('data-lang', voice.lang);
                option.setAttribute('data-name', voice.name);
                voiceSelect.appendChild(option);
            }
        });
    }
}

function handlePlay() {
    if (speechSynthesis.speaking) return;
    if (textInput.value !== '') {
        utterance = new SpeechSynthesisUtterance(textInput.value);
        
        // --- НОВЫЙ КОД ДЛЯ ПОДСВЕТКИ ---
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const text = textInput.value;
                const start = event.charIndex;
                let end = text.indexOf(' ', start);
                if (end === -1) end = text.length;
                
                const highlightedText = 
                    text.substring(0, start) +
                    '<span class="bg-blue-200 dark:bg-blue-800">' +
                    text.substring(start, end) +
                    '</span>' +
                    text.substring(end);
                
                highlighter.innerHTML = highlightedText;
            }
        };
        
        utterance.onend = () => {
            highlighter.innerHTML = textInput.value; // Убираем подсветку в конце
        };
        // --- КОНЕЦ НОВОГО КОДА ---
        
        utterance.onerror = (event) => console.error('SpeechSynthesisUtterance.onerror', event);
        const selectedOption = voiceSelect.selectedOptions[0]?.getAttribute('data-name');
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.name === selectedOption);
        utterance.pitch = pitchSlider.value;
        utterance.rate = rateSlider.value;
        
        speechSynthesis.speak(utterance);
    }
}

function handleStop() {
    speechSynthesis.cancel();
    highlighter.innerHTML = textInput.value;
}
function handlePause() { speechSynthesis.pause(); }
function handleResume() { speechSynthesis.resume(); }

function updateSliderValue(event) {
    const slider = event.target;
    const output = document.getElementById(`${slider.id}Value`);
    if (output) output.textContent = slider.value;
}

export function getHtml() {
    return `
        <!-- Стили для подсветки -->
        <style>
            #tts-container { position: relative; }
            #tts-highlighter {
                white-space: pre-wrap;
                word-wrap: break-word;
                -webkit-text-fill-color: transparent;
                color: transparent;
            }
            #text-to-speech-input {
                position: absolute;
                left: 0;
                top: 0;
                background-color: transparent;
                -webkit-text-fill-color: inherit;
            }
        </style>
        <div class="space-y-6">
            <div>
                <label for="text-to-speech-input" class="block text-sm font-medium mb-2">Текст для озвучивания:</label>
                <!-- ИЗМЕНЕНИЕ: КОНТЕЙНЕР ДЛЯ ПОДСВЕТКИ -->
                <div id="tts-container" class="relative">
                    <div id="tts-highlighter" class="w-full h-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600" aria-hidden="true"></div>
                    <textarea id="text-to-speech-input" rows="6" class="w-full h-full p-3 border rounded-lg border-transparent focus:ring-blue-500 focus:border-blue-500 focus:outline-none resize-none" placeholder="Введите текст здесь..."></textarea>
                </div>
            </div>

            <div>
                <label for="voice-select" class="block text-sm font-medium mb-2">Выберите голос:</label>
                <select id="voice-select" class="w-full p-3 border rounded-lg bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500">
                    <option>Загрузка голосов...</option>
                </select>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="rate-slider" class="block text-sm font-medium">Скорость: <span id="rate-sliderValue">1</span></label>
                    <input type="range" id="rate-slider" min="0.5" max="2" value="1" step="0.1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                </div>
                <div>
                    <label for="pitch-slider" class="block text-sm font-medium">Высота тона: <span id="pitch-sliderValue">1</span></label>
                    <input type="range" id="pitch-slider" min="0" max="2" value="1" step="0.1" class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                </div>
            </div>

            <div class="flex flex-wrap gap-3 justify-center">
                <button id="play-btn" class="px-5 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300">Воспроизвести</button>
                <button id="pause-btn" class="px-5 py-2.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-300">Пауза</button>
                <button id="resume-btn" class="px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300">Продолжить</button>
                <button id="stop-btn" class="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300">Стоп</button>
            </div>
        </div>
    `;
}

export function init() {
    voiceSelect = document.getElementById('voice-select');
    textInput = document.getElementById('text-to-speech-input');
    rateSlider = document.getElementById('rate-slider');
    pitchSlider = document.getElementById('pitch-slider');
    highlighter = document.getElementById('tts-highlighter');
    const container = document.getElementById('tts-container');
    
    // Синхронизация текста и размера
    const syncText = () => {
        const text = textInput.value;
        highlighter.textContent = text;
        const scrollHeight = textInput.scrollHeight;
        container.style.height = `${scrollHeight}px`;
        textInput.style.height = `${scrollHeight}px`;
        highlighter.style.height = `${scrollHeight}px`;
    };
    
    textInput.addEventListener('input', syncText);
    textInput.addEventListener('scroll', () => { highlighter.scrollTop = textInput.scrollTop; });
    syncText();
    
    populateVoiceList();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
    
    document.getElementById('play-btn')?.addEventListener('click', handlePlay);
    document.getElementById('pause-btn')?.addEventListener('click', handlePause);
    document.getElementById('resume-btn')?.addEventListener('click', handleResume);
    document.getElementById('stop-btn')?.addEventListener('click', handleStop);
    rateSlider?.addEventListener('input', updateSliderValue);
    pitchSlider?.addEventListener('input', updateSliderValue);
}

export function cleanup() {
    if (speechSynthesis) {
        speechSynthesis.cancel();
    }
}
