<?php // Opens PHP script for handling password recovery actions
header('Content-Type: application/json'); // Sets response header to JSON
require_once __DIR__ . '/db-connect.php'; // Includes database connection script

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { // Ensures only POST requests are processed
    http_response_code(405); // Sets HTTP status to 405 Method Not Allowed
    echo json_encode(['success' => false, 'message' => 'Invalid request method.']); // Returns error message
    exit; // Stops execution
} // Ends method check

$action = $_POST['action'] ?? ''; // Retrieves action parameter from request
$email = trim($_POST['email'] ?? ''); // Retrieves and trims email value

if ($email === '' && $action !== 'fetch_question') { // Validates email presence for actions requiring it
    echo json_encode(['success' => false, 'message' => 'Email is required.']); // Returns validation message
    exit; // Stops execution
} // Ends email validation

switch ($action) { // Begins action handling switch block
    case 'fetch_question': // Handles fetching security question
        handleFetchQuestion($connection); // Invokes helper for question retrieval
        break; // Exits switch case
    case 'verify_answer': // Handles verifying security answer
        handleVerifyAnswer($connection); // Invokes helper for answer verification
        break; // Exits switch case
    case 'reset_password': // Handles password reset logic
        handleResetPassword($connection); // Invokes helper for password reset
        break; // Exits switch case
    default: // Handles unknown actions
        echo json_encode(['success' => false, 'message' => 'Unknown action requested.']); // Returns error for unsupported action
        break; // Exits switch case
} // Ends switch statement

function handleFetchQuestion(mysqli $connection): void { // Defines helper to fetch security question
    $email = trim($_POST['email'] ?? ''); // Retrieves email from POST data
    if ($email === '') { // Validates email presence
        echo json_encode(['success' => false, 'message' => 'Email is required to fetch security question.']); // Returns validation message
        return; // Exits function
    } // Ends email validation
    $query = $connection->prepare('SELECT security_question FROM users WHERE email = ?'); // Prepares statement to fetch question
    $query->bind_param('s', $email); // Binds email parameter
    $query->execute(); // Executes query
    $result = $query->get_result(); // Retrieves result set
    $user = $result->fetch_assoc(); // Fetches associative array
    $query->close(); // Closes statement
    if (!$user) { // Checks if user not found
        echo json_encode(['success' => false, 'message' => 'No account found with that email.']); // Returns error message
        return; // Exits function
    } // Ends user check
    echo json_encode(['success' => true, 'security_question' => $user['security_question']]); // Returns question in success response
} // Ends fetch question helper

function handleVerifyAnswer(mysqli $connection): void { // Defines helper to verify security answer
    $email = trim($_POST['email'] ?? ''); // Retrieves email from POST data
    $answer = trim($_POST['security_answer'] ?? ''); // Retrieves security answer from POST data
    if ($email === '' || $answer === '') { // Validates required fields
        echo json_encode(['success' => false, 'message' => 'Email and answer are required.']); // Returns validation message
        return; // Exits function
    } // Ends validation
    $query = $connection->prepare('SELECT security_answer FROM users WHERE email = ?'); // Prepares query to fetch stored answer hash
    $query->bind_param('s', $email); // Binds email parameter
    $query->execute(); // Executes query
    $result = $query->get_result(); // Retrieves result set
    $user = $result->fetch_assoc(); // Fetches associative array
    $query->close(); // Closes statement
    if (!$user) { // Checks if user not found
        echo json_encode(['success' => false, 'message' => 'No account found with that email.']); // Returns error message
        return; // Exits function
    } // Ends user check
    $isValid = password_verify(strtolower($answer), $user['security_answer']); // Verifies lowercase answer against hashed value
    if (!$isValid) { // Checks if verification failed
        echo json_encode(['success' => false, 'message' => 'Security answer is incorrect.']); // Returns failure message
        return; // Exits function
    } // Ends verification failure check
    echo json_encode(['success' => true, 'message' => 'Security answer verified.']); // Returns success response
} // Ends verify answer helper

function handleResetPassword(mysqli $connection): void { // Defines helper to reset password
    $email = trim($_POST['email'] ?? ''); // Retrieves email from POST data
    $newPassword = $_POST['new_password'] ?? ''; // Retrieves new password from POST data
    if ($email === '' || $newPassword === '') { // Validates required fields
        echo json_encode(['success' => false, 'message' => 'Email and new password are required.']); // Returns validation message
        return; // Exits function
    } // Ends validation
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT); // Hashes new password securely
    $query = $connection->prepare('UPDATE users SET password = ? WHERE email = ?'); // Prepares update statement
    $query->bind_param('ss', $hashedPassword, $email); // Binds hashed password and email
    $success = $query->execute(); // Executes update and stores result
    $query->close(); // Closes statement
    if (!$success || $connection->affected_rows === 0) { // Checks if update failed or affected no rows
        echo json_encode(['success' => false, 'message' => 'Unable to update password.']); // Returns failure message
        return; // Exits function
    } // Ends update failure check
    echo json_encode(['success' => true, 'message' => 'Password updated successfully.']); // Returns success response
} // Ends reset password helper
