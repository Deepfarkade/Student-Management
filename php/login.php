<?php // Opens PHP script for handling login and session checks
header('Content-Type: application/json'); // Sets response header to JSON format
require_once __DIR__ . '/db-connect.php'; // Includes database connection script

if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'session') { // Checks if request is a session validation GET call
    if (isset($_SESSION['user_id'])) { // Determines if a user session exists
        echo json_encode(['success' => true, 'first_name' => $_SESSION['first_name'], 'email' => $_SESSION['email']]); // Returns session information as JSON
    } else { // Handles scenario when no session exists
        echo json_encode(['success' => false, 'message' => 'Session not found.']); // Returns failure message
    } // Ends session existence check
    exit; // Stops script execution after session response
} // Ends session validation block

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Ensures only POST requests reach this point
    http_response_code(405); // Sets HTTP status to 405 Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']); // Returns error message
    exit; // Stops script execution
} // Ends request method check

$email = trim($_POST['email'] ?? ''); // Fetches email from POST data and trims whitespace
$password = $_POST['password'] ?? ''; // Retrieves password from POST data

if ($email === '' || $password === '') { // Validates that both fields are provided
    echo json_encode(['success' => false, 'message' => 'Email and password are required.']); // Returns validation error
    exit; // Stops script execution
} // Ends empty field check

$query = $connection->prepare('SELECT id, first_name, email, password FROM users WHERE email = ? OR email = ?'); // Prepares SQL query to find user by email
$query->bind_param('ss', $email, $email); // Binds email parameter twice for email or username flexibility
$query->execute(); // Executes the prepared statement
$result = $query->get_result(); // Retrieves the result set
$user = $result->fetch_assoc(); // Fetches the user record as associative array

if (!$user || !password_verify($password, $user['password'])) { // Verifies user exists and password matches hash
    echo json_encode(['success' => false, 'message' => 'Invalid email or password.']); // Returns authentication failure message
    $query->close(); // Closes prepared statement
    exit; // Stops script execution
} // Ends authentication check

$_SESSION['user_id'] = $user['id']; // Stores user ID in session
$_SESSION['first_name'] = $user['first_name']; // Stores first name in session
$_SESSION['email'] = $user['email']; // Stores email in session

$query->close(); // Closes prepared statement

echo json_encode(['success' => true, 'message' => 'Login successful.']); // Returns success response
