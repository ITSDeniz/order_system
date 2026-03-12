import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogOut, Phone, MapPin } from 'lucide-react';

function Admin() {
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        if (!user || user.is_admin !== 1) {
            navigate('/');
        }
    }, [navigate]);

    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [restaurants, setRestaurants] = useState([]);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders'
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image_url: '', description: '', restaurant_id: '' });
    const [editingId, setEditingId] = useState(null);
    const [filterRestaurantId, setFilterRestaurantId] = useState('');

    const fetchProducts = () => {
        fetch('http://localhost:5000/api/products')
            .then(res => res.json())
            .then(data => setProducts(data))
            .catch(err => console.error(err));
    };

    const fetchOrders = () => {
        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;
        if (!token) {
            localStorage.removeItem('user');
            navigate('/auth');
            return;
        }

        fetch('http://localhost:5000/api/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(res => {
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('user');
                    navigate('/auth');
                    toast.error('Session expired. Please log in again.');
                    throw new Error('Unauthorized');
                }
                return res.json();
            })
            .then(data => {
                if (Array.isArray(data)) setOrders(data);
                else console.error('Failed to fetch orders:', data);
            })
            .catch(err => console.error(err));
    };

    const fetchRestaurants = () => {
        fetch('http://localhost:5000/api/restaurants')
            .then(res => res.json())
            .then(data => setRestaurants(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        fetchProducts();
        fetchOrders();
        fetchRestaurants();
    }, []);

    const handleAddOrEditProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price || !newProduct.category || !newProduct.restaurant_id) {
            toast.error('Please fill in required details including restaurant!');
            return;
        }

        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;

        if (editingId) {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${editingId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newProduct)
                });
                if (response.ok) {
                    toast.success('Product updated successfully!');
                    setNewProduct({ name: '', price: '', category: '', image_url: '', description: '', restaurant_id: '' });
                    setEditingId(null);
                    fetchProducts();
                }
            } catch (err) {
                toast.error('Error updating product');
                console.error(err);
            }
        } else {
            try {
                const response = await fetch('http://localhost:5000/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(newProduct)
                });
                if (response.ok) {
                    toast.success('Product added successfully!');
                    setNewProduct({ name: '', price: '', category: '', image_url: '', description: '', restaurant_id: '' });
                    fetchProducts();
                }
            } catch (err) {
                toast.error('Error adding product');
                console.error(err);
            }
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        const userStr = localStorage.getItem('user');
        const token = userStr ? JSON.parse(userStr).token : null;

        try {
            const response = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success('Product deleted!');
                fetchProducts();
            }
        } catch (err) {
            toast.error('Error deleting product');
            console.error(err);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            const userStr = localStorage.getItem('user');
            const token = userStr ? JSON.parse(userStr).token : null;
            const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) {
                toast.success(`Order #${orderId} marked as ${newStatus}`);
                fetchOrders();
            }
        } catch (err) {
            toast.error('Failed to update status');
            console.error(err);
        }
    };

    const filteredProducts = filterRestaurantId
        ? products.filter(p => p.restaurant_id === parseInt(filterRestaurantId))
        : products;

    const filteredOrders = filterRestaurantId
        ? orders.filter(o => o.restaurant_id === parseInt(filterRestaurantId))
        : orders;

    return (
        <div style={{ padding: '30px', color: '#111', background: '#f5f5f5', minHeight: '100vh', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '15px' }}>
                    Admin Dashboard
                    <div style={{ display: 'flex', background: '#e0e0e0', padding: '5px', borderRadius: '8px', fontSize: '16px' }}>
                        <button onClick={() => setActiveTab('menu')} style={{ background: activeTab === 'menu' ? 'white' : 'transparent', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'menu' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Menu Items</button>
                        <button onClick={() => setActiveTab('orders')} style={{ background: activeTab === 'orders' ? 'white' : 'transparent', color: '#333', border: 'none', padding: '8px 15px', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', boxShadow: activeTab === 'orders' ? '0 2px 4px rgba(0,0,0,0.1)' : 'none' }}>Orders</button>
                    </div>
                    <select value={filterRestaurantId} onChange={(e) => setFilterRestaurantId(e.target.value)} style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white', cursor: 'pointer', color: '#333', fontSize: '16px', marginLeft: 'auto', marginRight: '20px' }}>
                        <option value="">All Restaurants</option>
                        {restaurants.map(r => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </h1>
                <Link to="/" style={{ textDecoration: 'none', padding: '10px 20px', background: '#333', color: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Exit Admin
                </Link>
            </div>

            {activeTab === 'menu' && (
                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', marginTop: '20px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 300px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleAddOrEditProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input required placeholder="Product Name (e.g. Burger)" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                            <input required type="number" placeholder="Price (TL)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                            <input required placeholder="Category (e.g. Fast Food)" value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                            <input placeholder="Image URL (Optional)" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
                            <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', resize: 'vertical' }} rows={3} />
                            <select required value={newProduct.restaurant_id} onChange={e => setNewProduct({ ...newProduct, restaurant_id: parseInt(e.target.value) })} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', background: 'white', cursor: 'pointer', color: '#333' }}>
                                <option value="" disabled style={{ color: '#888' }}>Select a Restaurant</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id} style={{ color: '#333' }}>{r.name}</option>
                                ))}
                            </select>
                            <button type="submit" style={{ background: editingId ? '#28a745' : '#007bff', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {editingId ? '✔ Save Changes' : '+ Add to Menu'}
                            </button>
                            {editingId && (
                                <button type="button" onClick={() => { setEditingId(null); setNewProduct({ name: '', price: '', category: '', image_url: '', description: '', restaurant_id: '' }); }} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                    Cancel Edit
                                </button>
                            )}
                        </form>
                    </div>

                    <div style={{ flex: '2 1 600px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h2 style={{ marginTop: 0 }}>Menu Catalog ({filteredProducts.length} Items)</h2>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                                <thead>
                                    <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Image</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Name</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Description</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Category</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Price</th>
                                        <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{p.image_url ? <img src={p.image_url} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: '8px' }} alt="" /> : 'No Image'}</td>
                                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.name}</td>
                                            <td style={{ padding: '12px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description || 'N/A'}</td>
                                            <td style={{ padding: '12px', color: '#666' }}>{p.category}</td>
                                            <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>{p.price} TL</td>
                                            <td style={{ padding: '12px' }}>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => { setEditingId(p.id); setNewProduct({ name: p.name, price: p.price, category: p.category, image_url: p.image_url || '', description: p.description || '', restaurant_id: p.restaurant_id || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ padding: '6px 12px', background: '#e0f2fe', color: '#0284c7', border: '1px solid #0284c7', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} style={{ padding: '6px 12px', background: '#ffe5e5', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'orders' && (
                <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ marginTop: 0 }}>Recent Orders ({filteredOrders.length})</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa', textAlign: 'left' }}>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>ID</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Customer</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Items</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Total</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6', width: '250px' }}>Delivery Info</th>
                                    <th style={{ padding: '12px', borderBottom: '2px solid #dee2e6' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(o => (
                                    <tr key={o.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px', fontWeight: 'bold' }}>#{o.id}</td>
                                        <td style={{ padding: '12px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{o.customer_name}</div>
                                            <div style={{ fontSize: '13px', color: '#666' }}>{new Date(o.created_at).toLocaleString()}</div>
                                        </td>
                                        <td style={{ padding: '12px', color: '#555', maxWidth: '200px' }}>{o.items_summary}</td>
                                        <td style={{ padding: '12px', color: '#d32f2f', fontWeight: 'bold', fontSize: '18px' }}>{o.total_price} TL</td>
                                        <td style={{ padding: '12px', fontSize: '14px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '5px' }}><Phone size={14} color="#666" /> {o.customer_phone || 'N/A'}</div>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '5px' }}><MapPin size={14} color="#666" style={{ marginTop: '2px' }} /> <span>{o.customer_address || 'N/A'}</span></div>
                                        </td>
                                        <td style={{ padding: '12px' }}>
                                            <select
                                                value={o.status || 'Pending'}
                                                onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                style={{
                                                    padding: '8px',
                                                    borderRadius: '5px',
                                                    border: 'none',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    background: o.status === 'Delivered' ? '#d4edda' : (o.status === 'On the way' ? '#fff3cd' : '#f8d7da'),
                                                    color: o.status === 'Delivered' ? '#155724' : (o.status === 'On the way' ? '#856404' : '#721c24')
                                                }}>
                                                <option value="Pending">🕒 Pending</option>
                                                <option value="Preparing">🍳 Preparing</option>
                                                <option value="On the way">🚚 On the way</option>
                                                <option value="Delivered">✅ Delivered</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>No orders found yet for this selection.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Admin;
