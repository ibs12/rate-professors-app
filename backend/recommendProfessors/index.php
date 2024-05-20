<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Normalize Professor Scores</title>
</head>

<body>
    <h1>Normalize Professor Scores</h1>
    <form id="normalizeForm" action="recommendProfessors.php" method="post">
        <input type="hidden" name="normalize" value="true">
        <label for="quizResult">Enter quiz result (A, B, C, D, or E):</label>
        <input type="text" id="quizResult" name="quizResult" required>
        <button type="submit">Start Normalization</button>
    </form>

    <script>
        document.getElementById('normalizeForm').onsubmit = function(e) {
            e.preventDefault(); // Prevent form from submitting normally
            const quizResult = document.getElementById('quizResult').value.toUpperCase();
            fetch('recommendProfessors.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        normalize: true,
                        quizResult: quizResult
                    })
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('Success:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        };
    </script>
</body>

</html>