import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', address: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? '/api/login' : '/api/signup';

        try {
            const response = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || (isLogin ? 'Logged in successfully' : 'Signed up successfully'));
                if (data.user) {
                    const userWithToken = { ...data.user, token: data.token };
                    localStorage.setItem('user', JSON.stringify(userWithToken));
                }
                navigate('/');
            } else {
                toast.error(data.error || 'Authentication failed');
            }
        } catch {
            toast.error('Network error. Is the server running?');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ background: '#222', padding: '40px', borderRadius: '15px', width: '100%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)', color: '#fff' }}>
                <h2 style={{ textAlign: 'center', margin: '0 0 20px 0', fontSize: '2rem' }}>{isLogin ? 'Login' : 'Sign Up'}</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {!isLogin && (
                        <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff', outline: 'none' }} />
                    )}

                    <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff', outline: 'none' }} />
                    <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff', outline: 'none' }} />

                    {!isLogin && (
                        <>
                            <input required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff', outline: 'none' }} />
                            <textarea required placeholder="Delivery Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ padding: '15px', borderRadius: '8px', border: '1px solid #444', background: '#111', color: '#fff', outline: 'none', resize: 'vertical' }} rows={3} />
                        </>
                    )}

                    <button type="submit" style={{ padding: '15px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer', marginTop: '10px' }}>
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: '#aaa', fontSize: '1rem' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span onClick={() => { setIsLogin(!isLogin); setFormData({ name: '', email: '', password: '', phone: '', address: '' }); }} style={{ color: '#ffc107', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isLogin ? 'Sign Up' : 'Login'}
                    </span>
                </p>

                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,193,7,0.1)', border: '1px solid #ffc107', borderRadius: '8px', color: '#ffc107', textAlign: 'center' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 'bold' }}>Demo Admin Login</p>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#ddd' }}>Email: <strong style={{ color: '#fff' }}>admin@order.com</strong></p>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: '#ddd' }}>Password: <strong style={{ color: '#fff' }}>admin123</strong></p>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/" style={{ color: '#aaa', textDecoration: 'none', fontSize: '1rem' }}>&larr; Back to Home</Link>
                </div>
            </div>
        </div>
    );
}

export default Auth;
