import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

function Profile() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!user) {
            navigate('/auth');
            return;
        }
        const token = userStr ? JSON.parse(userStr).token : null;
        if (!token) {
            localStorage.removeItem('user');
            navigate('/auth');
            return;
        }

        fetch(`http://localhost:5000/api/users/${user.id}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('user');
                    navigate('/auth');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                else {
                    console.error('Failed to fetch orders:', data);
                    setOrders([]);
                }
            })
            .catch(err => console.error("Error fetching orders:", err));
    }, [navigate]);

    const handleCancel = async (orderId) => {
        if (!window.confirm('Cancel this order?')) return;
        const token = userStr ? JSON.parse(userStr).token : null;
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                toast.success('Order cancelled.');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
            } else {
                toast.error(data.error || 'Failed to cancel order.');
            }
        } catch {
            toast.error('Network error.');
        }
    };

    if (!user) return null;

    return (
        <div style={{ backgroundColor: '#333', minHeight: '100vh', color: '#fff', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px auto' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem' }}>{user.name}'s Profile</h1>
                <Link to="/" style={{ color: '#007bff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.2rem' }}>&larr; Back to Store</Link>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#222', borderRadius: '15px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
                <h2 style={{ borderBottom: '1px solid #444', paddingBottom: '10px', marginTop: 0 }}>Your Order History</h2>

                {orders.length === 0 ? (
                    <p style={{ color: '#aaa', fontStyle: 'italic' }}>You haven't placed any orders yet.</p>
                ) : (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {orders.map(order => (
                            <li key={order.id} style={{ borderBottom: '1px solid #444', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc107' }}>Order #{order.id}</span>
                                    <span style={{ color: '#bbb' }}>{new Date(order.created_at).toLocaleString()}</span>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', color: '#ddd' }}>{order.items_summary}</p>
                                    <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem' }}>{order.total_price} TL</p>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        padding: '5px 12px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        fontSize: '0.9rem',
                                        backgroundColor: order.status === 'Delivered' ? '#28a745' : (order.status === 'Cancelled' ? '#dc3545' : (order.status === 'On the way' || order.status === 'Preparing') ? '#17a2b8' : '#6c757d'),
                                        color: 'white'
                                    }}>
                                        {order.status || 'Pending'}
                                    </span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {(!order.status || order.status === 'Pending') && (
                                            <button
                                                onClick={() => handleCancel(order.id)}
                                                style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        <Link to={`/track/${order.id}`} style={{ backgroundColor: '#007bff', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: '5px', fontWeight: 'bold', transition: '0.2s' }}>
                                            Track Order &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default Profile;
