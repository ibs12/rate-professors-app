<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

require_once '../db_config.php';
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Stop script execution after sending preflight response
    exit(0);
}

// Function to establish database connection
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

// Function to fetch quiz result based on session ID
function fetchQuizResult($sessionId)
{
    $conn = getDbConnection();

    // Prepare statement to fetch quiz result
    if ($stmt = $conn->prepare("SELECT quiz_result FROM users WHERE userID IN (SELECT userID FROM sessions WHERE sessionID = ?)")) {
        $stmt->bind_param("s", $sessionId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $quizResult = $row['quiz_result'];
            $stmt->close();
            return $quizResult;
        } elseif ($result->num_rows == 0) {
            $stmt->close();
            return "No user found for the given session ID"; // No user found
        } else {
            $stmt->close();
            return "Multiple users found for the given session ID"; // Multiple users found
        }
    } else {
        $conn->close();
        return "Statement preparation failed"; // Statement preparation failed
    }
}

// Extract session ID from input data
$sessionId = $data['sessionID'] ?? null;

// Attempt to fetch quiz result
if (!is_null($sessionId)) {
    $quizResult = fetchQuizResult($sessionId);

    if ($quizResult === "No user found for the given session ID") {
        http_response_code(401); // Unauthorized
        echo json_encode(["status" => "error", "message" => "No user found for the given session ID"]);
    } elseif ($quizResult === "Multiple users found for the given session ID") {
        http_response_code(401); // Unauthorized
        echo json_encode(["status" => "error", "message" => "Multiple users found for the given session ID"]);
    } elseif (is_null($quizResult)) {
        // Quiz result is NULL, redirect user to quiz page
        echo json_encode(["status" => "success", "message" => "User needs to take a quiz."]);
        exit;
    } else {
        // Quiz result is not NULL, do nothing
        echo json_encode(["status" => "success", "message" => "User does not need to take a quiz."]);
    }
} else {
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Session ID not provided."]);
}
?>
