import React, { useState } from 'react';
import './infoGraphicsCard.css'; 

const InfoGraphicsCard = ({ 
    difficultyAverage,
    feedbackQualityAverage,
    accessibilityAverage,
    clarityAverage,
    helpfulnessAverage,
    averageGrade,
    averageGPAs
}) => {
    const [selectedCourse, setSelectedCourse] = useState('overall'); // State to track the selected course

    // Function to handle null values
    const renderValue = (value) => {
        return value !== null ? (typeof value === 'number' ? value.toFixed(2) : value) : '-/5';
    };

    const convertNumberToLetterGrade = (gpa) => {
        if (gpa >= 3.667) return 'A';
        else if (gpa >= 3.333) return 'A-';
        else if (gpa >= 3.0) return 'B+';
        else if (gpa >= 2.667) return 'B';
        else if (gpa >= 2.333) return 'B-';
        else if (gpa >= 2.0) return 'C+';
        else if (gpa >= 1.667) return 'C';
        else if (gpa >= 1.333) return 'C-';
        else if (gpa >= 1.0) return 'D+';
        else if (gpa >= 0.667) return 'D';
        else if (gpa >= 0.333) return 'D-';
        else if (gpa < 0.333) return 'F';
        return '-'; // Handle null or undefined cases
    };
    

    // Function to handle course selection change
    const handleCourseChange = (event) => {
        setSelectedCourse(event.target.value);
    };

    // Function to render the selected course
    const renderCourseAverage = () => {
        if (selectedCourse === 'overall') {
            return (
                <>
                    <p>Average Ease of Class: {renderValue(difficultyAverage)}</p>
                    <p>Average Feedback Quality: {renderValue(feedbackQualityAverage)}</p>
                    <p>Average Accessibility: {renderValue(accessibilityAverage)}</p>
                    <p>Average Clarity: {renderValue(clarityAverage)}</p>
                    <p>Average Helpfulness: {renderValue(helpfulnessAverage)}</p>
                    <p>Overall Average Grade: {convertNumberToLetterGrade(averageGrade)}</p>
                </>
            );
        } else {
            const courseAverages = averageGPAs[selectedCourse];
            return (
                <>
                    <p>Average Ease of Class for {selectedCourse}: {renderValue(courseAverages.averageDifficulty)}</p>
                    <p>Average Feedback Quality for {selectedCourse}: {renderValue(courseAverages.averageFeedbackQuality)}</p>
                    <p>Average Accessibility for {selectedCourse}: {renderValue(courseAverages.averageAccessibility)}</p>
                    <p>Average Clarity for {selectedCourse}: {renderValue(courseAverages.averageClarity)}</p>
                    <p>Average Helpfulness for {selectedCourse}: {renderValue(courseAverages.averageHelpfulness)}</p>
                    <p>Average GPA for {selectedCourse}: {renderValue(courseAverages.averageGPA)}</p>
                </>
            );
        }
    };

    return (
        <div className="info-graphics-card">
            <div className="info-graphics-card-header">Exclusive information</div>
            <select id="courseOption" value={selectedCourse} onChange={handleCourseChange}>
                        <option value="overall">Overall Average Grade</option>
                        {Object.keys(averageGPAs).map(course => (
                            <option key={course} value={course}>{course}</option>
                        ))}
                    </select>
            <div className="info-graphics-card-content">
                {renderCourseAverage()}

            </div>
        </div>
    );
};

export default InfoGraphicsCard;
