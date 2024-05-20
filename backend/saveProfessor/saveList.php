<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
require_once '../db_config.php';

function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    return $conn;
}

// Function to fetch saved professors
function getSavedProfessors($userID, $conn)
{
    $stmt = $conn->prepare("
        SELECT p.professorID, p.professors
        FROM saved_professors sp
        JOIN professors p ON sp.professorID = p.professorID
        WHERE sp.userID = ?
    ");
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);  // Fetches the results as an associative array
}

$conn = getDbConnection();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $request_body = file_get_contents('php://input');
    $data = json_decode($request_body, true);

    $sessionID = $data['sessionID'] ?? null;
    $action = $data['action'] ?? '';
    $professorName = $data['professorName'] ?? '';

    if (!$sessionID) {
        exit(json_encode(['error' => 'Session ID is missing.']));
    }


    // Query the `sessions` table to get the userID associated with the sessionID
    $stmt = $conn->prepare("SELECT userID FROM `sessions` WHERE sessionID = ?");
    $stmt->bind_param("s", $sessionID);
    $stmt->execute();
    $stmt->bind_result($userID);
    $stmt->fetch();
    $stmt->close();

    if (!$userID) {
        exit(json_encode(['error' => 'User not authenticated.']));
    }

    if (empty($professorName)) {
        exit(json_encode(['error' => 'Professor name is required.']));
    }

    // Query the `professors` table to get the professor's ID based on the professor's name
    $stmt = $conn->prepare("SELECT professorID FROM `professors` WHERE `professors` = ?");
    $stmt->bind_param("s", $professorName);
    $stmt->execute();
    $stmt->bind_result($professorID);
    $stmt->fetch();
    $stmt->close();

    if (!$professorID) {
        exit(json_encode(['error' => 'Professor not found.']));
    }
    if ($action === 'fetch') {
        $savedProfessors = getSavedProfessors($userID, $conn);
        exit(json_encode(['saved_professors' => $savedProfessors]));
    }

    if ($action === 'save') {
        $stmt = $conn->prepare("INSERT INTO saved_professors (userID, professorID) VALUES (?, ?) ON DUPLICATE KEY UPDATE professorID = professorID");
        $stmt->bind_param("ii", $userID, $professorID);
    } elseif ($action === 'remove') {
        $stmt = $conn->prepare("DELETE FROM saved_professors WHERE userID = ? AND professorID = ?");
        $stmt->bind_param("ii", $userID, $professorID);
    } else {
        exit(json_encode(['error' => 'Invalid action.']));
    }

    if ($stmt->execute()) {
        $response = [
            'message' => 'Action completed successfully.',
            'saved_professors' => getSavedProfessors($userID, $conn)  // Fetch and return the updated list of saved professors
        ];
        exit(json_encode($response));
    } else {
        exit(json_encode(['error' => $conn->error]));
    }
}

$conn->close();
