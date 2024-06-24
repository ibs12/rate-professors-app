import React, { useState, useEffect } from 'react';
import ProfessorProfiles from '../../components/Searchcomponents/ProfessorSearchPage';
import NavBar from '../navBar/NavBar';
import NewNavBar from '../navBar/newNavBar';
import { useLocation } from 'react-router-dom';

function Search() {
  const [professors, setProfessors] = useState([]);
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('professors'); // Default filter by professors


  const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
  const apiUrl = "http://localhost:8000";

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
    // Check if search results are available in location state
    if (location.state && location.state.professors) {
      // If available, set the professors state with the search results
      setProfessors(location.state.professors.map(({ professors, pfppath, ...rest }) => ({ name: professors, pfppath, ...rest })));
    } else {
      // If not available, fetch search results from the backend
      fetch(`${apiUrl}/backend/searchFilter/?filter=professors`)
        .then(response => response.json())
        .then(data => {
          console.log("Received data from backend:", data);
          setProfessors(data.map(({ professors, pfppath, ...rest }) => ({ name: professors, pfppath, ...rest })));
        })
        .catch(error => console.error('Error fetching search results:', error));
    }
  }, [location.state]); 

  console.log("Search results:", professors); // Add this line to print search results

  return (
    <div className="App">
      {windowWidth < 767 ? <NavBar /> : <NewNavBar />}
      <ProfessorProfiles professors={professors} setProfessors={setProfessors}/>
    </div>
  );
}

export default Search;

