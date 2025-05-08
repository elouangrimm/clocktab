document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    const body = document.body;
    const mainDisplay = document.getElementById("main-display");
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
    const timeFormatSwitch = document.getElementById("time-format-switch");
    const fontSelect = document.getElementById("font-select");
    const fontSizeInput = document.getElementById("font-size-input");
    const primaryColorPicker = document.getElementById("primary-color-picker");
    const showSecondsCheckbox = document.getElementById(
        "show-seconds-checkbox"
    );
    const showDateCheckbox = document.getElementById("show-date-checkbox");
    const timerSoundSelect = document.getElementById("timer-sound-select");
    const resetSettingsBtn = document.getElementById("reset-settings-btn");

    let timerProgressBar;
    function createTimerProgressBar() {
        if (!document.getElementById("timer-progress-bar")) {
            timerProgressBar = document.createElement("div");
            timerProgressBar.id = "timer-progress-bar";
            body.appendChild(timerProgressBar);
        } else {
            timerProgressBar = document.getElementById("timer-progress-bar");
        }
    }
    createTimerProgressBar();

    // --- State Variables ---
    let appMode = "clock";
    let clockIntervalId = null;
    let timerIntervalId = null;
    let timerTotalSecondsSetAtStart = 0;
    let timerSecondsRemaining = 0;
    let currentTimerSound = new Audio();
    let originalDocTitle = "ClockTab";
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
            l = 0.5;
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

        const showAmPm =
            appMode === "clock" && currentSettings.timeFormat === "12" && ampm;
        clockAmPmEl.textContent = showAmPm ? ampm : "";
        clockAmPmEl.style.display = showAmPm ? "" : "none";
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
        if (ampm && currentSettings.timeFormat === "12") title += ` ${ampm}`;
        document.title = title + " - ClockTab";
        originalDocTitle = title + " - ClockTab";

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
    function updateTimerDisplayAndProgress() {
        const { h, m, s } = formatSecondsToHMS(timerSecondsRemaining);
        displayTime(h, m, s);
        document.title = `(${formatTimeUnit(h)}:${formatTimeUnit(
            m
        )}:${formatTimeUnit(s)}) Timer - ClockTab`;

        if (timerTotalSecondsSetAtStart > 0 && timerProgressBar) {
            const progressPercentage =
                ((timerTotalSecondsSetAtStart - timerSecondsRemaining) /
                    timerTotalSecondsSetAtStart) *
                100;
            timerProgressBar.style.width = `${progressPercentage}%`;
        }
    }

    function startTimer() {
        const inputVal = timerInputEl.value.trim();
        timerTotalSecondsSetAtStart = parseTimerInput(inputVal);

        if (timerTotalSecondsSetAtStart <= 0) {
            alert("Please enter a valid timer duration (e.g., 5:00 or 30).");
            timerInputEl.focus();
            return;
        }

        currentSettings.lastTimerInput = inputVal;
        saveSettings();

        appMode = "timerRunning";
        timerSecondsRemaining = timerTotalSecondsSetAtStart;
        body.classList.add("timer-active");
        updateUIForAppMode();

        timerIntervalId = setInterval(() => {
            timerSecondsRemaining--;
            if (timerSecondsRemaining < 0) {
                finishTimer();
            } else {
                updateTimerDisplayAndProgress();
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
        body.classList.add("timer-active");
        updateUIForAppMode();
        timerIntervalId = setInterval(() => {
            timerSecondsRemaining--;
            if (timerSecondsRemaining < 0) {
                finishTimer();
            } else {
                updateTimerDisplayAndProgress();
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timerIntervalId);
        timerSecondsRemaining = parseTimerInput(currentSettings.lastTimerInput);
        timerTotalSecondsSetAtStart = 0;
        if (timerProgressBar) timerProgressBar.style.width = "0%";
        body.classList.remove("timer-active");

        appMode = "timerSetup";
        updateUIForAppMode();
        document.title = originalDocTitle;
        mainDisplay.classList.remove("timer-finished-blink");
    }

    function finishTimer() {
        clearInterval(timerIntervalId);
        appMode = "timerFinished";
        if (timerProgressBar) timerProgressBar.style.width = "100%";

        updateUIForAppMode();
        mainDisplay.classList.add("timer-finished-blink");
        document.title = "Time's Up! - ClockTab";

        if (
            currentSettings.timerSound !== "none" &&
            currentSettings.timerSound
        ) {
            currentTimerSound.src = currentSettings.timerSound;
            currentTimerSound
                .play()
                .catch((e) => console.error("Error playing sound:", e));
        }
        setTimeout(() => {
            if (appMode === "timerFinished") {
                // Only reset if still in finished state
                body.classList.remove("timer-active");
                if (timerProgressBar) timerProgressBar.style.width = "0%";
            }
        }, 3000);
    }

    // --- UI Update Logic ---
    function updateUIForAppMode() {
        timerInputEl.style.display = "none";
        clockDigitsContainer.style.visibility = "hidden";
        timerControlsContainer.style.display = "none";
        mainDisplay.classList.remove("timer-finished-blink");
        dateDisplayContainer.style.display = "none";
        if (timerProgressBar) {
            timerProgressBar.style.transition =
                appMode === "timerRunning" ||
                appMode === "timerPaused" ||
                appMode === "timerFinished"
                    ? "width 0.5s linear"
                    : "none";
        }

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
            body.classList.remove("timer-active");
            if (timerProgressBar) timerProgressBar.style.width = "0%";
        } else {
            clearInterval(clockIntervalId);
            clockIntervalId = null;
            modeSwitchBtn.innerHTML =
                '<i class="material-icons-outlined">watch_later</i>';
            modeSwitchBtn.title = "Switch to Clock";
            timerControlsContainer.style.display = "flex";
            clockAmPmEl.style.display = "none";

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
                body.classList.remove("timer-active");
                if (timerProgressBar) timerProgressBar.style.width = "0%";
            } else if (appMode === "timerRunning") {
                clockDigitsContainer.style.visibility = "visible";
                updateTimerDisplayAndProgress();
                timerStartPauseBtn.textContent = "Pause";
                timerStartPauseBtn.classList.add("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
                body.classList.add("timer-active");
            } else if (appMode === "timerPaused") {
                clockDigitsContainer.style.visibility = "visible";
                updateTimerDisplayAndProgress();
                timerStartPauseBtn.textContent = "Resume";
                timerStartPauseBtn.classList.remove("running");
                timerStartPauseBtn.disabled = false;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
                body.classList.add("timer-active");
            } else if (appMode === "timerFinished") {
                clockDigitsContainer.style.visibility = "visible";
                displayTime(0, 0, 0);
                mainDisplay.classList.add("timer-finished-blink");
                timerStartPauseBtn.textContent = "Start";
                timerStartPauseBtn.disabled = true;
                timerResetBtn.textContent = "Reset";
                timerResetBtn.disabled = false;
                body.classList.add("timer-active");
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

        const newProgressBarColor = `hsl(${currentSettings.primaryHue}, 15%, 15%)`;
        document.documentElement.style.setProperty(
            "--m3-progress-bar-color",
            newProgressBarColor
        );

        primaryColorPicker.value = hueToHex(currentSettings.primaryHue);
        updateUIForAppMode();
    }

    function saveSettings() {
        localStorage.setItem(
            "clockTabSettings",
            JSON.stringify(currentSettings)
        );
    }

    function loadSettings() {
        const saved = localStorage.getItem("clockTabSettings");
        if (saved) {
            currentSettings = { ...defaultSettings, ...JSON.parse(saved) };
        } else {
            currentSettings = { ...defaultSettings };
        }

        timeFormatSwitch.checked = currentSettings.timeFormat === "24";
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
            if (
                !settingsModal.classList.contains("show") &&
                !actionButtonsContainer.matches(":hover")
            ) {
                actionButtonsContainer.classList.add("hidden");
            }
        }, 3000);
    }

    document.addEventListener("mousemove", (e) => {
        showActionButtons();
        const cornerRect = actionButtonsContainer.getBoundingClientRect();
        const isMouseInCornerArea =
            e.clientX >= window.innerWidth - (cornerRect.width + 70) &&
            e.clientY <= cornerRect.height + 70;

        if (!isMouseInCornerArea && !actionButtonsContainer.matches(":hover")) {
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
        if (e.key === "Enter") {
            if (appMode === "timerSetup") {
                startTimer();
            } else if (appMode === "timerFinished") {
                // If enter on finished, treat as reset then start
                resetTimer(); // This will go to timerSetup
                // Need a slight delay for UI to update before trying to start, or start from here
                // For simplicity, we assume user will click start or type again.
                // Or, call startTimer() directly but ensure appMode is 'timerSetup'
                // For now, let reset put it in setup, user can then hit enter again or click start
            }
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
    timeFormatSwitch.addEventListener("change", (e) => {
        currentSettings.timeFormat = e.target.checked ? "24" : "12";
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
            localStorage.removeItem("clockTabSettings");
            loadSettings();
            if (appMode.startsWith("timer")) {
                resetTimer();
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
