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

// Main request handling
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $request_body = file_get_contents('php://input');
    $data = json_decode($request_body, true);

    $sessionID = $data['sessionID'] ?? null;
    $professorID = $data['professorID'] ?? null;

    if (!$sessionID || !$professorID) {
        exit(json_encode(['error' => 'Session ID and Professor ID are required.']));
    }

    $conn = getDbConnection();

    // Check if the professor is saved by the user
    $stmt = $conn->prepare("SELECT COUNT(*) FROM saved_professors WHERE userID = (SELECT userID FROM sessions WHERE sessionID = ?) AND professorID = ?");
    $stmt->bind_param("si", $sessionID, $professorID);
    $stmt->execute();
    $stmt->store_result();
    $stmt->bind_result($count);
    $stmt->fetch();
    $stmt->close();

    $isSaved = $count > 0;

    exit(json_encode(['isSaved' => $isSaved]));
}

function getDbConnection() {
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}
?>
