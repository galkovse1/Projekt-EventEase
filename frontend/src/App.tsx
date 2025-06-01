import { Auth0Provider } from '@auth0/auth0-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth0Config } from './auth/auth0-config';
import { NavbarProvider, NavbarContext, Navbar } from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import EventList from './pages/EventList';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useContext } from 'react';

function App() {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const createUserIfNeeded = async () => {
      if (isAuthenticated) {
        const token = await getAccessTokenSilently();
        await fetch('http://localhost:5000/api/users', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    };
    createUserIfNeeded();
  }, [isAuthenticated, getAccessTokenSilently]);

  // Dynamic padding for main
  const { mini } = useContext(NavbarContext);
  const mainPadding = mini ? 'pr-20' : 'pr-64';

  return (
    <HelmetProvider>
      <Auth0Provider {...auth0Config}>
        <NavbarProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <main className={`w-full px-4 py-8 transition-all duration-300 ${mainPadding}`}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/events" element={<EventList />} />
                  <Route path="/events/create" element={<CreateEvent />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                </Routes>
              </main>
            </div>
          </Router>
        </NavbarProvider>
      </Auth0Provider>
    </HelmetProvider>
  );
}

export default App;
