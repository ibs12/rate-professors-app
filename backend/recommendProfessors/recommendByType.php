<?php
require_once '../db_config.php';

// Set content type to JSON
header('Content-Type: application/json');

// Set up error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Prevent MIME sniffing
header('X-Content-Type-Options: nosniff');

// Check if request method is OPTIONS (preflight request)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Stop script execution after sending preflight response
    exit(0);
}

// Get JSON content from the request body
$data = json_decode(file_get_contents('php://input'), true);

// Check if userID is provided in the request body
if (!isset($data['userID'])) {
    echo json_encode(["status" => "error", "message" => "UserID is required."]);
    exit;
}

$userID = $data['userID'];

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Delete existing recommendations for the user
$deleteSql = "DELETE FROM recommended_professors WHERE userID = ?";
$stmt = $conn->prepare($deleteSql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$stmt->close();

// Fetch user's quiz result from the database
$sql = "SELECT quiz_result FROM users WHERE userID = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $userID);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    $quizResult = $row['quiz_result'];

    if ($quizResult !== null) {
        // Split user's letters
        $userLetters = explode(" and ", $quizResult);

        // Fetch professors matching user's letters
        $professors = [];
        foreach ($userLetters as $letter) {
            $letter = trim($letter);
            $professorSql = "SELECT professorID FROM professors WHERE professor_type = ?";
            $stmt = $conn->prepare($professorSql);
            $stmt->bind_param("s", $letter);
            $stmt->execute();
            $professorResult = $stmt->get_result();
            while ($professor = $professorResult->fetch_assoc()) {
                $professors[] = $professor['professorID'];
            }
        }

        // Insert recommended professors into recommended_professors table
        foreach ($professors as $professorID) {
            $insertSql = "INSERT INTO recommended_professors (userID, professorID) VALUES (?, ?)";
            $stmt = $conn->prepare($insertSql);
            $stmt->bind_param("ii", $userID, $professorID);
            $stmt->execute();
        }

        // Retrieve and return the recommended professors with additional details
        $retrieveSql = "SELECT p.professorID, p.professors, p.department, p.pfppath FROM professors p JOIN recommended_professors rp ON p.professorID = rp.professorID WHERE rp.userID = ?";
        $stmt = $conn->prepare($retrieveSql);
        $stmt->bind_param("i", $userID);
        $stmt->execute();
        $result = $stmt->get_result();
        $recommendedProfessors = [];
        while ($row = $result->fetch_assoc()) {
            $recommendedProfessors[] = $row;
        }

        echo json_encode(["status" => "success", "recommended_professors" => $recommendedProfessors, "message" => "Recommended professors fetched successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "User has not taken the quiz yet."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
