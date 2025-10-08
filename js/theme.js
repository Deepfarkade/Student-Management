// Handles light and dark mode toggling across pages
const themeToggleButton = document.querySelector('#theme-toggle'); // Grabs the theme toggle button if it exists on the current page
const storedTheme = localStorage.getItem('student-crm-theme'); // Reads any previously saved theme preference from local storage
if (storedTheme) { // Checks whether a stored theme exists
    document.body.classList.remove('light-mode', 'dark-mode'); // Clears any pre-existing theme classes
    document.body.classList.add(storedTheme); // Applies the stored theme class to the body
} // Ends stored theme check

if (themeToggleButton) { // Ensures the toggle button exists before wiring events
    updateToggleCopy(); // Updates button label to match the current theme state
    themeToggleButton.addEventListener('click', () => { // Listens for clicks on the toggle button
        document.body.classList.toggle('dark-mode'); // Toggles the dark-mode class on the body
        document.body.classList.toggle('light-mode'); // Toggles the light-mode class on the body
        const activeTheme = document.body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode'; // Determines the active theme class
        localStorage.setItem('student-crm-theme', activeTheme); // Persists the active theme to local storage
        updateToggleCopy(); // Updates the button copy/icon after toggling
    }); // Ends click listener
} // Ends existence check for toggle button

function updateToggleCopy() { // Declares helper function to refresh button text/icon
    if (!themeToggleButton) { // Ensures a button is available before proceeding
        return; // Exits early if no button is found
    } // Ends safety check
    const isDarkMode = document.body.classList.contains('dark-mode'); // Checks whether dark mode is active
    themeToggleButton.textContent = isDarkMode ? '☀️ Light' : '🌙 Dark'; // Updates the button label to reflect the active theme
} // Ends helper function definition
