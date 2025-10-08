// Handles dashboard specific interactions and session enforcement
const logoutButton = document.querySelector('#logout-button'); // Selects the logout button element
const welcomeNameElement = document.querySelector('#welcome-name'); // Selects the element that shows the user's name
const sessionInfoElement = document.querySelector('#session-email'); // Selects the element that displays the logged-in email

async function enforceSession() { // Declares async function to verify active session
    try { // Begins try block for async operation
        const response = await fetch(SESSION_CHECK_URL, { // Sends request to session endpoint
            credentials: 'include' // Ensures cookies are included for session lookup
        }); // Ends fetch call
        const result = await response.json(); // Parses the response JSON
        if (!result.success) { // Checks if session is invalid
            window.location.href = '../pages/login.html'; // Redirects to login page when session missing
            return; // Stops further execution after redirect
        } // Ends success check
        if (welcomeNameElement) { // Ensures welcome element exists
            welcomeNameElement.textContent = result.first_name; // Updates UI with user's first name
        } // Ends welcome element check
        if (sessionInfoElement) { // Ensures email element exists
            sessionInfoElement.textContent = result.email; // Updates UI with user's email
        } // Ends email element check
    } catch (error) { // Catches network or parsing errors
        window.location.href = '../pages/login.html'; // Redirects to login page on unexpected failures
    } // Ends try/catch
} // Ends enforceSession function

enforceSession(); // Invokes session enforcement on page load

if (logoutButton) { // Ensures the logout button is present
    logoutButton.addEventListener('click', async () => { // Binds click handler to perform logout
        try { // Begins async try block
            const response = await fetch('../php/logout.php', { // Sends request to logout endpoint
                credentials: 'include' // Includes session cookies to be destroyed
            }); // Ends fetch call
            const result = await response.json(); // Parses JSON response
            if (result.success) { // Checks if logout succeeded
                window.location.href = '../index.html'; // Navigates back to landing page
            } else { // Handles logout failure cases
                alert('Unable to log out right now.'); // Provides fallback alert
            } // Ends success check
        } catch (error) { // Catches network failures
            alert('A network error occurred while logging out.'); // Displays error alert
        } // Ends try/catch
    }); // Ends click listener
} // Ends logout button logic
