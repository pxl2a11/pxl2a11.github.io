// 30--- КОД С ИСПРАВЛЕНИЯМИ ---

async function fetchRhymes() {
    const word = rhymeInput.value.trim().toLowerCase();
    if (word.length < 2) {
        statusMessage.textContent = 'Пожалуйста, введите слово.';
        resultsContainer.innerHTML = '';
        return;
    }

    statusMessage.textContent = 'Ищем рифмы...';
    resultsContainer.innerHTML = '';

    try {
        // --- ИСПРАВЛЕНИЕ: Используем новый, специализированный API для русского языка ---
        const response = await fetch(`https://rifma-api.herokuapp.com/rifma/${encodeURIComponent(word)}`);
        
        if (!response.ok) {
            // Этот API может возвращать 404, если рифм не найдено, обрабатываем это как пустой результат.
            if (response.status === 404) {
                statusMessage.textContent = `К сожалению, рифм для слова "${word}" не найдено. Попробуйте другую форму слова.`;
                resultsContainer.innerHTML = '';
                return;
            }
            throw new Error(`Сетевая ошибка: ${response.statusText}`);
        }

        const data = await response.json();
        const rhymes = data.rhymes; // API возвращает рифмы в поле 'rhymes'
        
        // API уже возвращает отфильтрованные рифмы, дополнительная фильтрация не требуется.

        if (rhymes && rhymes.length > 0) {
            statusMessage.textContent = `Найдено рифм: ${rhymes.length}. Нажмите на слово, чтобы скопировать.`;
            // Функция renderRhymes ожидает массив объектов, а новый API возвращает массив строк.
            // Поэтому мы преобразуем его.
            renderRhymes(rhymes.map(r => ({ word: r })));
        } else {
            statusMessage.textContent = `К сожалению, рифм для слова "${word}" не найдено. Попробуйте другую форму слова.`;
        }
    } catch (error) {
        console.error("Ошибка при получении рифм:", error);
        statusMessage.textContent = 'Произошла ошибка при загрузке. Попробуйте позже.';
    }
}
