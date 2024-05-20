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

function updateProfessorRatings($conn, $professorId)
{
    $avgQuery = "SELECT AVG(difficulty) AS avgDifficulty, AVG(helpfulness) AS avgHelpfulness, AVG(clarity) AS avgClarity, AVG(feedback_quality) AS avgFeedbackQuality, AVG(accessibility) AS avgAccessibility FROM prof_reviews WHERE professorID = ?";
    if ($stmt = $conn->prepare($avgQuery)) {
        $stmt->bind_param("i", $professorId);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        // Convert each average to a scale of 100
        foreach ($result as &$value) {
            $value *= 20; // Convert from a scale of 5 to a scale of 100
        }
        unset($value); // Break the reference with the last element

        $totalAvg = ceil(array_sum($result) / count($result));

        $updateQuery = "UPDATE professors SET difficulty = ?, helpfulness = ?, clarity = ?, feedback_quality = ?, accessibility = ?, total_average = ? WHERE ProfessorID = ?";
        if ($updateStmt = $conn->prepare($updateQuery)) {
            $updateStmt->bind_param(
                "ddddddi",
                $result['avgDifficulty'],
                $result['avgHelpfulness'],
                $result['avgClarity'],
                $result['avgFeedbackQuality'],
                $result['avgAccessibility'],
                $totalAvg, // Add the total average to the update statement
                $professorId
            );
            $updateStmt->execute();

            // Output the updated averages including the total average, all scaled to 100
            echo json_encode([
                "message" => "Professor ratings updated successfully.",
                "updatedAverages" => [
                    "difficulty" => $result['avgDifficulty'],
                    "helpfulness" => $result['avgHelpfulness'],
                    "clarity" => $result['avgClarity'],
                    "feedback_quality" => $result['avgFeedbackQuality'],
                    "accessibility" => $result['avgAccessibility'],
                    "total_average" => $totalAvg // Include the total average in the response
                ]
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["message" => "Error preparing update statement."]);
        }
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Error preparing average calculation statement."]);
    }
    $conn->close();
}



$conn = getDbConnection();

// Check for JSON payload first
$data = json_decode(file_get_contents('php://input'), true);
if ($data && isset($data['professorId'])) {
    $professorId = $data['professorId'];
} else {
    // Fallback to query parameter if JSON payload is not provided or does not contain professorId
    $professorId = isset($_GET['professorId']) ? intval($_GET['professorId']) : null;
}

if (!is_null($professorId)) {
    updateProfessorRatings($conn, $professorId);
} else {
    http_response_code(400); // Bad request
    echo json_encode(['message' => 'Invalid or missing professor ID.']);
}
