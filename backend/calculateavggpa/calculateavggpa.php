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

function calculateGPA($grade) {
    switch ($grade) {
        case 'A':
            return 4.0;
        case 'A-':
            return 3.667;
        case 'B+':
            return 3.333;
        case 'B':
            return 3.0;
        case 'B-':
            return 2.667;
        case 'C+':
            return 2.333;
        case 'C':
            return 2.0;
        case 'C-':
            return 1.6667;
        case 'D+':
            return 1.333;
        case 'D':
            return 1.0;
        case 'F':
            return 0.0;
        default:
            return null;
    }
}

function getClosestGrade($gpa) {
    $grades = array(
        "A" => 4.0,
        "A-" => 3.667,
        "B+" => 3.333,
        "B" => 3.0,
        "B-" => 2.667,
        "C+" => 2.333,
        "C" => 2.0,
        "C-" => 1.6667,
        "D+" => 1.333,
        "D" => 1.0,
        "F" => 0.0
    );

    $closestGrade = null;
    $minDifference = PHP_INT_MAX;

    foreach ($grades as $grade => $value) {
        $difference = abs($gpa - $value);
        if ($difference < $minDifference) {
            $minDifference = $difference;
            $closestGrade = $grade;
        }
    }

    return $closestGrade;
}

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$input = json_decode(file_get_contents('php://input'), true);

$professorId = $input['professorID'] ?? null;
$course = $input['course'] ?? null;

if ($professorId === null || $course === null) {
    // Professor ID or course not provided
    http_response_code(400); // Bad Request
    echo json_encode(["error" => "Professor ID or course not provided."]);
    exit;
}

$sql = "SELECT grade FROM prof_reviews WHERE professorID = ? AND course = ? AND grade IS NOT NULL";
$stmt = $conn->prepare($sql);
$stmt->bind_param("is", $professorId, $course);
$stmt->execute();
$result = $stmt->get_result();

$totalGPA = 0;
$count = 0;

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $grade = $row["grade"];
        $gpa = calculateGPA($grade);
        if (!is_null($gpa)) {
            $totalGPA += $gpa;
            $count++;
        }
    }
    if ($count > 0) {
        $averageGPA = $totalGPA / $count;
        $closestGrade = getClosestGrade($averageGPA);
        echo json_encode(["averageGPA" => number_format($averageGPA, 2), "closestGrade" => $closestGrade]);
    } else {
        // No valid grades found
        echo json_encode(["message" => "No valid grades found for Professor ID " . $professorId . " and course " . $course]);
    }
} else {
    // No grades found
    echo json_encode(["message" => "No grades found for Professor ID " . $professorId . " and course " . $course]);
}

$stmt->close();
$conn->close();
?>
