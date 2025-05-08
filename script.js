document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const mainDisplay = document.getElementById("main-display");
    const clockHoursEl = document.getElementById("clock-hours");
    const clockMinutesEl = document.getElementById("clock-minutes");
    const clockSecondsEl = document.getElementById("clock-seconds");
    const clockAmPmEl = document.getElementById("clock-ampm");
    const clockSeparators = document.querySelectorAll(".clock-separator");
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

    const modeSwitchBtn = document.getElementById("mode-switch-btn");
    const settingsBtn = document.getElementById("settings-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");

    // Settings Elements
    const timeFormatSelect = document.getElementById("time-format-select");
    const fontSelect = document.getElementById("font-select");
    const fontSizeInput = document.getElementById("font-size-input");
    const primaryHueInput = document.getElementById("bg-color-input-m3"); // Updated ID
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

    const defaultSettings = {
        timeFormat: "24",
        clockFont: "'Roboto Mono', monospace",
        fontSize: "15",
        primaryHue: 210, // Default M3 Hue
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
            .filter((p) => !isNaN(p)); // Filter out NaN parts
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

    function displayTime(hours, minutes, seconds, ampm = "") {
        clockHoursEl.textContent = formatTimeUnit(hours);
        clockMinutesEl.textContent = formatTimeUnit(minutes);

        const showSeconds =
            (appMode === "clock" && currentSettings.showSecondsClock) ||
            appMode.startsWith("timer");

        clockSecondsEl.style.display = showSeconds ? "" : "none";
        clockSecondSeparator.style.display = showSeconds ? "" : "none";
        if (showSeconds) {
            clockSecondsEl.textContent = formatTimeUnit(seconds);
        }

        clockAmPmEl.textContent = ampm;
        clockAmPmEl.style.display = ampm && appMode === "clock" ? "" : "none"; // AM/PM only for clock

        clockHoursEl.style.display = "";
        clockMinutesEl.style.display = "";
        clockSeparators.forEach((sep) => (sep.style.display = ""));
        if (!showSeconds) {
            // Re-evaluate second separator if seconds are hidden
            clockSecondSeparator.style.display = "none";
        }
        timerInputEl.style.display = "none";
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
            // Date is handled by updateUIForAppMode now
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
        timerSecondsRemaining = timerTotalSecondsSet; // Reset to originally set time for quick restart
        if (appMode === "timerSetup" || appMode === "timerFinished") {
            // Or clear if in setup/finished
            timerInputEl.value = currentSettings.lastTimerInput;
            timerSecondsRemaining = parseTimerInput(
                currentSettings.lastTimerInput
            );
        }

        appMode = "timerSetup"; // Always go to setup on reset, prefill with last valid
        updateUIForAppMode();
        document.title = originalDocTitle;
        mainDisplay.classList.remove("timer-finished-blink");
        if (appMode === "timerSetup") {
            const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
            //displayTime(h, m, s); // Display the prefilled time
        }
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
        updateUIForAppMode(); // This will update buttons
    }

    // --- UI Update Logic ---
    function updateUIForAppMode() {
        clockHoursEl.style.display = "none";
        clockMinutesEl.style.display = "none";
        clockSecondsEl.style.display = "none";
        clockAmPmEl.style.display = "none";
        clockSeparators.forEach((sep) => (sep.style.display = "none"));
        timerInputEl.style.display = "none";
        timerControlsContainer.style.display = "none";
        mainDisplay.classList.remove("timer-finished-blink");
        dateDisplayContainer.style.display = "none"; // Hide date by default

        if (appMode === "clock") {
            modeSwitchBtn.innerHTML =
                '<i class="material-icons-outlined">timer</i>';
            modeSwitchBtn.title = "Switch to Timer";
            if (currentSettings.showDate) {
                // Show date only in clock mode if enabled
                dateDisplayContainer.style.display = "block";
            }
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
                timerInputEl.style.display = "block";
                timerInputEl.value = currentSettings.lastTimerInput;
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                // Optionally show the parsed time from input on main display
                const initialTimerValue = parseTimerInput(
                    currentSettings.lastTimerInput
                );
                const { h, m, s } = formatSecondsToHMS(initialTimerValue);
                displayTime(h, m, s); // Show initial value in clock format
                timerInputEl.style.display = "block"; // Then overlay input
            } else if (appMode === "timerRunning") {
                updateTimerDisplay();
                timerStartPauseBtn.textContent = "Pause";
                timerStartPauseBtn.classList.add("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
            } else if (appMode === "timerPaused") {
                updateTimerDisplay();
                timerStartPauseBtn.textContent = "Resume";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
            } else if (appMode === "timerFinished") {
                displayTime(0, 0, 0);
                mainDisplay.classList.add("timer-finished-blink");
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.disabled = true; // Can only reset
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

        if (appMode === "clock") updateClock();
        else if (appMode.startsWith("timer")) {
            // If in timer setup, re-parse and display the time based on lastTimerInput
            if (appMode === "timerSetup") {
                const val = parseTimerInput(currentSettings.lastTimerInput);
                const { h, m, s } = formatSecondsToHMS(val);
                displayTime(h, m, s);
                timerInputEl.style.display = "block"; // ensure input is visible over it
            } else {
                updateTimerDisplay(); // For running/paused states
            }
        }
        updateUIForAppMode(); // Crucial to update date visibility etc.
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
            // Merge saved settings with defaults to ensure new settings get default values
            currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
        } else {
            currentSettings = { ...defaultSettings };
        }

        timeFormatSelect.value = currentSettings.timeFormat;
        fontSelect.value = currentSettings.clockFont;
        fontSizeInput.value = currentSettings.fontSize;
        primaryHueInput.value = currentSettings.primaryHue;
        showSecondsCheckbox.checked = currentSettings.showSecondsClock;
        showDateCheckbox.checked = currentSettings.showDate;
        timerSoundSelect.value = currentSettings.timerSound;
        // timerInputEl.value is set by updateUIForAppMode based on currentSettings.lastTimerInput

        applySettings(); // Apply loaded settings to the DOM/CSS variables
    }

    // --- Event Listeners ---
    modeSwitchBtn.addEventListener("click", () => {
        if (appMode === "clock") {
            appMode = "timerSetup";
        } else {
            resetTimer(); // This sets mode to timerSetup internally
            appMode = "clock"; // Then switch to clock
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

    timerInputEl.addEventListener("input", () => {
        // Live update preview in timerSetup
        if (appMode === "timerSetup") {
            const currentVal = parseTimerInput(timerInputEl.value);
            const { h, m, s } = formatSecondsToHMS(currentVal);
            displayTime(h, m, s); // Show current input as formatted time
            timerInputEl.style.display = "block"; // Keep input on top
        }
    });
    timerInputEl.addEventListener("keydown", (e) => {
        if (
            e.key === "Enter" &&
            (appMode === "timerSetup" || appMode === "timerFinished")
        ) {
            startTimer();
        }
    });

    settingsBtn.addEventListener("click", () =>
        settingsModal.classList.add("show")
    );
    closeSettingsBtn.addEventListener("click", () =>
        settingsModal.classList.remove("show")
    );
    window.addEventListener("click", (event) => {
        if (event.target === settingsModal)
            settingsModal.classList.remove("show");
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
    primaryHueInput.addEventListener("input", (e) => {
        currentSettings.primaryHue = e.target.value;
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
            localStorage.removeItem("minimalClockSettings"); // Clear saved settings
            loadSettings(); // Load defaults and apply
            if (appMode.startsWith("timer")) {
                resetTimer();
            }
            updateUIForAppMode();
        }
    });

    // Fullscreen (no changes needed here for M3)
    fullscreenBtn.addEventListener("click", () => {
        /* ... existing ... */
    });
    document.addEventListener("fullscreenchange", () => {
        /* ... existing ... */
    });

    // --- Initialisation ---
    loadSettings(); // Load saved or default settings FIRST
    updateUIForAppMode(); // Then set up UI based on loaded settings and initial mode
});
