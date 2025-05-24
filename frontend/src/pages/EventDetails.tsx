import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

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

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/events/${id}`);
                if (!res.ok) throw new Error('Napaka pri pridobivanju dogodka');
                const data = await res.json();
                setEvent(data);
            } catch (err) {
                setError('Napaka pri pridobivanju dogodka');
            }
        };
        fetchEvent();
    }, [id]);

    if (error) return <div className="text-center text-red-600">{error}</div>;
    if (!event) return <div>Nalaganje...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
            <div className="w-full max-w-xl bg-white shadow rounded-lg p-6">
                {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />
                )}
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <p className="mb-2">{event.description}</p>
                <p className="text-gray-600 mb-2">Datum: {new Date(event.dateTime).toLocaleString()}</p>
                <p className="text-gray-600 mb-2">Lokacija: {event.location}</p>
                <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">Organizator:</span>
                    {event.User ? (
                        <span className="flex items-center gap-2">
              {event.User.picture && <img src={event.User.picture} alt={event.User.name} className="w-6 h-6 rounded-full inline" />}
                            {event.User.name} {event.User.surname || ''}
            </span>
                    ) : event.ownerId}
                </div>
            </div>
        </div>
    );
};

export default EventDetails;