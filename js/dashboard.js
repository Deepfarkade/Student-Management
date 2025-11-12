// Handles dashboard specific interactions and session enforcement
const logoutButton = document.querySelector('#logout-button'); // Selects the logout button element
const welcomeNameElement = document.querySelector('#welcome-name'); // Selects the element that shows the user's name
const sessionInfoElement = document.querySelector('#session-email'); // Selects the element that displays the logged-in email
const enrolledCard = document.querySelector('[data-enrolled-card]'); // Card that opens modal
const enrolledCountElement = document.querySelector('[data-enrolled-count]'); // Displays enrollment count
const chipRail = document.querySelector('#enrolled-chips'); // Chip container for enrolled courses
const courseGrid = document.querySelector('#course-grid'); // Grid listing all courses
const courseSearch = document.querySelector('#course-search'); // Search input for catalog
const enrolledModal = document.querySelector('#enrolled-modal'); // Modal overlay
const modalCloseButton = document.querySelector('#close-enrolled'); // Modal close control
const modalList = document.querySelector('#enrolled-modal-list'); // Modal course list

let sessionUserId = null; // Tracks authenticated user ID
let catalogCourses = []; // All catalog entries
let enrolledCourses = []; // Active enrollments

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
        sessionUserId = result.user_id || null; // Stores user identifier
        if (welcomeNameElement) { // Ensures welcome element exists
            welcomeNameElement.textContent = result.first_name; // Updates UI with user's first name
        } // Ends welcome element check
        if (sessionInfoElement) { // Ensures email element exists
            sessionInfoElement.textContent = result.email; // Updates UI with user's email
        } // Ends email element check
        await loadCourses(); // Loads course data after confirming session
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

async function loadCourses() { // Fetches catalog and enrollment data
    try {
        const response = await fetch(`${COURSES_URL}?action=list`, {
            credentials: 'include'
        });
        const data = await response.json();
        if (!data.success) {
            return;
        }
        catalogCourses = data.catalog || [];
        enrolledCourses = data.enrolled || [];
        renderEnrolled(enrolledCourses);
        applyCourseFilter();
    } catch (error) {
        console.error('Unable to load courses', error);
    }
}

function renderEnrolled(enrolled) { // Updates enrolled chips, modal, and count
    enrolledCourses = enrolled; // Sync global cache
    const count = enrolled.length;
    if (enrolledCountElement) {
        enrolledCountElement.textContent = count.toString();
    }
    if (chipRail) {
        chipRail.innerHTML = count
            ? enrolled.map(course => `<span class="chip">${course.title}</span>`).join('')
            : '<span class="chip">No courses enrolled yet</span>';
    }
    if (modalList) {
        if (!count) {
            modalList.innerHTML = '<li>You have not enrolled in any courses yet.</li>';
        } else {
            modalList.innerHTML = enrolled.map(course => `
                <li>
                    <strong>${course.title}</strong>
                    <span>${course.category || 'General'}</span>
                </li>
            `).join('');
        }
    }
}

function applyCourseFilter() { // Filters catalog based on search term
    const term = (courseSearch?.value || '').trim().toLowerCase();
    const filtered = term
        ? catalogCourses.filter(course => [course.title, course.category, course.summary]
            .some(value => value && value.toLowerCase().includes(term)))
        : catalogCourses;
    renderCatalog(filtered);
}

function renderCatalog(courses) { // Renders catalog cards
    if (!courseGrid) {
        return;
    }
    if (!courses.length) {
        courseGrid.innerHTML = '<p>No courses match your search.</p>';
        return;
    }
    courseGrid.innerHTML = courses.map(course => {
        const summary = course.summary || 'Stay ahead with curated learning content.';
        const category = course.category ? `<small>${course.category}</small>` : '';
        const enrolledClass = course.enrolled ? 'enrolled' : 'enroll';
        const disabled = course.enrolled ? 'disabled' : '';
        const buttonLabel = course.enrolled ? 'Enrolled' : 'Enroll';
        return `
            <article class="course-card" data-course-id="${course.id}">
                <h4>${course.title}</h4>
                ${category}
                <p>${summary}</p>
                <div class="course-actions">
                    <button type="button" class="${enrolledClass}" data-enroll="${course.id}" ${disabled}>${buttonLabel}</button>
                    <a href="../pages/course.html?id=${course.id}">View</a>
                </div>
            </article>
        `;
    }).join('');
}

async function enrollInCourse(courseId, button) { // Handles enrollment POST
    try {
        button.disabled = true;
        button.textContent = 'Enrolling…';
        const response = await fetch(COURSES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ course_id: courseId })
        });
        const data = await response.json();
        if (!data.success) {
            alert(data.message || 'Unable to enroll right now.');
        }
        await loadCourses();
    } catch (error) {
        alert('A network error occurred while enrolling.');
        console.error(error);
        button.disabled = false;
        button.textContent = 'Enroll';
    }
}

if (courseGrid) { // Delegates enroll button clicks
    courseGrid.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-enroll]');
        if (!button || button.disabled) {
            return;
        }
        const courseId = Number.parseInt(button.getAttribute('data-enroll'), 10);
        if (Number.isNaN(courseId)) {
            return;
        }
        enrollInCourse(courseId, button);
    });
}

if (courseSearch) { // Live search listener
    courseSearch.addEventListener('input', () => {
        applyCourseFilter();
    });
}

function openModal() { // Opens enrolled modal
    if (enrolledModal && !enrolledModal.classList.contains('hidden')) {
        return;
    }
    enrolledModal?.classList.remove('hidden');
}

function closeModal() { // Closes modal
    enrolledModal?.classList.add('hidden');
}

if (enrolledCard) { // Opens modal when card clicked
    enrolledCard.addEventListener('click', () => {
        if (!enrolledCourses.length) {
            return;
        }
        openModal();
    });
}

if (modalCloseButton) { // Close button handler
    modalCloseButton.addEventListener('click', closeModal);
}

if (enrolledModal) { // Allow click outside to close
    enrolledModal.addEventListener('click', (event) => {
        if (event.target === enrolledModal) {
            closeModal();
        }
    });
}
