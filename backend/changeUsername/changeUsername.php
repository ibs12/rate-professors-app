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

// Function to update username based on userID
function updateUsername($userId, $newUsername)
{
    $conn = getDbConnection();

    if ($stmt = $conn->prepare("UPDATE users SET username = ? WHERE userID = ?")) {
        $stmt->bind_param("si", $newUsername, $userId);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            // Username updated successfully in users table, now update prof_reviews
            $stmt->close(); // Close the previous statement

            // Prepare statement to update username in prof_reviews table
            if ($stmt = $conn->prepare("UPDATE prof_reviews SET username = ? WHERE userID = ?")) {
                $stmt->bind_param("si", $newUsername, $userId);
                $stmt->execute();

                if ($stmt->affected_rows > 0) {
                    // Username updated successfully in prof_reviews
                    $conn->commit(); // Commit the transaction
                    echo json_encode(["status" => "success", "message" => "Username updated successfully in both tables."]);
                } else {
                    // No rows affected in prof_reviews, still commit because user table was updated
                    $conn->commit();
                    echo json_encode(["status" => "success", "message" => "Username updated in users table but no matching records in prof_reviews."]);
                }
            }
        }
    } else {
        // Statement preparation failed
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
    }

    $conn->close();
}

// Function to check if username is already taken
function isUsernameTaken($newUsername)
{
    $conn = getDbConnection();

    // Prepare statement to check if username exists
    if ($stmt = $conn->prepare("SELECT username FROM users WHERE username = ?")) {
        $stmt->bind_param("s", $newUsername);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Username already exists
            return true;
        } else {
            // Username is available
            return false;
        }

        $stmt->close();
    } else {
        // Statement preparation failed
        http_response_code(500); // Server error
        echo json_encode(["message" => "Failed to prepare statement: " . $conn->error]);
    }

    $conn->close();
}

// Function to get current username for a given userID
function getCurrentUsername($userId)
{
    $conn = getDbConnection();

    // Prepare statement to get current username
    if ($stmt = $conn->prepare("SELECT username FROM users WHERE userID = ?")) {
        $stmt->bind_param("i", $userId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 1) {
            $row = $result->fetch_assoc();
            $currentUsername = $row['username'];
            $stmt->close();
            return $currentUsername;
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

// Extract session ID and new username from input data
$sessionId = $data['sessionID'] ?? null;
$newUsername = $data['username'] ?? null;

// Validate input data
if (is_null($sessionId) || is_null($newUsername)) {
    // Session ID or new username not provided
    http_response_code(400); // Bad Request
    echo json_encode(["status" => "error", "message" => "Session ID or new username not provided."]);
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

        // Check if the new username is the same as the current username
        $currentUsername = getCurrentUsername($userId);
        if ($newUsername === $currentUsername) {
            // User is trying to change to the same username
            http_response_code(400); // Bad Request
            echo json_encode(["status" => "error", "message" => "You already have this username."]);
            exit;
        }

        // Check if username is already taken
        if (isUsernameTaken($newUsername)) {
            // Username is already taken
            http_response_code(409); // Conflict
            echo json_encode(["status" => "error", "message" => "Username already taken."]);
            exit;
        }

        // Update username
        updateUsername($userId, $newUsername);
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
