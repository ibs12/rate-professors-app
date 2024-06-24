import React from 'react';
import './newNavBar.css'; // Ensure this CSS file is properly linked
import Logo from "../../images/Logo.png";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext';

function NewNavBar() {
    const { isAuthenticated, setIsAuthenticated } = useAuth();  // Simplified use of AuthContext

    const navigate = useNavigate();



    const handleLogout = async () => {
        console.log("Initiating logout process");
        const email = localStorage.getItem('email');
        const sessionID = localStorage.getItem('sessionID');
        const userID = localStorage.getItem('userID');
        console.log("Retrieved session data:", { email, sessionID, userID });

        const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac/backend/logout/logout.php";
        if (email && sessionID && userID) {
            console.log("Session data exists. Proceeding with logout.");
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, sessionID, userID, action: 'logout' }),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log("Logout response:", data);

                    localStorage.removeItem('email');
                    localStorage.removeItem('sessionID');
                    localStorage.removeItem('userID');

                    setIsAuthenticated(false);
                    navigate('/signinpage');
                } else {
                    console.error("Logout failed with status:", response.status, response.statusText);
                }
            } catch (error) {
                console.error('Logout error caught:', error);
            }
        } else{
            console.log("No active session found. Redirecting to login page.");
            const confirmRedirect = window.confirm("Sorry! This feature is only for sign-up users. Would you like to sign up?");
            if (confirmRedirect) {
                navigate('/signuppage');
            } else {
            }
        }
    };


    const handleNavigationAttempt = (path) => {
        if (isAuthenticated) {
            navigate(path);
        } else {
            const confirmSignUp = window.confirm("Sorry! This feature is only for registered users. Would you like to sign up?");
            if (confirmSignUp) {
                navigate('/signuppage');
            }
        }
    };

    return (
        <nav className="newnavbar">
            <div>
                <Link to="/homepage">
                    <img src={Logo} alt="Logo" className="newnavbar-logo" />
                </Link>            
            </div>
            <div className="newnavbar-links">
                <Link to="/homepage" className="newnavbar-item">Homepage</Link>
                <div onClick={() => handleNavigationAttempt('/saved')} className="newnavbar-item">Saved</div>
                <div onClick={() => handleNavigationAttempt('/recommendpage')} className="newnavbar-item">Recommendations</div>
                <div onClick={() => handleNavigationAttempt('/accountsettings')} className="newnavbar-item">Account Settings</div>
                <div onClick={handleLogout} className="newnavbar-item">Logout</div>
            </div>
        </nav>
    );
}

export default NewNavBar;
