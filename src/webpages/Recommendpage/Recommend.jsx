import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Default from '../../images/defaultPic.png';
import { useNavigate } from 'react-router-dom';
import './Recommend.css';
import NavBar from '../navBar/NavBar';
import NewNavBar from '../navBar/newNavBar';
const webServerUrl =  "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac";

const apiUrl = "http://localhost:8000"; // Assuming your backend runs on localhost port 8000

const importProfessorImage = (imagePath) => {
    try {
        const images = require.context('../../images/professorpfp', false, /\.(png|jpe?g|svg)$/);
        return images(`./${imagePath}`);
    } catch (error) {
        return Default;
    }
};

// Recursive function to remove 'Department of' prefix from all departments
const removeDepartmentPrefix = (department) => {
    if (department.startsWith('Department of')) {
        return removeDepartmentPrefix(department.replace(/^Department of\s+/i, ''));
    }
    return department;
};

const RecommendedProfessorsPage = () => {
    const navigate = useNavigate();
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [professorsData, setProfessorsData] = useState([]);
    const [quizPromptVisible, setQuizPromptVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Add loading state
    const [countdown, setCountdown] = useState(3);


    const [windowWidth, setWindowWidth] = useState(window.innerWidth);


    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const userID = localStorage.getItem('userID');
                console.log('User ID sent to backend:', userID);

                const response = await fetch(`${apiUrl}/backend/recommendProfessors/recommendByType.php`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userID })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const data = await response.json();
                console.log('Received professor data:', data);

                if (data.message === 'User has not taken the quiz yet.') {
                    setQuizPromptVisible(true);
                    const interval = setInterval(() => {
                        setCountdown(prevCountdown => prevCountdown - 1);
                    }, 1000);
                    setTimeout(() => {
                        clearInterval(interval);
                        navigate('/quizpage');
                    }, 3000);
                }

                data.recommended_professors.forEach(professor => {
                    professor.department = professor.department.split(';').map(dept => removeDepartmentPrefix(dept.trim())).join('; ');
                });

                if (data.message === 'User has not taken the quiz yet.') {
                    setQuizPromptVisible(true);
                    const interval = setInterval(() => {
                        setCountdown(prevCountdown => prevCountdown - 1);
                    }, 1000);
                    setTimeout(() => {
                        clearInterval(interval);
                        navigate('/quizpage');
                    }, 3000);
                } else {
                    setProfessorsData(data.recommended_professors);
                }
                setIsLoading(false);
            } catch (error) {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleDepartmentChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    const filteredProfessors = selectedDepartment
        ? professorsData.filter(professor =>
            professor.department.split(';').some(dept => dept.trim() === selectedDepartment)
        )
        : professorsData;

    return (
        <div>
            {windowWidth < 768 ? <NavBar /> : <NewNavBar />}
            <div className="recommended-professors-page-content">
                <h1 className="recommended-professors-page-title">Recommended Professors</h1>
                {isLoading && (
                    <p>In the process of generating your personalized recommended professors...</p>
                )}
                {quizPromptVisible && !isLoading && (
                    <div className="quiz-prompt">
                        <p>It seems you haven't completed the quiz yet.</p>
                        <p>Redirecting to the quiz page in {countdown} seconds...</p>
                    </div>
                )}
                {!quizPromptVisible && !isLoading && (
                    <div>
                        <label htmlFor="departmentFilter">Filter by Department:</label>
                        <select id="departmentFilter" value={selectedDepartment} onChange={handleDepartmentChange}>
                            <option value="">All Departments</option>
                            {[...new Set(professorsData.flatMap(professor => professor.department.split(';').map(dept => dept.trim())))].map((department, index) => (
                                <option key={index} value={department}>{department}</option>
                            ))}
                        </select>
                    </div>
                )}
                {!quizPromptVisible && !isLoading && (
                    <div className="recommended-professors-container">
                        {filteredProfessors.map((professor, index) => (
                            <div key={index} className="recommended-professor-cards">
                                <div className="recommended-professor-infos-container">
                                    <img
                                        src={importProfessorImage(professor.pfppath.split('/').pop())}
                                        alt="Professor"
                                        className="recommended-professor-img"
                                        onError={(e) => e.target.src = Default}
                                    />
                                    <div className="recommended-professor-infos">
                                        <Link
                                            to={{
                                                pathname: `/professor/${professor.professors + '+' + professor.department + '+' + professor.pfppath.split('/').pop() + '+' + professor.professorID}`
                                            }}
                                        >
                                            {professor.professors}
                                        </Link>
                                        <p className="recommended-professor-department">{professor.department}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecommendedProfessorsPage;
