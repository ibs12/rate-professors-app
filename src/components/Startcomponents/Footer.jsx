import React from 'react';
import {Link} from 'react-router-dom';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer" style={{ position: 'relative' }}>
      <Link to="/signuppage/" style={{ textDecoration: 'none' }}>
      <button style={{
        position: 'relative',
        width: 'calc(20.4vw + 20.4vh)',  // Reduced width from 24.8 to 12.4
        height: 'calc(2vw + 2vh)',        // Reduced height from 4 to 2
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#005BBB',
        borderRadius: '15.5633px',
        border: 'none',
        color: '#FFFFFF',
        fontFamily: 'Crimson Text',
        fontStyle: 'normal',
        fontWeight: '600',
        fontSize: 'calc(1.25vw + 1.25vh)', // Reduced font size from 2.5 to 1.25
        lineHeight: '31.5px',              // Adjusted line height to half of previous
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',          // Center horizontally
        textAlign: 'center'
    }}>
        Sign up now!
    </button>

      </Link>
      <p style={{
        position: 'absolute',
        top: '50%',
        transform: 'translateY(-50%)',
        right: '40%', /* Adjust position */
        fontSize: 'calc(1.0vw + 1.0vh)', /* Adjust font size */
        color: '#000' /* Adjust color */,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center', /* Center horizontally */
        textAlign: 'center'
      }}>
        <Link to="/homepage/" style={{ textDecoration: 'none' }}> No thanks! I'll sign up later.</Link>

      </p>
    </footer>
  );
}

export default Footer;
