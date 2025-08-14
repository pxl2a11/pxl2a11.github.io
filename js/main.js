import { renderChangelog, getChangelogData } from './utils/changelog.js';
import { auth } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
// ИЗМЕНЕНИЕ: Импортируем наши новые функции управления данными
import { fetchUserAccountData, clearUserData, getUserData, saveUserData } from './dataManager.js';

// --- Сопоставление имен приложений и другие метаданные (без изменений) ---
// ... (все ваши объекты: appNameToModuleFile, appPopularity, appSearchMetadata)

/**
 * =======================================================
 *  ЛОГИКА АВТОРИЗАЦИИ
 * =======================================================
 */

const userProfileElement = document.getElementById('user-profile');
const userAvatarElement = document.getElementById('user-avatar');
const userNameElement = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');
const googleSignInContainer = document.getElementById('google-signin-top-right-container');
let isGsiInitialized = false;

function renderGoogleButton() { /* ... (код функции без изменений) ... */ }
function updateAuthStateUI(user) { /* ... (код функции без изменений) ... */ }

// ИЗМЕНЕНИЕ: Функции get/savePinnedApps теперь используют dataManager
async function getPinnedApps() {
    return getUserData('pinnedApps', []);
}
async function savePinnedApps(pinnedModules) {
    await saveUserData('pinnedApps', pinnedModules);
}

function handleCredentialResponse(response) {
    const googleCredential = GoogleAuthProvider.credential(response.credential);
    signInWithCredential(auth, googleCredential)
        .catch((error) => console.error("Firebase sign-in error", error));
}
function handleSignOut() {
    signOut(auth);
    if (window.google && window.google.accounts) {
        google.accounts.id.disableAutoSelect();
    }
}
function initializeGoogleSignIn() {
    if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
            client_id: '327345325953-bubmv3lac6ctv2tgddin8mshdbceve27.apps.googleusercontent.com',
            callback: handleCredentialResponse
        });
        isGsiInitialized = true;
        renderGoogleButton();
    }
}
// --- КОНЕЦ ЛОГИКИ АВТОРИЗАЦИИ ---

// ... (все остальные функции до document.addEventListener: populateAppCardMap, router, etc.)

document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    signOutBtn.addEventListener('click', handleSignOut);
    setupNavigationEvents();
    window.addEventListener('popstate', router);
    // ... (код обработчиков темы, поиска, кликов по пинам и т.д.)

    // --- ГЛАВНЫЙ ИСПРАВЛЕННЫЙ ПОТОК ЗАГРУЗКИ ---
    let isInitialLoad = true;
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Пользователь вошел: загружаем все его данные в кэш
            await fetchUserAccountData(user.uid);
        } else {
            // Пользователь вышел: очищаем кэш
            clearUserData();
        }

        updateAuthStateUI(user);
        
        if (isInitialLoad) {
            isInitialLoad = false;
            router(); // Первый запуск отрисовки
        } else {
            router(); // Перерисовываем страницу при входе/выходе
        }

        if (isGsiInitialized) {
            renderGoogleButton();
        }
    });
    
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
        }
    }, 100);
});
