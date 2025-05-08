document.addEventListener("DOMContentLoaded", () => {
    const clockDisplay = document.getElementById("clock-display");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    const ampmEl = document.getElementById("ampm");
    const dateDisplayEl = document.getElementById("date-display");
    const separatorEls = document.querySelectorAll(".separator");

    const settingsBtn = document.getElementById("settings-btn");
    const fullscreenBtn = document.getElementById("fullscreen-btn");
    const settingsModal = document.getElementById("settings-modal");
    const closeSettingsBtn = document.getElementById("close-settings-btn");

    // Settings Elements
    const layoutSelect = document.getElementById("layout-select");
    const fontSelect = document.getElementById("font-select");
    const fontSizeInput = document.getElementById("font-size-input");
    const bgColorInput = document.getElementById("bg-color-input");
    const textColorInput = document.getElementById("text-color-input");
    const showSecondsCheckbox = document.getElementById(
        "show-seconds-checkbox"
    );
    const showDateCheckbox = document.getElementById("show-date-checkbox");
    const resetSettingsBtn = document.getElementById("reset-settings-btn");

    const defaultSettings = {
        layout: "HH:MM:SS_24",
        fontFamily: "'Merriweather', serif",
        fontSize: "15", // vw
        bgColor: "#1a1a1a",
        textColor: "#e0e0e0",
        showSeconds: true,
        showDate: false,
    };

    let currentSettings = { ...defaultSettings };

    function formatTimeUnit(unit) {
        return unit < 10 ? `0${unit}` : unit;
    }

    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();

        // Apply layout and format
        const layout = currentSettings.layout;
        let displayHours = hours;
        let ampm = "";

        if (layout.includes("_12")) {
            ampm = hours >= 12 ? "PM" : "AM";
            displayHours = hours % 12;
            displayHours = displayHours ? displayHours : 12; // 0 should be 12
        }

        hoursEl.textContent = formatTimeUnit(displayHours);
        minutesEl.textContent = formatTimeUnit(minutes);

        if (currentSettings.showSeconds && !layout.startsWith("HH:MM_")) {
            secondsEl.textContent = formatTimeUnit(seconds);
            secondsEl.style.display = "";
            if (separatorEls.length > 1) separatorEls[1].style.display = "";
        } else {
            secondsEl.style.display = "none";
            if (separatorEls.length > 1) separatorEls[1].style.display = "none";
        }

        if (layout.includes("HH:MM_")) {
            // Hide seconds explicitly for HH:MM layouts
            secondsEl.style.display = "none";
            if (separatorEls.length > 1) separatorEls[1].style.display = "none";
        }

        ampmEl.textContent = ampm;
        ampmEl.style.display = layout.includes("_12") ? "" : "none";

        // Title update
        let titleTime = `${formatTimeUnit(displayHours)}:${formatTimeUnit(
            minutes
        )}`;
        if (currentSettings.showSeconds && !layout.startsWith("HH:MM_")) {
            titleTime += `:${formatTimeUnit(seconds)}`;
        }
        if (layout.includes("_12")) {
            titleTime += ` ${ampm}`;
        }
        document.title = titleTime;

        // Handle stacked layout
        if (layout.includes("_STACKED")) {
            document.body.classList.add("layout-stacked");
            separatorEls.forEach((sep) => (sep.style.display = "none"));
        } else {
            document.body.classList.remove("layout-stacked");
            separatorEls.forEach((sep) => (sep.style.display = "")); // May be overridden by showSeconds
            if (!currentSettings.showSeconds || layout.startsWith("HH:MM_")) {
                if (separatorEls.length > 1)
                    separatorEls[1].style.display = "none";
            }
        }

        // Handle date display
        if (currentSettings.showDate) {
            const options = {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            dateDisplayEl.textContent = now.toLocaleDateString(
                undefined,
                options
            );
            dateDisplayEl.style.display = "block";

            if (layout === "DATE_TIME") {
                clockDisplay.parentNode.insertBefore(
                    dateDisplayEl,
                    clockDisplay
                );
            } else if (layout === "TIME_DATE") {
                clockDisplay.parentNode.insertBefore(
                    clockDisplay,
                    dateDisplayEl.nextSibling
                ); // Puts date after clock
            } else {
                // Default: date below clock, ensure it's after clock-display
                if (dateDisplayEl.previousElementSibling !== clockDisplay) {
                    clockDisplay.parentNode.insertBefore(
                        dateDisplayEl,
                        clockDisplay.nextSibling
                    );
                }
            }
        } else {
            dateDisplayEl.style.display = "none";
        }

        // Re-evaluate separator visibility based on showSeconds and specific layouts
        if (layout.startsWith("HH:MM_") || !currentSettings.showSeconds) {
            if (separatorEls.length > 1) separatorEls[1].style.display = "none"; // Hide second separator
        } else {
            if (separatorEls.length > 1 && !layout.includes("_STACKED"))
                separatorEls[1].style.display = "";
        }
        if (layout.includes("_STACKED")) {
            separatorEls.forEach((sep) => (sep.style.display = "none"));
        }

        requestAnimationFrame(updateClock);
    }

    function applySettings() {
        document.documentElement.style.setProperty(
            "--primary-font",
            currentSettings.fontFamily
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

        // Trigger a clock update to reflect layout changes immediately
        updateClock(); // Call directly, not requestAnimationFrame, to force immediate re-render based on new settings
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
        // Populate form fields with loaded/default settings
        layoutSelect.value = currentSettings.layout;
        fontSelect.value = currentSettings.fontFamily;
        fontSizeInput.value = currentSettings.fontSize;
        bgColorInput.value = currentSettings.bgColor;
        textColorInput.value = currentSettings.textColor;
        showSecondsCheckbox.checked = currentSettings.showSeconds;
        showDateCheckbox.checked = currentSettings.showDate;

        applySettings();
    }

    // Event Listeners for Settings
    settingsBtn.addEventListener("click", () =>
        settingsModal.classList.add("show")
    );
    closeSettingsBtn.addEventListener("click", () =>
        settingsModal.classList.remove("show")
    );
    window.addEventListener("click", (event) => {
        if (event.target === settingsModal) {
            settingsModal.classList.remove("show");
        }
    });

    layoutSelect.addEventListener("change", (e) => {
        currentSettings.layout = e.target.value;
        // If DATE_TIME or TIME_DATE is selected, automatically check showDate
        if (e.target.value === "DATE_TIME" || e.target.value === "TIME_DATE") {
            currentSettings.showDate = true;
            showDateCheckbox.checked = true;
        }
        applySettings();
        saveSettings();
    });
    fontSelect.addEventListener("change", (e) => {
        currentSettings.fontFamily = e.target.value;
        applySettings();
        saveSettings();
    });
    fontSizeInput.addEventListener("input", (e) => {
        // 'input' for live update
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
        currentSettings.showSeconds = e.target.checked;
        applySettings();
        saveSettings();
    });
    showDateCheckbox.addEventListener("change", (e) => {
        currentSettings.showDate = e.target.checked;
        // If showDate is unchecked, and layout is DATE_TIME/TIME_DATE, revert to a time-only layout
        if (
            !e.target.checked &&
            (currentSettings.layout === "DATE_TIME" ||
                currentSettings.layout === "TIME_DATE")
        ) {
            currentSettings.layout = defaultSettings.layout; // or the previous non-date layout
            layoutSelect.value = currentSettings.layout;
        }
        applySettings();
        saveSettings();
    });

    resetSettingsBtn.addEventListener("click", () => {
        if (
            confirm(
                "Are you sure you want to reset all settings to their defaults?"
            )
        ) {
            currentSettings = { ...defaultSettings };
            saveSettings(); // Save defaults
            loadSettings(); // Reload and re-apply
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
                    console.error(
                        `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
                    )
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
        if (!document.fullscreenElement) {
            fullscreenBtn.innerHTML =
                '<i class="material-icons">fullscreen</i>';
        } else {
            fullscreenBtn.innerHTML =
                '<i class="material-icons">fullscreen_exit</i>';
        }
    });

    // Initial Load
    loadSettings();
    updateClock(); // Start the clock
});
