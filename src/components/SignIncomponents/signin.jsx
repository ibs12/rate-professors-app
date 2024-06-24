//'https://cors-anywhere.herokuapp.com/https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac/backend/login/login.php'

import React, { useState } from 'react';
import './signin.css'; 
import eyeLogo from './Logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext'; // Import useAuth hook

function Main() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentname, setCurrentName] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [quizResult, setQuizResult] = useState('No quiz result yet');

  const { checkAuth, setIsAuthenticated } = useAuth();
  
  const navigate = useNavigate();

  const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac";
  const apiUrl = "http://localhost:8000";

  const handleLogin = () => {
    // Check if the email ends with 'buffalo.edu'
    if (!email.endsWith('buffalo.edu')) {
      alert('Please use an email ending with buffalo.edu');
      return;
    }

    const data = {
      action: 'login',
      email: email,
      password: password
    };

    fetch(`${apiUrl}/backend/login/login.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })    
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('Failed to login');
      }
    })
    .then(data => {
      // Check if the response contains expected data
      if (data.email && data.sessionID && data.userID) {
        sessionStorage.setItem('email', data.email);
        sessionStorage.setItem('sessionID', data.sessionID);
        sessionStorage.setItem('userID', data.userID);



        setIsAuthenticated(true);
        checkQuizTaken(data.sessionID);
      } else {
        // Handle unexpected response
        throw new Error('Invalid response data');
      }
    })
    .catch(error => {
      // Handle login error
      console.error('Login error:', error);
      alert('Please check your email and password input');
    });
  }; 
 


  const checkQuizTaken = (sessionID) => {
    fetch(`${apiUrl}/backend/checkquizstatus/checkquizstatus.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sessionID: sessionID })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        if (data.message === 'User needs to take a quiz.') {
          navigate('/quizPage');
        } else {
          navigate('/homepage');
        }
      } else {
        throw new Error(data.message);
      }
    })
    .catch(error => {
      console.error('Error checking quiz status:', error);
      alert('Error checking quiz status');
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="main-container">
      <div className="bg">
        <main className="container">
          <div className="title-container">
            <img className="title" src={eyeLogo} alt="Logo" />
          </div>
          <hr className="separator" />
          <div className="space"></div>
          <h3 className="subtitle">Sign In</h3>
          <form className="form">
            <div className="input">
              <label className="label">Email</label>
              <input className="textfield" type="email" placeholder="Enter your email" onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="input">
              <label className="label">Password</label>
              <input className="textfield" type="password" placeholder="Enter your password" onChange={e => setPassword(e.target.value)} onKeyDown={handleKeyDown} />
            </div>
            <div className="forgot-password">
              <a href="#" className="link"></a>
            </div>
            <div className="extra-space"></div>
            <button className="primary" type="button" onClick={handleLogin}>Sign In</button>
          </form>
          <div className="signup-link">
            <p className="link">New to Insight? <Link to="/signuppage" className="link">Sign Up</Link></p>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Main;
