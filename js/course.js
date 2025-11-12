// Handles individual course preview and enrollment
const courseTitleElement = document.querySelector('#course-title');
const courseCategoryElement = document.querySelector('#course-category');
const courseSummaryElement = document.querySelector('#course-summary');
const courseMetaElement = document.querySelector('#course-meta');
const courseStatusElement = document.querySelector('#course-status');
const enrollButton = document.querySelector('#course-enroll');

const params = new URLSearchParams(window.location.search);
const courseId = Number.parseInt(params.get('id'), 10);

if (!courseId) {
    renderError('Missing course identifier.');
    disableEnroll();
} else {
    bootCoursePage();
}

async function bootCoursePage() {
    const hasSession = await ensureSession();
    if (!hasSession) {
        window.location.href = '../pages/login.html';
        return;
    }
    await loadCourse();
}

async function ensureSession() {
    try {
        const response = await fetch(SESSION_CHECK_URL, { credentials: 'include' });
        const result = await response.json();
        return Boolean(result.success);
    } catch (error) {
        return false;
    }
}

async function loadCourse() {
    try {
        const response = await fetch(`${COURSES_URL}?action=detail&id=${courseId}`, { credentials: 'include' });
        const data = await response.json();
        if (!data.success) {
            renderError(data.message || 'Course not found.');
            disableEnroll();
            return;
        }
        renderCourse(data.course);
    } catch (error) {
        renderError('Unable to load course details right now.');
        disableEnroll();
    }
}

function renderCourse(course) {
    if (courseTitleElement) {
        courseTitleElement.textContent = course.title;
    }
    if (courseCategoryElement) {
        courseCategoryElement.textContent = course.category || 'Featured Program';
    }
    if (courseSummaryElement) {
        courseSummaryElement.textContent = course.summary || 'This curated module helps you build in-demand skills with guided projects and knowledge checks.';
    }
    if (courseMetaElement) {
        courseMetaElement.innerHTML = `
            <span>Format: Self-paced with weekly checkpoints</span>
            <span>Duration: 6 weeks (recommended)</span>
            <span>Effort: 3-5 hours per week</span>
        `;
    }
    updateEnrollState(course.enrolled);
}

function updateEnrollState(isEnrolled) {
    if (!enrollButton) {
        return;
    }
    if (isEnrolled) {
        enrollButton.textContent = 'Enrolled';
        enrollButton.classList.add('btn-outline');
        enrollButton.classList.remove('btn-primary');
        enrollButton.disabled = true;
        enrollButton.setAttribute('aria-disabled', 'true');
        enrollButton.onclick = null;
        if (courseStatusElement) {
            courseStatusElement.textContent = 'You are already enrolled in this course.';
        }
    } else {
        enrollButton.textContent = 'Enroll';
        enrollButton.classList.add('btn-primary');
        enrollButton.classList.remove('btn-outline');
        enrollButton.disabled = false;
        enrollButton.removeAttribute('aria-disabled');
        if (courseStatusElement) {
            courseStatusElement.textContent = 'Secure your seat to add this course to your dashboard.';
        }
        enrollButton.onclick = handleEnrollment;
    }
}

async function handleEnrollment() {
    if (!enrollButton) {
        return;
    }
    enrollButton.onclick = null;
    enrollButton.disabled = true;
    enrollButton.textContent = 'Enrolling…';
    try {
        const response = await fetch(COURSES_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ course_id: courseId })
        });
        const data = await response.json();
        if (!data.success) {
            if (courseStatusElement) {
                courseStatusElement.textContent = data.message || 'Unable to enroll. Try again shortly.';
            }
            enrollButton.disabled = false;
            enrollButton.textContent = 'Enroll';
            enrollButton.onclick = handleEnrollment;
            return;
        }
        if (courseStatusElement) {
            courseStatusElement.textContent = data.message || 'Enrollment confirmed.';
        }
        await loadCourse();
    } catch (error) {
        if (courseStatusElement) {
            courseStatusElement.textContent = 'A network error occurred. Please try again.';
        }
        enrollButton.disabled = false;
        enrollButton.textContent = 'Enroll';
        enrollButton.onclick = handleEnrollment;
    }
}

function renderError(message) {
    if (courseTitleElement) {
        courseTitleElement.textContent = 'Course unavailable';
    }
    if (courseSummaryElement) {
        courseSummaryElement.textContent = message;
    }
    if (courseStatusElement) {
        courseStatusElement.textContent = message;
    }
}

function disableEnroll() {
    if (!enrollButton) {
        return;
    }
    enrollButton.disabled = true;
    enrollButton.classList.remove('btn-primary');
    enrollButton.classList.add('btn-outline');
    enrollButton.textContent = 'Enrollment Closed';
    enrollButton.onclick = null;
}
