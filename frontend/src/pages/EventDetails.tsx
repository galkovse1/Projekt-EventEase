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
    allowSignup: boolean;
    maxSignups?: number;
}

interface Signup {
    id: string;
    name: string;
    surname: string;
    age: number;
    userId?: string;
}

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [error, setError] = useState('');
    const { user, getAccessTokenSilently, isLoading } = useAuth0();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Event | null>(null);
    const [signups, setSignups] = useState<Signup[]>([]);
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [signupData, setSignupData] = useState({ name: '', surname: '', age: '' });
    const [signupError, setSignupError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');

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
        const fetchSignups = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/signups/${id}`);
                if (!res.ok) throw new Error('Napaka pri pridobivanju prijav');
                const data = await res.json();
                setSignups(data);
            } catch (err) {
                // ignore for now
            }
        };
        fetchEvent();
        fetchSignups();
    }, [id]);

    if (isLoading) return <div>Nalaganje...</div>;
    if (error) return <div className="text-center text-red-600">{error}</div>;
    if (!event) return <div>Nalaganje...</div>;

    const isOwner = user && event.ownerId === user.sub;
    const canSignup = event.allowSignup && !isOwner && (!event.maxSignups || signups.length < event.maxSignups);
    const isSignedUp = user && signups.some(s => s.userId === user.sub);

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

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');
        setSignupSuccess('');
        if (!signupData.name.trim() || !signupData.surname.trim() || !signupData.age) {
            setSignupError('Vsa polja so obvezna!');
            return;
        }
        try {
            const res = await fetch(`http://localhost:5000/api/signups/${event.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: signupData.name,
                    surname: signupData.surname,
                    age: parseInt(signupData.age),
                    userId: user ? user.sub : null
                })
            });
            if (!res.ok) {
                const errData = await res.json();
                setSignupError(errData.error || 'Napaka pri prijavi');
                return;
            }
            setSignupSuccess('Uspešno prijavljen!');
            setShowSignupForm(false);
            setSignupData({ name: '', surname: '', age: '' });
            // Refresh prijav
            const res2 = await fetch(`http://localhost:5000/api/signups/${event.id}`);
            setSignups(await res2.json());
        } catch (err) {
            setSignupError('Napaka pri prijavi');
        }
    };

    const handleCancelSignup = async () => {
        if (!user) return;
        setSignupError('');
        setSignupSuccess('');
        try {
            await fetch(`http://localhost:5000/api/signups/${event.id}/${user.sub}`, {
                method: 'DELETE'
            });
            // Refresh prijav
            const res2 = await fetch(`http://localhost:5000/api/signups/${event.id}`);
            setSignups(await res2.json());
            setSignupSuccess('Uspešno odjavljen!');
        } catch (err) {
            setSignupError('Napaka pri odjavi');
        }
    };

    const handleOwnerRemoveSignup = async (userIdToRemove: string | undefined) => {
        if (!userIdToRemove) return;
        try {
            await fetch(`http://localhost:5000/api/signups/${event.id}/${userIdToRemove}`, {
                method: 'DELETE'
            });
            // Refresh prijav
            const res2 = await fetch(`http://localhost:5000/api/signups/${event.id}`);
            setSignups(await res2.json());
        } catch (err) {
            setSignupError('Napaka pri odjavi uporabnika');
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
                        {canSignup && !showSignupForm && !isSignedUp && (
                            <button onClick={() => setShowSignupForm(true)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4">Prijavi se na dogodek</button>
                        )}
                        {isSignedUp && user && (
                            <button onClick={handleCancelSignup} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4">Odjavi se</button>
                        )}
                        {showSignupForm && (
                            <form onSubmit={handleSignupSubmit} className="space-y-2 mb-4">
                                <input type="text" name="name" value={signupData.name} onChange={handleSignupChange} placeholder="Ime" className="w-full border rounded p-2" />
                                <input type="text" name="surname" value={signupData.surname} onChange={handleSignupChange} placeholder="Priimek" className="w-full border rounded p-2" />
                                <input type="number" name="age" value={signupData.age} onChange={handleSignupChange} placeholder="Starost" className="w-full border rounded p-2" />
                                {signupError && <div className="text-red-600">{signupError}</div>}
                                {signupSuccess && <div className="text-green-600">{signupSuccess}</div>}
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Potrdi prijavo</button>
                                    <button type="button" onClick={() => setShowSignupForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Prekliči</button>
                                </div>
                            </form>
                        )}
                        {event.allowSignup && (
                            <div className="mb-4 text-gray-700">Število prijavljenih: {signups.length}{event.maxSignups ? ` / ${event.maxSignups}` : ''}</div>
                        )}
                        {isOwner && event.allowSignup && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-gray-700">Prijavljeni:</h3>
                                <ul className="list-disc pl-5">
                                    {signups.map(s => (
                                        <li key={s.id} className="text-gray-700 flex items-center justify-between">
                                            <span>{s.name} {s.surname} ({s.age} let)</span>
                                            <button
                                                onClick={() => handleOwnerRemoveSignup(s.userId)}
                                                className="ml-2 text-red-600 hover:underline text-sm"
                                                disabled={user && user.sub === s.userId}
                                            >
                                                Odjavi
                                            </button>
                                        </li>
                                    ))}
                                    {signups.length === 0 && <li className="text-gray-700">Nihče še ni prijavljen.</li>}
                                </ul>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default EventDetails;