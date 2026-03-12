import { Routes, Route } from 'react-router-dom';
import RestaurantList from './pages/RestaurantList';
import Store from './pages/Store';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Profile from './pages/Profile';
import OrderTracking from './pages/OrderTracking';
import NotFound from './pages/NotFound';
import { Toaster } from 'react-hot-toast';
import './App.css'; // ensure global styles if any

function App() {
  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<RestaurantList />} />
        <Route path="/restaurant/:id" element={<Store />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/track/:id" element={<OrderTracking />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;