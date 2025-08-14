// --- Файл: js/dataManager.js ---

import { auth, db } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Наш кэш в памяти браузера для всех данных пользователя
let userAccountData = {};

/**
 * Загружает все данные пользователя из Firestore в кэш.
 * Вызывается один раз при входе в систему.
 */
export async function fetchUserAccountData(userId) {
    if (!userId) {
        userAccountData = {}; // Если ID нет, сбрасываем кэш
        return;
    }
    const userDocRef = doc(db, 'users', userId);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            userAccountData = docSnap.data();
            console.log("Данные аккаунта загружены в кэш:", userAccountData);
        } else {
            // Если у нового пользователя еще нет документа, создаем пустой объект
            userAccountData = {};
        }
    } catch (error) {
        console.error("Ошибка загрузки данных аккаунта:", error);
        userAccountData = {};
    }
}

/**
 * Очищает кэш при выходе из аккаунта.
 */
export function clearUserData() {
    userAccountData = {};
    console.log("Кэш данных аккаунта очищен.");
}

/**
 * Универсальная функция для получения данных.
 * Приложения будут вызывать ее. Она сама решает, откуда брать данные:
 * из кэша (если пользователь вошел) или из localStorage (для гостя).
 */
export function getUserData(key, defaultValue = []) {
    const user = auth.currentUser;
    if (user) {
        // Пользователь вошел - берем данные из кэша
        return userAccountData[key] || defaultValue;
    } else {
        // Гость - берем данные из localStorage
        const localData = localStorage.getItem(`${key}_guest`);
        // Проверяем, соответствует ли тип данных значению по умолчанию
        if (typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
             return localData ? JSON.parse(localData) : defaultValue;
        }
        return localData ? JSON.parse(localData) : defaultValue;
    }
}

/**
 * Универсальная функция для сохранения данных.
 * Мгновенно обновляет кэш и отправляет данные в Firebase.
 */
export async function saveUserData(key, data) {
    const user = auth.currentUser;
    if (user) {
        // Обновляем локальный кэш для мгновенного отклика интерфейса
        userAccountData[key] = data;
        // Сохраняем в Firestore в фоновом режиме
        const userDocRef = doc(db, 'users', user.uid);
        try {
            // set с { merge: true } создает документ, если его нет, или обновляет/добавляет поля
            await setDoc(userDocRef, { [key]: data }, { merge: true });
        } catch (error) {
            console.error(`Ошибка сохранения ${key}:`, error);
        }
    } else {
        // Гость - сохраняем в localStorage
        localStorage.setItem(`${key}_guest`, JSON.stringify(data));
    }
}
