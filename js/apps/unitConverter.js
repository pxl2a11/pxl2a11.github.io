export function getHtml() {
    return `
        <div class="p-4 space-y-6">
            <div class="space-y-2">
                <label for="converter-type" class="font-medium">Тип конвертации:</label>
                <select id="converter-type" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <option value="length">Длина</option>
                    <option value="weight">Вес</option>
                    <option value="temperature">Температура</option>
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
        temperature: { c: { name: 'Цельсий', to_base: v => v, from_base: v => v }, f: { name: 'Фаренгейт', to_base: v => (v - 32) * 5/9, from_base: v => (v * 9/5) + 32 }, k: { name: 'Кельвин', to_base: v => v - 273.15, from_base: v => v + 273.15 } }
    };

    const buildConverterUI = type => {
        const availableUnits = units[type];
        const unitKeys = Object.keys(availableUnits);
        const optionsHtml = unitKeys.map(key => `<option value="${key}">${availableUnits[key].name}</option>`).join('');
        converterUiContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div class="space-y-2"><label for="input-value" class="font-medium">Из</label><input id="input-value" type="number" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600" value="1"><select id="input-unit" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">${optionsHtml}</select></div>
                <div class="space-y-2"><label for="output-value" class="font-medium">В</label><input id="output-value" type="number" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600"><select id="output-unit" class="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">${optionsHtml}</select></div>
            </div>`;
        
        const inputVal = document.getElementById('input-value'), outputVal = document.getElementById('output-value'), inputUnitSelect = document.getElementById('input-unit'), outputUnitSelect = document.getElementById('output-unit');
        outputUnitSelect.value = unitKeys.length > 1 ? unitKeys[1] : unitKeys[0];

        const convert = source => {
            const fromUnit = availableUnits[inputUnitSelect.value], toUnit = availableUnits[outputUnitSelect.value];
            const fromVal = parseFloat(inputVal.value), toVal = parseFloat(outputVal.value);
            if (source === 'input' && !isNaN(fromVal)) {
                outputVal.value = parseFloat(toUnit.from_base(fromUnit.to_base(fromVal)).toPrecision(6));
            } else if (source === 'output' && !isNaN(toVal)) {
                inputVal.value = parseFloat(fromUnit.from_base(toUnit.to_base(toVal)).toPrecision(6));
            }
        };
        
        [inputVal, outputVal, inputUnitSelect, outputUnitSelect].forEach(el => {
            el.addEventListener('input', () => convert(el.id.startsWith('input') ? 'input' : 'output'));
        });
        convert('input');
    };

    converterTypeSelect.addEventListener('change', e => buildConverterUI(e.target.value));
    buildConverterUI('length');
}

export function cleanup() {}
