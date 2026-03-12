import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(res => res.json())
      .then(data => setRestaurants(data))
      .catch(err => console.error("Error fetching restaurants:", err));
  }, []);

  return (
    <div style={{ backgroundColor: '#333', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem' }}>Discover Restaurants</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {user && user.is_admin === 1 && (
            <Link to="/admin" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold' }}>
              Admin Dashboard
            </Link>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#444', padding: '5px 15px', borderRadius: '30px', textDecoration: 'none', color: 'white', transition: '0.2s', cursor: 'pointer' }}>
                <div style={{ backgroundColor: '#ffc107', color: '#000', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontWeight: 'bold' }}>{user.name}</span>
              </Link>
              <button
                onClick={() => { localStorage.removeItem('user'); window.location.reload(); }}
                style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}>
                Logout
              </button>
            </div>
          ) : (
            <Link to="/auth" style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 'bold', border: '2px solid #ffc107', padding: '8px 20px', borderRadius: '20px', transition: '0.2s' }}>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>
        {restaurants.map(restaurant => (
          <div
            key={restaurant.id}
            style={{
              backgroundColor: '#444',
              borderRadius: '15px',
              overflow: 'hidden',
              width: 'calc(33.333% - 20px)',
              minWidth: '300px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Image placeholder or real image. The DB likely has image_url, or we can use a fallback */}
            <img
              src={restaurant.image_url || 'https://placehold.co/400x200?text=Restaurant'}
              alt={restaurant.name}
              style={{ width: '100%', height: '220px', objectFit: 'cover' }}
            />
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '1.5rem' }}>{restaurant.name}</h2>
              <p style={{ margin: '0 0 20px 0', color: '#bbb', lineHeight: '1.5', flexGrow: 1 }}>
                {restaurant.description || 'Delicious food awaits you here!'}
              </p>
              <button
                onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ffc107',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  padding: 0,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  width: 'fit-content'
                }}
              >
                View Menu <span>&rarr;</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RestaurantList;
