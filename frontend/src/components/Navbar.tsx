import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const { isAuthenticated, loginWithRedirect, logout, user } = useAuth0();

    return (
        <nav className="bg-white shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-xl font-bold text-gray-800">
                            EventEase
                        </Link>
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link to="/events" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                                Dogodki
                            </Link>
                            {isAuthenticated && (
                                <Link to="/events/create" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md">
                                    Nov dogodek
                                </Link>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center">
                        {isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                                    {user?.name}
                                </Link>
                                <button
                                    onClick={() => logout()}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                                >
                                    Odjava
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => loginWithRedirect()}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                                >
                                    Prijava
                                </button>
                                <button
                                    onClick={() => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } })}
                                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                                >
                                    Registracija
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;