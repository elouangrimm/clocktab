document.addEventListener('DOMContentLoaded', () => {
    // --- Translation Data ---
    const translations = {
        "en": {
            "appName": "ClockTab",
            "tabTitleSuffix": " - ClockTab",
            "timerTabTitlePrefix": "Timer",
            "pausedTabTitlePrefix": "(Paused)",
            "timesUpTabTitle": "Time's Up!",
            "action.switchToTimer": "Switch to Timer",
            "action.switchToClock": "Switch to Clock",
            "action.settings": "Settings",
            "action.fullscreen": "Toggle Fullscreen",
            "settings.title": "Settings",
            "settings.language": "Language:",
            "settings.timeFormat": "Time Format:",
            "settings.timeFormat12": "12-Hour",
            "settings.timeFormat24": "24-Hour",
            "settings.clockFont": "Clock Font:",
            "settings.fontSize": "Clock Font Size (vw):",
            "settings.primaryColor": "Primary Color:",
            "settings.showSeconds": "Show Seconds (Clock):",
            "settings.showDate": "Show Date:",
            "settings.timerSound": "Timer Sound:",
            "settings.soundPixel": "Pixel",
            "settings.soundStarJump": "Star Jump",
            "settings.soundTinsel": "Tinsel",
            "settings.soundNone": "None",
            "settings.resetDefaults": "Reset to Defaults",
            "timer.start": "Start",
            "timer.pause": "Pause",
            "timer.resume": "Resume",
            "timer.reset": "Reset",
            "timer.inputPlaceholder": "HH:MM:SS or MM:SS or SS",
            "alert.invalidDuration": "Please enter a valid timer duration (e.g., 5:00 or 30).",
            "confirm.resetSettings": "Are you sure you want to reset all settings to their defaults?"
        },
        "fr": { // French Translations
            "appName": "ClockTab", // Or "Onglet Horloge"
            "tabTitleSuffix": " - ClockTab",
            "timerTabTitlePrefix": "Minuteur",
            "pausedTabTitlePrefix": "(En Pause)",
            "timesUpTabTitle": "Temps Écoulé !",
            "action.switchToTimer": "Passer au Minuteur",
            "action.switchToClock": "Passer à l'Horloge",
            "action.settings": "Paramètres",
            "action.fullscreen": "Plein Écran",
            "settings.title": "Paramètres",
            "settings.language": "Langue :",
            "settings.timeFormat": "Format de l'Heure :",
            "settings.timeFormat12": "12 Heures",
            "settings.timeFormat24": "24 Heures",
            "settings.clockFont": "Police de l'Horloge :",
            "settings.fontSize": "Taille du Texte (vw) :",
            "settings.primaryColor": "Couleur Principale :",
            "settings.showSeconds": "Afficher Secondes (Horloge) :",
            "settings.showDate": "Afficher Date :",
            "settings.timerSound": "Son du Minuteur :",
            "settings.soundPixel": "Pixel", // Keep as is or translate if desired
            "settings.soundStarJump": "StarJump",
            "settings.soundTinsel": "Tinsel",
            "settings.soundNone": "Aucun",
            "settings.resetDefaults": "Réinitialiser les Paramètres",
            "timer.start": "Démarrer",
            "timer.pause": "Pause",
            "timer.resume": "Reprendre",
            "timer.reset": "Réinitialiser",
            "timer.inputPlaceholder": "HH:MM:SS ou MM:SS ou SS",
            "alert.invalidDuration": "Veuillez entrer une durée valide (ex : 5:00 ou 30).",
            "confirm.resetSettings": "Êtes-vous sûr de vouloir réinitialiser tous les paramètres par défaut ?"
        },
        "es": { 
            "appName": "ClockTab", 
            "tabTitleSuffix": " - ClockTab",
            "timerTabTitlePrefix": "Temporizador",
            "pausedTabTitlePrefix": "(Pausado)",
            "timesUpTabTitle": "¡Tiempo Terminado!",
            "action.switchToTimer": "Cambiar a Temporizador",
            "action.switchToClock": "Cambiar a Reloj",
            "action.settings": "Ajustes",
            "action.fullscreen": "Pantalla Completa",
            "settings.title": "Ajustes",
            "settings.language": "Idioma:",
            "settings.timeFormat": "Formato de Hora:",
            "settings.timeFormat12": "12 Horas",
            "settings.timeFormat24": "24 Horas",
            "settings.clockFont": "Fuente del Reloj:",
            "settings.fontSize": "Tamaño de Fuente (vw):",
            "settings.primaryColor": "Color Primario:",
            "settings.showSeconds": "Mostrar Segundos (Reloj):",
            "settings.showDate": "Mostrar Fecha:",
            "settings.timerSound": "Sonido del Temporizador:",
            "settings.soundPixel": "Pixel", // Keep English or translate if you have Spanish names
            "settings.soundStarJump": "Star Jump",
            "settings.soundTinsel": "Tinsel",
            "settings.soundNone": "Ninguno",
            "settings.resetDefaults": "Restablecer Predeterminados",
            "timer.start": "Iniciar",
            "timer.pause": "Pausar",
            "timer.resume": "Reanudar",
            "timer.reset": "Reiniciar",
            "timer.inputPlaceholder": "HH:MM:SS o MM:SS o SS",
            "alert.invalidDuration": "Por favor, ingrese una duración válida para el temporizador (ej. 5:00 o 30).",
            "confirm.resetSettings": "¿Está seguro de que desea restablecer todas las configuraciones a sus valores predeterminados?"
        }
    };

    // --- DOM Elements ---
    const htmlEl = document.documentElement;
    const body = document.body; 
    const mainDisplay = document.getElementById('main-display');
    // Dynamically insert clock/timer structure into #main-display
    mainDisplay.innerHTML = `
        <span class="clock-digits">
            <span id="clock-hours">00</span><span class="clock-separator main-sep">:</span><span id="clock-minutes">00</span><span class="clock-separator main-sep" id="clock-second-separator">:</span><span id="clock-seconds">00</span>
        </span>
        <span id="clock-ampm"></span>
        <input type="text" id="timer-input" style="display: none;">
    `; 
    const clockDigitsContainer = mainDisplay.querySelector('.clock-digits');
    const clockHoursEl = document.getElementById('clock-hours');
    const clockMinutesEl = document.getElementById('clock-minutes');
    const clockSecondsEl = document.getElementById('clock-seconds');
    const clockAmPmEl = document.getElementById('clock-ampm');
    const clockSecondSeparator = document.getElementById('clock-second-separator');
    
    const timerInputEl = document.getElementById('timer-input');
    const dateDisplayContainer = document.getElementById('date-display-container');
    const timerControlsContainer = document.getElementById('timer-controls-container');
    const timerStartPauseBtn = document.getElementById('timer-start-pause-btn');
    const timerResetBtn = document.getElementById('timer-reset-btn');

    const actionButtonsContainer = document.querySelector('.action-buttons');
    const modeSwitchBtn = document.getElementById('mode-switch-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsBtn = document.getElementById('close-settings-btn');

    // Settings Elements
    const languageSelect = document.getElementById('language-select'); 
    const timeFormatSwitch = document.getElementById('time-format-switch');
    const fontSelect = document.getElementById('font-select');
    const fontSizeInput = document.getElementById('font-size-input');
    const primaryColorPicker = document.getElementById('primary-color-picker');
    const showSecondsCheckbox = document.getElementById('show-seconds-checkbox');
    const showDateCheckbox = document.getElementById('show-date-checkbox');
    const timerSoundSelect = document.getElementById('timer-sound-select');
    const resetSettingsBtn = document.getElementById('reset-settings-btn');

    let timerProgressBar; 
    function createTimerProgressBar() {
        if (!document.getElementById('timer-progress-bar')) {
            timerProgressBar = document.createElement('div');
            timerProgressBar.id = 'timer-progress-bar';
            body.appendChild(timerProgressBar);
        } else {
            timerProgressBar = document.getElementById('timer-progress-bar');
        }
    }
    createTimerProgressBar();

    // --- State Variables ---
    let appMode = 'clock'; 
    let clockIntervalId = null;
    let timerIntervalId = null; 
    let timerAnimationFrameId = null; 
    let timerStartTime = 0; 
    let timerTotalSecondsSetAtStart = 0; 
    let timerSecondsRemaining = 0; 
    let timeElapsedBeforePause = 0; 

    let currentTimerSound = new Audio();
    let originalDocTitle = "ClockTab";

    let mouseMoveTimeout;
    let mouseLeaveTimeout;

    // --- Default Settings ---
    function getBrowserLanguage() {
        const lang = navigator.language || navigator.userLanguage; 
        if (lang) {
            const baseLang = lang.split('-')[0]; 
            if (translations[baseLang]) { 
                return baseLang;
            }
        }
        return 'en'; 
    }

    const defaultSettings = {
        language: getBrowserLanguage(), 
        timeFormat: '12', 
        clockFont: "'Roboto Mono', monospace",
        fontSize: '15',
        primaryHue: 210, 
        showSecondsClock: true,
        showDate: false,
        timerSound: 'sounds/Pixel.mp3', // Default to your first sound
        lastTimerInput: '05:00'
    };
    let currentSettings = { ...defaultSettings };


    // --- Translation Function ---
    function translate(key, replacements = {}) {
        const lang = currentSettings.language;
        let text = translations[lang] && translations[lang][key] 
                   ? translations[lang][key] 
                   : (translations['en'] && translations['en'][key] ? translations['en'][key] : key); 

        for (const placeholder in replacements) {
            text = text.replace(`{${placeholder}}`, replacements[placeholder]);
        }
        return text;
    }

    function applyStaticTranslations() {
        htmlEl.lang = currentSettings.language; 
        document.title = translate("appName"); 
        originalDocTitle = translate("appName");


        document.querySelectorAll('[data-translate-key]').forEach(el => {
            const key = el.dataset.translateKey;
            if (el.tagName === 'INPUT' && el.type === 'submit' || el.tagName === 'BUTTON') {
                el.value = translate(key); // For button values
            } else {
                el.textContent = translate(key);
            }
        });
        document.querySelectorAll('[data-translate-title-key]').forEach(el => {
            const key = el.dataset.translateTitleKey;
            el.title = translate(key);
        });
        timerInputEl.placeholder = translate("timer.inputPlaceholder");
    }


    // --- Utility Functions ---
    function formatTimeUnit(unit) {
        return unit < 10 ? `0${unit}` : String(unit);
    }

    function parseTimerInput(inputStr) {
        if (!inputStr || typeof inputStr !== 'string') return 0;
        const parts = inputStr.split(':').map(p => parseInt(p.trim(), 10)).filter(p => !isNaN(p)); 
        let totalSeconds = 0;
        if (parts.length === 1) { 
            totalSeconds = parts[0];
        } else if (parts.length === 2) { 
            totalSeconds = (parts[0] * 60) + parts[1];
        } else if (parts.length === 3) { 
            totalSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }
        return Math.max(0, totalSeconds);
    }

    function formatSecondsToHMS(totalSeconds) {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return { h, m, s };
    }

    function hexToHue(hex) {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        r /= 255; g /= 255; b /= 255;
        let cmin = Math.min(r,g,b),
            cmax = Math.max(r,g,b),
            delta = cmax - cmin,
            h = 0;

        if (delta == 0) h = 0;
        else if (cmax == r) h = ((g - b) / delta) % 6;
        else if (cmax == g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;

        h = Math.round(h * 60);
        if (h < 0) h += 360;
        return h;
    }

    function hueToHex(h) { 
        const s = 1, l = 0.5;
        const k = n => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = n =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const toHex = x => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    }
    
    function displayTime(hours, minutes, seconds, ampm = '') {
        clockHoursEl.textContent = formatTimeUnit(hours);
        clockMinutesEl.textContent = formatTimeUnit(minutes);
        
        const showSeconds = (appMode === 'clock' && currentSettings.showSecondsClock) || 
                            (appMode.startsWith('timer') && appMode !== 'timerSetup');
        
        clockSecondsEl.style.display = showSeconds ? '' : 'none';
        clockSecondSeparator.style.display = showSeconds ? '' : 'none';
        if (showSeconds) {
            clockSecondsEl.textContent = formatTimeUnit(seconds);
        }

        const showAmPm = appMode === 'clock' && currentSettings.timeFormat === '12' && ampm;
        clockAmPmEl.textContent = showAmPm ? ampm : '';
        clockAmPmEl.style.display = showAmPm ? '' : 'none';
    }

    // --- Clock Logic ---
    function updateClock() {
        if (appMode !== 'clock') return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let ampm = '';

        if (currentSettings.timeFormat === '12') { 
            ampm = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12;
            hours = hours ? hours : 12;
        }

        displayTime(hours, minutes, seconds, ampm);
        
        let titleTime = `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}`;
        if (currentSettings.showSecondsClock) titleTime += `:${formatTimeUnit(seconds)}`;
        if (ampm && currentSettings.timeFormat === '12') titleTime += ` ${ampm}`;
        
        document.title = titleTime + translate("tabTitleSuffix"); 
        originalDocTitle = titleTime + translate("tabTitleSuffix"); 

        if (currentSettings.showDate) { 
            const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            try {
                dateDisplayContainer.textContent = now.toLocaleDateString(currentSettings.language, dateOptions);
            } catch (e) { 
                dateDisplayContainer.textContent = now.toLocaleDateString(undefined, dateOptions);
                console.warn(`toLocaleDateString does not support language tag: ${currentSettings.language}. Using browser default.`);
            }
        }
    }

    // --- Timer Logic ---
    function smoothTimerUpdate() {
        if (appMode !== 'timerRunning') {
            cancelAnimationFrame(timerAnimationFrameId);
            return;
        }

        const currentTime = Date.now();
        const elapsedTimeSinceStartOrResume = (currentTime - timerStartTime) / 1000; 
        const totalElapsedTime = timeElapsedBeforePause + elapsedTimeSinceStartOrResume;
        
        let currentSecondsRemainingVisual = timerTotalSecondsSetAtStart - totalElapsedTime;
        
        if (currentSecondsRemainingVisual < 0) currentSecondsRemainingVisual = 0;

        if (timerTotalSecondsSetAtStart > 0 && timerProgressBar) {
            const progressPercentage = (totalElapsedTime / timerTotalSecondsSetAtStart) * 100;
            timerProgressBar.style.width = `${Math.min(100, progressPercentage)}%`;
        }
        
        timerAnimationFrameId = requestAnimationFrame(smoothTimerUpdate);
    }


    function timerTick() { 
        timerSecondsRemaining--; 
        
        const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
        displayTime(h, m, s); 
        document.title = `(${formatTimeUnit(h)}:${formatTimeUnit(m)}:${formatTimeUnit(s)}) ${translate("timerTabTitlePrefix")}${translate("tabTitleSuffix")}`;

        if (timerSecondsRemaining < 0) {
            finishTimer();
        }
    }


    function startTimer() {
        const inputVal = timerInputEl.value.trim();
        timerTotalSecondsSetAtStart = parseTimerInput(inputVal); 

        if (timerTotalSecondsSetAtStart <= 0) {
            alert(translate("alert.invalidDuration"));
            timerInputEl.focus();
            return;
        }
        
        currentSettings.lastTimerInput = inputVal;
        saveSettings();

        appMode = 'timerRunning';
        timerSecondsRemaining = timerTotalSecondsSetAtStart;
        timerStartTime = Date.now(); 
        timeElapsedBeforePause = 0;   

        body.classList.add('timer-active'); 
        updateUIForAppMode(); 
        
        const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
        displayTime(h, m, s); 
        document.title = `(${formatTimeUnit(h)}:${formatTimeUnit(m)}:${formatTimeUnit(s)}) ${translate("timerTabTitlePrefix")}${translate("tabTitleSuffix")}`;
        if (timerProgressBar) timerProgressBar.style.width = '0%'; 

        clearInterval(timerIntervalId); 
        timerIntervalId = setInterval(timerTick, 1000);
        
        cancelAnimationFrame(timerAnimationFrameId); 
        timerAnimationFrameId = requestAnimationFrame(smoothTimerUpdate);
    }

    function pauseTimer() {
        if (appMode !== 'timerRunning') return;
        
        clearInterval(timerIntervalId); 
        cancelAnimationFrame(timerAnimationFrameId); 
        
        const currentTime = Date.now();
        const elapsedTimeThisSession = (currentTime - timerStartTime) / 1000;
        timeElapsedBeforePause += elapsedTimeThisSession; 

        appMode = 'timerPaused';
        updateUIForAppMode();
        document.title = `${translate("pausedTabTitlePrefix")} ${originalDocTitle.replace(translate("tabTitleSuffix"), '')}${translate("tabTitleSuffix")}`;
    }

    function resumeTimer() {
        if (appMode !== 'timerPaused') return;
        
        appMode = 'timerRunning';
        timerStartTime = Date.now(); 

        body.classList.add('timer-active'); 
        updateUIForAppMode(); 
        
        clearInterval(timerIntervalId);
        timerIntervalId = setInterval(timerTick, 1000);

        cancelAnimationFrame(timerAnimationFrameId);
        timerAnimationFrameId = requestAnimationFrame(smoothTimerUpdate);
    }
    
    function resetTimer() {
        clearInterval(timerIntervalId);
        cancelAnimationFrame(timerAnimationFrameId);

        if (currentTimerSound && !currentTimerSound.paused) {
            currentTimerSound.pause();
            currentTimerSound.currentTime = 0;
        }

        timerSecondsRemaining = parseTimerInput(currentSettings.lastTimerInput);
        timerTotalSecondsSetAtStart = 0; 
        timeElapsedBeforePause = 0;
        if (timerProgressBar) timerProgressBar.style.width = '0%'; 
        body.classList.remove('timer-active'); 
        
        appMode = 'timerSetup'; 
        updateUIForAppMode(); 
        document.title = originalDocTitle; 
        mainDisplay.classList.remove('timer-finished-blink');
    }

    function finishTimer() {
        clearInterval(timerIntervalId);
        cancelAnimationFrame(timerAnimationFrameId);
        appMode = 'timerFinished';
        if (timerProgressBar) timerProgressBar.style.width = '100%'; 
        
        updateUIForAppMode(); 
        mainDisplay.classList.add('timer-finished-blink');
        document.title = `${translate("timesUpTabTitle")}${translate("tabTitleSuffix")}`;
        
        if (currentSettings.timerSound !== 'none' && currentSettings.timerSound) {
            currentTimerSound.src = currentSettings.timerSound; 
            currentTimerSound.play().catch(e => console.error("Error playing sound:", e));
        }
        setTimeout(() => {
            if (appMode === 'timerFinished') { 
                body.classList.remove('timer-active');
                if (timerProgressBar) timerProgressBar.style.width = '0%';
            }
        }, 3000); 
    }

    // --- UI Update Logic ---
    function updateUIForAppMode() {
        timerInputEl.style.display = 'none'; 
        clockDigitsContainer.style.visibility = 'hidden'; 
        timerControlsContainer.style.display = 'none';
        mainDisplay.classList.remove('timer-finished-blink');
        dateDisplayContainer.style.display = 'none';
        
        if (timerProgressBar) {
             timerProgressBar.style.transition = (appMode === 'timerRunning' || appMode === 'timerPaused') ? 'width 0.1s linear' : 'none';
        }

        timerStartPauseBtn.setAttribute('data-translate-key', 'timer.start'); 
        modeSwitchBtn.setAttribute('data-translate-title-key', 'action.switchToTimer');


        if (appMode === 'clock') {
            modeSwitchBtn.setAttribute('data-translate-title-key', 'action.switchToTimer');
            if (currentSettings.showDate) {
                dateDisplayContainer.style.display = 'block';
            }
            clockDigitsContainer.style.visibility = 'visible'; 
            updateClock(); 
            if (clockIntervalId === null) {
                clockIntervalId = setInterval(updateClock, 1000);
            }
            body.classList.remove('timer-active'); 
            if (timerProgressBar) timerProgressBar.style.width = '0%';
        } else { 
            clearInterval(clockIntervalId);
            clockIntervalId = null;
            modeSwitchBtn.setAttribute('data-translate-title-key', 'action.switchToClock');
            timerControlsContainer.style.display = 'flex';
            clockAmPmEl.style.display = 'none'; 

            if (appMode === 'timerSetup') {
                clockDigitsContainer.style.visibility = 'hidden'; 
                timerInputEl.style.display = 'block'; 
                timerInputEl.value = currentSettings.lastTimerInput;
                timerInputEl.focus(); 
                timerStartPauseBtn.setAttribute('data-translate-key', 'timer.start');
                timerStartPauseBtn.classList.remove('running');
                timerStartPauseBtn.disabled = false;
                timerResetBtn.setAttribute('data-translate-key', 'timer.reset');
                timerResetBtn.disabled = false; 
                body.classList.remove('timer-active');
                if (timerProgressBar) timerProgressBar.style.width = '0%';
            } else if (appMode === 'timerRunning') {
                clockDigitsContainer.style.visibility = 'visible'; 
                timerStartPauseBtn.setAttribute('data-translate-key', 'timer.pause');
                timerStartPauseBtn.classList.add('running');
                timerStartPauseBtn.disabled = false;
                timerResetBtn.setAttribute('data-translate-key', 'timer.reset');
                timerResetBtn.disabled = false;
                body.classList.add('timer-active');
            } else if (appMode === 'timerPaused') {
                clockDigitsContainer.style.visibility = 'visible'; 
                timerStartPauseBtn.setAttribute('data-translate-key', 'timer.resume');
                timerStartPauseBtn.classList.remove('running');
                timerStartPauseBtn.disabled = false;
                timerResetBtn.setAttribute('data-translate-key', 'timer.reset');
                timerResetBtn.disabled = false;
                body.classList.add('timer-active'); 
            } else if (appMode === 'timerFinished') {
                clockDigitsContainer.style.visibility = 'visible'; 
                displayTime(0,0,0); 
                mainDisplay.classList.add('timer-finished-blink');
                timerStartPauseBtn.setAttribute('data-translate-key', 'timer.start'); 
                timerStartPauseBtn.disabled = true; 
                timerResetBtn.setAttribute('data-translate-key', 'timer.reset');
                timerResetBtn.disabled = false;
                body.classList.add('timer-active'); 
            }
        }
        applyTranslationsToDynamicElements();
    }

    function applyTranslationsToDynamicElements() {
        if (timerStartPauseBtn.dataset.translateKey) {
            timerStartPauseBtn.textContent = translate(timerStartPauseBtn.dataset.translateKey);
        }
        if (timerResetBtn.dataset.translateKey) {
            timerResetBtn.textContent = translate(timerResetBtn.dataset.translateKey);
        }
        if (modeSwitchBtn.dataset.translateTitleKey) {
            modeSwitchBtn.title = translate(modeSwitchBtn.dataset.translateTitleKey);
        }
        timerInputEl.placeholder = translate("timer.inputPlaceholder");
    }


    // --- Settings ---
    function applySettings() {
        document.documentElement.style.setProperty('--clock-font-family', currentSettings.clockFont);
        document.documentElement.style.setProperty('--clock-font-size', `${currentSettings.fontSize}vw`);
        document.documentElement.style.setProperty('--m3-primary-hue', currentSettings.primaryHue);
        
        const newProgressBarColor = `hsl(${currentSettings.primaryHue}, 15%, 15%)`;
        document.documentElement.style.setProperty('--m3-progress-bar-color', newProgressBarColor);

        primaryColorPicker.value = hueToHex(currentSettings.primaryHue);
        
        applyStaticTranslations(); 
        updateUIForAppMode(); 
    }

    function saveSettings() {
        localStorage.setItem('clockTabSettings', JSON.stringify(currentSettings));
    }

    function loadSettings() {
        const savedSettings = localStorage.getItem('clockTabSettings');
        let userPreferredLanguageDetected = false;

        if (savedSettings) {
            const loaded = JSON.parse(savedSettings);
            currentSettings = { ...defaultSettings, ...loaded }; // Start with defaults, then overwrite with loaded
            if (loaded.language && translations[loaded.language]) {
                currentSettings.language = loaded.language; // Respect saved language if valid
                userPreferredLanguageDetected = true; 
            }
        }
        
        if (!userPreferredLanguageDetected) { // If no valid language was saved, detect from browser
             currentSettings.language = getBrowserLanguage();
        }
        
        languageSelect.value = currentSettings.language; 
        timeFormatSwitch.checked = currentSettings.timeFormat === '24'; 
        fontSelect.value = currentSettings.clockFont;
        fontSizeInput.value = currentSettings.fontSize;
        showSecondsCheckbox.checked = currentSettings.showSecondsClock;
        showDateCheckbox.checked = currentSettings.showDate;
        timerSoundSelect.value = currentSettings.timerSound;

        applySettings(); 
    }

    // --- Action Button Fading Logic ---
    function showActionButtons() {
        clearTimeout(mouseMoveTimeout);
        clearTimeout(mouseLeaveTimeout);
        actionButtonsContainer.classList.remove('hidden');

        mouseMoveTimeout = setTimeout(() => {
            if (!settingsModal.classList.contains('show')) {
                 actionButtonsContainer.classList.add('hidden');
            }
        }, 5000);
    }

    function hideActionButtonsSoon() {
       clearTimeout(mouseLeaveTimeout);
       mouseLeaveTimeout = setTimeout(() => {
            if (!settingsModal.classList.contains('show') && !actionButtonsContainer.matches(':hover')) { 
                actionButtonsContainer.classList.add('hidden');
            }
       }, 3000); 
    }
    
    document.addEventListener('mousemove', (e) => {
        showActionButtons();
        const cornerRect = actionButtonsContainer.getBoundingClientRect();
        const isMouseInCornerArea = e.clientX >= window.innerWidth - (cornerRect.width + 70) && e.clientY <= (cornerRect.height + 70);

        if (!isMouseInCornerArea && !actionButtonsContainer.matches(':hover')) {
             hideActionButtonsSoon();
        } else {
            clearTimeout(mouseLeaveTimeout); 
        }
    });
    actionButtonsContainer.addEventListener('mouseenter', () => {
        clearTimeout(mouseMoveTimeout);
        clearTimeout(mouseLeaveTimeout);
        actionButtonsContainer.classList.remove('hidden');
    });
    actionButtonsContainer.addEventListener('mouseleave', () => {
        if (!settingsModal.classList.contains('show')) {
            hideActionButtonsSoon();
        }
    });

    // --- Event Listeners ---
    modeSwitchBtn.addEventListener('click', () => {
        if (appMode === 'clock') {
            appMode = 'timerSetup';
        } else { 
            resetTimer(); 
            appMode = 'clock'; 
        }
        updateUIForAppMode();
    });

    timerStartPauseBtn.addEventListener('click', () => {
        if (appMode === 'timerSetup') startTimer();
        else if (appMode === 'timerRunning') pauseTimer();
        else if (appMode === 'timerPaused') resumeTimer();
    });

    timerResetBtn.addEventListener('click', () => {
        resetTimer(); 
        if (appMode === 'timerSetup') timerInputEl.focus(); 
    });
        
    timerInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            if (appMode === 'timerSetup') {
                startTimer();
            } else if (appMode === 'timerFinished') {
                resetTimer(); 
            }
        }
    });


    settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('show');
        clearTimeout(mouseMoveTimeout); 
        clearTimeout(mouseLeaveTimeout);
        actionButtonsContainer.classList.remove('hidden');
    });
    closeSettingsBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
        showActionButtons(); 
    });
    window.addEventListener('click', (event) => {
        if (event.target === settingsModal) {
            settingsModal.classList.remove('show');
            showActionButtons(); 
        }
    });
    
    languageSelect.addEventListener('change', (e) => { 
        currentSettings.language = e.target.value;
        applySettings(); 
        saveSettings();
    });

    timeFormatSwitch.addEventListener('change', (e) => { 
        currentSettings.timeFormat = e.target.checked ? '24' : '12'; 
        applySettings(); 
        saveSettings(); 
    });
    fontSelect.addEventListener('change', (e) => { currentSettings.clockFont = e.target.value; applySettings(); saveSettings(); });
    fontSizeInput.addEventListener('input', (e) => { currentSettings.fontSize = e.target.value; applySettings(); saveSettings(); });
    
    primaryColorPicker.addEventListener('input', (e) => { 
        currentSettings.primaryHue = hexToHue(e.target.value);
        applySettings(); 
        saveSettings(); 
    });

    showSecondsCheckbox.addEventListener('change', (e) => { currentSettings.showSecondsClock = e.target.checked; applySettings(); saveSettings(); });
    showDateCheckbox.addEventListener('change', (e) => { currentSettings.showDate = e.target.checked; applySettings(); saveSettings(); });
    timerSoundSelect.addEventListener('change', (e) => { currentSettings.timerSound = e.target.value; saveSettings(); });
    
    resetSettingsBtn.addEventListener('click', () => {
        if (confirm(translate("confirm.resetSettings"))) { 
            localStorage.removeItem('clockTabSettings'); 
            currentSettings = { ...defaultSettings, language: getBrowserLanguage() }; 
            loadSettings(); 
            if (appMode.startsWith('timer')) { 
                resetTimer(); 
            }
        }
    });

    fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => fullscreenBtn.innerHTML = '<i class="material-icons-outlined">fullscreen_exit</i>')
                .catch(err => console.error(`Error fullscreen: ${err.message}`));
        } else {
            document.exitFullscreen()
                .then(() => fullscreenBtn.innerHTML = '<i class="material-icons-outlined">fullscreen</i>');
        }
    });
    document.addEventListener('fullscreenchange', () => {
        fullscreenBtn.innerHTML = document.fullscreenElement ? 
            '<i class="material-icons-outlined">fullscreen_exit</i>' : 
            '<i class="material-icons-outlined">fullscreen</i>';
    });

    // --- Initialisation ---
    loadSettings(); 
    updateUIForAppMode(); 
    showActionButtons(); 
});