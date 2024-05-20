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
function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode(["error" => "Failed to connect to database: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

function validateGrade($grade)
{
    $validGrades = array("A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F");
    return in_array($grade, $validGrades);
}

function addGradeColumnIfNeeded($conn)
{
    $result = $conn->query("SHOW COLUMNS FROM prof_reviews LIKE 'grade'");
    if ($result->num_rows === 0) {
        $conn->query("ALTER TABLE prof_reviews ADD COLUMN grade VARCHAR(5) DEFAULT NULL");
    }
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents('php://input'), true);
    if (is_null($data)) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON format"]);
        exit;
    }

    // Filter and sanitize the inputs
    $userId = filter_var($data['userID'], FILTER_SANITIZE_NUMBER_INT);
    $professorId = filter_var($data['professorID'], FILTER_SANITIZE_NUMBER_INT);
    $difficulty = filter_var($data['difficulty'], FILTER_SANITIZE_NUMBER_INT);
    $helpfulness = filter_var($data['helpfulness'], FILTER_SANITIZE_NUMBER_INT);
    $clarity = filter_var($data['clarity'], FILTER_SANITIZE_NUMBER_INT);
    $feedbackQuality = filter_var($data['Feedback_Quality'], FILTER_SANITIZE_NUMBER_INT);
    $accessibility = filter_var($data['accessibility'], FILTER_SANITIZE_NUMBER_INT);
    $comment = htmlspecialchars($data['comment'], ENT_QUOTES, 'UTF-8');
    $course = htmlspecialchars($data['course'], ENT_QUOTES, 'UTF-8'); // New
    $term = htmlspecialchars($data['term'], ENT_QUOTES, 'UTF-8'); // New

    // Check if the grade field is provided
    if (isset($data['grade'])) {
        $grade = htmlspecialchars($data['grade'], ENT_QUOTES, 'UTF-8'); // New field for grade

        // Treat empty grade as null
        if ($grade === "") {
            $grade = null;
        } else {
            // Treat "None" as null
            if ($grade === "None") {
                $grade = null;
            }

            // Validate the grade
            if (!validateGrade($grade)) {
                http_response_code(400);
                echo json_encode(["error" => "Invalid grade. Grade must be A, A-, B+, B, B-, C+, C, C-, D+, D or F."]);
                exit;
            }
        }
    } else {
        // If grade is not provided, set it to null
        $grade = null;
    }

    if (!$userId || !$professorId) {
        http_response_code(400);
        echo json_encode(["error" => "UserID and ProfessorID are required."]);
        exit;
    }

    $conn = getDbConnection();
    // Add 'grade' column if it doesn't exist
    addGradeColumnIfNeeded($conn);
    $usernameQuery = $conn->prepare("SELECT username FROM users WHERE userID = ?");
    $usernameQuery->bind_param("i", $userId);
    $usernameQuery->execute();
    $usernameResult = $usernameQuery->get_result();
    if ($usernameResult->num_rows == 0) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }
    $usernameRow = $usernameResult->fetch_assoc();
    $username = $usernameRow['username'];
    $usernameQuery->close();

    $majorQuery = $conn->prepare("SELECT major FROM users WHERE userID = ?");
    $majorQuery->bind_param("i", $userId);
    $majorQuery->execute();
    $majorResult = $majorQuery->get_result();
    if ($usernameResult->num_rows == 0) {
        http_response_code(404);
        echo json_encode(["error" => "User not found"]);
        exit;
    }
    $majorRow = $majorResult->fetch_assoc();
    $major = $majorRow['major'];
    $majorQuery->close();

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO prof_reviews (userID, username, major, professorID, course, term, difficulty, helpfulness, clarity, Feedback_Quality, accessibility, comment, grade) VALUES (?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("ississiiiiiss", $userId, $username, $major, $professorId, $course, $term, $difficulty, $helpfulness, $clarity, $feedbackQuality, $accessibility, $comment, $grade);

    if ($stmt->execute()) {
        echo json_encode(["message" => "New review added successfully.", "status" => "success"]);
    } else {
        http_response_code(500);
        echo json_encode(["error" => "Error inserting review: " . $stmt->error]);
    }

    $stmt->close();
    $conn->close();
} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
