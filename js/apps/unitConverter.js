export function getHtml() {
    return `
        <div class="p-4 space-y-6">
            <div class="space-y-2">
                <label for="converter-type" class="font-medium">Тип конвертации:</label>
                <select id="converter-type" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <option value="length">Длина</option>
                    <option value="weight">Вес</option>
                    <option value="temperature">Температура</option>
                    <option value="area">Площадь</option>
                    <option value="speed">Скорость</option>
                </select>
            </div>
            <div id="converter-ui"></div>
        </div>`;
}

export function init() {
    const converterTypeSelect = document.getElementById('converter-type');
    const converterUiContainer = document.getElementById('converter-ui');
    const units = {
        length: { m: { name: 'Метры', to_base: v => v, from_base: v => v }, cm: { name: 'Сантиметры', to_base: v => v / 100, from_base: v => v * 100 }, in: { name: 'Дюймы', to_base: v => v * 0.0254, from_base: v => v / 0.0254 }, ft: { name: 'Футы', to_base: v => v * 0.3048, from_base: v => v / 0.3048 } },
        weight: { kg: { name: 'Килограммы', to_base: v => v, from_base: v => v }, g: { name: 'Граммы', to_base: v => v / 1000, from_base: v => v * 1000 }, lb: { name: 'Фунты', to_base: v => v * 0.453592, from_base: v => v / 0.453592 }, oz: { name: 'Унции', to_base: v => v * 0.0283495, from_base: v => v / 0.0283495 } },
        temperature: { c: { name: 'Цельсий', to_base: v => v, from_base: v => v }, f: { name: 'Фаренгейт', to_base: v => (v - 32) * 5/9, from_base: v => (v * 9/5) + 32 }, k: { name: 'Кельвин', to_base: v => v - 273.15, from_base: v => v + 273.15 } },
        area: { sqm: { name: 'Кв. метры', to_base: v => v, from_base: v => v }, sqft: { name: 'Кв. футы', to_base: v => v * 0.092903, from_base: v => v / 0.092903 }, acre: { name: 'Акры', to_base: v => v * 4046.86, from_base: v => v / 4046.86 } },
        speed: { kph: { name: 'Км/ч', to_base: v => v, from_base: v => v }, mph: { name: 'Миль/ч', to_base: v => v * 1.60934, from_base: v => v / 1.60934 }, mps: { name: 'М/с', to_base: v => v * 3.6, from_base: v => v / 3.6 } }
    };

    const buildConverterUI = type => {
        const availableUnits = units[type];
        const unitKeys = Object.keys(availableUnits);
        const optionsHtml = unitKeys.map(key => `<option value="${key}">${availableUnits[key].name}</option>`).join('');
        converterUiContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div class="space-y-2"><label for="input-value" class="font-medium">Из</label><input id="input-value" type="number" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" value="1"><select id="input-unit" class="w-full p-2 mt-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">${optionsHtml}</select></div>
                <div class="space-y-2"><label for="output-value" class="font-medium">В</label><input id="output-value" type="number" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"><select id="output-unit" class="w-full p-2 mt-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">${optionsHtml}</select></div>
            </div>`;
        
        const inputVal = document.getElementById('input-value'), outputVal = document.getElementById('output-value'), inputUnitSelect = document.getElementById('input-unit'), outputUnitSelect = document.getElementById('output-unit');
        outputUnitSelect.value = unitKeys.length > 1 ? unitKeys[1] : unitKeys[0];

        const convert = (source) => {
            const fromUnitKey = inputUnitSelect.value;
            const toUnitKey = outputUnitSelect.value;
            const fromUnit = availableUnits[fromUnitKey];
            const toUnit = availableUnits[toUnitKey];
            
            if (source === 'input') {
                const fromVal = parseFloat(inputVal.value);
                if (!isNaN(fromVal)) {
                    const baseValue = fromUnit.to_base(fromVal);
                    const result = toUnit.from_base(baseValue);
                    outputVal.value = parseFloat(result.toPrecision(6));
                } else {
                    outputVal.value = '';
                }
            } else { // source === 'output'
                const toVal = parseFloat(outputVal.value);
                if (!isNaN(toVal)) {
                    const baseValue = toUnit.to_base(toVal);
                    const result = fromUnit.from_base(baseValue);
                    inputVal.value = parseFloat(result.toPrecision(6));
                } else {
                    inputVal.value = '';
                }
            }
        };
        
        [inputVal, outputVal, inputUnitSelect, outputUnitSelect].forEach(el => {
            el.addEventListener('input', () => {
                const source = el.id.startsWith('input') ? 'input' : 'output';
                convert(source);
            });
             el.addEventListener('change', () => {
                const source = el.id.startsWith('input') ? 'input' : 'output';
                convert(source);
            });
        });
        convert('input');
    };

    converterTypeSelect.addEventListener('change', e => buildConverterUI(e.target.value));
    buildConverterUI('length');
}

export function cleanup() {}
