import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';
import { useEffect } from 'react';

const Home = () => {
    const { isAuthenticated } = useAuth0();

    useEffect(() => {
        document.title = 'Domov | EventEase';
    }, []);

    return (
        <>
            <Helmet>
                <title>Domov | EventEase</title>
            </Helmet>
            <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                    Dobrodošli v EventEase
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Enostavno upravljanje z vašimi dogodki
                </p>
                <div className="space-x-4">
                    <Link
                        to="/events"
                        className="inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
                    >
                        Ogled dogodkov
                    </Link>
                    {isAuthenticated && (
                        <Link
                            to="/events/create"
                            className="inline-block bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
                        >
                            Ustvari nov dogodek
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
};

export default Home;