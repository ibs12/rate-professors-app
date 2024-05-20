import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProfessorCard.css';
import NewNavBar from '../navBar/newNavBar';
import NavBar from '../navBar/NavBar';

import defaultPic from "../../images/defaultPic.png";
import savedIcon from "../../images/saved_icon.png";
import savedIconColored from "../../images/saved_icon_colored.png";
import { useAuth } from '../../AuthContext';
import InfoGraphicsCard from './infoGraphicsCard'; 
import './infoGraphicsCard.css';

const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
const apiUrl = "http://localhost:8000";


const importProfessorImage = (imagePath) => {
    try {
        const images = require.context('../../images/professorpfp', false, /\.(png|jpe?g|svg)$/);
        return images(`./${imagePath}`);
    } catch (error) {
        console.error('Failed to import image:', error);
        return defaultPic;
    }
};

const convertLetterGradeToNumber = (grade) => {
    switch (grade) {
        case 'A':
            return 4.0;
        case 'A-':
            return 3.667;
        case 'B+':
            return 3.333;
        case 'B':
            return 3.0;
        case 'B-':
            return 2.667;
        case 'C+':
            return 2.333;
        case 'C':
            return 2.0;
        case 'C-':
            return 1.6667;
        case 'D+':
            return 1.333;
        case 'D':
            return 1.0;
        case 'F':
            return 0.0;
        default:
            return 0.0; // Default to 0 if grade is not recognized
    }
};

//this is for infographics card
const calculateAverageGPA = (data) => {
    const courseData = {};

    data.forEach(item => {
        const { course, grade, Feedback_Quality, accessibility, clarity, difficulty, helpfulness } = item;

        if (!(course in courseData)) {
            courseData[course] = {
                totalGPA: 0,
                totalFeedbackQuality: 0,
                totalAccessibility: 0,
                totalClarity: 0,
                totalDifficulty: 0,
                totalHelpfulness: 0,
                count: 0
            };
        }

        courseData[course].totalGPA += convertLetterGradeToNumber(grade);
        courseData[course].totalFeedbackQuality += parseInt(Feedback_Quality);
        courseData[course].totalAccessibility += parseInt(accessibility);
        courseData[course].totalClarity += parseInt(clarity);
        courseData[course].totalDifficulty += parseInt(difficulty);
        courseData[course].totalHelpfulness += parseInt(helpfulness);
        courseData[course].count++;
    });

    const averageCourseData = {};
    for (const course in courseData) {
        const totalGPA = courseData[course].totalGPA;
        const totalFeedbackQuality = courseData[course].totalFeedbackQuality;
        const totalAccessibility = courseData[course].totalAccessibility;
        const totalClarity = courseData[course].totalClarity;
        const totalDifficulty = courseData[course].totalDifficulty;
        const totalHelpfulness = courseData[course].totalHelpfulness;
        const count = courseData[course].count;

        averageCourseData[course] = {
            averageGPA: totalGPA / count,
            averageFeedbackQuality: totalFeedbackQuality / count,
            averageAccessibility: totalAccessibility / count,
            averageClarity: totalClarity / count,
            averageDifficulty: totalDifficulty / count,
            averageHelpfulness: totalHelpfulness / count
        };
    }
    console.log(averageCourseData)
    return averageCourseData;
};

const ProfessorCard = () => {
    const navigate = useNavigate();
    const { name } = useParams();
    const { isAuthenticated } = useAuth(); // Destructure to get isAuthenticated from AuthContext
    const [showInfoCard, setShowInfoCard] = useState(false); // Added for toggling InfoGraphicsCard

    const toggleInfoCard = () => {
        if (!isAuthenticated) {
            const confirmLogin = window.confirm("This feature is available only to registered users. Would you like to log in or sign up?");
            if (confirmLogin) {
                navigate('/signuppage'); // Adjust the route as necessary
            }
        } else {
            setShowInfoCard(!showInfoCard);
        }
    };
    

    const [difficultyAverage, setDifficultyAverage] = useState(null);
    const [feedbackQualityAverage, setFeedbackQualityAverage] = useState(null);
    const [accessibilityAverage, setAccessibilityAverage] = useState(null);
    const [clarityAverage, setClarityAverage] = useState(null);
    const [helpfulnessAverage, setHelpfulnessAverage] = useState(null);
    const [averageGrade, setAverageGrade] = useState(null);
    const [averageGPAs, setAverageGPAs] = useState({}); // State for storing average GPAs
    


    const [profname, setProfName] = useState('');
    const [profdepartment, setProfDepartment] = useState('');
    const [ID, setProid] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [pfppath, setPfppath] = useState('');
    const [professorInfo, setProfessorInfo] = useState({
        name: '',
        department: '',
        profilePicture: '',
        rating: 0,
        reviews: []
    });

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
        fetchProfessorInfo(name);
        checkSavedStatus(name);
    }, [name]);

    const handleUnauthorized = () => {
        const confirmSignUp = window.confirm("Sorry! This feature is only for registered users. Would you like to sign up?");
        if (confirmSignUp) {
            navigate('/signuppage');
        }
    };
    
    const [overallRating, setOverallRating] = useState(null);  // State to hold the overall rating independently


    const fetchProfessorInfo = (Data) => {
        const [name, department, path, ID] = Data.split('+');
        setProfName(name);
        setProfDepartment(department);
        setPfppath(path);
        setProid(ID);
    
        const request = {
            professorID: ID
        };

        // Fetch for overall rating
        fetch(`${webServerUrl}/backend/overallProfessorsRating/overallProfessorsRating.php?professorId=${ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            setOverallRating(parseFloat(data.updatedAverages.total_average));  // Set the overall rating
            setProfessorInfo(prevInfo => ({ ...prevInfo, rating: parseFloat(data.updatedAverages.total_average) }));
        })
        .catch(error => {
            console.error('Error fetching overall rating:', error);
            setOverallRating('-');  // Handle errors or invalid data by setting a fallback
        });

    
        fetch(`${webServerUrl}/backend/searchFilter/searchprofessorreviews.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return response.json().then(data => {
                        throw new Error(data.error);
                    });
                }
            })
            .then(data => {
                console.log('Fetched reviews:', data);
                // Check if there are reviews available
                if (data.length > 0) {
                    const updatedReviews = data.map(review => {
                        // Extract individual ratings from the review object
                        const { Feedback_Quality, accessibility, clarity, difficulty, helpfulness } = review;
    
                        // Calculate average rating for the review
                        const totalRating = parseInt(Feedback_Quality) + parseInt(accessibility) + parseInt(clarity) + parseInt(difficulty) + parseInt(helpfulness);
                        const averageRating = totalRating / 5; // Assuming 5 attributes
    
                        // Return the review object with the calculated average rating
                        return {
                            ...review,
                            rating: averageRating
                        };
                    });
                    setProfessorInfo(prev => ({
                        ...prev,
                        name: name,
                        department: department,
                        profilePicture: '',
                        rating: '',
                        reviews: updatedReviews
                    }));
                    /*
                    setProfessorInfo({
                        name: name,
                        department: department,
                        profilePicture: '',
                        //rating: '-',
                        rating: data.updatedAverages.total_average, // You may want to calculate the overall rating based on all reviews
                        reviews: updatedReviews
                    });*/

                    //Calculate and set averages
                    calculateAverages(updatedReviews);
                    const averageGPAs = calculateAverageGPA(updatedReviews);
                    setAverageGPAs(averageGPAs);
                } else {
                    // If no reviews available, set only the basic information
                    setProfessorInfo(prevInfo => ({
                        name: name,
                        department: department,
                        profilePicture: '',
                        rating: '-', // Preserve the rating if already set and valid
                        reviews: []
                    }));
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });


    };

    //this is for infographics card
    const calculateAverages = (reviews) => {
        let difficultySum = 0;
        let feedbackQualitySum = 0;
        let accessibilitySum = 0;
        let claritySum = 0;
        let helpfulnessSum = 0;
        let totalCount = reviews.length;

        reviews.forEach(review => {
            difficultySum += parseInt(review.difficulty);
            feedbackQualitySum += parseInt(review.Feedback_Quality);
            accessibilitySum += parseInt(review.accessibility);
            claritySum += parseInt(review.clarity);
            helpfulnessSum += parseInt(review.helpfulness);
        });

        setDifficultyAverage(difficultySum / totalCount);
        setFeedbackQualityAverage(feedbackQualitySum / totalCount);
        setAccessibilityAverage(accessibilitySum / totalCount);
        setClarityAverage(claritySum / totalCount);
        setHelpfulnessAverage(helpfulnessSum / totalCount);
        setAverageGrade(calculateAverageGrade(reviews));
    };

    //this is for infographics card
    const calculateAverageGrade = (reviews) => {
        let totalGrade = 0;
        let totalCount = reviews.length;

        reviews.forEach(review => {
            totalGrade += convertLetterGradeToNumber(review.grade);
        });

        return totalGrade / totalCount;
    };

    const checkSavedStatus = (Data) => {
        const [name, department, path, ID] = Data.split('+');
        setProfName(name);
        setProfDepartment(department);
        setPfppath(path);
        setProid(ID);
        const sessionID = localStorage.getItem('sessionID');
    
        // If session ID is not found, handle the error
        if (!sessionID) {
            console.error('Session ID not found in local storage');
            return;
        }
    
        const requestBody = {
            sessionID: sessionID,
            professorID: ID 
        };
    
        console.log('Request Body:', requestBody); // Print requestBody
    
        fetch(`${webServerUrl}/backend/saveProfessor/checkSavedStatus.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
        .then(response => response.json())
        .then(data => {
            setIsSaved(data.isSaved);
            console.log('Fetched saved status:', data); // Print fetched data
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };
    
    const toggleSave = () => {
        if (!isAuthenticated) {
            handleUnauthorized();
            return;
        }
        const sessionID = localStorage.getItem('sessionID');

        if (!sessionID) {
            console.error('Session ID not found in local storage');
            return;
        }

        const requestBody = {
            sessionID: sessionID,
            professorName: profname,
            action: isSaved ? 'remove' : 'save'
        };

        fetch(`${webServerUrl}/backend/saveProfessor/saveList.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        })
            .then(response => response.json())
            .then(data => {
                setIsSaved(!isSaved);
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    };

    const handleWriteReview = () => {
        if (!isAuthenticated) {
            handleUnauthorized();
            return;
        }
        navigate(`/review/${profname+'+'+profdepartment+'+'+pfppath+'+'+ID}`);
    };

    const sortReviews = (sortBy) => {
        const sortedReviews = [...professorInfo.reviews].sort((a, b) => {
            if (sortBy === "rating") {
                return b.rating - a.rating;
            } else if (sortBy === "author") {
                return a.author.localeCompare(b.author);
            }
            return 0;
        });

        setProfessorInfo({ ...professorInfo, reviews: sortedReviews });
    };

    const Review = ({ author, comment, rating, term, course, grade, major }) => {
        return (
            <div className="profile-page-review">
                <div className="profile-page-review-header">
                    <h4 className="author">{author}</h4>
                    <h4>{major}</h4>
                    <span>{term} - {course}</span>
                    <span>Grade: {grade}</span>
                    <span>Rating: {rating}</span>
                </div>
                <p>{comment}</p>
            </div>
        );
    };

    return (
        <div className='profile-page-professor-main'>
            {windowWidth < 768 ? <NavBar /> : <NewNavBar />} 


            <div className="profile-page-professor-card">
                <img
                    src={isSaved ? savedIconColored : savedIcon}
                    alt="Save Professor"
                    className="profile-page-saved-icon"
                    onClick={toggleSave}
                />
                <img src={importProfessorImage(pfppath)} alt="Professor" className="profile-page-professor-img" />
                <div className="profile-page-professor-info">
                    <h2>{professorInfo.name}</h2>
                    <p>{professorInfo.department}</p>
                </div>
                <div className="profile-page-professor-rating">
                    <span>{overallRating !== null ? overallRating : '-'}</span>
                </div>
            </div>
            <div className="profile-page-toggle-info-card">
                <span onClick={toggleInfoCard}>
                    {showInfoCard ? "▲ Click here to view less " : "▼ Click here to view more "}
                </span>
            </div>

            
            {showInfoCard && isAuthenticated && (
                <InfoGraphicsCard 
                    difficultyAverage={difficultyAverage}
                    feedbackQualityAverage={feedbackQualityAverage}
                    accessibilityAverage={accessibilityAverage}
                    clarityAverage={clarityAverage}
                    helpfulnessAverage={helpfulnessAverage}
                    averageGrade={averageGrade}
                    averageGPAs={averageGPAs}
                />
            )}

            
            <div className='profile-page-sort-button-container'>
                {/*<button className='profile-page-sort-button' onClick={() => sortReviews("rating")}>Sort by Rating</button>*/}
                {/* <button className='profile-page-sort-button' onClick={() => sortReviews("author")}>Sort by Author</button> */}
            </div>

            <div className="profile-page-reviews">
                {professorInfo.reviews.length === 0 ? (
                    <p>No Reviews</p>
                ) : (
                    [...professorInfo.reviews] // Create a copy of the reviews array to avoid mutating the original array
                    .reverse() // Reverse the order of the reviews
                    .map((review, index) => (
                        <Review
                            key={index}
                            author={review.username}
                            major={review.major}
                            comment={review.comment}
                            rating={review.rating}
                            term={review.term}
                            course={review.course}
                            grade={review.grade} 
                        />
                    ))
                )}
            </div>

            <div className="profile-page-write-review-container">
                <button className="profile-page-write-review-button" onClick={handleWriteReview}>Write a Review</button>
            </div>
        </div>
    );
};

export default ProfessorCard;


// //import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import './ProfessorCard.css';
// import NavBar from '../navBar/NavBar';
// import defaultPic from "../../images/defaultPic.png";
// import savedIcon from "../../images/saved_icon.png";
// import savedIconColored from "../../images/saved_icon_colored.png";
// import { useAuth } from '../../AuthContext';


// const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
// const apiUrl = "http://localhost:8000";

// const importProfessorImage = (imagePath) => {
//     try {
//         const images = require.context('../../images/professorpfp', false, /\.(png|jpe?g|svg)$/);
//         return images(`./${imagePath}`);
//     } catch (error) {
//         console.error('Failed to import image:', error);
//         return defaultPic;
//     }
// };

// const ProfessorCard = () => {
//     const navigate = useNavigate();
//     const { name } = useParams();
//     const { isAuthenticated } = useAuth(); // Destructure to get isAuthenticated from AuthContext

//     const [profname, setProfName] = useState('');
//     const [profdepartment, setProfDepartment] = useState('');
//     const [ID, setProid] = useState('');
//     const [isSaved, setIsSaved] = useState(false);
//     const [pfppath, setPfppath] = useState('');
//     const [professorInfo, setProfessorInfo] = useState({
//         name: '',
//         department: '',
//         profilePicture: '',
//         rating: 0,
//         reviews: []
//     });

//     useEffect(() => {
//         fetchProfessorInfo(name);
//         checkSavedStatus(name);
//     }, [name]);

//     const handleUnauthorized = () => {
//         const confirmSignUp = window.confirm("Sorry! This feature is only for registered users. Would you like to sign up?");
//         if (confirmSignUp) {
//             navigate('/signuppage');
//         }
//     };

//     const fetchProfessorInfo = (Data) => {
//         const [name, department, path, ID] = Data.split('+');
//         setProfName(name);
//         setProfDepartment(department);
//         setPfppath(path);
//         setProid(ID);
    
//         const request = {
//             professorID: ID
//         };

//         fetch(`${apiUrl}/backend/overallProfessorsRating/overallProfessorsRating.php?professorId=${ID}`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             }
//         })
//         .then(response => response.json())
//         .then(data => {
//             // Assuming data contains the total average in data.updatedAverages.total_average
//             const totalAverage = data.updatedAverages.total_average > 0 ? parseFloat(data.updatedAverages.total_average) : '-';
//             setProfessorInfo(prevInfo => ({
//                 ...prevInfo,
//                 rating: totalAverage // Update rating with the actual total average
//             }));
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
    
//         fetch(`${webServerUrl}/backend/searchFilter/searchprofessorreviews.php`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(request)
//         })
//             .then(response => {
//                 if (response.ok) {
//                     return response.json();
//                 } else {
//                     return response.json().then(data => {
//                         throw new Error(data.error);
//                     });
//                 }
//             })
//             .then(data => {
//                 console.log('Fetched reviews:', data);
//                 // Check if there are reviews available
//                 if (data.length > 0) {
//                     const updatedReviews = data.map(review => {
//                         // Extract individual ratings from the review object
//                         const { Feedback_Quality, accessibility, clarity, difficulty, helpfulness } = review;
    
//                         // Calculate average rating for the review
//                         const totalRating = parseInt(Feedback_Quality) + parseInt(accessibility) + parseInt(clarity) + parseInt(difficulty) + parseInt(helpfulness);
//                         const averageRating = totalRating / 5; // Assuming 5 attributes
    
//                         // Return the review object with the calculated average rating
//                         return {
//                             ...review,
//                             rating: averageRating
//                         };
//                     });
    
//                     setProfessorInfo({
//                         name: name,
//                         department: department,
//                         profilePicture: '',
//                         rating: '-', // You may want to calculate the overall rating based on all reviews
//                         reviews: updatedReviews
//                     });
//                 } else {
//                     // If no reviews available, set only the basic information
//                     setProfessorInfo({
//                         name: name,
//                         department: department,
//                         profilePicture: '',
//                         rating: '-', // You may want to calculate the overall rating based on all reviews
//                         reviews: []
//                     });
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });


//     };    
//         const checkSavedStatus = (Data) => {
//             const [name, department, path, ID] = Data.split('+');
//             setProfName(name);
//             setProfDepartment(department);
//             setPfppath(path);
//             setProid(ID);
//         const sessionID = localStorage.getItem('sessionID');
    
//         // If session ID is not found, handle the error
//         if (!sessionID) {
//             console.error('Session ID not found in local storage');
//             return;
//         }
    
//         const requestBody = {
//             sessionID: sessionID,
//             professorID: ID 
//         };
    
//         console.log('Request Body:', requestBody); // Print requestBody
    
//         fetch(`${webServerUrl}/backend/saveProfessor/checkSavedStatus.php`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(requestBody)
//         })
//         .then(response => response.json())
//         .then(data => {
//             setIsSaved(data.isSaved);
//             console.log('Fetched saved status:', data); // Print fetched data
//         })
//         .catch(error => {
//             console.error('Error:', error);
//         });
//     };
    
//     const toggleSave = () => {
//         if (!isAuthenticated) {
//             handleUnauthorized();
//             return;
//         }
//         const sessionID = localStorage.getItem('sessionID');

//         if (!sessionID) {
//             console.error('Session ID not found in local storage');
//             return;
//         }

//         const requestBody = {
//             sessionID: sessionID,
//             professorName: profname,
//             action: isSaved ? 'remove' : 'save'
//         };

//         fetch(`${webServerUrl}/backend/saveProfessor/saveList.php`, {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify(requestBody)
//         })
//             .then(response => response.json())
//             .then(data => {
//                 setIsSaved(!isSaved);
//                 console.log(data);
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//             });
//     };

//     const handleWriteReview = () => {
//         if (!isAuthenticated) {
//             handleUnauthorized();
//             return;
//         }
//         navigate(`/review/${profname+'+'+profdepartment+'+'+pfppath+'+'+ID}`);
//     };

//     const sortReviews = (sortBy) => {
//         const sortedReviews = [...professorInfo.reviews].sort((a, b) => {
//             if (sortBy === "rating") {
//                 return b.rating - a.rating;
//             } else if (sortBy === "author") {
//                 return a.author.localeCompare(b.author);
//             }
//             return 0;
//         });

//         setProfessorInfo({ ...professorInfo, reviews: sortedReviews });
//     };

//     const Review = ({ author, comment, rating, term, course, grade }) => {
//         return (
//             <div className="profile-page-review">
//                 <div className="profile-page-review-header">
//                     <h4>Anonymous</h4>
//                     <span>{term} - {course}</span>
//                     <span>Grade: {grade}</span>
//                     <span>Rating: {rating}</span>
//                 </div>
//                 <p>{comment}</p>
//             </div>
//         );
//     };

//     return (
//         <div className='profile-page-professor-main'>
//             <NavBar/>
//             <div className="profile-page-professor-card">
//                 <img
//                     src={isSaved ? savedIconColored : savedIcon}
//                     alt="Save Professor"
//                     className="profile-page-saved-icon"
//                     onClick={toggleSave}
//                 />
//                 <img src={importProfessorImage(pfppath)} alt="Professor" className="profile-page-professor-img" />
//                 <div className="profile-page-professor-info">
//                     <h2>{professorInfo.name}</h2>
//                     <p>{professorInfo.department}</p>
//                 </div>
//                 <div className="profile-page-professor-rating">
//                     <span>{professorInfo.rating}</span>
//                 </div>
//             </div>
//             <div className='profile-page-sort-button-container'>
//                 {/*<button className='profile-page-sort-button' onClick={() => sortReviews("rating")}>Sort by Rating</button>*/}
//                 {/* <button className='profile-page-sort-button' onClick={() => sortReviews("author")}>Sort by Author</button> */}
//             </div>

//             <div className="profile-page-reviews">
//                 {professorInfo.reviews.length === 0 ? (
//                     <p>No Reviews</p>
//                 ) : (
//                     professorInfo.reviews.map((review, index) => (
//                         <Review
//                             key={index}
//                             author={review.userID}
//                             comment={review.comment}
//                             rating={review.rating}
//                             term={review.term}
//                             course={review.course}
//                             grade={review.grade} 
//                         />
//                     ))
//                 )}
//             </div>

//             <div className="profile-page-write-review-container">
//                 <button className="profile-page-write-review-button" onClick={handleWriteReview}>Write a Review</button>
//             </div>
//         </div>
//     );
// };

// export default ProfessorCard;