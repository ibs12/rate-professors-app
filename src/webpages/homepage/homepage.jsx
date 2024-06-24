import React, { useState,useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../navBar/NavBar';
import NewNavBar from '../navBar/newNavBar';
import SearchIcon from '../../images/search_icon.png';
import './homepage.css';

const Homepage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('professors'); // Default filter by professors
  const [searchError, setSearchError] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
    const apiUrl = "http://localhost:8000";

    if (searchTerm.trim() !== '') {
      // if (filter === 'classes') {
      //   // If filter is set to "classes", show a popup saying "we will implement that later"
      //   alert('We will implement that later.');
      //   return; // Exit the function, don't proceed with the search
      // }

      fetch(`${apiUrl}/backend/searchFilter/searchFilter.php?query=${encodeURIComponent(searchTerm)}&filter=${filter}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          if (data.length > 0) {
            navigate('/search', { state: { professors: data } });
          } else {
            setSearchError('No results found.');
          }
        })
        .catch(error => {
          console.error('Error fetching search results:', error);
          setSearchError('Error fetching search results.');
        });
    }
  };

  return (
    <div>
      {windowWidth < 768 ? <NavBar /> : <NewNavBar />}
      <div className="content-container">
        <div className="text-container">
          <p className="intro-text">I want to get to know ...</p>
        </div>
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            placeholder="Enter a Professor or Class"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <select
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="professors">Filter by Professor</option>
            <option value="classes">Filter by Class</option>
          </select>
          <button className="search-button" onClick={handleSearch}>
            <img src={SearchIcon} alt="Search" />
          </button>
        </div>
        {searchError && <p className="error-message">{searchError}</p>}
      </div>
    </div>
  );
};

export default Homepage;
