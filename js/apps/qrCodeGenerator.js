// 1qrCodeGenerator.js

/* ... (весь код до функции generateQRCode остается без изменений) ... */

// 1. УДАЛИТЕ эту функцию полностью
/*
 * НОВАЯ ФУНКЦИЯ: Кодирует строку в UTF-8 для поддержки кириллицы
 * @param {string} str - Входная строка
 * @returns {string} - Строка в формате UTF-8
 */
/*
function toUtf8(str) {
    let utftext = "";
    str = str.replace(/\r\n/g, "\n");
    for (let n = 0; n < str.length; n++) {
        let c = str.charCodeAt(n);
        if (c < 128) {
            utftext += String.fromCharCode(c);
        } else if ((c > 127) && (c < 2048)) {
            utftext += String.fromCharCode((c >> 6) | 192);
            utftext += String.fromCharCode((c & 63) | 128);
        } else {
            utftext += String.fromCharCode((c >> 12) | 224);
            utftext += String.fromCharCode(((c >> 6) & 63) | 128);
            utftext += String.fromCharCode((c & 63) | 128);
        }
    }
    return utftext;
}
*/

/* ... */

function generateQRCode() {
    let text = '';
    const selectedTemplate = templateSelect.value;
    const colorDark = document.getElementById('qr-color-dark').value;
    const colorLight = document.getElementById('qr-color-light').value;

    if (selectedTemplate === 'text') {
        text = document.getElementById('qr-text').value.trim();
    } else if (selectedTemplate === 'wifi') {
        const ssid = document.getElementById('qr-wifi-ssid').value.trim();
        const pass = document.getElementById('qr-wifi-pass').value;
        const enc = document.getElementById('qr-wifi-enc').value;
        if (ssid) text = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    } else if (selectedTemplate === 'vcard') {
        const name = document.getElementById('qr-vcard-name').value.trim();
        const tel = document.getElementById('qr-vcard-tel').value.trim();
        const email = document.getElementById('qr-vcard-email').value.trim();
        if (name) {
            text = `BEGIN:VCARD\nVERSION:3.0\nN:${name}\n`;
            if (tel) text += `TEL:${tel}\n`;
            if (email) text += `EMAIL:${email}\n`;
            text += `END:VCARD`;
        }
    }

    if (text) {
        display.innerHTML = '';
        downloadBtn.classList.add('hidden');
        try {
            new QRCode(display, {
                // 2. ИЗМЕНЕНО: Передаем текст напрямую, без кодирования
                text: text, 
                width: 208,
                height: 208,
                colorDark: colorDark,
                colorLight: colorLight,
                correctLevel: QRCode.CorrectLevel.H
            });
            setTimeout(() => {
                const canvas = display.querySelector('canvas');
                if (canvas) {
                    downloadBtn.href = canvas.toDataURL();
                    downloadBtn.classList.remove('hidden');
                }
            }, 100);
        } catch (e) {
            console.error(e);
            display.innerHTML = '<span class="text-red-500">Ошибка при создании QR-кода.</span>';
        }
    }
}

/* ... (остальной код без изменений) ... */
