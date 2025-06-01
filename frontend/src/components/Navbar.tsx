import { useAuth0 } from '@auth0/auth0-react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaPlusSquare, FaSignOutAlt, FaSignInAlt, FaUserPlus, FaBars } from 'react-icons/fa';
import { useState, createContext, useContext } from 'react';

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
  const { mini, setMini } = useContext(NavbarContext);

  return (
    <aside
      className={`fixed top-0 right-0 h-full z-50 bg-[#363636] text-white shadow-2xl flex flex-col transition-all duration-300 ${mini ? 'w-20' : 'w-64'}`}
      style={{ minWidth: mini ? 80 : 256 }}
    >
      <div className={`relative flex items-center px-6 py-6 border-b border-[#444] ${mini ? 'px-2' : 'px-6'}`}> 
        <button
          className="text-2xl bg-transparent hover:bg-[#444] rounded p-2 transition-colors mr-3 z-10"
          onClick={() => setMini(!mini)}
          aria-label={mini ? 'Expand menu' : 'Collapse menu'}
        >
          <FaBars />
        </button>
        {!mini && (
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-bold tracking-wide text-center w-full pointer-events-none select-none">
            EventEase
          </span>
        )}
      </div>
      {!isAuthenticated && (
        <div className="flex flex-col gap-2 mt-6 px-2">
          <button
            onClick={() => loginWithRedirect()}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
            title="Prijava"
            style={{ color: 'white', background: 'none' }}
          >
            <FaSignInAlt className="text-xl" style={{ color: 'white' }} />
            {!mini && 'Prijava'}
          </button>
          <button
            onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
            className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full border-2 border-white text-white hover:bg-white hover:text-[#363636] bg-transparent`}
            title="Registracija"
            style={{ color: 'white', background: 'none' }}
          >
            <FaUserPlus className="text-xl" style={{ color: 'white' }} />
            {!mini && 'Registracija'}
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
                className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors w-full hover:bg-[#444] ${mini ? 'justify-center' : ''}`}
                title={link.label}
                style={{ color: 'white', background: 'none' }}
              >
                <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                {!mini && <span style={{ color: 'white' }}>{link.label}</span>}
              </button>
            ) : (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-3 px-2 py-3 rounded-lg text-lg font-medium transition-colors ${isActive ? 'bg-[#444]' : 'hover:bg-[#444]'} ${mini ? 'justify-center' : ''}`}
                title={link.label}
                style={{ color: 'white' }}
              >
                <span className="text-xl" style={{ color: 'white' }}>{link.icon}</span>
                {!mini && <span style={{ color: 'white' }}>{link.label}</span>}
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
            <FaSignOutAlt className="text-xl" style={{ color: 'white' }} />
            {!mini && 'Odjava'}
          </button>
        )}
      </nav>
    </aside>
  );
};

export { Navbar };
