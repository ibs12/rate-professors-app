<!DOCTYPE html>
<html>

<head>
    <title>Save/Remove Professors</title>
</head>

<body>

    <h2>Save/Remove Professors Form</h2>
    <form action="saveList.php" method="post">
        <label for="userID">User ID:</label><br>
        <input type="number" id="userID" name="userID" required><br><br>

        <label for="professorID">Professor ID:</label><br>
        <input type="number" id="professorID" name="professorID" required><br><br>

        <label for="action">Action:</label><br>
        <select id="action" name="action" required>
            <option value="">Select Action</option>
            <option value="save">Save</option>
            <option value="remove">Remove</option>
        </select><br><br>

        <input type="submit" value="Submit">
    </form>

    <!-- A place to display the list of saved professors -->
    <div id="savedProfessors"></div>

    <script>
        // Example JavaScript to handle the form submission and process the response
        document.querySelector('form').onsubmit = async function(event) {
            event.preventDefault();

            // Fetch form data
            const formData = new FormData(event.target);
            const response = await fetch('saveList.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            // Handle errors
            if (data.error) {
                alert('Error: ' + data.error);
            } else {
                alert(data.message);
                // Update the list of saved professors
                const professorsList = data.savedProfessors.map(prof => `<li>${prof.name}</li>`).join('');
                document.getElementById('savedProfessors').innerHTML = `<ul>${professorsList}</ul>`;
            }
        };
    </script>

</body>

</html>