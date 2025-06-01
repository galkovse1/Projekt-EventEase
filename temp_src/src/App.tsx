import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { ToastContainer } from 'react-toastify';

import './App.css';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './components/Login/Login';
import { NavBar } from './components/NavBar/NavBar';
import { CreateEvent } from './components/CreateEvent/CreateEvent';
import { SingleEvent } from './components/SingleEvent/SingleEvent';
import { MainPage } from './components/MainPage/MainPage';
import { UserProfile } from './components/UserProfile/UserProfile';
import { EditProfile } from './components/EditProfile/EditProfile';

function App() {
  const { isAuthenticated } = useAuth0();

  if (isAuthenticated) {
    return (
      <BrowserRouter>
        <div className="container">
          <div className="containerRoutes">
            <Routes>
              <Route path="/" element={<MainPage />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/single-event/:eventId" element={<SingleEvent />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
            </Routes>
          </div>
          <NavBar />
          <ToastContainer />
        </div>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
