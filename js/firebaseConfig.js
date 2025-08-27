// 32js/firebaseConfig.js

// Импортируем все необходимые модули Firebase
import firebase from "https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js";
import "https://www.gstatic.com/firebasejs/8.10.1/firebase-auth.js";
import "https://www.gstatic.com/firebasejs/8.10.1/firebase-firestore.js"; // <-- УБЕДИТЕСЬ, ЧТО ЭТА СТРОКА ЕСТЬ

// Ваша персональная конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDks7wx8Lua2rX-BW6SL_OKd83oRdTRj_Q",
  authDomain: "mini-apps-2c0ad.firebaseapp.com",
  projectId: "mini-apps-2c0ad",
  storageBucket: "mini-apps-2c0ad.appspot.com",
  messagingSenderId: "420068130976",
  appId: "1:420068130976:web:f4d61f2cd1d8d13adcc9c5"
};

// Инициализация Firebase, если еще не была произведена
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Получаем доступ к сервисам аутентификации и базы данных
const auth = firebase.auth();
const firestore = firebase.firestore(); // <-- УБЕДИТЕСЬ, ЧТО ЭТА СТРОКА ЕСТЬ

// Экспортируем ОБА сервиса
export { auth, firestore }; // <-- УБЕДИТЕСЬ, ЧТО FIRESTORE ЗДЕСЬ УКАЗАН
