import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { X, User, Phone, MapPin } from 'lucide-react';

function Store() {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return { name: user.name || '', phone: user.phone || '', address: user.address || '' };
      } catch {
        return { name: '', phone: '', address: '' };
      }
    }
    return { name: '', phone: '', address: '' };
  });
  const [isCartVisible, setIsCartVisible] = useState(false);

  useEffect(() => {
    // Fetch Restaurant Details
    fetch(`http://localhost:5000/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => setRestaurant(data))
      .catch(err => console.error("Error fetching restaurant:", err));

    // Fetch Restaurant Products
    fetch(`http://localhost:5000/api/restaurants/${id}/products`)
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error("Error fetching products:", err));
  }, [id]);

  const addToCart = (product) => {
    // We can group identical items using a temporary map or state updates, but keeping simple for now
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productToRemove) => {
    setCart(cart.filter(item => item.id !== productToRemove.id));
  };

  const decreaseQuantity = (productToDecrease) => {
    const existingItem = cart.find(item => item.id === productToDecrease.id);
    if (existingItem.quantity > 1) {
      setCart(cart.map(item => item.id === productToDecrease.id ? { ...item, quantity: item.quantity - 1 } : item));
    } else {
      removeFromCart(productToDecrease);
    }
  };

  const completeOrder = async (e) => {
    e.preventDefault();
    if (!checkoutData.name || !checkoutData.phone || !checkoutData.address) {
      toast.error("Please fill in all details.");
      return;
    }

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const token = user ? user.token : null;

    const orderData = {
      customer_name: checkoutData.name,
      customer_phone: checkoutData.phone,
      customer_address: checkoutData.address,
      total_price: cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0),
      items: cart,
      restaurant_id: id
    };

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        toast.success("Order placed successfully! Enjoy your meal 🍔", { duration: 4000 });
        setCart([]);
        setIsCheckoutOpen(false);
        navigate('/');
      } else {
        toast.error("An error occurred while placing order.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while placing order.");
    }
  };

  if (!restaurant) return <div style={{ color: '#fff', padding: '20px' }}>Loading...</div>;

  return (
    <div style={{ backgroundColor: '#111', color: '#eee', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ backgroundColor: '#333', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: '#ffc107', textDecoration: 'none', fontWeight: 'bold' }}>&larr; Back</Link>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>{restaurant.name} Menu</h1>
        </div>
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

      {/* Floating Cart Button */}
      <button
        onClick={() => setIsCartVisible(true)}
        style={{
          position: 'fixed',
          bottom: '40px',
          right: isCartVisible ? '-100px' : '40px',
          backgroundColor: '#ffc107',
          borderRadius: '50%',
          width: '70px',
          height: '70px',
          border: 'none',
          boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
          cursor: 'pointer',
          fontSize: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        title="Open Cart"
      >
        🛒
        {cart.length > 0 && (
          <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#dc3545', color: 'white', fontSize: '14px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontWeight: 'bold', border: '2px solid #fff' }}>
            {cart.reduce((acc, item) => acc + item.quantity, 0)}
          </span>
        )}
      </button>

      <div style={{ padding: '20px', fontFamily: 'Arial', transition: 'padding-right 0.4s cubic-bezier(0.4, 0, 0.2, 1)', paddingRight: isCartVisible ? '420px' : '20px' }}>
        {/* Main Menu */}
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {products.map(product => (
            <div key={product.id} style={{ border: '1px solid #444', padding: '15px', borderRadius: '10px', width: '220px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)', backgroundColor: '#222', display: 'flex', flexDirection: 'column' }}>
              {product.image_url && (
                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }} />
              )}
              <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>{product.name}</h3>
              <p style={{ color: '#999', margin: '0 0 5px 0' }}>{product.category}</p>
              {product.description && <p style={{ color: '#bbb', fontSize: '0.9em', margin: '0 0 10px 0', lineHeight: '1.4', flexGrow: 1 }}>{product.description}</p>}
              <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: '#ffc107', marginTop: 'auto', marginBottom: '10px' }}>{product.price} TL</p>
              <button
                onClick={() => addToCart(product)}
                style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '10px', width: '100%', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold', transition: '0.2s' }}>
                Add to Cart
              </button>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: '#aaa', fontStyle: 'italic' }}>No products found for this restaurant.</p>}
        </div>
      </div>

      {/* Right Side: Animated Cart Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: isCartVisible ? '0' : '-400px',
        width: '400px',
        height: '100vh',
        backgroundColor: '#f9f9f9',
        boxShadow: '-5px 0 20px rgba(0,0,0,0.15)',
        transition: 'right 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 1000,
        padding: '30px 20px',
        boxSizing: 'border-box',
        overflowY: 'auto',
        color: '#333'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>🛒 Your Cart ({cart.reduce((total, item) => total + item.quantity, 0)})</h2>
          <button onClick={() => setIsCartVisible(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }} title="Close Cart"><X size={24} /></button>
        </div>

        {cart.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', marginTop: '40px' }}>Your cart is currently empty.</p>
        ) : (
          <div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {cart.map((item) => (
                <li key={item.id} style={{ padding: '15px 0', borderBottom: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>{item.name} {item.quantity > 1 ? `x${item.quantity}` : ''}</span>
                    <strong style={{ color: '#28a745', fontSize: '1.1rem' }}>{(item.price * item.quantity).toFixed(2)} TL</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#e9ecef', padding: '3px 8px', borderRadius: '15px' }}>
                      <button onClick={() => decreaseQuantity(item)} style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>-</button>
                      <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center', color: '#333' }}>{item.quantity}</span>
                      <button onClick={() => addToCart(item)} style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', fontWeight: 'bold' }}>+</button>
                    </div>
                    <button onClick={() => removeFromCart(item)} style={{ background: '#ffe5e5', color: '#dc3545', border: '1px solid #dc3545', cursor: 'pointer', fontSize: '0.8rem', padding: '5px 10px', borderRadius: '5px', fontWeight: 'bold' }}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <hr style={{ borderColor: '#ddd', margin: '20px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#333', fontSize: '1.5rem', margin: 0 }}>Total:</h3>
              <h3 style={{ color: '#d32f2f', fontSize: '1.8rem', margin: 0 }}>{cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0).toFixed(2)} TL</h3>
            </div>
            <button onClick={() => setIsCheckoutOpen(true)} style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '15px', width: '100%', cursor: 'pointer', borderRadius: '8px', fontSize: '1.2em', fontWeight: 'bold', marginTop: '20px', transition: '0.2s', boxShadow: '0 4px 6px rgba(40, 167, 69, 0.3)' }}>
              Complete Order ➔
            </button>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '400px', color: '#333', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Checkout Details</h2>
              <button onClick={() => setIsCheckoutOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}><X size={24} /></button>
            </div>

            <form onSubmit={completeOrder} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                <User size={18} color="#666" style={{ marginRight: '10px' }} />
                <input required placeholder="Your Full Name" value={checkoutData.name} onChange={e => setCheckoutData({ ...checkoutData, name: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: '#333' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                <Phone size={18} color="#666" style={{ marginRight: '10px' }} />
                <input required placeholder="Phone Number" value={checkoutData.phone} onChange={e => setCheckoutData({ ...checkoutData, phone: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', color: '#333' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
                <MapPin size={18} color="#666" style={{ marginRight: '10px' }} />
                <textarea required placeholder="Delivery Address" value={checkoutData.address} onChange={e => setCheckoutData({ ...checkoutData, address: e.target.value })} style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '15px', resize: 'none', fontFamily: 'inherit', color: '#333' }} rows={3} />
              </div>
              <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '15px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s', display: 'flex', justifyContent: 'space-between' }}>
                <span>Confirm & Pay</span>
                <span>{(cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0)).toFixed(2)} TL</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Store;
