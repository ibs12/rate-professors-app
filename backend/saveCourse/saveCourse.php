<?php
header('Content-Type: application/json');

ini_set('display_errors', 1); // Keep error reporting on for debugging; consider turning off in production
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
require_once '../db_config.php'; // Include database configuration

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Correctly handle preflight requests
}

// Establish database connection
function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        echo json_encode(['error' => "Connection failed: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

$conn = getDbConnection();

// Main logic for updating professor's classes
$data = json_decode(file_get_contents('php://input'), true);

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $professorID = $data['professorID'] ?? '';
    $courseNumber = $data['courseNumber'] ?? '';
    $courseName = $data['courseName'] ?? '';

    if (empty($professorID) || empty($courseNumber) || empty($courseName)) {
        echo json_encode(['error' => 'ProfessorID, CourseNumber, and CourseName are required.']);
        exit;
    }

    // Fetch current classes for the professor
    $stmt = $conn->prepare("SELECT classes FROM professors WHERE ProfessorID = ?");
    $stmt->bind_param("i", $professorID);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Update classes list
        $classes = !empty($row['classes']) ? $row['classes'] . ",$courseNumber: $courseName" : "$courseNumber-$courseName";
        $updateStmt = $conn->prepare("UPDATE professors SET classes = ? WHERE ProfessorID = ?");
        $updateStmt->bind_param("si", $classes, $professorID);

        if ($updateStmt->execute()) {
            echo json_encode(['message' => 'Class added successfully.']);
        } else {
            error_log('Query Error: ' . $updateStmt->error); // Log error to server's error log
            echo json_encode(['error' => 'Failed to update professor classes.']);
        }
    } else {
        echo json_encode(['error' => 'Professor not found.']);
    }

    $stmt->close();
    $conn->close();
} else {
    echo json_encode(['error' => 'Invalid request method.']);
}
