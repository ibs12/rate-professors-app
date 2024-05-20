<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Profile Form</title>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const form = document.querySelector("form");

            form.addEventListener("submit", function(e) {
                e.preventDefault(); // Prevent the standard form submission

                // Gather form data
                const formData = {
                    user_id: document.getElementById("user_id").value,
                    major: document.getElementById("major").value,
                    minor: document.getElementById("minor").value,
                    interests: document.getElementById("interests").value,
                    clubs_and_organizations: document.getElementById("clubs_and_organizations").value,
                    academic_achievements: document.getElementById("academic_achievements").value,
                    gpa: document.getElementById("gpa").value
                };

                // Send the form data as JSON
                fetch("saveProfile.php", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData)
                    })
                    .then(response => response.text())
                    .then(data => {
                        // Handle response here
                        // e.g., redirect to a new page, display a success message, etc.
                        console.log(data);
                        alert("Profile submitted successfully!");
                    })
                    .catch((error) => {
                        console.error("Error:", error);
                        alert("An error occurred while submitting the profile.");
                    });
            });
        });
    </script>
</head>

<body>
    <h2>Student Profile Information</h2>
    <form action="saveProfile.php" method="POST">
        <label for="user_id">User ID:</label>
        <input type="text" id="user_id" name="user_id" required><br><br>

        <label for="major">Major:</label>
        <input type="text" id="major" name="major" required><br><br>

        <label for="minor">Minor:</label>
        <input type="text" id="minor" name="minor"><br><br>

        <label for="interests">Interests:</label>
        <textarea id="interests" name="interests"></textarea><br><br>

        <label for="clubs_and_organizations">Clubs and Organizations:</label>
        <textarea id="clubs_and_organizations" name="clubs_and_organizations"></textarea><br><br>

        <label for="academic_achievements">Academic Achievements:</label>
        <textarea id="academic_achievements" name="academic_achievements"></textarea><br><br>

        <label for="gpa">GPA:</label>
        <input type="number" id="gpa" name="gpa" step="0.01" min="0" max="4.00" required><br><br>

        <button type="submit">Submit Profile</button>
    </form>
</body>

</html>