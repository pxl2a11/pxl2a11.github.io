import { renderChangelog, getChangelogData } from './utils/changelog.js';
import { auth, db } from './firebaseConfig.js';
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// --- Сопоставление имен приложений с файлами модулей (без изменений) ---
// ... (все ваши объекты-конфигурации: appNameToModuleFile, appPopularity, appSearchMetadata)

/**
 * =======================================================
 *  ЛОГИКА АВТОРИЗАЦИИ И РАБОТЫ С FIREBASE V9
 * =======================================================
 */

const userProfileElement = document.getElementById('user-profile');
const userAvatarElement = document.getElementById('user-avatar');
const userNameElement = document.getElementById('user-name');
const signOutBtn = document.getElementById('sign-out-btn');
const googleSignInContainer = document.getElementById('google-signin-top-right-container');

let isGsiInitialized = false;

function renderGoogleButton() {
    if (!isGsiInitialized || !googleSignInContainer || auth.currentUser) return;
    googleSignInContainer.innerHTML = '';
    window.google.accounts.id.renderButton(
        googleSignInContainer,
        { type: "icon", shape: "circle", theme: "outline", size: "large" }
    );
    googleSignInContainer.classList.remove('hidden');
}

function updateAuthStateUI(user) {
    if (user) {
        if (userNameElement) userNameElement.textContent = user.displayName;
        if (userAvatarElement) userAvatarElement.src = user.photoURL;
        if (userProfileElement) userProfileElement.classList.remove('hidden');
        if (googleSignInContainer) googleSignInContainer.classList.add('hidden');
    } else {
        if (userProfileElement) userProfileElement.classList.add('hidden');
        if (googleSignInContainer) googleSignInContainer.classList.remove('hidden');
    }
}

async function getPinnedApps() {
    const user = auth.currentUser;
    if (!user) {
        const guestPins = localStorage.getItem('pinnedApps_guest');
        return guestPins ? JSON.parse(guestPins) : [];
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().pinnedApps) {
            return docSnap.data().pinnedApps;
        }
        return [];
    } catch (error) {
        console.error("Error getting pinned apps:", error);
        return [];
    }
}

async function savePinnedApps(pinnedModules) {
    const user = auth.currentUser;
    if (!user) {
        localStorage.setItem('pinnedApps_guest', JSON.stringify(pinnedModules));
        return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
        await setDoc(userDocRef, { pinnedApps: pinnedModules }, { merge: true });
    } catch (error) {
        console.error("Error saving pinned apps:", error);
    }
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
// --- КОНЕЦ ЛОГИКИ FIREBASE ---

// ... (все функции без изменений: populateAppCardMap, renderSimilarApps, setupNavigationEvents, setupSearch)

async function applyAppListFilterAndRender() {
    // ... (код функции без изменений)
}

function setupFilters() {
    // ... (код функции без изменений)
}

async function router() {
    // ... (код функции без изменений)
}

document.addEventListener('DOMContentLoaded', () => {
    populateAppCardMap();
    
    // --- ИЗМЕНЕНИЕ: Логика инициализации для быстрой загрузки ---

    // 1. Сразу отрисовываем страницу для гостя
    router();

    // 2. Навешиваем все обработчики событий
    const themeToggleBtn = document.getElementById('theme-toggle');
    // ... (весь код обработчиков: тема, поиск, клики по пинам, changelog и т.д.)

    // 3. Запускаем проверку авторизации
    onAuthStateChanged(auth, user => {
        console.log("Auth state changed, user:", user ? user.displayName : 'none');
        updateAuthStateUI(user);
        applyAppListFilterAndRender(); // Перерисовываем пины, когда пришел ответ от Firebase
        if (isGsiInitialized) {
            renderGoogleButton();
        }
    });
    
    // 4. Инициализируем Google Sign-In
    const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
            clearInterval(checkGoogle);
            initializeGoogleSignIn();
        }
    }, 100);

    window.addEventListener('popstate', () => router());
});
