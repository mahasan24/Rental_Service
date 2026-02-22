import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import FaqBot from './components/FaqBot';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VanList from './pages/VanList';
import VanDetail from './pages/VanDetail';
import BookingForm from './pages/BookingForm';
import BookingConfirmation from './pages/BookingConfirmation';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import AssistedBooking from './pages/AssistedBooking';
import AdminDashboard from './pages/admin/Dashboard';
import AdminVans from './pages/admin/Vans';
import AdminUsers from './pages/admin/Users';
import AdminBookings from './pages/admin/Bookings';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vans" element={<VanList />} />
          <Route path="/vans/:id" element={<VanDetail />} />
          <Route path="/book/:vanId" element={<BookingForm />} />
          <Route path="/booking-confirmation" element={<BookingConfirmation />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/help" element={<AssistedBooking />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vans" element={<AdminVans />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/bookings" element={<AdminBookings />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <FaqBot />
    </>
  );
}
