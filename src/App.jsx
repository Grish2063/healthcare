import { Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Login from './pages/auth/Login';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Login />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
