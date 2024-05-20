import React from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import './NavBar.css'; // Make sure to create a corresponding CSS file
import Logo from "../../images/Logo.png";

function NavBar() {
    return (
        <nav style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#005bbb',
            color: 'white',
            padding: '0.5rem 1rem', // Reduced vertical padding
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link to="/"> 
                    <img src={Logo} alt="Logo" style={{ height: '40px', marginRight: '1rem' }} />
                </Link>
            </div>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                width: '30%', // Adjust this value based on your needs
            }}>
                <Link to="/help" style={{ // Updated href to to and changed to help page
                    color: '#FFFFFF',
                    fontSize: '20px',
                    fontFamily: 'Crimson Text',
                    fontWeight: '400',
                    textDecoration: 'none',
                    marginRight: '20px', // Adjust the spacing between links as needed
                }}>Help</Link>
                <Link to="/signinpage" style={{
                    color: '#FFFFFF',
                    fontFamily: 'Crimson Text',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    fontSize: '20px',
                    textDecoration: 'none',
                    marginRight: '20px',

                }}>Sign In</Link>
                <Link to="/signuppage" style={{
                    background: '#FFFFFF',
                    color: '#000000',
                    fontSize: '20px',
                    fontFamily: 'Crimson Text',
                    fontStyle: 'normal',
                    fontWeight: '400',
                    borderRadius: '9.26822px',
                    textDecoration: 'none',
                    padding: '5px 20px', // Reduced vertical padding in the "Sign Up" button
                }}>Sign Up</Link>
            </div>
        </nav>
    );
}

export default NavBar;
