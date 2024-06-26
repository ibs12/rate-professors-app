<?php
session_start(); // Start the session at the beginning to handle feedback messages
ini_set('display_errors', 1);
error_reporting(E_ALL);
include '../db_config.php';

function getDbConnection()
{
    global $servername, $username, $password, $dbname; // Make sure to define these variables globally or pass them to the function
    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        die("Failed to connect to database: " . $conn->connect_error);
    }
    return $conn;
}

function saveOrUpdateStudentProfile($userId, $major, $minor, $interests, $clubsAndOrganizations, $academicAchievements)
{
    $conn = getDbConnection();

    $stmt = $conn->prepare("SELECT user_id FROM student_profiles WHERE user_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $updateStmt = $conn->prepare("UPDATE student_profiles SET major = ?, minor = ?, interests = ?, clubs_and_organizations = ?, academic_achievements = ? WHERE user_id = ?");
        $updateStmt->bind_param("sssssi", $major, $minor, $interests, $clubsAndOrganizations, $academicAchievements, $userId);
        if (!$updateStmt->execute()) {
            $_SESSION['message'] = "Failed to update profile: " . $updateStmt->error;
            return false;
        }
        $_SESSION['message'] = "Profile updated successfully";
    } else {
        $insertStmt = $conn->prepare("INSERT INTO student_profiles (user_id, major, minor, interests, clubs_and_organizations, academic_achievements) VALUES (?, ?, ?, ?, ?, ?)");
        $insertStmt->bind_param("isssss", $userId, $major, $minor, $interests, $clubsAndOrganizations, $academicAchievements);
        if (!$insertStmt->execute()) {
            $_SESSION['message'] = "Failed to create profile: " . $insertStmt->error;
            return false;
        }
        $_SESSION['message'] = "Profile created successfully";
    }

    $conn->close();
    return true;
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get JSON as a string
    $json_str = file_get_contents('php://input');
    // decode the JSON into an associative array
    $json_obj = json_decode($json_str, true);

    // Assign each property to a variable
    $userId = filter_var($json_obj['user_id'], FILTER_SANITIZE_NUMBER_INT);
    $major = filter_var($json_obj['major'], FILTER_SANITIZE_STRING);
    $minor = filter_var($json_obj['minor'], FILTER_SANITIZE_STRING);
    $interests = filter_var($json_obj['interests'], FILTER_SANITIZE_STRING);
    $clubsAndOrganizations = filter_var($json_obj['clubs_and_organizations'], FILTER_SANITIZE_STRING);
    $academicAchievements = filter_var($json_obj['academic_achievements'], FILTER_SANITIZE_STRING);

    if (saveOrUpdateStudentProfile($userId, $major, $minor, $interests, $clubsAndOrganizations, $academicAchievements)) {
        // Redirect to the same or a different page to display the session message
        header("Location: index.php"); // Adjust the redirect location as necessary
        exit();
    }
} else {
    $_SESSION['message'] = "Invalid request method";
    header("Location: index.php"); // Adjust if you want to redirect elsewhere
    exit();
}
