import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

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
    const { user, getAccessTokenSilently } = useAuth0();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Event | null>(null);

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

    const isOwner = user && event.ownerId === user.sub;

    const handleEditClick = () => {
        setEditData(event);
        setIsEditing(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!editData) return;
        const { name, value } = e.target;
        setEditData({ ...editData, [name]: value });
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:5000/api/events/${event.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            if (!response.ok) throw new Error('Napaka pri urejanju dogodka');
            const updated = await response.json();
            setEvent(updated);
            setIsEditing(false);
        } catch (err) {
            setError('Napaka pri urejanju dogodka');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Si prepričan, da želiš izbrisati dogodek?')) return;
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:5000/api/events/${event.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Napaka pri brisanju dogodka');
            navigate('/events');
        } catch (err) {
            setError('Napaka pri brisanju dogodka');
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
            <div className="w-full max-w-xl bg-white shadow rounded-lg p-6">
                {event.imageUrl && (
                    <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />
                )}
                {isOwner && !isEditing && (
                    <div className="flex gap-2 mb-4">
                        <button onClick={handleEditClick} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">Uredi</button>
                        <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Izbriši</button>
                    </div>
                )}
                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-4">
                        <input type="text" name="title" value={editData?.title || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="Naslov" />
                        <textarea name="description" value={editData?.description || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="Opis" />
                        <input type="datetime-local" name="dateTime" value={editData?.dateTime ? editData.dateTime.slice(0,16) : ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                        <input type="text" name="location" value={editData?.location || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="Lokacija" />
                        <input type="url" name="imageUrl" value={editData?.imageUrl || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="URL slike" />
                        <div className="flex gap-2">
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Shrani</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Prekliči</button>
                        </div>
                    </form>
                ) : (
                    <>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default EventDetails;