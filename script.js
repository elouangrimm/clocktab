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
    const bgColorInput = document.getElementById("bg-color-input");
    const textColorInput = document.getElementById("text-color-input");
    const showSecondsCheckbox = document.getElementById(
        "show-seconds-checkbox"
    );
    const showDateCheckbox = document.getElementById("show-date-checkbox");
    const timerSoundSelect = document.getElementById("timer-sound-select");
    const resetSettingsBtn = document.getElementById("reset-settings-btn");

    // --- State Variables ---
    let appMode = "clock"; // 'clock', 'timerSetup', 'timerRunning', 'timerPaused'
    let clockIntervalId = null;
    let timerIntervalId = null;
    let timerTotalSecondsSet = 0;
    let timerSecondsRemaining = 0;
    let currentTimerSound = new Audio();
    let originalDocTitle = "Minimal Clock";

    const defaultSettings = {
        timeFormat: "24", // '12' or '24'
        clockFont: "'Roboto Mono', monospace",
        fontSize: "15", // vw
        bgColor: "#1a1a1a",
        textColor: "#e0e0e0",
        showSecondsClock: true,
        showDate: false,
        timerSound: "sounds/alarm1.mp3",
        lastTimerInput: "05:00", // Store as string MM:SS or HH:MM:SS
    };
    let currentSettings = { ...defaultSettings };

    // --- Utility Functions ---
    function formatTimeUnit(unit) {
        return unit < 10 ? `0${unit}` : String(unit);
    }

    function parseTimerInput(inputStr) {
        if (!inputStr || typeof inputStr !== "string") return 0;
        const parts = inputStr.split(":").map((p) => parseInt(p.trim(), 10));
        let totalSeconds = 0;
        if (parts.length === 1 && !isNaN(parts[0])) {
            // Only seconds
            totalSeconds = parts[0];
        } else if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            // MM:SS
            totalSeconds = parts[0] * 60 + parts[1];
        } else if (
            parts.length === 3 &&
            !isNaN(parts[0]) &&
            !isNaN(parts[1]) &&
            !isNaN(parts[2])
        ) {
            // HH:MM:SS
            totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
        return Math.max(0, totalSeconds); // Ensure non-negative
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
        if (currentSettings.showSecondsClock || appMode.startsWith("timer")) {
            clockSecondsEl.textContent = formatTimeUnit(seconds);
            clockSecondsEl.style.display = "";
            clockSecondSeparator.style.display = "";
        } else {
            clockSecondsEl.style.display = "none";
            clockSecondSeparator.style.display = "none";
        }
        clockAmPmEl.textContent = ampm;
        clockAmPmEl.style.display = ampm ? "" : "none";

        // Ensure all clock elements are visible and input is hidden
        clockHoursEl.style.display = "";
        clockMinutesEl.style.display = "";
        clockSeparators.forEach((sep) => (sep.style.display = ""));
        if (!currentSettings.showSecondsClock && appMode === "clock") {
            clockSecondsEl.style.display = "none";
            clockSecondSeparator.style.display = "none";
        }
        timerInputEl.style.display = "none";
    }

    // --- Clock Logic ---
    function updateClock() {
        if (appMode !== "clock") return; // Only run if in clock mode

        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        let ampm = "";

        if (currentSettings.timeFormat === "12") {
            ampm = hours >= 12 ? "PM" : "AM";
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12 for 12h format
        }

        displayTime(hours, minutes, seconds, ampm);

        // Update Tab Title (Clock only)
        let title = `${formatTimeUnit(hours)}:${formatTimeUnit(minutes)}`;
        if (currentSettings.showSecondsClock)
            title += `:${formatTimeUnit(seconds)}`;
        if (ampm) title += ` ${ampm}`;
        document.title = title;
        originalDocTitle = title; // Store current clock time for restoring

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
            dateDisplayContainer.style.display = "block";
        } else {
            dateDisplayContainer.style.display = "none";
        }
    }

    // --- Timer Logic ---
    function updateTimerDisplay() {
        const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
        displayTime(h, m, s); // Reuse displayTime for timer countdown
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

        currentSettings.lastTimerInput = inputVal; // Save valid input
        saveSettings();

        appMode = "timerRunning";
        timerSecondsRemaining = timerTotalSecondsSet;
        updateUIForAppMode();
        updateTimerDisplay(); // Initial display

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
        // No need to call updateTimerDisplay immediately, interval will do it
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
        timerSecondsRemaining = 0;
        // If resetting from running/paused, go to setup. If in setup, clear input.
        if (
            appMode === "timerRunning" ||
            appMode === "timerPaused" ||
            appMode === "timerFinished"
        ) {
            appMode = "timerSetup";
            timerInputEl.value = currentSettings.lastTimerInput; // Restore last used or default
        } else if (appMode === "timerSetup") {
            timerInputEl.value = ""; // Clear input if already in setup
        }
        updateUIForAppMode();
        document.title = originalDocTitle; // Restore original clock title
        mainDisplay.classList.remove("timer-finished-blink");
    }

    function finishTimer() {
        clearInterval(timerIntervalId);
        appMode = "timerFinished"; // New state to handle 'Time's Up!'
        mainDisplay.classList.add("timer-finished-blink");
        displayTime(0, 0, 0); // Show 00:00:00
        document.title = "Time's Up! - " + originalDocTitle;
        timerStartPauseBtn.textContent = "Start";
        timerStartPauseBtn.classList.remove("running");
        timerStartPauseBtn.disabled = true; // Can only reset now

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
        // Hide everything initially, then show based on mode
        clockHoursEl.style.display = "none";
        clockMinutesEl.style.display = "none";
        clockSecondsEl.style.display = "none";
        clockAmPmEl.style.display = "none";
        clockSeparators.forEach((sep) => (sep.style.display = "none"));
        timerInputEl.style.display = "none";
        timerControlsContainer.style.display = "none";
        mainDisplay.classList.remove("timer-finished-blink");

        if (appMode === "clock") {
            modeSwitchBtn.innerHTML = '<i class="material-icons">timer</i>';
            modeSwitchBtn.title = "Switch to Timer";
            updateClock(); // This will show relevant clock parts
            if (clockIntervalId === null) {
                // Start clock interval if not already running
                clockIntervalId = setInterval(updateClock, 1000);
            }
        } else {
            // Timer modes
            clearInterval(clockIntervalId); // Stop clock updates
            clockIntervalId = null;
            modeSwitchBtn.innerHTML =
                '<i class="material-icons">watch_later</i>'; // Icon for clock
            modeSwitchBtn.title = "Switch to Clock";
            timerControlsContainer.style.display = "flex";

            if (appMode === "timerSetup") {
                timerInputEl.style.display = "block";
                timerInputEl.value = currentSettings.lastTimerInput;
                timerInputEl.placeholder = "HH:MM:SS or MM:SS or SS";
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Clear"; // Or 'Reset' to default
            } else if (appMode === "timerRunning") {
                updateTimerDisplay(); // Shows the countdown in clock elements
                timerStartPauseBtn.textContent = "Pause";
                timerStartPauseBtn.classList.add("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
            } else if (appMode === "timerPaused") {
                updateTimerDisplay(); // Shows the paused countdown
                timerStartPauseBtn.textContent = "Resume";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
            } else if (appMode === "timerFinished") {
                displayTime(0, 0, 0); // Show 00:00:00
                mainDisplay.classList.add("timer-finished-blink");
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.disabled = true;
                timerResetBtn.textContent = "Reset";
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
            "--bg-color",
            currentSettings.bgColor
        );
        document.documentElement.style.setProperty(
            "--text-color",
            currentSettings.textColor
        );

        // Update UI based on settings that affect current mode
        if (appMode === "clock") updateClock();
        else if (appMode.startsWith("timer")) updateTimerDisplay(); // e.g. if showSeconds changed
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
        }
        // Populate form fields
        timeFormatSelect.value = currentSettings.timeFormat;
        fontSelect.value = currentSettings.clockFont;
        fontSizeInput.value = currentSettings.fontSize;
        bgColorInput.value = currentSettings.bgColor;
        textColorInput.value = currentSettings.textColor;
        showSecondsCheckbox.checked = currentSettings.showSecondsClock;
        showDateCheckbox.checked = currentSettings.showDate;
        timerSoundSelect.value = currentSettings.timerSound;
        timerInputEl.value = currentSettings.lastTimerInput; // For initial timer setup state

        applySettings();
    }

    // --- Event Listeners ---
    modeSwitchBtn.addEventListener("click", () => {
        if (appMode === "clock") {
            appMode = "timerSetup";
        } else {
            // Any timer mode
            resetTimer(); // Reset timer state before switching fully to clock
            appMode = "clock";
        }
        updateUIForAppMode();
    });

    timerStartPauseBtn.addEventListener("click", () => {
        if (appMode === "timerSetup") {
            startTimer();
        } else if (appMode === "timerRunning") {
            pauseTimer();
        } else if (appMode === "timerPaused") {
            resumeTimer();
        }
    });

    timerResetBtn.addEventListener("click", () => {
        resetTimer();
        // If in timerSetup and reset is clicked, it clears the input field.
        // If running/paused, it resets to timerSetup with last value.
        if (appMode === "timerSetup") timerInputEl.focus();
    });

    timerInputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && appMode === "timerSetup") {
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
    bgColorInput.addEventListener("input", (e) => {
        currentSettings.bgColor = e.target.value;
        applySettings();
        saveSettings();
    });
    textColorInput.addEventListener("input", (e) => {
        currentSettings.textColor = e.target.value;
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
            currentSettings = { ...defaultSettings };
            saveSettings();
            loadSettings(); // Re-populates form and applies
            // If in timer mode, reset its state too
            if (appMode.startsWith("timer")) {
                resetTimer(); // This will use new default lastTimerInput
                appMode = "timerSetup"; // Go to setup
                updateUIForAppMode();
            }
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
                            '<i class="material-icons">fullscreen_exit</i>')
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
                            '<i class="material-icons">fullscreen</i>')
                );
        }
    });
    document.addEventListener("fullscreenchange", () => {
        fullscreenBtn.innerHTML = document.fullscreenElement
            ? '<i class="material-icons">fullscreen_exit</i>'
            : '<i class="material-icons">fullscreen</i>';
    });

    // --- Initialisation ---
    loadSettings();
    updateUIForAppMode(); // Sets up initial UI based on appMode (default 'clock')
});
