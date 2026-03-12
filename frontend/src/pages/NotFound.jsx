import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#111',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Arial, sans-serif',
            textAlign: 'center',
            gap: '20px',
            padding: '20px'
        }}>
            <div style={{ fontSize: '6rem' }}>🍔</div>
            <h1 style={{ fontSize: '5rem', margin: 0, color: '#ffc107' }}>404</h1>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: '#aaa' }}>Oops! Page not found.</h2>
            <p style={{ color: '#666', maxWidth: '400px' }}>
                The page you're looking for doesn't exist. Maybe you took a wrong turn at the kitchen?
            </p>
            <Link
                to="/"
                style={{
                    marginTop: '10px',
                    padding: '14px 30px',
                    backgroundColor: '#ffc107',
                    color: '#111',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }}
            >
                🏠 Back to Home
            </Link>
        </div>
    );
}

export default NotFound;
