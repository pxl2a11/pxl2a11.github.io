export function getHtml() {
    return `
        <div class="p-4">
            <div class="flex border-b border-gray-300 dark:border-gray-600 mb-4">
                <button id="tasks-tab" class="tab-btn py-2 px-4 font-semibold border-b-2 active">Задачи</button>
                <button id="notes-tab" class="tab-btn py-2 px-4 font-semibold border-b-2">Заметки</button>
            </div>
            <div id="tasks-content">
                <div class="flex gap-2 mb-4">
                    <input id="task-input" type="text" placeholder="Новая задача..." class="flex-grow p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <button id="add-task-btn" class="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">Добавить</button>
                </div>
                <div id="tasks-list" class="space-y-2"></div>
            </div>
            <div id="notes-content" class="hidden">
                 <div class="flex gap-2 mb-4">
                    <input id="note-input" type="text" placeholder="Новая заметка..." class="flex-grow p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600">
                    <button id="add-note-btn" class="bg-blue-500 text-white px-4 rounded-lg hover:bg-blue-600">Добавить</button>
                </div>
                <div id="notes-list" class="space-y-2"></div>
            </div>
        </div>
    `;
}

export function init() {
    const tasksTab = document.getElementById('tasks-tab'), notesTab = document.getElementById('notes-tab');
    const tasksContent = document.getElementById('tasks-content'), notesContent = document.getElementById('notes-content');
    const taskInput = document.getElementById('task-input'), addTaskBtn = document.getElementById('add-task-btn'), tasksList = document.getElementById('tasks-list');
    const noteInput = document.getElementById('note-input'), addNoteBtn = document.getElementById('add-note-btn'), notesList = document.getElementById('notes-list');

    const switchTab = (activeTab) => {
        tasksTab.classList.toggle('active', activeTab === 'tasks');
        notesTab.classList.toggle('active', activeTab === 'notes');
        tasksContent.classList.toggle('hidden', activeTab !== 'tasks');
        notesContent.classList.toggle('hidden', activeTab !== 'notes');
    };
    tasksTab.addEventListener('click', () => switchTab('tasks'));
    notesTab.addEventListener('click', () => switchTab('notes'));

    // --- TASKS LOGIC ---
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const saveTasks = () => localStorage.setItem('tasks', JSON.stringify(tasks));
    const renderTasks = () => {
        tasksList.innerHTML = tasks.length === 0 ? '<p class="text-center text-gray-500 dark:text-gray-400">Список задач пуст.</p>' :
            tasks.map((task, index) => `
                <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center">
                        <input type="checkbox" data-index="${index}" class="task-checkbox h-5 w-5 rounded-full" ${task.completed ? 'checked' : ''}>
                        <span class="ml-3 ${task.completed ? 'line-through text-gray-500' : ''}">${task.text}</span>
                    </div>
                    <button data-index="${index}" class="task-delete-btn text-red-500 hover:text-red-700 font-bold">✖</button>
                </div>
            `).join('');
    };
    addTaskBtn.addEventListener('click', () => { if (taskInput.value.trim()) { tasks.unshift({ text: taskInput.value.trim(), completed: false }); taskInput.value = ''; saveTasks(); renderTasks(); } });
    taskInput.addEventListener('keypress', e => { if (e.key === 'Enter') addTaskBtn.click(); });
    tasksList.addEventListener('click', e => { if (e.target.classList.contains('task-delete-btn')) { tasks.splice(e.target.dataset.index, 1); saveTasks(); renderTasks(); } });
    tasksList.addEventListener('change', e => { if (e.target.classList.contains('task-checkbox')) { tasks[e.target.dataset.index].completed = e.target.checked; saveTasks(); renderTasks(); } });

    // --- NOTES LOGIC ---
    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    const saveNotes = () => localStorage.setItem('notes', JSON.stringify(notes));
    const renderNotes = () => {
        notesList.innerHTML = notes.length === 0 ? '<p class="text-center text-gray-500 dark:text-gray-400">Список заметок пуст.</p>' :
            notes.map((noteText, index) => `
                <div class="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span class="break-all">${noteText}</span>
                    <button data-index="${index}" class="note-delete-btn text-red-500 hover:text-red-700 font-bold ml-4 flex-shrink-0">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd"></path></svg>
                    </button>
                </div>
            `).join('');
    };
    addNoteBtn.addEventListener('click', () => { if (noteInput.value.trim()) { notes.unshift(noteInput.value.trim()); noteInput.value = ''; saveNotes(); renderNotes(); } });
    noteInput.addEventListener('keypress', e => { if (e.key === 'Enter') addNoteBtn.click(); });
    notesList.addEventListener('click', e => { const btn = e.target.closest('.note-delete-btn'); if (btn) { notes.splice(btn.dataset.index, 1); saveNotes(); renderNotes(); } });

    renderTasks();
    renderNotes();
}

export function cleanup() {}```

#### `js/apps/soundAndMicTest.js`
```javascript
let audioCtx, micStream, animationFrameId;

export function getHtml() {
    return `
        <div class="p-4 space-y-8">
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест звука</h3>
                <p class="text-center mb-4">Нажмите для проверки левого и правого каналов.</p>
                <div class="flex justify-center gap-4">
                    <button id="left-channel-btn" class="bg-blue-500 text-white font-bold py-3 px-6 rounded-full">Левый</button>
                    <button id="right-channel-btn" class="bg-green-500 text-white font-bold py-3 px-6 rounded-full">Правый</button>
                </div>
            </div>
            <div>
                <h3 class="text-xl font-bold mb-2 text-center">Тест микрофона</h3>
                <p id="mic-status" class="text-center mb-4">Нажмите "Начать" для проверки.</p>
                <div class="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4"><div id="mic-level" class="h-full bg-teal-500 transition-all duration-50" style="width: 0%;"></div></div>
                <div class="text-center"><button id="mic-start-btn" class="bg-teal-500 text-white font-bold py-3 px-6 rounded-full">Начать</button></div>
            </div>
        </div>`;
}

export function init() {
    const playTestTone = pan => {
        if (!audioCtx || audioCtx.state === 'closed') audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator(), panner = audioCtx.createStereoPanner();
        osc.type = 'sine'; osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        panner.pan.setValueAtTime(pan, audioCtx.currentTime);
        osc.connect(panner).connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
    };

    document.getElementById('left-channel-btn').onclick = () => playTestTone(-1);
    document.getElementById('right-channel-btn').onclick = () => playTestTone(1);

    const startBtn = document.getElementById('mic-start-btn');
    const micStatus = document.getElementById('mic-status');
    const micLevel = document.getElementById('mic-level');

    startBtn.onclick = async () => {
        if (micStream) return;
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            startBtn.style.display = 'none';
            micStatus.textContent = 'Говорите в микрофон...';
            if (!audioCtx || audioCtx.state === 'closed') audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(micStream);
            source.connect(analyser);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const draw = () => {
                animationFrameId = requestAnimationFrame(draw);
                analyser.getByteFrequencyData(dataArray);
                micLevel.style.width = `${Math.min(dataArray.reduce((a, b) => a + b, 0) / dataArray.length * 2, 100)}%`;
            };
            draw();
        } catch (err) {
            micStatus.textContent = 'Ошибка: Доступ к микрофону запрещен.';
        }
    };
}

export function cleanup() {
    if (micStream) micStream.getTracks().forEach(track => track.stop());
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (audioCtx && audioCtx.state !== 'closed') audioCtx.close();
    micStream = animationFrameId = audioCtx = null;
}
