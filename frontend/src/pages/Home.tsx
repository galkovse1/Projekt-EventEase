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
            <div className="w-full min-h-screen bg-[#f7f7fa] px-4 py-12 flex flex-col items-center justify-center">
                <div className="bg-white rounded-3xl shadow-2xl p-12 flex flex-col items-center max-w-xl w-full">
                    <h1 className="text-5xl font-extrabold text-gray-900 mb-6 text-center tracking-tight">
                        Dobrodošli v EventEase
                    </h1>
                    <p className="text-2xl text-gray-600 mb-10 text-center">
                        Enostavno upravljanje z vašimi dogodki
                    </p>
                    <div className="space-x-4 flex flex-row justify-center w-full">
                        <Link
                            to="/events"
                            className="inline-block bg-[#363636] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow hover:bg-[#444] transition-colors"
                        >
                            Ogled dogodkov
                        </Link>
                        {isAuthenticated && (
                            <Link
                                to="/events/create"
                                className="inline-block bg-[#363636] text-white px-8 py-4 rounded-lg font-semibold text-lg shadow hover:bg-[#444] transition-colors"
                            >
                                Ustvari nov dogodek
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;