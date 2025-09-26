// Импортируем библиотеку jsQR в воркер.
// Важно: в воркерах используется importScripts, а не ES6 import.
importScripts("jsQR.js");

// Слушаем сообщения, приходящие от основного потока
self.onmessage = function(event) {
    // Получаем данные изображения (пиксели, ширина, высота)
    const imageData = event.data;

    // Выполняем ресурсоемкую операцию по распознаванию QR-кода
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
    });

    // Отправляем результат обратно в основной поток
    // postMessage() передаст либо объект с данными кода, либо null, если ничего не найдено
    self.postMessage(code);
};