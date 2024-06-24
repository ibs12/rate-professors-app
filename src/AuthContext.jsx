import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const webServerUrl = "https://www-student.cse.buffalo.edu/CSE442-542/2024-Spring/cse-442ac"
  const apiUrl = "http://localhost:8000";


  const signOut = () => {
    localStorage.clear();
    setIsAuthenticated(false);
  };

  const checkAuth = () => {
    const email = localStorage.getItem('email');
    const sessionID = localStorage.getItem('sessionID');
    const userID = localStorage.getItem('userID');
  
    if (email && sessionID && userID) {
      fetch(`${apiUrl}/backend/authentication/auth.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, sessionID, userID }),
      })
      .then(response => {
        if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data.status === "success") {
          setIsAuthenticated(true);
        } else {
          throw new Error('Authentication failed');
        }
      })
      .catch(error => {
        console.error('Authentication check failed:', error);
        signOut();
      })
      .finally(() => {
        setIsLoading(false); // Set loading to false when the check is complete
      });
    } else {
      signOut();
      setIsLoading(false);
    }
  };



  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, setIsAuthenticated, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
  
};
