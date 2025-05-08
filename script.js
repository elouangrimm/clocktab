document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const mainDisplay = document.getElementById("main-display");
    // Dynamically create clock elements within main-display for better control
    mainDisplay.innerHTML = `
        <span class="clock-digits">
            <span id="clock-hours">00</span><span class="clock-separator main-sep">:</span><span id="clock-minutes">00</span><span class="clock-separator main-sep" id="clock-second-separator">:</span><span id="clock-seconds">00</span>
        </span>
        <span id="clock-ampm"></span>
        <input type="text" id="timer-input" placeholder="HH:MM:SS or MM:SS or SS" style="display: none;">
    `;
    const clockDigitsContainer = mainDisplay.querySelector(".clock-digits");
    const clockHoursEl = document.getElementById("clock-hours");
    const clockMinutesEl = document.getElementById("clock-minutes");
    const clockSecondsEl = document.getElementById("clock-seconds");
    const clockAmPmEl = document.getElementById("clock-ampm");
    const clockSeparators = document.querySelectorAll(
        ".clock-separator.main-sep"
    );
    const clockSecondSeparator = document.getElementById(
        "clock-second-separator"
    );

    const timerInputEl = document.getElementById("timer-input");
    const dateDisplayContainer = document.getElementById(
        "date-display-container"
    );
    const timerControlsContainer = document.getElementById(
        "timer-controls-container"
    );
    const timerStartPauseBtn = document.getElementById("timer-start-pause-btn");
    const timerResetBtn = document.getElementById("timer-reset-btn");

    const actionButtonsContainer = document.querySelector(".action-buttons");
    const modeSwitchBtn = document.getElementById("mode-switch-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");

    // Settings Elements
    const timeFormatSelect = document.getElementById("time-format-select");
    const fontSelect = document.getElementById("font-select");
    const fontSizeInput = document.getElementById("font-size-input");
    const primaryColorPicker = document.getElementById("primary-color-picker");
    const showSecondsCheckbox = document.getElementById(
        "show-seconds-checkbox"
    );
    const showDateCheckbox = document.getElementById("show-date-checkbox");
    const timerSoundSelect = document.getElementById("timer-sound-select");
    const resetSettingsBtn = document.getElementById("reset-settings-btn");

    // --- State Variables ---
    let appMode = "clock";
    let clockIntervalId = null;
    let timerIntervalId = null;
    let timerTotalSecondsSet = 0;
    let timerSecondsRemaining = 0;
    let currentTimerSound = new Audio();
    let originalDocTitle = "Minimal Clock";
    let mouseMoveTimeout;
    let mouseLeaveTimeout;

    const defaultSettings = {
        timeFormat: "12",
        clockFont: "'Roboto Mono', monospace",
        fontSize: "15",
        primaryHue: 210,
        showSecondsClock: true,
        showDate: false,
        timerSound: "sounds/alarm1.mp3",
        lastTimerInput: "05:00",
    };
    let currentSettings = { ...defaultSettings };

    // --- Utility Functions ---
    function formatTimeUnit(unit) {
        return unit < 10 ? `0${unit}` : String(unit);
    }

    function parseTimerInput(inputStr) {
        if (!inputStr || typeof inputStr !== "string") return 0;
        const parts = inputStr
            .split(":")
            .map((p) => parseInt(p.trim(), 10))
            .filter((p) => !isNaN(p));
        let totalSeconds = 0;
        if (parts.length === 1) {
            totalSeconds = parts[0];
        } else if (parts.length === 2) {
            totalSeconds = parts[0] * 60 + parts[1];
        } else if (parts.length === 3) {
            totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
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
        let r = 0,
            g = 0,
            b = 0;
        if (hex.length == 4) {
            r = parseInt(hex[1] + hex[1], 16);
            g = parseInt(hex[2] + hex[2], 16);
            b = parseInt(hex[3] + hex[3], 16);
        } else if (hex.length == 7) {
            r = parseInt(hex.substring(1, 3), 16);
            g = parseInt(hex.substring(3, 5), 16);
            b = parseInt(hex.substring(5, 7), 16);
        }
        r /= 255;
        g /= 255;
        b /= 255;
        let cmin = Math.min(r, g, b),
            cmax = Math.max(r, g, b),
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
        const s = 1,
            l = 0.5; // Full saturation, 50% lightness for a vibrant color
        const k = (n) => (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        const f = (n) =>
            l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? "0" + hex : hex;
        };
        return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
    }

    function displayTime(hours, minutes, seconds, ampm = "") {
        clockHoursEl.textContent = formatTimeUnit(hours);
        clockMinutesEl.textContent = formatTimeUnit(minutes);

        const showSeconds =
            (appMode === "clock" && currentSettings.showSecondsClock) ||
            (appMode.startsWith("timer") && appMode !== "timerSetup");

        clockSecondsEl.style.display = showSeconds ? "" : "none";
        clockSecondSeparator.style.display = showSeconds ? "" : "none";
        if (showSeconds) {
            clockSecondsEl.textContent = formatTimeUnit(seconds);
        }

        clockAmPmEl.textContent = ampm;
        clockAmPmEl.style.display = ampm && appMode === "clock" ? "" : "none";

        clockDigitsContainer.style.visibility = "visible";
        timerInputEl.style.display = "none"; // Ensure timer input is hidden when displaying time
    }

    // --- Clock Logic ---
    function updateClock() {
        if (appMode !== "clock") return;

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let ampm = "";

        if (currentSettings.timeFormat === "12") {
            ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12;
        }

        displayTime(hours, minutes, seconds, ampm);

        let title = `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}`;
        if (currentSettings.showSecondsClock)
            title += `:${formatTimeUnit(seconds)}`;
        if (ampm) title += ` ${ampm}`;
        document.title = title;
        originalDocTitle = title;

        if (currentSettings.showDate) {
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            dateDisplayContainer.textContent = now.toLocaleDateString(
                undefined,
                options
            );
        }
    }

    // --- Timer Logic ---
    function updateTimerDisplay() {
        const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
        displayTime(h, m, s);
        document.title = `(${formatTimeUnit(h)}:${formatTimeUnit(
            m
        )}:${formatTimeUnit(s)}) Timer`;
    }

    function startTimer() {
        const inputVal = timerInputEl.value.trim();
        timerTotalSecondsSet = parseTimerInput(inputVal);

        if (timerTotalSecondsSet <= 0) {
            alert("Please enter a valid timer duration (e.g., 5:00 or 30).");
            timerInputEl.focus();
            return;
        }

        currentSettings.lastTimerInput = inputVal;
        saveSettings();

        appMode = "timerRunning";
        timerSecondsRemaining = timerTotalSecondsSet;
        updateUIForAppMode();
        updateTimerDisplay();

        timerIntervalId = setInterval(() => {
            timerSecondsRemaining--;
            if (timerSecondsRemaining < 0) {
                finishTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function pauseTimer() {
        if (appMode !== "timerRunning") return;
        clearInterval(timerIntervalId);
        appMode = "timerPaused";
        updateUIForAppMode();
        document.title = `(Paused) ${originalDocTitle}`;
    }

    function resumeTimer() {
        if (appMode !== "timerPaused") return;
        appMode = "timerRunning";
        updateUIForAppMode();
        timerIntervalId = setInterval(() => {
            timerSecondsRemaining--;
            if (timerSecondsRemaining < 0) {
                finishTimer();
            } else {
                updateTimerDisplay();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerIntervalId);
        timerSecondsRemaining = parseTimerInput(currentSettings.lastTimerInput);

        appMode = "timerSetup";
        updateUIForAppMode();
        document.title = originalDocTitle;
        mainDisplay.classList.remove("timer-finished-blink");
    }

    function finishTimer() {
        clearInterval(timerIntervalId);
        appMode = "timerFinished";
        mainDisplay.classList.add("timer-finished-blink");
        displayTime(0, 0, 0);
        document.title = "Time's Up! - " + originalDocTitle;

        if (
            currentSettings.timerSound !== "none" &&
            currentSettings.timerSound
        ) {
            currentTimerSound.src = currentSettings.timerSound;
            currentTimerSound
                .play()
                .catch((e) => console.error("Error playing sound:", e));
        }
        updateUIForAppMode();
    }

    // --- UI Update Logic ---
    function updateUIForAppMode() {
        clockDigitsContainer.style.visibility = "hidden";
        timerInputEl.style.display = "none";
        timerControlsContainer.style.display = "none";
        mainDisplay.classList.remove("timer-finished-blink");
        dateDisplayContainer.style.display = "none";

        if (appMode === "clock") {
            modeSwitchBtn.innerHTML =
                '<i class="material-icons-outlined">timer</i>';
            modeSwitchBtn.title = "Switch to Timer";
            if (currentSettings.showDate) {
                dateDisplayContainer.style.display = "block";
            }
            clockDigitsContainer.style.visibility = "visible";
            updateClock();
            if (clockIntervalId === null) {
                clockIntervalId = setInterval(updateClock, 1000);
            }
        } else {
            clearInterval(clockIntervalId);
            clockIntervalId = null;
            modeSwitchBtn.innerHTML =
                '<i class="material-icons-outlined">watch_later</i>';
            modeSwitchBtn.title = "Switch to Clock";
            timerControlsContainer.style.display = "flex";

            if (appMode === "timerSetup") {
                clockDigitsContainer.style.visibility = "hidden";
                timerInputEl.style.display = "block";
                timerInputEl.value = currentSettings.lastTimerInput;
                timerInputEl.focus();
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
            } else if (appMode === "timerRunning") {
                clockDigitsContainer.style.visibility = "visible";
                updateTimerDisplay();
                timerStartPauseBtn.textContent = "Pause";
                timerStartPauseBtn.classList.add("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
            } else if (appMode === "timerPaused") {
                clockDigitsContainer.style.visibility = "visible";
                updateTimerDisplay();
                timerStartPauseBtn.textContent = "Resume";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
            } else if (appMode === "timerFinished") {
                clockDigitsContainer.style.visibility = "visible";
                displayTime(0, 0, 0);
                mainDisplay.classList.add("timer-finished-blink");
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.disabled = true;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
            }
        }
    }

    // --- Settings ---
    function applySettings() {
        document.documentElement.style.setProperty(
            "--clock-font-family",
            currentSettings.clockFont
        );
        document.documentElement.style.setProperty(
            "--clock-font-size",
            `${currentSettings.fontSize}vw`
        );
        document.documentElement.style.setProperty(
            "--m3-primary-hue",
            currentSettings.primaryHue
        );

        primaryColorPicker.value = hueToHex(currentSettings.primaryHue);

        if (appMode === "clock") {
            updateClock();
        } else if (appMode.startsWith("timer")) {
            if (appMode !== "timerSetup") {
                // Only update display if not in setup (where input is shown)
                updateTimerDisplay();
            }
        }
        updateUIForAppMode();
    }

    function saveSettings() {
        localStorage.setItem(
            "minimalClockSettings",
            JSON.stringify(currentSettings)
        );
    }

    function loadSettings() {
        const saved = localStorage.getItem("minimalClockSettings");
        if (saved) {
            currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
        } else {
            currentSettings = { ...defaultSettings };
        }

        timeFormatSelect.value = currentSettings.timeFormat;
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
        actionButtonsContainer.classList.remove("hidden");

        mouseMoveTimeout = setTimeout(() => {
            if (!settingsModal.classList.contains("show")) {
                actionButtonsContainer.classList.add("hidden");
            }
        }, 5000);
    }

    function hideActionButtonsSoon() {
        clearTimeout(mouseLeaveTimeout);
        mouseLeaveTimeout = setTimeout(() => {
            if (!settingsModal.classList.contains("show")) {
                actionButtonsContainer.classList.add("hidden");
            }
        }, 3000);
    }

    document.addEventListener("mousemove", (e) => {
        showActionButtons();
        const cornerRect = actionButtonsContainer.getBoundingClientRect();
        const isMouseInCorner =
            e.clientX >= cornerRect.left - 50 && // Give some buffer
            e.clientX <= cornerRect.right + 50 &&
            e.clientY >= cornerRect.top - 50 &&
            e.clientY <= cornerRect.bottom + 50;

        if (!isMouseInCorner) {
            hideActionButtonsSoon();
        } else {
            clearTimeout(mouseLeaveTimeout);
        }
    });
    actionButtonsContainer.addEventListener("mouseenter", () => {
        clearTimeout(mouseMoveTimeout);
        clearTimeout(mouseLeaveTimeout);
        actionButtonsContainer.classList.remove("hidden");
    });
    actionButtonsContainer.addEventListener("mouseleave", () => {
        if (!settingsModal.classList.contains("show")) {
            // Don't hide if settings are open and mouse just left buttons
            hideActionButtonsSoon();
        }
    });

    // --- Event Listeners ---
    modeSwitchBtn.addEventListener("click", () => {
        if (appMode === "clock") {
            appMode = "timerSetup";
        } else {
            resetTimer();
            appMode = "clock";
        }
        updateUIForAppMode();
    });

    timerStartPauseBtn.addEventListener("click", () => {
        if (appMode === "timerSetup") startTimer();
        else if (appMode === "timerRunning") pauseTimer();
        else if (appMode === "timerPaused") resumeTimer();
    });

    timerResetBtn.addEventListener("click", () => {
        resetTimer();
        if (appMode === "timerSetup") timerInputEl.focus();
    });

    timerInputEl.addEventListener("keydown", (e) => {
        if (
            e.key === "Enter" &&
            (appMode === "timerSetup" || appMode === "timerFinished")
        ) {
            startTimer();
        }
    });

    settingsBtn.addEventListener("click", () => {
        settingsModal.classList.add("show");
        clearTimeout(mouseMoveTimeout);
        clearTimeout(mouseLeaveTimeout);
        actionButtonsContainer.classList.remove("hidden");
    });
    closeSettingsBtn.addEventListener("click", () => {
        settingsModal.classList.remove("show");
        showActionButtons();
    });
    window.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
            settingsModal.classList.remove("show");
            showActionButtons();
        }
    });

    // Settings Event Listeners
    timeFormatSelect.addEventListener("change", (e) => {
        currentSettings.timeFormat = e.target.value;
        applySettings();
        saveSettings();
    });
    fontSelect.addEventListener("change", (e) => {
        currentSettings.clockFont = e.target.value;
        applySettings();
        saveSettings();
    });
    fontSizeInput.addEventListener("input", (e) => {
        currentSettings.fontSize = e.target.value;
        applySettings();
        saveSettings();
    });

    primaryColorPicker.addEventListener("input", (e) => {
        currentSettings.primaryHue = hexToHue(e.target.value);
        applySettings();
        saveSettings();
    });

    showSecondsCheckbox.addEventListener("change", (e) => {
        currentSettings.showSecondsClock = e.target.checked;
        applySettings();
        saveSettings();
    });
    showDateCheckbox.addEventListener("change", (e) => {
        currentSettings.showDate = e.target.checked;
        applySettings();
        saveSettings();
    });
    timerSoundSelect.addEventListener("change", (e) => {
        currentSettings.timerSound = e.target.value;
        saveSettings();
    });

    resetSettingsBtn.addEventListener("click", () => {
        if (
            confirm(
                "Are you sure you want to reset all settings to their defaults?"
            )
        ) {
            localStorage.removeItem("minimalClockSettings");
            loadSettings();
            if (appMode.startsWith("timer")) {
                resetTimer();
            }
            updateUIForAppMode();
        }
    });

    // Fullscreen
    fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
            document.documentElement
                .requestFullscreen()
                .then(
                    () =>
                        (fullscreenBtn.innerHTML =
                            '<i class="material-icons-outlined">fullscreen_exit</i>')
                )
                .catch((err) =>
                    console.error(`Error fullscreen: ${err.message}`)
                );
        } else {
            document
                .exitFullscreen()
                .then(
                    () =>
                        (fullscreenBtn.innerHTML =
                            '<i class="material-icons-outlined">fullscreen</i>')
                );
        }
    });
    document.addEventListener("fullscreenchange", () => {
        fullscreenBtn.innerHTML = document.fullscreenElement
            ? '<i class="material-icons-outlined">fullscreen_exit</i>'
            : '<i class="material-icons-outlined">fullscreen</i>';
    });

    // --- Initialisation ---
    loadSettings();
    updateUIForAppMode();
    showActionButtons();
});
