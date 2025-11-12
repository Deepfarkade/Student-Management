<?php
header('Content-Type: application/json');
require_once __DIR__ . '/db-connect.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Session expired.']);
    exit;
}

$userId = (int) $_SESSION['user_id'];

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        handleGetCourses($connection, $userId);
        break;
    case 'POST':
        handleEnrollCourse($connection, $userId);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Unsupported method.']);
        break;
}

function handleGetCourses(mysqli $connection, int $userId): void
{
    ensureDefaultEnrollments($connection, $userId);

    $enrolled = [];
    $enrolledStmt = $connection->prepare('SELECT uc.course_id AS id, COALESCE(c.title, uc.course_name) AS title, c.category, c.summary, uc.enrolled_at FROM user_courses uc LEFT JOIN courses c ON c.id = uc.course_id WHERE uc.user_id = ? ORDER BY title');
    if ($enrolledStmt) {
        $enrolledStmt->bind_param('i', $userId);
        $enrolledStmt->execute();
        $enrolledResult = $enrolledStmt->get_result();
        while ($row = $enrolledResult->fetch_assoc()) {
            $enrolled[] = [
                'id' => (int) $row['id'],
                'title' => $row['title'],
                'category' => $row['category'],
                'summary' => $row['summary'],
                'enrolled_at' => $row['enrolled_at']
            ];
        }
        $enrolledStmt->close();
    }

    if (isset($_GET['action']) && $_GET['action'] === 'detail') {
        $courseId = isset($_GET['id']) ? (int) $_GET['id'] : 0;
        $course = fetchCourseDetail($connection, $userId, $courseId);
        if (!$course) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Course not found.']);
            return;
        }
        echo json_encode(['success' => true, 'course' => $course, 'enrolled' => $enrolled]);
        return;
    }

    $catalog = [];
    $catalogStmt = $connection->prepare('SELECT c.id, c.title, c.category, c.summary, (uc.user_id IS NOT NULL) AS enrolled FROM courses c LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ? ORDER BY c.title');
    if ($catalogStmt) {
        $catalogStmt->bind_param('i', $userId);
        $catalogStmt->execute();
        $catalogResult = $catalogStmt->get_result();
        while ($row = $catalogResult->fetch_assoc()) {
            $catalog[] = [
                'id' => (int) $row['id'],
                'title' => $row['title'],
                'category' => $row['category'],
                'summary' => $row['summary'],
                'enrolled' => (bool) $row['enrolled']
            ];
        }
        $catalogStmt->close();
    }

    echo json_encode(['success' => true, 'enrolled' => $enrolled, 'catalog' => $catalog]);
}

function handleEnrollCourse(mysqli $connection, int $userId): void
{
    $payload = json_decode(file_get_contents('php://input'), true);
    $courseId = isset($payload['course_id']) ? (int) $payload['course_id'] : 0;
    if ($courseId <= 0) {
        http_response_code(422);
        echo json_encode(['success' => false, 'message' => 'Select a course to enroll.']);
        return;
    }

    $courseStmt = $connection->prepare('SELECT id, title FROM courses WHERE id = ?');
    if (!$courseStmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to access course catalog.']);
        return;
    }
    $courseStmt->bind_param('i', $courseId);
    $courseStmt->execute();
    $courseResult = $courseStmt->get_result();
    $courseExists = $courseResult->fetch_assoc();
    $courseStmt->close();

    if (!$courseExists) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Course not found.']);
        return;
    }

    $enrollStmt = $connection->prepare('INSERT IGNORE INTO user_courses (user_id, course_id, course_name) VALUES (?, ?, ?)');
    if (!$enrollStmt) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Unable to update enrollment.']);
        return;
    }
    $courseTitle = $courseExists['title'];
    $enrollStmt->bind_param('iis', $userId, $courseId, $courseTitle);
    $enrollStmt->execute();
    $changes = $connection->affected_rows;
    $enrollStmt->close();

    echo json_encode([
        'success' => true,
        'message' => $changes > 0 ? 'Enrolled successfully.' : 'You are already enrolled in this course.'
    ]);
}

function ensureDefaultEnrollments(mysqli $connection, int $userId): void
{
    $countStmt = $connection->prepare('SELECT COUNT(*) AS total FROM user_courses WHERE user_id = ?');
    if (!$countStmt) {
        return;
    }
    $countStmt->bind_param('i', $userId);
    $countStmt->execute();
    $countResult = $countStmt->get_result()->fetch_assoc();
    $countStmt->close();

    if ($countResult && (int) $countResult['total'] > 0) {
        return;
    }

    $defaults = ['Python Fundamentals', 'Data Structures & Algorithms', 'C Programming Essentials', 'C++ Programming Fundamentals'];
    $placeholders = implode(',', array_fill(0, count($defaults), '?'));
    $courseStmt = $connection->prepare("SELECT id, title FROM courses WHERE title IN ($placeholders)");
    if (!$courseStmt) {
        return;
    }
    $courseStmt->bind_param(str_repeat('s', count($defaults)), ...$defaults);
    $courseStmt->execute();
    $result = $courseStmt->get_result();
    $courses = [];
    while ($row = $result->fetch_assoc()) {
        $courses[] = [
            'id' => (int) $row['id'],
            'title' => $row['title']
        ];
    }
    $courseStmt->close();

    if (empty($courses)) {
        return;
    }

    $insertStmt = $connection->prepare('INSERT IGNORE INTO user_courses (user_id, course_id, course_name) VALUES (?, ?, ?)');
    if (!$insertStmt) {
        return;
    }
    foreach ($courses as $course) {
        $courseId = $course['id'];
        $courseTitle = $course['title'];
        $insertStmt->bind_param('iis', $userId, $courseId, $courseTitle);
        $insertStmt->execute();
    }
    $insertStmt->close();
}

function fetchCourseDetail(mysqli $connection, int $userId, int $courseId): ?array
{
    if ($courseId <= 0) {
        return null;
    }

    $stmt = $connection->prepare('SELECT c.id, COALESCE(c.title, uc.course_name) AS title, c.category, c.summary, (uc.user_id IS NOT NULL) AS enrolled FROM courses c LEFT JOIN user_courses uc ON uc.course_id = c.id AND uc.user_id = ? WHERE c.id = ?');
    $stmt->bind_param('ii', $userId, $courseId);
    $stmt->execute();
    $result = $stmt->get_result();
    $course = $result->fetch_assoc();
    $stmt->close();

    if (!$course) {
        return null;
    }

    return [
        'id' => (int) $course['id'],
        'title' => $course['title'],
        'category' => $course['category'],
        'summary' => $course['summary'],
        'enrolled' => (bool) $course['enrolled']
    ];
}
