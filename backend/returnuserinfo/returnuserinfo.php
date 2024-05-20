<?php
require_once '../db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Set up error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Prevent MIME sniffing
header('X-Content-Type-Options: nosniff');

// Check if request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Stop script execution after sending preflight response
    exit(0);
}

// Get JSON content from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Check if sessionID is provided in the request body
if (!isset($data['sessionID'])) {
    echo json_encode(["status" => "error", "message" => "SessionID is required."]);
    exit;
}

$sessionID = $data['sessionID'];

// Connect to the database
$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Query to get userID from sessions table
$sessionQuery = "SELECT userID FROM sessions WHERE sessionID = ?";
$stmt = $conn->prepare($sessionQuery);
$stmt->bind_param("s", $sessionID);
$stmt->execute();
$sessionResult = $stmt->get_result();

if ($sessionResult->num_rows > 0) {
    $sessionRow = $sessionResult->fetch_assoc();
    $userID = $sessionRow['userID'];

    // Query to get username, quiz_result, major, and graduationYear from users table
    $userQuery = "SELECT username, quiz_result, major, graduationYear FROM users WHERE userID = ?";
    $stmt = $conn->prepare($userQuery);
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $userResult = $stmt->get_result();

    if ($userResult->num_rows > 0) {
        $userRow = $userResult->fetch_assoc();
        $username = $userRow['username'];
        $quizResult = $userRow['quiz_result'];
        $major = $userRow['major'];
        $graduationYear = $userRow['graduationYear'];

        // Return username, quiz_result, major, and graduationYear
        echo json_encode(["status" => "success", "username" => $username, "quiz_result" => $quizResult, "major" => $major, "graduationYear" => $graduationYear]);
    } else {
        echo json_encode(["status" => "error", "message" => "User not found."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "SessionID not found."]);
}

// Close database connection
$stmt->close();
$conn->close();
?>
