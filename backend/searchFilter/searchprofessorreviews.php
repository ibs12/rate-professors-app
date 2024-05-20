<?php
header('Content-Type: application/json');

ini_set('display_errors', 1);
error_reporting(E_ALL);
header('X-Content-Type-Options: nosniff');
require_once '../db_config.php';

// Get the database connection
function getDbConnection() {
    global $servername, $username, $password, $dbname;
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        return ['error' => 'Connection failed: ' . $conn->connect_error];
    }
    return $conn;
}

// Fetch rows from the prof_reviews table for a specific professorID
function fetchReviews($professorID) {
    $conn = getDbConnection();
    $sql = "SELECT * FROM prof_reviews WHERE professorID = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $professorID);
    $stmt->execute();
    $result = $stmt->get_result();

    $reviews = [];
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $reviews[] = $row;
        }
    }

    // Close the database connection
    $stmt->close();
    $conn->close();

    return $reviews;
}

// Get JSON data sent from frontend
$json_data = file_get_contents('php://input');
$request_data = json_decode($json_data, true);

// Check if professorID exists in the request data
if(isset($request_data['professorID'])) {
    // Fetch reviews for the given professorID
    $professorID = $request_data['professorID'];
    $reviews = fetchReviews($professorID);

    // Check if reviews exist
    if (!empty($reviews)) {
        // Return reviews as JSON
        echo json_encode($reviews);
    } else {
        // No reviews found
        echo json_encode(['message' => 'No reviews found for the given professorID']);
    }
} else {
    // Send error message if professorID is not provided
    echo json_encode(['error' => 'ProfessorID is not provided']);
}
?>
