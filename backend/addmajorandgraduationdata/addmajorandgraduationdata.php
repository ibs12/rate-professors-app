<?php
require_once '../db_config.php';

header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['sessionID']) || !isset($data['major']) || !isset($data['graduationYear'])) {
    $missingFields = [];
    if (!isset($data['sessionID'])) $missingFields[] = "sessionID";
    if (!isset($data['major'])) $missingFields[] = "major";
    if (!isset($data['graduationYear'])) $missingFields[] = "graduationYear";
    echo json_encode(["status" => "error", "message" => "The following fields are required: " . implode(', ', $missingFields)]);
    exit;
}

$sessionID = $data['sessionID'];
$major = $data['major'];
$graduationYear = $data['graduationYear'];

if (empty($sessionID) || empty($major) || empty($graduationYear)) {
    $emptyFields = [];
    if (empty($sessionID)) $emptyFields[] = "sessionID";
    if (empty($major)) $emptyFields[] = "major";
    if (empty($graduationYear)) $emptyFields[] = "graduationYear";
    echo json_encode(["status" => "error", "message" => "The following fields cannot be empty: " . implode(', ', $emptyFields)]);
    exit;
}

function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["message" => "Failed to connect to the database: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

$conn = getDbConnection();

$sql = "SELECT userID FROM sessions WHERE sessionID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $sessionID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $userID = $row['userID'];

    $checkUserSql = "SELECT major, graduationYear FROM users WHERE userID = ?";
    $stmt = $conn->prepare($checkUserSql);
    $stmt->bind_param("i", $userID);
    $stmt->execute();
    $userResult = $stmt->get_result();
    $userRow = $userResult->fetch_assoc();
    $oldMajor = $userRow['major'];
    $oldGraduationYear = $userRow['graduationYear'];

    $majorChanged = ($major !== $oldMajor);
    $graduationYearChanged = ($graduationYear !== $oldGraduationYear);

    if ($majorChanged || $graduationYearChanged) {
        $updateSql = "UPDATE users SET major = ?, graduationYear = ? WHERE userID = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("ssi", $major, $graduationYear, $userID);
        if ($stmt->execute()) {
            $message = "User's ID: $userID\n";
            $message .= $majorChanged ? "Old major: $oldMajor, New major: $major\n" : "Major: $major is the same as the old one\n";
            $message .= $graduationYearChanged ? "Old graduation date: $oldGraduationYear, New graduation date: $graduationYear\n" : "Graduation date: $graduationYear is the same as the old one\n";

            // Update major in prof_reviews as well
            $updateProfReviewsSql = "UPDATE prof_reviews SET major = ? WHERE userID = ?";
            $stmt = $conn->prepare($updateProfReviewsSql);
            $stmt->bind_param("si", $major, $userID);
            $stmt->execute();

            echo json_encode(["status" => "success", "message" => "User's major and graduation year updated successfully in users and prof_reviews tables.", "changes" => $message]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to update user's major and graduation year."]);
        }
    } else {
        echo json_encode(["status" => "success", "message" => "No updates necessary."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "SessionID not found."]);
}

$stmt->close();
$conn->close();
