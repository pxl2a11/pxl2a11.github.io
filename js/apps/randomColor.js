export function getHtml() {
    return `
        <div class="p-4 flex flex-col items-center space-y-6">
            <div id="color-display" class="w-48 h-48 rounded-2xl shadow-lg transition-colors duration-300" style="background-color: #ffffff;"></div>
            <div id="color-code" class="text-2xl font-mono text-center">#ffffff</div>
            <button id="generate-color-btn" class="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-600">Новый цвет</button>
        </div>`;
}

export function init() {
    const display = document.getElementById('color-display');
    const code = document.getElementById('color-code');
    const btn = document.getElementById('generate-color-btn');
    const generateColor = () => {
        const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        display.style.backgroundColor = randomColor;
        code.textContent = randomColor;
    };
    btn.addEventListener('click', generateColor);
    generateColor(); // Initial color
}

export function cleanup() {}
