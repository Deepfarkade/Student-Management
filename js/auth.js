// Contains client-side logic for login, registration, and password recovery flows
const loginForm = document.querySelector('#login-form'); // Grabs login form if present on the page
const registerForm = document.querySelector('#register-form'); // Grabs registration form if present
const forgotFormStepOne = document.querySelector('#forgot-step-one'); // Selects the first step form in password recovery
const forgotFormStepTwo = document.querySelector('#forgot-step-two'); // Selects the second step form in password recovery
const forgotFormStepThree = document.querySelector('#forgot-step-three'); // Selects the final step form in password recovery
const modalElement = document.querySelector('#feedback-modal'); // Selects the reusable modal element
const modalTitleElement = document.querySelector('#feedback-title'); // Selects the modal title element
const modalMessageElement = document.querySelector('#feedback-message'); // Selects the modal message element
const modalCloseButton = document.querySelector('#modal-close'); // Selects the modal close button

if (modalCloseButton) { // Checks if the modal close button exists on the current page
    modalCloseButton.addEventListener('click', hideModal); // Binds click listener to close the modal when triggered
} // Ends modal button existence check

if (loginForm) { // Ensures login form exists before attaching logic
    loginForm.addEventListener('submit', async (event) => { // Handles login submission asynchronously
        event.preventDefault(); // Prevents default form submission behaviour
        const formData = new FormData(loginForm); // Collects the form data into a FormData object
        try { // Begins try block for async/await operations
            const response = await fetch(`${API_BASE_URL}login.php`, { // Sends POST request to login endpoint
                method: 'POST', // Uses POST method for credential submission
                body: formData, // Attaches form data in the request body
                credentials: 'include' // Ensures PHP session cookies are included
            }); // Ends fetch call
            const result = await response.json(); // Parses response JSON
            if (result.success) { // Checks if login succeeded
                showModal('Login Successful', 'Redirecting to your dashboard...'); // Displays success message in modal
                setTimeout(() => { // Schedules a redirect after a short delay
                    window.location.href = '../pages/dashboard.html'; // Navigates to the dashboard page
                }, 1400); // Ends timeout after 1.4 seconds
            } else { // Handles login failure
                showModal('Login Failed', result.message || 'Invalid credentials.'); // Displays error message in modal
            } // Ends success check
        } catch (error) { // Captures network or parsing errors
            showModal('Error', 'An unexpected error occurred while logging in.'); // Displays generic error message
        } // Ends try/catch
    }); // Ends submit listener
} // Ends login form logic

if (registerForm) { // Ensures register form exists before attaching logic
    registerForm.addEventListener('submit', async (event) => { // Handles registration submission asynchronously
        event.preventDefault(); // Prevents default submission
        const formData = new FormData(registerForm); // Collects registration form data
        const password = formData.get('password'); // Reads password field for custom validation
        const confirmPassword = formData.get('confirm_password'); // Reads confirmation field
        if (password !== confirmPassword) { // Validates matching passwords on client side
            showModal('Validation Error', 'Password and confirmation do not match.'); // Displays mismatch message
            return; // Exits early because validation failed
        } // Ends password match check
        try { // Begins async try block
            const response = await fetch(`${API_BASE_URL}register.php`, { // Sends POST request to registration endpoint
                method: 'POST', // Uses POST method
                body: formData // Attaches form data payload
            }); // Ends fetch call
            const result = await response.json(); // Parses JSON response
            if (result.success) { // Checks if registration succeeded
                showModal('Registration Successful', 'You can now log in with your new account.'); // Shows success feedback
                registerForm.reset(); // Clears the form fields after success
                setTimeout(() => { // Sets redirect delay after showing modal
                    window.location.href = 'login.html'; // Navigates to login page
                }, 1600); // Ends timeout after 1.6 seconds
            } else { // Handles server-side validation errors
                showModal('Registration Failed', result.message || 'Unable to register user.'); // Shows failure message
            } // Ends success check
        } catch (error) { // Catches network or parsing issues
            showModal('Error', 'An unexpected error occurred while registering.'); // Shows error message
        } // Ends try/catch
    }); // Ends submit listener
} // Ends register form logic

if (forgotFormStepOne) { // Ensures the forgot password workflow exists before wiring events
    forgotFormStepOne.addEventListener('submit', async (event) => { // Handles the first step submission
        event.preventDefault(); // Prevents default submission
        const formData = new FormData(forgotFormStepOne); // Collects email input data
        formData.append('action', 'fetch_question'); // Adds action to indicate the desired server operation
        try { // Begins async try block
            const response = await fetch(`${API_BASE_URL}forgot-password.php`, { // Sends POST request to forgot password endpoint
                method: 'POST', // Uses POST method
                body: formData // Attaches form data payload
            }); // Ends fetch call
            const result = await response.json(); // Parses the JSON response
            if (result.success) { // Checks if the question was retrieved successfully
                document.querySelector('#security-question-display').textContent = result.security_question; // Displays the retrieved security question
                toggleForgotStep(1, 2); // Switches the UI from step one to step two
            } else { // Handles failure to find the email
                showModal('Account Not Found', result.message || 'No account exists with that email.'); // Shows error message
            } // Ends success check
        } catch (error) { // Catches request errors
            showModal('Error', 'Unable to fetch the security question at this time.'); // Shows error message
        } // Ends try/catch
    }); // Ends submit listener for step one
} // Ends forgot password step one logic

if (forgotFormStepTwo) { // Ensures the second step form exists
    forgotFormStepTwo.addEventListener('submit', async (event) => { // Handles security answer submission
        event.preventDefault(); // Prevents default behaviour
        const formData = new FormData(forgotFormStepTwo); // Collects answer data
        formData.append('action', 'verify_answer'); // Specifies verification action
        formData.append('email', document.querySelector('#forgot-email').value); // Adds the previously provided email
        try { // Begins async try block
            const response = await fetch(`${API_BASE_URL}forgot-password.php`, { // Sends POST request for verification
                method: 'POST', // Uses POST method
                body: formData // Attaches form data payload
            }); // Ends fetch call
            const result = await response.json(); // Parses JSON response
            if (result.success) { // Checks if answer was correct
                toggleForgotStep(2, 3); // Moves to final password reset step
            } else { // Handles incorrect answers
                showModal('Verification Failed', result.message || 'Security answer is incorrect.'); // Shows failure message
            } // Ends success check
        } catch (error) { // Catches request errors
            showModal('Error', 'Unable to verify the security answer right now.'); // Shows error message
        } // Ends try/catch
    }); // Ends submit listener for step two
} // Ends forgot step two logic

if (forgotFormStepThree) { // Ensures the final step form exists
    forgotFormStepThree.addEventListener('submit', async (event) => { // Handles new password submission
        event.preventDefault(); // Prevents default form submission
        const formData = new FormData(forgotFormStepThree); // Collects new password inputs
        const newPassword = formData.get('new_password'); // Reads new password field
        const confirmPassword = formData.get('confirm_new_password'); // Reads confirmation field
        if (newPassword !== confirmPassword) { // Validates matching passwords
            showModal('Validation Error', 'New password and confirmation must match.'); // Shows mismatch error
            return; // Exits early due to failed validation
        } // Ends password match check
        formData.append('action', 'reset_password'); // Specifies reset action for the server
        formData.append('email', document.querySelector('#forgot-email').value); // Includes the email for identification
        try { // Begins async try block
            const response = await fetch(`${API_BASE_URL}forgot-password.php`, { // Sends POST request to reset password
                method: 'POST', // Uses POST method
                body: formData // Attaches form data payload
            }); // Ends fetch call
            const result = await response.json(); // Parses JSON response
            if (result.success) { // Checks if password reset succeeded
                showModal('Password Reset', 'Your password has been updated successfully.'); // Shows success message
                forgotFormStepThree.reset(); // Clears form fields
                setTimeout(() => { // Sets redirect delay after showing modal
                    window.location.href = 'login.html'; // Redirects to login page
                }, 1600); // Ends timeout after 1.6 seconds
            } else { // Handles server-side failure
                showModal('Reset Failed', result.message || 'Password reset could not be completed.'); // Shows failure message
            } // Ends success check
        } catch (error) { // Catches request errors
            showModal('Error', 'An unexpected error occurred while resetting the password.'); // Shows error message
        } // Ends try/catch
    }); // Ends submit listener for step three
} // Ends forgot step three logic

function toggleForgotStep(currentStep, nextStep) { // Helper function to switch between recovery steps
    const stepIdMap = { // Maps step numbers to DOM ids used in the markup
        1: '#forgot-step-one', // Step one form id selector
        2: '#forgot-step-two', // Step two form id selector
        3: '#forgot-step-three' // Step three form id selector
    }; // Ends step id mapping object
    const currentForm = document.querySelector(stepIdMap[currentStep]); // Selects current step form using mapped id
    const nextForm = document.querySelector(stepIdMap[nextStep]); // Selects next step form using mapped id
    if (currentForm && nextForm) { // Ensures both forms exist
        currentForm.classList.add('step-hidden'); // Hides the current form
        currentForm.classList.remove('step-visible'); // Removes visible class from current form
        nextForm.classList.add('step-visible'); // Shows the next form
        nextForm.classList.remove('step-hidden'); // Removes hidden class from next form
        nextForm.scrollIntoView({ behavior: 'smooth' }); // Scrolls smoothly to the new form
    } // Ends existence check
} // Ends helper function

function showModal(title, message) { // Displays modal feedback with provided text
    if (!modalElement) { // Checks if modal exists on page
        alert(`${title}: ${message}`); // Falls back to native alert if modal missing
        return; // Exits function after fallback
    } // Ends modal existence check
    modalTitleElement.textContent = title; // Sets modal title text
    modalMessageElement.textContent = message; // Sets modal message text
    modalElement.classList.add('active'); // Shows modal by adding active class
} // Ends showModal function

function hideModal() { // Hides the feedback modal
    if (!modalElement) { // Checks if modal exists
        return; // Exits if modal absent
    } // Ends existence check
    modalElement.classList.remove('active'); // Removes active class to hide modal
} // Ends hideModal function
