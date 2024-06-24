import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './QuizPage.css';
import questions from './questions.jsx';
import rick from '../../images/tenor.gif';


const Quiz = () => {
  const [answers, setAnswers] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [result, setResult] = useState('');
  const [showTable, setShowTable] = useState(false); // State to control table visibility

  const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac";
  const apiUrl = "http://localhost:8000";


  
  // Questions array remains the same...

  const handleSelectOption = (questionIndex, option) => {
    setAnswers({ ...answers, [questionIndex]: option });
  };

  const calculateResult = () => {

    if (Object.keys(answers).length !== questions.length) {
      setErrorMessage('Please fill out all the questions');
      return;
    }

    const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    Object.values(answers).forEach(answer => counts[answer]++);
    const maxCount = Math.max(...Object.values(counts));
    const topCategories = Object.keys(counts).filter(key => counts[key] === maxCount);
    setResult(topCategories.join(' and ')); // Set result to only the top category letters
    setShowTable(true); // Show the table when results are calculated

    setErrorMessage('');
    alert("Great! We're now in the process of referring you to a professor");


 
    
  };

  const addToProfile =() => {   //add to profile
    const sessionID = sessionStorage.getItem('sessionID');
    if (sessionID) {
      fetch(`${apiUrl}/backend/saveQuiz/saveQuiz.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionID: sessionID,
          quizResult: result,
        }),
      })
        .then(response => {
          if (response.ok) {
            alert('Result added to profile!');
            navigate('/homepage');
          } else {
            throw new Error('Failed to save quiz result');
          }
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to save quiz result');
        });
    } else {
      alert('SessionID not found');
    }

  }

  const handleDecline = () => {
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };


  const Table = () => (
    <table className="customTable">
      <thead>
        <tr>
          <th>Letter</th>
          <th>Professor Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>A</td>
          <td>The Mentor</td>
          <td>Professors who are especially supportive, providing personalized guidance and encouragement.</td>
  
        </tr>
        <tr>
          <td>B</td>
          <td>The Innovator</td>
          <td>Instructors who use cutting-edge technology and innovative teaching methods to engage students.</td>
  
        </tr>
  
        <tr>
          <td>C</td>
          <td>The Traditionalist</td>
          <td>Educators who prefer structured, lecture-based teaching and traditional assessment methods.</td>
        </tr>
  
        <tr>
          <td>D</td>
          <td>The Facilitator</td>
          <td>Teachers who promote an interactive learning environment, encouraging group work and discussions.</td>
        </tr>
  
        <tr>
          <td>E</td>
          <td>The Challenger</td>
          <td>Professors known for their rigorous academic standards, challenging students to think critically and independently.
  </td>
        </tr>
      </tbody>
    </table>
  );
  
  return (
    <div className='quiz-main'>
      <div className="quiz-container">
        <div className="quiz-header">Let's find your type of professor!</div>
        <p>Embarking on your educational path is not just about choosing the right courses; it's also about connecting with the right mentors. Understanding your preferences and personality can significantly impact your learning experience and academic success. This quiz is designed to help you navigate the diverse teaching styles and personalities you'll encounter in your academic journey.</p>

        {questions.map((q, index) => (
          <div key={index} className="question-block">
            <div className="question">{q.question}</div>
            <div className="options">
              {q.options.map((option, optionIndex) => (
                <button
                  key={optionIndex}
                  className={`option-button ${answers[index] === option.charAt(0) ? 'selected' : ''}`}
                  onClick={() => handleSelectOption(index, option.charAt(0))}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="submit-btn" onClick={calculateResult}>Submit</button>
        <button className="submit-btn" onClick={handleDecline}>Decline</button>
        <button className="submit-btn" onClick={addToProfile}>Add to profile</button>
        {result && <div className="result">{result}</div>}
        {showTable && (
          <>
            <h2>If your best match was an...</h2> {/* Title for the table */}
            <Table />
          </>
        )}
        {errorMessage && <div style={{ color: 'red', textAlign: 'center', marginTop: '10px' }}>{errorMessage}</div>}

        {showPopup && (
          <div className="popup">
            <img src={rick} alt="Rick Roll" />
            <p>Once again, this quiz helps us find a suitable professor for you!</p>
            <button onClick={handleClosePopup}>Go Back</button>
          </div>
        )}
        
      </div>
    </div>
  );
};

export default Quiz;

