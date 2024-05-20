import React, { useState, useEffect } from 'react';
import NavBar from '../navBar/NavBar';
import NewNavBar from '../navBar/newNavBar'; // Import the NewNavBar as well

import './saved.css';
import Default from '../../images/defaultPic.png';
import TrashPic from '../../images/trash_bin.png';

const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
const apiUrl = "http://localhost:8000";

const importProfessorImage = (imagePath) => {
    try {
      const filename = imagePath.split('/').pop(); // Extract the filename from the path
      const images = require.context('../../images/professorpfp', false, /\.(png|jpeg|jpg|svg)$/);
      return images('./' + filename);
    } catch (error) {
        console.error('Failed to import image:', error);
        return Default;
    }
};

const Saved = () => {
    const [professors, setProfessors] = useState([]);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth); // State to track window width

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
        const userID = localStorage.getItem('userID'); // Get sessionID from local storage

        if (!userID) {
            console.error('Session ID not found');
            return;
        }

        const fetchSavedProfessors = async () => {
            const requestBody = { userID: userID, action: 'fetch' }; // Add action 'fetch'

            const response = await fetch(`${webServerUrl}/backend/saveProfessor/fetchSaved.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                console.error('Failed to fetch saved professors');
                return;
            }

            const data = await response.json();
            console.log(data);

            if (data.saved_professors) {
                setProfessors(data.saved_professors);
            } else {
                console.error('No saved professors found');
            }
        };
        fetchSavedProfessors();
    }, []);

    const removeProfessor = async (professorID) => {
        const userID = localStorage.getItem('userID');
        const requestBody = { userID: userID, professorID: professorID, action: 'remove' };
        const response = await fetch(`${webServerUrl}/backend/saveProfessor/removeSaved.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });
    
        if (response.ok) {
            // Remove the professor from the state
            setProfessors(professors.filter(professor => professor.professorID !== professorID));
        } else {
            console.error('Failed to delete the professor');
        }
    };    

    return (
    <div>
        {windowWidth < 768 ? <NavBar /> : <NewNavBar />} 
        <div className="page-content">
            <h1 className="page-title">Saved Professors</h1>
            <div className="saved-professors-container">
                {professors.map((professor, index) => (
                    <div key={index} className="saved-professor-cards">
                        <div className="saved-professor-infos-container">
                            <img src={importProfessorImage(professor.pfppath)} alt="Professor" className="saved-professor-img" onError={(e) => e.target.src = Default} />
                            <div className="saved-professor-infos">
                                <h2 className="saved-professor-name">{professor.professors}</h2>
                                <p className="saved-professor-department">{professor.department}</p>
                                <p className="saved-professor-rating">Rating: {
                                    (professor.total_average === '0.00' || professor.total_average === null) ? "currently none" : parseFloat(professor.total_average) + '/100'
                                }</p>                                
                            </div>
                        </div>
                        <img src={TrashPic} alt="Delete" className="delete-icon" onClick={() => removeProfessor(professor.professorID)} />
                    </div>
                ))}
            </div>
        </div>
    </div>
    );
};

export default Saved;