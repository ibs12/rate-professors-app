import React, { useState, useEffect } from 'react';
import NavBar from '../navBar/NavBar';
import NewNavBar from '../navBar/newNavBar';
import './accountsettings.css';
import defaultProfilePic from "../../images/eye.png";
import { useNavigate } from 'react-router-dom';
import majors from './majors';


const AccountSettingsPage = () => {
    const [profilePic, setProfilePic] = useState(null);
    const [major, setMajor] = useState('');
    const [newmajor, setNewMajor] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [newgraduationYear, setNewGraduationYear] = useState('');
    const [currentname, setCurrentName] = useState('');
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quizResult, setQuizResult] = useState('No quiz result yet');
    const [updateType, setUpdateType] = useState('password');
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [usernameErrorMessage, setUsernameErrorMessage] = useState('');
    const [majorUpdateMessage, setMajorUpdateMessage] = useState('');
    const [graduationUpdateMessage, setGraduationUpdateMessage] = useState('');
    const [usernameUpdateMessage, setUsernameUpdateMessage] = useState('');
    const [passwordUpdateMessage, setPasswordUpdateMessage] = useState('');
    const navigate = useNavigate();
    const [semester, setSemester] = useState('');
    const graduationSemesterYear = `${semester} ${newgraduationYear}`;
    const webServerUrl = 'https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac'
   
    useEffect(() => {
        const sessionId = localStorage.getItem('sessionID');
        const backendUrl = 'http://localhost:8000/backend/returnuserinfo/returnuserinfo.php';

        fetch(`${webServerUrl}/backend/returnuserinfo/returnuserinfo.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: sessionId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                setCurrentName(data.username);
                setQuizResult(data.quiz_result); 
                setMajor(data.major); 
                setGraduationYear(data.graduationYear);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Fetch user data error:', error);
            alert(`Failed to fetch user data: ${error.message}`);
        });

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const handleProfilePicChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileUrl = URL.createObjectURL(file);
            setProfilePic(fileUrl);
        }
    };

    const handleDeleteAccount = () => {
        setIsModalOpen(true);
    };

    const handleResetPassword = () => {
        const sessionId = localStorage.getItem('sessionID');
        const oldPassword = currentPassword;
        const newPasswordValue = newPassword;
        const confirmPassword = confirmNewPassword;
    
        if (newPasswordValue !== confirmPassword) {
            setPasswordErrorMessage("New password and confirm password do not match.");
            return;
        }
    
        const data = {
            sessionID: sessionId,
            oldpassword: oldPassword,
            newpassword: newPasswordValue
        };
    
        const backendUrl = 'http://localhost:8000/backend/changePassword/changePassword.php';
    
        fetch(`${webServerUrl}/backend/changePassword/changePassword.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to change password');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                setPasswordUpdateMessage('Password changed successfully');
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Change password error:', error);
            setPasswordErrorMessage(`Failed to change password: ${error.message}`);
        });
    };
    

    const toggleSection = (type) => {
        setUpdateType(type);
    };
    


    const handleConfirmDelete = () => {
        const email = localStorage.getItem('email');
        const sessionId = localStorage.getItem('sessionID');
        const userID = localStorage.getItem('userID');

        const data = {
            email,
            sessionId,
            userID
        };

        const backendUrl = 'http://localhost:8000/backend/removeuser/remove.php';
        fetch(`${webServerUrl}/backend/removeuser/remove.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete account');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                alert('Account successfully deleted');
                navigate('/signuppage');
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Delete account error:', error);
            alert(`Failed to delete account: ${error.message}`);
        });

        setIsModalOpen(false);
    };

    const handleChangeUsername = () => {
        const sessionId = localStorage.getItem('sessionID');
        const newUsername = name;

        const data = {
            sessionID: sessionId,
            username: newUsername
        };

        const backendUrl = 'http://localhost:8000/backend/changeUsername/changeUsername.php';
        fetch(`${webServerUrl}/backend/changeUsername/changeUsername.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update username');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                setUsernameUpdateMessage('Username updated successfully');
                fetchUserData(sessionId);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Update username error:', error);
            setUsernameErrorMessage(`Failed to update username: ${error.message}`);
        });
    };

    const fetchUserData = (sessionId) => {
        const backendUrl = 'http://localhost:8000/backend/returnuserinfo/returnuserinfo.php';

        fetch(`${webServerUrl}/backend/returnuserinfo/returnuserinfo.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionID: sessionId })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch user data');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                setCurrentName(data.username);
                setQuizResult(data.quiz_result);
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Fetch user data error:', error);
            alert(`Failed to fetch user data: ${error.message}`);
        });
    };

    const [graduationYearFormatError, setGraduationYearFormatError] = useState('');
    const [semesterErrorMessage, setSemesterErrorMessage] = useState('');


    const handleUpdateMajorAndGraduation = () => {
        const sessionId = localStorage.getItem('sessionID');

            // Check if newgraduationYear is a 4-digit number
        if (!/^\d{4}$/.test(newgraduationYear)) {
            setGraduationYearFormatError('Please enter a valid 4-digit graduation year.');
            return; // Stop the function if the year format is incorrect
        } else {
            setGraduationYearFormatError(''); // Clear any existing error messages if the format is now correct
        }

            // Validation for semester
            if (!semester) {
                setSemesterErrorMessage('Please select a semester.');
            } else {
                setSemesterErrorMessage('');
            }

            // Stop function execution if there are any validation errors
            if (!semester || !/^\d{4}$/.test(newgraduationYear)) {
                return;
            }

        const data = {
            sessionID: sessionId,
            major: newmajor,
            graduationYear: graduationSemesterYear
        };
    
        const backendUrl = 'http://localhost:8000/backend/addmajorandgraduationdata/addmajorandgraduationdata.php';

        fetch(`${webServerUrl}/backend/addmajorandgraduationdata/addmajorandgraduationdata.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to update major and graduation year');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                setMajor(newmajor); // Update major state
                setGraduationYear(graduationSemesterYear); // Update graduation year state
                setMajorUpdateMessage('Major updated successfully');
                setGraduationUpdateMessage('Graduation year updated successfully');
            } else {
                throw new Error(data.message || 'Unknown error occurred');
            }
        })
        .catch(error => {
            console.error('Update major and graduation year error:', error);
            //const errorMessage = error.message || 'Unknown error occurred';
            const majorErrorMessage = newmajor ? '' : 'Major cannot be empty';
            const graduationYearErrorMessage = newgraduationYear ? '' : 'Graduation Year cannot be empty';
            setMajorUpdateMessage(majorErrorMessage);
            setGraduationUpdateMessage(graduationYearErrorMessage);
        });
        
    };
    

    const handleSaveChanges = () => {
        if (updateType === 'password') {
            handleResetPassword();
        } else if (updateType === 'username') {
            handleChangeUsername();
        } else if (updateType === 'major') {
            handleUpdateMajorAndGraduation();
        }
    };
    


    const SimpleModal = ({ isOpen, onClose, onConfirm }) => {
        if (!isOpen) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <h2>Are you sure you want to delete your account?</h2>
                    <div className="modal-actions">
                        <button onClick={onConfirm} className="modal-button confirm">Yes</button>
                        <button onClick={onClose} className="modal-button cancel">No</button>
                    </div>
                </div>
            </div>
        );
    };

    const handleRetakeQuiz = () =>{
        navigate('/quizPage');
    }



    return (
        <div>
            {windowWidth < 767 ? <NavBar /> : <NewNavBar />}
            <div className="main-container">
            <div className="left-side">
                <div className="profile-pic-container">
                    <label htmlFor="profile-upload" style={{ cursor: 'pointer' }}>
                        <img src={defaultProfilePic} alt="Profile" className="profile-image" />
                    </label>

                </div>
                
                <div className="field-container">
                <div className="text-display">{major}</div>
                <div className="text-display">{graduationYear}</div>
                    <label className="text-field">Quiz Result: {quizResult}</label>
                </div>
                <div >
                    <button classname = "retake-quiz-button" onClick= {handleRetakeQuiz}>
                        Retake Quiz?
                    </button>

                </div>
                <div className="delete-account-container">
                    <button className="delete-account-button" onClick={handleDeleteAccount}>
                        Delete Account
                    </button>
                </div>
            </div>
            <SimpleModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirmDelete}
            />
            <div className="right-side">
                <div className='field-group'>
                    <label className="field-label">Current Username:</label>
                    <div className="text-display">{currentname}</div>
                </div>
                <hr className="divider" />
                <div className="section-toggle-buttons">
                    <button 
                        className={`some-button ${updateType === 'password' ? 'active' : ''}`}
                        onClick={() => toggleSection('password')}>
                        Change Password
                    </button>
                    <button 
                        className={`some-button ${updateType === 'username' ? 'active' : ''}`}
                        onClick={() => toggleSection('username')}>
                        Update Username
                    </button>
                    <button 
                        className={`some-button ${updateType === 'major' ? 'active' : ''}`}
                        onClick={() => toggleSection('major')}>
                        Update Major & Graduation Date
                    </button>
                    </div>
                    {updateType === 'password' && (
                        <div className="password-change-section">
                            <div className='field-group'>
                                <label className="field-label">Current Password:</label>
                                <input
                                    type="password"
                                    placeholder="Current Password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="text-field"
                                />
                            </div>
                            <div className='field-group'>
                                <label className="field-label">New Password:</label>
                                <input
                                    type="password"
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="text-field"
                                />
                            </div>
                            <div className='field-group'>
                                <label className="field-label">Confirm New Password:</label>
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    className="text-field"
                                />
                            </div>
                            <div className='error-message'>{passwordErrorMessage}</div>
                            <div className='success-message'>{passwordUpdateMessage}</div>
                        </div>
                    )}
                    {updateType === 'username' && (
                        <div className="username-update-section">
                            <div className='field-group'>
                                <label className="field-label">New Username:</label>
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="text-field"
                                />
                            </div>
                            <div className='error-message'>{usernameErrorMessage}</div>
                            <div className='success-message'>{usernameUpdateMessage}</div>
                        </div>
                    )}
                    {updateType === 'major' && (
                        <div className="major-update-section">
                            <div className='field-group'>
                            <label className="field-label">New Major:</label>
                            <select
                             value={newmajor}
                             onChange={(e) => setNewMajor(e.target.value)}
                             className="dropdown-menu"
                             >
                                <option value="">Select a Major</option>
                                {majors.map((major, index) => (
                                <option key={index} value={major}>{major}</option>
                                ))}
                                </select>
                            </div>
                            <div className='field-group'>
                                <label className="field-label">Semester:</label>
                                <select
                                    value={semester}
                                    onChange={(e) => setSemester(e.target.value)}
                                    className="dropdown-menu"
                                >
                                    <option value="">Select a Semester</option>
                                    <option value="Spring">Spring</option>
                                    <option value="Summer">Summer</option>
                                    <option value="Fall">Fall</option>
                                    <option value="Winter">Winter</option>
                                </select>
                                {semesterErrorMessage && <div className='error-message'>{semesterErrorMessage}</div>}

                            </div>
                            <div className='field-group'>
                                <label className="field-label">Graduation Year:</label>
                                <input
                                    type="text"
                                    placeholder="YYYY"
                                    value={newgraduationYear}
                                    onChange={(e) => setNewGraduationYear(e.target.value)}
                                    className="text-field"
                                    pattern="\d*"
                                />
                                {graduationYearFormatError && <div className='error-message'>{graduationYearFormatError}</div>}

                            </div>
                            <div className='error-message'>{majorUpdateMessage}</div>
                            <div className='error-message'>{graduationUpdateMessage}</div>
                        </div>
                    )}
                    <div className="button-container">
                        <button className="save-button" onClick={handleSaveChanges}>
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AccountSettingsPage;
