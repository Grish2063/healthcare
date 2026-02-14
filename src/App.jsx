import {Routes, Route} from "react-router-dom";
import Login from './pages/auth/Login';
import Dashboard from './pages/Dashboard';
import Patients from './pages/Patients';
import Appointment from './pages/Appointment';
import ProtectedRoute from './components/ProtectedRoute';

function App(){
  return(
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard/>
        </ProtectedRoute>
      }
      />
      <Route path="/patients" element={
        <ProtectedRoute>
        <Patients/>
        </ProtectedRoute>
      }
      />
      <Route path="/appointment" element={
        <ProtectedRoute>
          <Appointment/>
        </ProtectedRoute>
      }/>
    </Routes>

  )
}
