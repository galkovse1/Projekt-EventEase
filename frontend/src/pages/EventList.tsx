import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';

interface Event {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    imageUrl: string;
    ownerId: string;
    visibility: 'public' | 'private' | 'selected';
    User?: {
        name: string;
        surname?: string;
        picture?: string;
    };
}

const EventList = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [onlyMine, setOnlyMine] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let token = '';
                try {
                    token = await getAccessTokenSilently();
                } catch {
                    console.warn('Uporabnik ni prijavljen – nalagam javne dogodke');
                }

                const queryParams = new URLSearchParams();
                if (search) queryParams.append('search', search);
                if (location) queryParams.append('location', location);
                if (date) queryParams.append('date', date);
                if (organizer) queryParams.append('organizer', organizer);
                if (onlyMine && user) queryParams.append('onlyMine', 'true');

                const response = await fetch(`http://localhost:5000/api/events/visible?${queryParams.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Napaka pri pridobivanju dogodkov:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [getAccessTokenSilently, search, location, date, organizer, onlyMine]);

    useEffect(() => {
        document.title = 'Dogodki | EventEase';
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-600">Nalaganje...</div>;

    return (
        <>
            <Helmet>
                <title>Dogodki | EventEase</title>
            </Helmet>
            <div className="w-full min-h-screen bg-gray-100 px-4 py-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Dogodki</h1>
                <div className="mb-6 flex flex-col md:flex-row gap-4 items-start">
                    <button
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                        onClick={() => setOnlyMine(prev => !prev)}
                    >
                        {onlyMine ? 'Prikaži vse dogodke' : 'Prikaži moje dogodke'}
                    </button>
                    <input type="text" placeholder="Išči po naslovu/opisu" value={search} onChange={e => setSearch(e.target.value)} className="p-2 border rounded w-full md:w-64" />
                    <input type="text" placeholder="Filter po mestu" value={location} onChange={e => setLocation(e.target.value)} className="p-2 border rounded w-full md:w-64" />
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} className="p-2 border rounded w-full md:w-48" />
                    <input type="text" placeholder="Organizator (ime/priemk)" value={organizer} onChange={e => setOrganizer(e.target.value)} className="p-2 border rounded w-full md:w-64" />
                </div>
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center">
                    {events.map((event) => (
                        <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden w-full md:w-96">
                            {event.imageUrl && (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h2>
                                <p className="text-gray-600 mb-4">{event.description}</p>
                                <div className="text-sm text-gray-500 mb-4">
                                    <p>Datum: {new Date(event.dateTime).toLocaleString()}</p>
                                    <p>Lokacija: {event.location}</p>
                                    <p>Vidnost: {event.visibility === 'public' ? 'Javno' : event.visibility === 'private' ? 'Zasebno' : 'Izbrani uporabniki'}</p>
                                    <p>
                                        Organizator:{' '}
                                        {event.User ? (
                                            <span className="flex items-center gap-2">
                                                {event.User.picture && (
                                                    <img
                                                        src={event.User.picture}
                                                        alt={event.User.name}
                                                        className="w-6 h-6 rounded-full inline"
                                                    />
                                                )}
                                                {event.User.name} {event.User.surname || ''}
                                            </span>
                                        ) : (
                                            event.ownerId
                                        )}
                                    </p>
                                </div>
                                <Link
                                    to={`/events/${event.id}`}
                                    className="inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                                >
                                    Več informacij
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default EventList;
