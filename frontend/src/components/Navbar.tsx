import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaPlusSquare, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars, FaTimes } from 'react-icons/fa';
import { useState, createContext } from 'react';

const navLinks = [
  { to: '/events', label: 'Dogodki', icon: <FaCalendarAlt /> },
  { to: '/profile', label: 'Profil', icon: <FaUser /> },
  { to: '/events/create', label: 'Ustvari dogodek', icon: <FaPlusSquare /> },
];

export const NavbarContext = createContext({ mini: false, setMini: (v: boolean) => {} });

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [mini, setMini] = useState(false);
  return (
    <NavbarContext.Provider value={{ mini, setMini }}>
      {children}
    </NavbarContext.Provider>
  );
};

const Navbar = () => {
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navbar je vedno širok na md+ zaslonih, na manjših je hamburger meni
  return (
    <>
      {/* Hamburger gumb - prikazan samo na mobilnih napravah */}
        <button
        className="fixed top-4 right-4 z-50 md:hidden bg-[#363636] text-white p-3 rounded-lg shadow-lg focus:outline-none"
        onClick={() => setMobileOpen(true)}
        aria-label="Odpri meni"
        >
        <FaBars size={24} />
        </button>
      {/* Navbar za večje zaslone in mobile overlay */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-40 bg-[#363636] text-white shadow-2xl flex flex-col transition-all duration-300
          w-64
          hidden md:flex
        `}
        style={{ minWidth: 256 }}
      >
        <div className="relative flex items-center gap-3 px-6 py-6 border-b border-[#444] justify-center">
          <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-full" />
          <span className="text-2xl font-bold tracking-wide text-center">
            EventEase
          </span>
      </div>
      {!isAuthenticated && (
        <div className="flex flex-col gap-2 mt-6 px-2">
          <button
            onClick={() => loginWithRedirect()}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
            title="Prijava"
            style={{ color: 'white', background: 'none' }}
          >
            <FaSignInAlt size={24} color="white" />
              Prijava
          </button>
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
            title="Registracija"
            style={{ color: 'white', background: 'none' }}
          >
            <FaUserPlus size={24} color="white" />
              Registracija
          </button>
        </div>
      )}
      <nav className="flex flex-col gap-2 mt-6 px-2">
        {navLinks.map(link => {
          const isActive = location.pathname === link.to;
          return (
            (link.to === '/profile' || link.to === '/events/create') && !isAuthenticated ? (
              <button
                key={link.to}
                onClick={() => loginWithRedirect()}
                  className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full hover:bg-[#444]`}
                title={link.label}
                style={{ color: 'white', background: 'none' }}
              >
                <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                  <span style={{ color: 'white' }}>{link.label}</span>
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                  className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors ${isActive ? 'bg-[#444]' : 'hover:bg-[#444]'}`}
                title={link.label}
                style={{ color: 'white' }}
              >
                <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                  <span style={{ color: 'white' }}>{link.label}</span>
              </Link>
            )
          );
        })}
        {isAuthenticated && (
          <button
            onClick={() => logout()}
            className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium bg-red-600 hover:bg-red-700 transition-colors w-full"
            title="Odjava"
            style={{ color: 'white' }}
          >
            <FaSignOutAlt size={24} color="white" />
              Odjava
            </button>
          )}
        </nav>
      </aside>
      {/* Mobile overlay meni */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden justify-end">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-64 h-full bg-[#363636] shadow-2xl flex flex-col z-50 animate-slideInRight">
            <div className="relative flex items-center gap-3 px-6 py-6 border-b border-[#444] justify-center">
              <img src="/logo.png" alt="Logo" className="h-10 w-10 object-contain rounded-full" />
              <button
                className="text-2xl bg-transparent hover:bg-[#444] rounded p-2 transition-colors ml-3 z-10 absolute right-4 top-1"
                onClick={() => setMobileOpen(false)}
                aria-label="Zapri meni"
              >
                <FaTimes />
              </button>
              <span className="text-2xl font-bold tracking-wide text-center">
                EventEase
              </span>
            </div>
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 mt-6 px-2">
                <button
                  onClick={() => { setMobileOpen(false); loginWithRedirect(); }}
                  className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
                  title="Prijava"
                  style={{ color: 'white', background: 'none' }}
                >
                  <FaSignInAlt size={24} color="white" />
                  Prijava
                </button>
                <button
                  onClick={() => { setMobileOpen(false); loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }); }}
                  className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
                  title="Registracija"
                  style={{ color: 'white', background: 'none' }}
                >
                  <FaUserPlus size={24} color="white" />
                  Registracija
                </button>
              </div>
            )}
            <nav className="flex flex-col gap-2 mt-6 px-2">
              {navLinks.map(link => {
                const isActive = location.pathname === link.to;
                return (
                  (link.to === '/profile' || link.to === '/events/create') && !isAuthenticated ? (
                    <button
                      key={link.to}
                      onClick={() => { setMobileOpen(false); loginWithRedirect(); }}
                      className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full hover:bg-[#444]`}
                      title={link.label}
                      style={{ color: 'white', background: 'none' }}
                    >
                      <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                      <span style={{ color: 'white' }}>{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors ${isActive ? 'bg-[#444]' : 'hover:bg-[#444]'}`}
                      title={link.label}
                      style={{ color: 'white' }}
                    >
                      <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                      <span style={{ color: 'white' }}>{link.label}</span>
                    </Link>
                  )
                );
              })}
              {isAuthenticated && (
                <button
                  onClick={() => { setMobileOpen(false); logout(); }}
                  className="flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium bg-red-600 hover:bg-red-700 transition-colors w-full"
                  title="Odjava"
                  style={{ color: 'white' }}
                >
                  <FaSignOutAlt size={24} color="white" />
                  Odjava
                </button>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};

export { Navbar };
