<?php // Opens PHP script for handling logout requests
header('Content-Type: application/json'); // Sets response header to JSON
require_once __DIR__ . '/db-connect.php'; // Includes database connection script to ensure session is started

$_SESSION = []; // Clears session array data
if (ini_get('session.use_cookies')) { // Checks if session cookies are in use
    $params = session_get_cookie_params(); // Retrieves session cookie parameters
    setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']); // Expires the session cookie
} // Ends cookie check
session_destroy(); // Destroys the session on the server side

echo json_encode(['success' => true, 'message' => 'Logged out successfully.']); // Returns success response
