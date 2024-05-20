<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Update Professor Classes</title>
</head>

<body>
    <h2>Update Professor Classes</h2>
    <form id="updateClassesForm">
        <div>
            <label for="professorID">Professor ID:</label>
            <input type="text" id="professorID" name="professorID" required>
        </div>
        <div>
            <label for="courseNumber">Course Number:</label>
            <input type="text" id="courseNumber" name="courseNumber" required>
        </div>
        <div>
            <label for="courseName">Course Name:</label>
            <input type="text" id="courseName" name="courseName" required>
        </div>
        <button type="submit">Update Classes</button>
    </form>
    <div id="responseMessage"></div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('updateClassesForm').addEventListener('submit', function(e) {
                e.preventDefault(); // Prevent the default form submission

                // Prepare the form data
                const formData = new FormData(this);
                const searchParams = new URLSearchParams();
                for (const pair of formData) {
                    searchParams.append(pair[0], pair[1]);
                }

                // Make the POST request
                fetch('saveCourse.php', {
                        method: 'POST',
                        body: searchParams,
                    })
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('responseMessage').innerHTML = `<p style="color: green;">${data.message}</p>`;
                    })
                    .catch(error => {
                        document.getElementById('responseMessage').innerHTML = `<p style="color: red;">Error: ${error}</p>`;
                    });
            });
        });
    </script>
</body>

</html>