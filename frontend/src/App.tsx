import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth0Config } from './auth/auth0-config';
import { NavbarProvider, Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EventList from './pages/EventList';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
const API_BASE = import.meta.env.VITE_BACKEND_URL;
function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        await fetch(`${API_BASE}/api/users`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    };
    createUserIfNeeded();
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <HelmetProvider>
      <Auth0Provider {...auth0Config}>
        <NavbarProvider>
          <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
              <Navbar />
              <main className="flex-1 flex flex-col items-center justify-start px-2 py-8 md:mr-64 w-full min-h-screen">
                <div className="w-full max-w-full md:max-w-[calc(100vw-16rem)] 2xl:max-w-7xl mx-auto">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/events" element={<EventList />} />
                    <Route path="/events/create" element={<CreateEvent />} />
                    <Route path="/events/:id" element={<EventDetails />} />
                  </Routes>
                </div>
              </main>
            </div>
          </Router>
        </NavbarProvider>
      </Auth0Provider>
    </HelmetProvider>
  );
}

export default App;
