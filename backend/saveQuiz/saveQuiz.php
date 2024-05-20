<?php
// Include database configuration
require_once '../db_config.php';
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://www-student.cse.buffalo.edu'
];



// Get the origin of the current request
$requestOrigin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// Check if the request origin is in the allowed origins list
if (in_array($requestOrigin, $allowedOrigins)) {
// If so, set the Access-Control-Allow-Origin header to the request origin
header("Access-Control-Allow-Origin: $requestOrigin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
} else {
// Optionally handle requests from disallowed origins, such as logging or sending a specific response
// For now, we'll simply exit to prevent further execution for disallowed origins
exit('Origin not allowed');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
// Stop script execution after sending preflight response
exit(0);
}



function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to connect to the database: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

$mysqli = getDbConnection();

// Retrieve request body
$request_body = file_get_contents('php://input');

// Decode JSON data
$data = json_decode($request_body, true);

// Retrieve sessionID from the decoded data
$sessionID = $data['sessionID'] ?? null;

if ($sessionID) {
    // Query the 'users' table to get the userID associated with the sessionID
    $stmt = $mysqli->prepare("SELECT userID FROM `sessions` WHERE sessionID = ?");
    $stmt->bind_param("s", $sessionID);
    $stmt->execute();
    $stmt->bind_result($userID);
    $stmt->fetch();
    $stmt->close();

    if ($userID) {
        // Update the 'users' table with quiz results
        $quizResult = $data['quizResult'] ?? null;
        if ($quizResult) {
            $stmt = $mysqli->prepare("UPDATE users SET quiz_result = ? WHERE userID = ?");
            $stmt->bind_param("si", $quizResult, $userID);
            $stmt->execute();
            $stmt->close();
            echo json_encode(["message" => "Quiz result updated successfully"]);
        } else {
            http_response_code(400); // Bad request
            echo json_encode(["message" => "Quiz result not provided"]);
        }
    } else {
        http_response_code(404); // Not found
        echo json_encode(["message" => "User not found"]);
    }
} else {
    http_response_code(400); // Bad request
    echo json_encode(["message" => "SessionID not provided"]);
}

// Close the database connection
$mysqli->close();
?>