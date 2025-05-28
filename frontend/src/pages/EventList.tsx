import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
//import { useAuth0 } from '@auth0/auth0-react';

interface Event {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    imageUrl: string;
    ownerId: string;
    User?: {
        name: string;
        surname?: string;
        picture?: string;
    };
}

const EventList = () => {
    const [events, setEvents] = useState<Event[]>([]);
    //const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = await getAccessTokenSilently();
                const response = await fetch('http://localhost:5000/api/events/visible', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const data = await response.json();
                setEvents(data);
            } catch (error) {
                console.error('Napaka pri pridobivanju dogodkov:', error);
            }
        };

        fetchEvents();
    }, [getAccessTokenSilently]);

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Dogodki</h1>
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
    );
};

export default EventList;
