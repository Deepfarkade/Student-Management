<?php // Opens PHP tag for database connection helper
session_start(); // Starts PHP session to manage authentication state across endpoints

$host = '127.0.0.1'; // Defines the MySQL host name based on the provided Workbench connection
$username = 'root'; // Defines the MySQL username matching the Workbench setup
$password = 'Qwerty@123'; // Defines the MySQL password sourced from the Workbench configuration
$database = 'student_crm'; // Defines the database name (ensure schema is created)

$connection = new mysqli($host, $username, $password, $database); // Establishes a new MySQLi connection using provided credentials

if ($connection->connect_error) { // Checks if a connection error occurred
    http_response_code(500); // Sets HTTP status to 500 for server error
    echo json_encode(['success' => false, 'message' => 'Database connection failed.']); // Returns JSON error response
    exit; // Stops further script execution due to connection failure
} // Ends connection error check

$connection->set_charset('utf8mb4'); // Ensures the connection uses UTF-8 encoding for text handling
