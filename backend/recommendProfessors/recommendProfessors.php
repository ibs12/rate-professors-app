<?php

ini_set('display_errors', 0); // Turn off error display, use logging instead
ini_set('log_errors', 1); // Enable error logging
error_reporting(E_ALL);
require_once '../db_config.php'; // Adjust the path as needed

header('Content-Type: application/json');

function getDbConnection()
{
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);

    if ($conn->connect_error) {
        http_response_code(500);
        error_log("Connection failed: " . $conn->connect_error); // Log the error
        echo json_encode(["message" => "Failed to connect to database: " . $conn->connect_error]);
        exit;
    }
    return $conn;
}

function normalizeScores($conn, $columnName, $normalizedColumnName)
{
    // Fetch the minimum and maximum scores for the category, excluding NULL values
    $minMaxQuery = $conn->prepare("SELECT MIN($columnName) AS minScore, MAX($columnName) AS maxScore FROM professors WHERE $columnName IS NOT NULL");
    $minMaxQuery->execute();
    $minMaxResult = $minMaxQuery->get_result()->fetch_assoc();

    // Check if any scores were fetched; if not, min and max will both be NULL
    if ($minMaxResult['minScore'] === NULL || $minMaxResult['maxScore'] === NULL) {
        // All scores are NULL, so there's nothing to normalize
        return;
    }

    // If all non-NULL scores are the same, they're effectively normalized
    if ($minMaxResult['minScore'] == $minMaxResult['maxScore']) {
        // Update all non-NULL scores to 100 (or another policy, such as setting to 50)
        $updateAllQuery = $conn->prepare("UPDATE professors SET $normalizedColumnName = 100 WHERE $columnName IS NOT NULL");
        $updateAllQuery->execute();
        return;
    }

    // Normalization process
    $minScore = (float)$minMaxResult['minScore'];
    $maxScore = (float)$minMaxResult['maxScore'];

    // Fetch all professor scores for normalization, excluding NULL values
    $scoreQuery = $conn->prepare("SELECT ProfessorID, $columnName FROM professors WHERE $columnName IS NOT NULL");
    $scoreQuery->execute();
    $results = $scoreQuery->get_result();

    while ($row = $results->fetch_assoc()) {
        $score = (float)$row[$columnName];
        // Normalize the score between 1 and 100
        $normalizedScore = 1 + ($score - $minScore) * (99 / ($maxScore - $minScore));
        // Update the normalized score in the database
        $updateQuery = $conn->prepare("UPDATE professors SET $normalizedColumnName = ? WHERE ProfessorID = ?");
        $updateQuery->bind_param("di", $normalizedScore, $row['ProfessorID']);
        $updateQuery->execute();
    }
}

// Main logic for processing the normalization
// Main logic for processing the normalization
$data = json_decode(file_get_contents('php://input'), true);
if (isset($data['normalize']) && $data['normalize'] == true && isset($data['quizResult'])) {
    $conn = getDbConnection();
    $quizResult = strtoupper($data['quizResult']);

    // Define the weights based on the quiz result
    switch ($quizResult) {
        case 'A': // The Mentor
            $weights = [
                'difficulty' => 0.1,
                'helpfulness' => 0.4,
                'clarity' => 0.2,
                'Feedback_Quality' => 0.2,
                'accessibility' => 0.1,
            ];
            break;
        case 'B': // The Innovator
            $weights = [
                'difficulty' => 0.2,
                'helpfulness' => 0.1,
                'clarity' => 0.3,
                'Feedback_Quality' => 0.2,
                'accessibility' => 0.2,
            ];
            break;
        case 'C': // The Traditionalist
            $weights = [
                'difficulty' => 0.3,
                'helpfulness' => 0.1,
                'clarity' => 0.3,
                'Feedback_Quality' => 0.2,
                'accessibility' => 0.1,
            ];
            break;
        case 'D': // The Facilitator
            $weights = [
                'difficulty' => 0.1,
                'helpfulness' => 0.3,
                'clarity' => 0.2,
                'Feedback_Quality' => 0.2,
                'accessibility' => 0.2,
            ];
            break;
        case 'E': // The Challenger
            $weights = [
                'difficulty' => 0.4,
                'helpfulness' => 0.1,
                'clarity' => 0.2,
                'Feedback_Quality' => 0.2,
                'accessibility' => 0.1,
            ];
            break;
        default:
            http_response_code(400); // Bad request
            echo json_encode(['message' => 'Invalid quiz result. Please provide A, B, C, D, or E.']);
            exit;
    }

    $scoreCategories = [
        ['columnName' => 'difficulty', 'normalizedColumnName' => 'difficulty_normalized', 'weight' => $weights['difficulty']],
        ['columnName' => 'helpfulness', 'normalizedColumnName' => 'helpfulness_normalized', 'weight' => $weights['helpfulness']],
        ['columnName' => 'clarity', 'normalizedColumnName' => 'clarity_normalized', 'weight' => $weights['clarity']],
        ['columnName' => 'Feedback_Quality', 'normalizedColumnName' => 'Feedback_Quality_normalized', 'weight' => $weights['Feedback_Quality']],
        ['columnName' => 'accessibility', 'normalizedColumnName' => 'accessibility_normalized', 'weight' => $weights['accessibility']],
    ];

    foreach ($scoreCategories as $category) {
        normalizeScores($conn, $category['columnName'], $category['normalizedColumnName']);
    }

    // Calculate the overall average score and weighted average score for each professor
    $overallAverageQuery = $conn->prepare("
        UPDATE professors
        SET overall_average = (difficulty_normalized + helpfulness_normalized + clarity_normalized + Feedback_Quality_normalized + accessibility_normalized) / 5,
            prof_match = (difficulty_normalized * ?) + (helpfulness_normalized * ?) + (clarity_normalized * ?) + (Feedback_Quality_normalized * ?) + (accessibility_normalized * ?)
    ");

    // Bind the weights to the query
    $overallAverageQuery->bind_param(
        "ddddd",
        $scoreCategories[0]['weight'],
        $scoreCategories[1]['weight'],
        $scoreCategories[2]['weight'],
        $scoreCategories[3]['weight'],
        $scoreCategories[4]['weight']
    );

    $overallAverageQuery->execute();

    $conn->close();

    echo json_encode(['message' => 'Normalization completed successfully.']);
    exit;
} else {
    http_response_code(400); // Bad request
    echo json_encode(['message' => 'Invalid or missing data for normalization.']);
}
