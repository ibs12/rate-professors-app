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

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Fetch professors from the database
$sql = "SELECT professorID, 
               IFNULL(helpfulness_normalized, -1) AS A, 
               IFNULL(accessibility_normalized, -1) AS B, 
               IFNULL(clarity_normalized, -1) AS C, 
               IFNULL(feedback_quality_normalized, -1) AS D, 
               IFNULL(difficulty_normalized, -1) AS E 
        FROM professors 
        GROUP BY professorID";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // Loop through each professor
    while ($row = $result->fetch_assoc()) {
        // Determine the highest normalized score and corresponding type
        $scoreMap = [
            'A' => $row['A'],
            'B' => $row['B'],
            'C' => $row['C'],
            'D' => $row['D'],
            'E' => $row['E']
        ];
        
        arsort($scoreMap);
        $maxScore = reset($scoreMap);
        $professorType = array_search($maxScore, $scoreMap);
        
        // Update the professor's type in the professors table
        $professorID = $row['professorID'];
        $updateSql = "UPDATE professors SET professor_type = ? WHERE professorID = ?";
        $updateStmt = $conn->prepare($updateSql);
        $updateStmt->bind_param("si", $professorType, $professorID);
        $updateStmt->execute();
    }
    echo json_encode(["status" => "success", "message" => "Professor types updated successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "No professors found."]);
}

$conn->close();
?>
