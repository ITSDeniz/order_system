import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Clock, ChefHat, Truck, Home, User, Phone, MapPin } from 'lucide-react';

function OrderTracking() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let interval;

        const fetchOrder = () => {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;

            fetch(`http://localhost:5000/api/orders/${id}`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            })
                .then(res => {
                    if (res.status === 401 || res.status === 403) {
                        clearInterval(interval); // stop polling on auth errors
                        throw new Error('Unauthorized');
                    }
                    if (!res.ok) {
                        clearInterval(interval); // stop polling if order not found
                        throw new Error('Order not found');
                    }
                    return res.json();
                })
                .then(data => {
                    setOrder(data);
                    setLoading(false);
                    // Stop polling once order is delivered or cancelled
                    if (data.status === 'Delivered' || data.status === 'Cancelled') {
                        clearInterval(interval);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        };

        fetchOrder();
        interval = setInterval(fetchOrder, 5000); // refresh every 5s
        return () => clearInterval(interval);
    }, [id]);

    if (loading) {
        return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', color: '#333' }}>Loading Order #{id}...</div>;
    }

    if (!order) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f5f5f5', color: '#333' }}>
                <h2>Order not found</h2>
                <Link to="/" style={{ padding: '10px 20px', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Back to Store</Link>
            </div>
        );
    }

    // Handle cancelled orders — stepper doesn't apply
    if (order.status === 'Cancelled') {
        return (
            <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f5f5f5', color: '#333', fontFamily: 'Arial' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                    <h1 style={{ color: '#dc3545' }}>❌ Order #{order.id} Cancelled</h1>
                    <p style={{ color: '#666' }}>This order was cancelled and will not be delivered.</p>
                    <Link to="/" style={{ padding: '10px 20px', background: '#ffc107', color: 'black', textDecoration: 'none', borderRadius: '5px', fontWeight: 'bold' }}>Back to Store</Link>
                </div>
            </div>
        );
    }

    const statusSteps = ['Pending', 'Preparing', 'On the way', 'Delivered'];
    const currentStepIndex = statusSteps.indexOf(order.status || 'Pending');

    return (
        <div style={{ padding: '40px 20px', minHeight: '100vh', background: '#f5f5f5', color: '#333', fontFamily: 'Arial' }}>
            <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '20px', marginBottom: '20px' }}>
                    <h1 style={{ margin: 0, fontSize: '24px' }}>Order Tracking</h1>
                    <Link to="/" style={{ textDecoration: 'none', color: '#007bff', fontWeight: 'bold' }}>Back to Store</Link>
                </div>

                <div style={{ marginBottom: '30px', textAlign: 'center' }}>
                    <h2 style={{ marginTop: 0, fontSize: '32px' }}>Order #{order.id}</h2>
                    <p style={{ color: '#666' }}>Placed on {new Date(order.created_at).toLocaleString()}</p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginBottom: '40px', position: 'relative' }}>
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        let Icon = CheckCircle;
                        if (step === 'Pending') Icon = Clock;
                        if (step === 'Preparing') Icon = ChefHat;
                        if (step === 'On the way') Icon = Truck;
                        if (step === 'Delivered') Icon = Home;

                        return (
                            <div key={step} style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', position: 'relative' }}>
                                {index < statusSteps.length - 1 && (
                                    <div style={{ position: 'absolute', top: '40px', left: '19px', width: '2px', height: '100%', background: index < currentStepIndex ? '#28a745' : '#ddd', zIndex: 1 }} />
                                )}
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    background: isCompleted ? '#28a745' : '#eee',
                                    color: isCompleted ? 'white' : '#999',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                    zIndex: 2, boxShadow: isCurrent ? '0 0 0 5px rgba(40,167,69,0.2)' : 'none',
                                    transition: 'all 0.3s'
                                }}>
                                    <Icon size={20} />
                                </div>
                                <div style={{ paddingTop: '8px' }}>
                                    <h3 style={{ margin: 0, color: isCompleted ? '#333' : '#999' }}>{step}</h3>
                                    {isCurrent && <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>
                                        {step === 'Pending' && 'We have received your order.'}
                                        {step === 'Preparing' && 'Our chefs are cooking your meal!'}
                                        {step === 'On the way' && 'Your food is out for delivery.'}
                                        {step === 'Delivered' && 'Enjoy your meal!'}
                                    </p>}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '10px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Order Details</h3>
                    <p style={{ margin: '8px 0', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><User size={16} style={{ marginTop: '2px' }} /> <strong>Name:</strong> {order.customer_name}</p>
                    <p style={{ margin: '8px 0', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><Phone size={16} style={{ marginTop: '2px' }} /> <strong>Phone:</strong> {order.customer_phone}</p>
                    <p style={{ margin: '8px 0', color: '#555', display: 'flex', alignItems: 'flex-start', gap: '10px' }}><MapPin size={16} style={{ marginTop: '2px' }} /> <strong>Address:</strong> {order.customer_address}</p>
                    <div style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <p style={{ margin: '0 0 10px 0', color: '#555', fontWeight: 'bold' }}>Items ordered:</p>
                        <p style={{ margin: 0, color: '#666', lineHeight: '1.5' }}>{order.items_summary}</p>
                    </div>
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Total Paid:</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>{order.total_price} TL</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderTracking;
