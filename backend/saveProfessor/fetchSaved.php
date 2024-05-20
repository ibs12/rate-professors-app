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

function getProfessorsByUserID($userID, $conn) {
    $stmt = $conn->prepare("
        SELECT p.professorID, p.professors, p.department, p.pfppath, p.total_average
        FROM saved_professors sp
        JOIN professors p ON sp.professorID = p.professorID
        WHERE sp.userID = ?
    ");
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_all(MYSQLI_ASSOC);
}

// Main request handling
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $request_body = file_get_contents('php://input');
    $data = json_decode($request_body, true);

    $userID = $data['userID'] ?? null;

    if (!$userID) {
        exit(json_encode(['error' => 'UserID is required.']));
    }

    $conn = getDbConnection();
    $professors = getProfessorsByUserID($userID, $conn);
    $conn->close();

    if (count($professors) > 0) {
        exit(json_encode(['saved_professors' => $professors]));
    } else {
        exit(json_encode(['error' => 'No saved professors found for this user.']));
    }
}
?>
