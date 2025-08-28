// js/dataManager.js

import { auth, firestore } from './firebaseConfig.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

const LOCAL_STORAGE_KEY = 'miniAppsUserData';
let userDataCache = null;
let onDataLoadedCallback = null; // Callback для обновления UI

// Внутренняя функция для сохранения данных в LocalStorage
function _saveToLocalStorage() {
    if (userDataCache) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(userDataCache));
    } else {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}

// Внутренняя функция для сохранения данных в Firebase (синтаксис v9)
async function _saveToFirebase() {
    if (auth.currentUser && userDataCache) {
        try {
            const userDocRef = doc(firestore, 'users', auth.currentUser.uid);
            await setDoc(userDocRef, userDataCache, { merge: true });
        } catch (error) {
            console.error("Ошибка сохранения данных в Firebase:", error);
            // Здесь можно добавить логику для повторной попытки, если пользователь офлайн
        }
    }
}

// Загружает данные из LocalStorage при инициализации
function _loadFromLocalStorage() {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localData) {
        try {
            userDataCache = JSON.parse(localData);
        } catch (e) {
            console.error("Ошибка парсинга локальных данных:", e);
            userDataCache = {};
        }
    } else {
        userDataCache = {};
    }
}

// --- ПУБЛИЧНЫЕ ФУНКЦИИ ---

/**
 * Устанавливает callback, который будет вызван после загрузки свежих данных из Firebase.
 * @param {Function} callback Функция для вызова
 */
export function setOnDataLoaded(callback) {
    onDataLoadedCallback = callback;
}

/**
 * Основная функция для получения данных пользователя.
 * Сначала загружает из кэша, затем из Firebase. (синтаксис v9)
 * @param {string} uid ID пользователя
 */
export async function fetchUserAccountData(uid) {
    _loadFromLocalStorage(); // Мгновенная загрузка из локального хранилища

    // Фоновая загрузка актуальных данных из Firebase
    try {
        const docRef = doc(firestore, 'users', uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            userDataCache = docSnap.data();
            _saveToLocalStorage(); // Обновляем локальный кэш свежими данными
            console.log("Данные аккаунта загружены из Firebase и обновлены в кэше:", userDataCache);
            if (onDataLoadedCallback) {
                onDataLoadedCallback(); // Уведомляем UI, что пришли свежие данные
            }
        } else {
            // Если в Firebase нет документа, создаем его на основе локальных данных (если они есть)
            console.log("В Firebase нет документа для пользователя, создаем новый.");
            await _saveToFirebase();
        }
    } catch (error) {
        console.warn("Не удалось загрузить данные из Firebase (возможно, оффлайн). Используются локальные данные.", error);
    }
}

/**
 * Сохраняет данные пользователя. Обновляет кэш, LocalStorage и отправляет в Firebase.
 * @param {string} key Ключ данных (например, 'myApps')
 * @param {*} value Новое значение
 */
export async function saveUserData(key, value) {
    if (!userDataCache) {
        userDataCache = {};
    }
    userDataCache[key] = value;
    _saveToLocalStorage(); // Мгновенное сохранение локально
    await _saveToFirebase(); // Попытка сохранить в облаке
}

/**
 * Получает данные из кэша.
 * @param {string} key Ключ данных
 * @param {*} defaultValue Значение по умолчанию
 * @returns {*}
 */
export function getUserData(key, defaultValue) {
    if (!userDataCache) {
        _loadFromLocalStorage();
    }
    return userDataCache?.[key] ?? defaultValue;
}

/**
 * Очищает все данные пользователя при выходе.
 */
export function clearUserData() {
    userDataCache = null;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    console.log("Данные пользователя очищены.");
}
