import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';

interface FeaturedEventData {
    id: number;
    title: string;
    dateTime: string;
    location: string;
    imageUrl?: string;
    remainingSpots?: number;
    isFeaturedByOrganizer?: boolean;
}

const FeaturedEvent: React.FC = () => {
    const [event, setEvent] = useState<FeaturedEventData | null>(null);
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get('/api/events/featured');
                setEvent(response.data);
            } catch (error) {
                console.error('Napaka pri pridobivanju izpostavljenega dogodka:', error);
            }
        };

        fetchEvent();
    }, []);

    const handleFeatureEvent = async () => {
        if (!event) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.put(
                `/api/events/${event.id}`,
                { isFeaturedByOrganizer: true },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Dogodek je bil izpostavljen!');
            setEvent({ ...event, isFeaturedByOrganizer: true });
        } catch (error) {
            console.error('Napaka pri izpostavitvi dogodka:', error);
        }
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto text-center mt-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center justify-center gap-2 text-teal-700 animate-pulse">
                🎯 Izpostavljen dogodek dneva
            </h2>
            {event ? (
                <div>
                    <h3 className="text-xl font-semibold mb-1 flex items-center justify-center gap-2">
                        {event.title || 'Neimenovan dogodek'}
                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">🔥 Popularno</span>
                    </h3>
                    <p className="text-sm text-gray-600">{new Date(event.dateTime).toLocaleString('sl-SI')}</p>
                    <p className="text-sm text-gray-600 mb-2">{event.location}</p>
                    {typeof event.remainingSpots === 'number' && (
                        <p className="text-sm font-semibold text-green-700">Preostalih mest: {event.remainingSpots}</p>
                    )}
                    <img
                        src={event.imageUrl || '/no-image.png'}
                        alt="Slika dogodka"
                        className="mx-auto rounded-lg mt-2 max-h-52 object-cover"
                    />
                    <a
                        href={`/events/${event.id}`}
                        title="Klikni za ogled podrobnosti o dogodku"
                        className="inline-block mt-4 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 transition"
                    >
                        🔗 Ogled dogodka
                    </a>

                    {isAuthenticated && user && !event.isFeaturedByOrganizer && (
                        <button
                            onClick={handleFeatureEvent}
                            className="mt-4 ml-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                        >
                            ⭐ Izpostavi ta dogodek
                        </button>
                    )}
                </div>
            ) : (
                <p className="text-gray-500">Trenutno ni izpostavljenih dogodkov.</p>
            )}
        </div>
    );
};

export default FeaturedEvent;
