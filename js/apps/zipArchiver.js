// js/apps/zipArchiver.js

// Требуется библиотека JSZip. Убедитесь, что она загружена.
// <script src="путь/к/jszip.min.js"></script>

// Эта функция-обертка нужна, чтобы избежать ошибок, если JSZip еще не загружен
const loadJSZip = () => {
  return new Promise((resolve, reject) => {
    if (window.JSZip) {
      resolve(window.JSZip);
    } else {
      // Можно добавить динамическую загрузку скрипта, если его нет
      reject('JSZip library is not loaded');
    }
  
