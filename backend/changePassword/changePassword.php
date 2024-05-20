<?php
// Set up error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set content type to JSON
header('Content-Type: application/json');

// Include database configuration
require_once '../db_config.php';

// Get input data from frontend
$data = json_decode(file_get_contents('php://input'), true);

// Check if request method is OPTIONS (preflight request)
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
        // Error connecting to the database
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to connect to the database: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

// Function to hash password
function hashPassword($password)
{
    return password_hash($password, PASSWORD_DEFAULT);
}

// Function to update user's password
function updatePassword($userId, $newPassword)
{
    $conn = getDbConnection();

    // Hash the new password
    $hashedPassword = hashPassword($newPassword);

    // Prepare statement to update password
    if ($stmt = $conn->prepare("UPDATE users SET password = ? WHERE userID = ?")) {
        $stmt->bind_param("si", $hashedPassword, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            // Password updated successfully
            echo json_encode(["status" => "success", "message" => "Password updated successfully."]);
        } else {
            // No rows affected, password not updated
            http_response_code(400); // Bad Request
            echo json_encode(["status" => "error", "message" => "Failed to update password."]);
        }

        $stmt->close();
    } else {
        // Statement preparation failed
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
    }

    $conn->close();
}

// Function to get user's password hash
function getUserPasswordHash($userId)
{
    $conn = getDbConnection();

    // Prepare statement to get user's password hash
    if ($stmt = $conn->prepare("SELECT password FROM users WHERE userID = ?")) {
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $passwordHash = $row['password'];
            $stmt->close();
            return $passwordHash;
        } else {
            // No user found
            http_response_code(404); // Not Found
            echo json_encode(["status" => "error", "message" => "User not found."]);
            exit;
        }
    } else {
        // Statement preparation failed
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
        exit;
    }

    $conn->close();
}

// Extract session ID, old password, and new password from input data
$sessionId = $data['sessionID'] ?? null;
$oldPassword = $data['oldpassword'] ?? null;
$newPassword = $data['newpassword'] ?? null;

// Validate input data
if (is_null($sessionId) || is_null($oldPassword) || is_null($newPassword)) {
    // Session ID, old password, or new password not provided
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Session ID, old password, or new password not provided."]);
    exit;
}

// Check if session ID is valid and get userID
$conn = getDbConnection();

if ($stmt = $conn->prepare("SELECT userID FROM sessions WHERE sessionID = ?")) {
    $stmt->bind_param("s", $sessionId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        $userId = $row['userID'];
        $stmt->close();

        // Get user's password hash
        $userPasswordHash = getUserPasswordHash($userId);

        // Verify old password
        if (password_verify($oldPassword, $userPasswordHash)) {
            // Old password is correct, update password
            updatePassword($userId, $newPassword);
        } else {
            // Old password is incorrect
            http_response_code(401); // Unauthorized
            echo json_encode(["status" => "error", "message" => "Incorrect old password."]);
        }
    } else {
        // Session ID not found or multiple records found
        http_response_code(404); // Not Found
        echo json_encode(["status" => "error", "message" => "Invalid session ID."]);
    }
} else {
    // Statement preparation failed
    http_response_code(500); // Server error
    echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
}

$conn->close();
?>
