<?php

// Include database configuration file
include '../db_config.php';


// Define an array of allowed origins
$allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8000',
    'https://www-student.cse.buffalo.edu'
];

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Stop script execution after sending preflight response
    exit(0);
}


// Check if the request is a POST request
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data["email"]) && isset($data["sessionId"]) && isset($data["userID"])) {
        $post_email = $data["email"]; // Use a different variable name here
        $sessionId = $data["sessionId"];
        $userID = $data["userID"];

        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname); // Now, $username is the username for the database connection

        // Check connection
        if ($conn->connect_error) {
            http_response_code(500);
            echo json_encode(["message" => "Failed to connect to database: " . $conn->connect_error]);
            exit;
        }


        // Prepare SQL statements
        $stmtUser = $conn->prepare("SELECT * FROM users WHERE email = ? AND userID = ?");
        $stmtSession = $conn->prepare("SELECT * FROM sessions WHERE userID = ?");

        // Bind parameters and execute statements
        $stmtUser->bind_param("si", $post_email, $userID); // Use $post_username here
        $stmtUser->execute();
        $userResult = $stmtUser->get_result();

        if ($userResult->num_rows > 0) {
            $stmtSession->bind_param("i", $userID);
            $stmtSession->execute();
            $sessionResult = $stmtSession->get_result();

            // Check if user and session are valid
            if ($sessionResult->num_rows > 0) {
                // Prepare delete statements
                $stmtDeleteUser = $conn->prepare("DELETE FROM users WHERE userID = ?");
                $stmtDeleteSession = $conn->prepare("DELETE FROM sessions WHERE userID = ?");

                // Execute delete statements
                $stmtDeleteUser->bind_param("i", $userID);
                $stmtDeleteUser->execute();

                $stmtDeleteSession->bind_param("i", $userID);
                $stmtDeleteSession->execute();

                // Return success response
                http_response_code(200);
                echo json_encode(['status' => 'success', 'message' => 'Account and session deleted successfully']);
            } else {
                // Return error response
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid sessionId']);
            }
        } else {
            // Return error response
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Invalid username or userID']);
        }
    } else {
        http_response_code(400); // Bad request
        echo json_encode(["message" => "Invalid request"]);
    }

    exit;
} else {
    http_response_code(405);
    echo json_encode(["message" => "Method not allowed"]);
}
?>