<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
require_once '../db_config.php';

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Stop script execution after sending preflight response
    exit(0);
}

// Get the database connection
function getDbConnection() {
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

// Main request handling
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $request_body = file_get_contents('php://input');
    $data = json_decode($request_body, true);

    $action = $data['action'] ?? null; // Retrieve the action from the decoded data

    if ($action !== 'remove') {
        exit(json_encode(['error' => 'Invalid action.']));
    }

    $userID = $data['userID'] ?? null;
    $professorID = $data['professorID'] ?? null;

    if (!$userID || !$professorID) {
        exit(json_encode(['error' => 'UserID and ProfessorID are required.']));
    }

    $conn = getDbConnection();

    // Remove the saved professor entry associated with the provided userID and professorID
    $stmt = $conn->prepare("DELETE FROM saved_professors WHERE userID = ? AND professorID = ?");
    $stmt->bind_param("ii", $userID, $professorID);

    if ($stmt->execute()) {
        exit(json_encode(['success' => 'Professor removed successfully.']));
    } else {
        exit(json_encode(['error' => 'Failed to remove the professor.']));
    }

    $stmt->close();
    $conn->close();
}
?>
