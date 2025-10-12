<?php // Opens PHP script for handling user registration
header('Content-Type: application/json'); // Sets response header to JSON
require_once __DIR__ . '/db-connect.php'; // Includes database connection script

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Ensures request is POST
    http_response_code(405); // Sets HTTP status for invalid method
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']); // Responds with error
    exit; // Stops execution
} // Ends method check

$firstName = trim($_POST['first_name'] ?? ''); // Retrieves and trims first name
$lastName = trim($_POST['last_name'] ?? ''); // Retrieves and trims last name
$email = trim($_POST['email'] ?? ''); // Retrieves and trims email
$password = $_POST['password'] ?? ''; // Retrieves password
$securityQuestion = trim($_POST['security_question'] ?? ''); // Retrieves selected security question
$securityAnswer = trim($_POST['security_answer'] ?? ''); // Retrieves security answer

if ($firstName === '' || $lastName === '' || $email === '' || $password === '' || $securityQuestion === '' || $securityAnswer === '') { // Validates all fields present
    echo json_encode(['success' => false, 'message' => 'All fields are required.']); // Returns validation error
    exit; // Stops execution
} // Ends field requirement check

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { // Validates email format
    echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']); // Returns invalid email message
    exit; // Stops execution
} // Ends email validation

$existingQuery = $connection->prepare('SELECT id FROM users WHERE email = ?'); // Prepares query to check for existing email
$existingQuery->bind_param('s', $email); // Binds email parameter
$existingQuery->execute(); // Executes the query
$existingQuery->store_result(); // Stores result for row count

if ($existingQuery->num_rows > 0) { // Checks if email already exists
    echo json_encode(['success' => false, 'message' => 'An account with this email already exists.']); // Returns duplicate email message
    $existingQuery->close(); // Closes the query
    exit; // Stops execution
} // Ends duplicate email check

$existingQuery->close(); // Closes query after use

$insertQuery = $connection->prepare('INSERT INTO users (first_name, last_name, email, password, security_question, security_answer) VALUES (?, ?, ?, ?, ?, ?)'); // Prepares insert statement
$insertQuery->bind_param('ssssss', $firstName, $lastName, $email, $password, $securityQuestion, $securityAnswer); // Binds user data to statement using plain-text values
$success = $insertQuery->execute(); // Executes insertion and captures result

if (!$success) { // Checks if insertion failed
    echo json_encode(['success' => false, 'message' => 'Failed to create account. Please try again.']); // Returns error message
    $insertQuery->close(); // Closes statement
    exit; // Stops execution
} // Ends insertion failure check

$insertQuery->close(); // Closes insert statement

echo json_encode(['success' => true, 'message' => 'Registration successful.']); // Returns success response
