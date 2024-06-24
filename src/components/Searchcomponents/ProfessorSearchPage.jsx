import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SearchIcon from './search_icon.png';
import './Search.css';
import './ProfessorSearchResult.css';
import defaultPic from './defaultPic.png';

const importProfessorImage = (imagePath) => {
  try {
    const images = require.context('../../images/professorpfp', false, /\.(png|jpe?g|svg)$/);
    return images(`./${imagePath}`);
  } catch (error) {
    return defaultPic;
  }
};

const ProfessorSearchPage = ({ professors, setProfessors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('professors'); // Default filter by professors
  const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac";
  const apiUrl = "http://localhost:8000";

  
  
  
  const handleSearchInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchButtonClick = () => {
    if (searchTerm.trim() !== '') {
      fetch(`${apiUrl}/backend/searchFilter/searchFilter.php?query=${encodeURIComponent(searchTerm)}&filter=${filter}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setProfessors(data.map(({ professors, pfppath, ...rest }) => ({ name: professors, pfppath, ...rest })));
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
          alert('Failed to fetch professors.');
        });
    } else {
      alert('Please enter a search term.');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchButtonClick();
    }
  };

  return (
    <div className="search-app">
      <p className="search-intro-text">I want to get to know ...</p>
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter a Professor"
          className="search-search-input"
          value={searchTerm}
          onChange={handleSearchInputChange}
          onKeyDown={handleKeyDown}
        />
        <select
          className="search-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="professors">Filter by Professor</option>
          <option value="classes">Filter by Class</option>
        </select>
        <button className="search-search-button" onClick={handleSearchButtonClick}>
          <img src={SearchIcon} alt="Search" />
        </button>
      </div>
      <h1 className="search-header">Professor Search Results:</h1>
      {professors.map((professor, index) => (
        <div key={index} className="search-professor-search-result">
          <div className="search-left-section">
            {professor.pfppath && (
              <img
                src={importProfessorImage(professor.pfppath.split('/').pop())}
                alt={professor.name}
                className="search-professor-photo"
              />
            )}
          </div>
          <div className="search-right-section">
            <h2 className="search-professor-name">
              <Link to={{ pathname: `/professor/${professor.name + '+' + professor.department +'+'+professor.pfppath.split('/').pop()}`+'+'+professor.professorID}}>
                {professor.name}
              </Link>
            </h2>
            <div className="search-info-section">
              <p className="search-professor-department">Department: {professor.department}</p>
              <div className="search-courses-section">
                <div className="search-courses-taught">
                  <h3 className="search-courses-header">Teaching courses presently:</h3>
                  <p className="search-courses-list">{professor.classes}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfessorSearchPage;
