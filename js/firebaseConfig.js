// --- Файл: js/firebaseConfig.js ---

// 1. Импортируем необходимые функции из CDN Firebase.
// Этот синтаксис позволяет использовать модули Firebase прямо в браузере.
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// 2. Ваша уникальная конфигурация веб-приложения Firebase.
// Эти данные связывают ваш сайт с вашим проектом в Firebase.
const firebaseConfig = {
  apiKey: "AIzaSyDks7wx8Lua2rX-BW6SL_OKd83oRdTRj_Q",
  authDomain: "mini-apps-2c0ad.firebaseapp.com",
  projectId: "mini-apps-2c0ad",
  storageBucket: "mini-apps-2c0ad.appspot.com", // Убедитесь, что домен здесь .appspot.com
  messagingSenderId: "420068130976",
  appId: "1:420068130976:web:f4d61f2cd1d8d13adcc9c5"
};

// 3. Инициализируем приложение Firebase с вашей конфигурацией.
const app = initializeApp(firebaseConfig);

// 4. Инициализируем и экспортируем сервисы, которые мы будем использовать в других файлах.
// Теперь любой файл, в который мы импортируем `auth` или `db`, будет работать с этим же экземпляром.
export const auth = getAuth(app);
export const db = getFirestore(app);
