import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface Event {
    id: string;
    title: string;
    description: string;
    dateTime: string;
    location: string;
    imageUrl: string;
    ownerId: string;
    visibility: 'public' | 'private' | 'selected';
    allowSignup: boolean;
    maxSignups?: number;
    User?: {
        name: string;
        surname?: string;
        picture?: string;
    };
    dateOptions?: {
        id: string;
        dateOption: string;
        isFinal: boolean;
        votes: { userId: string }[];
    }[];
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
    const navigate = useNavigate();
    const { user, getAccessTokenSilently, isLoading } = useAuth0();

    const [event, setEvent] = useState<Event | null>(null);
    const [dateOptions, setDateOptions] = useState<Event["dateOptions"]>([]);
    const [signups, setSignups] = useState<Signup[]>([]);
    const [error, setError] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState('');
    const [showSignupForm, setShowSignupForm] = useState(false);
    const [signupData, setSignupData] = useState({ name: '', surname: '', age: '' });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Event | null>(null);

    useEffect(() => {
        fetchEvent();
        fetchSignups();
    }, [id]);

    const fetchEvent = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/events/${id}`);
            if (!res.ok) throw new Error('Napaka pri pridobivanju dogodka');
            const data = await res.json();
            setEvent(data);
            setDateOptions(data.dateOptions || []);
        } catch (err) {
            setError('Napaka pri pridobivanju dogodka');
        }
    };

    const fetchSignups = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/signups/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setSignups(data);
        } catch (err) {
            // ignore
        }
    };

    const isOwner = user && event?.ownerId === user.sub;
    const isSignedUp = user && signups.some(s => s.userId === user.sub);
    const canSignup = event?.allowSignup && !isOwner && (!event?.maxSignups || signups.length < event.maxSignups);

    const handleEditClick = () => {
        setEditData(event);
        setIsEditing(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editData) return;
        const { name, value } = e.target;
        setEditData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        try {
            const token = await getAccessTokenSilently();
            const response = await fetch(`http://localhost:5000/api/events/${event?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(editData)
            });
            if (!response.ok) throw new Error();
            const updated = await response.json();
            setEvent(updated);
            setIsEditing(false);
        } catch {
            setError('Napaka pri urejanju dogodka');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Si prepričan, da želiš izbrisati dogodek?')) return;
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`http://localhost:5000/api/events/${event?.id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error();
            navigate('/events');
        } catch {
            setError('Napaka pri brisanju dogodka');
        }
    };

    const vote = async (dateOptionId: string) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(`http://localhost:5000/api/events/vote/${dateOptionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            fetchEvent();
        } catch {
            console.error('Napaka pri glasovanju');
        }
    };

    const setAsFinal = async (dateOptionId: string) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(`http://localhost:5000/api/events/${event?.id}/final-date/${dateOptionId}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchEvent();
        } catch {
            console.error('Napaka pri nastavitvi končnega datuma');
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

        if (!signupData.name || !signupData.surname || !signupData.age) {
            setSignupError('Vsa polja so obvezna');
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/signups/${event?.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...signupData,
                    age: parseInt(signupData.age),
                    userId: user?.sub || null
                })
            });
            if (!res.ok) {
                const data = await res.json();
                setSignupError(data.error || 'Napaka pri prijavi');
                return;
            }

            setSignupSuccess('Uspešno prijavljen!');
            setShowSignupForm(false);
            setSignupData({ name: '', surname: '', age: '' });
            fetchSignups();
        } catch {
            setSignupError('Napaka pri prijavi');
        }
    };

    const handleCancelSignup = async () => {
        if (!user) return;
        try {
            await fetch(`http://localhost:5000/api/signups/${event?.id}/${user.sub}`, {
                method: 'DELETE'
            });
            fetchSignups();
            setSignupSuccess('Uspešno odjavljen!');
        } catch {
            setSignupError('Napaka pri odjavi');
        }
    };

    const handleOwnerRemoveSignup = async (userIdToRemove?: string) => {
        if (!userIdToRemove) return;
        try {
            await fetch(`http://localhost:5000/api/signups/${event?.id}/${userIdToRemove}`, {
                method: 'DELETE'
            });
            fetchSignups();
        } catch {
            setSignupError('Napaka pri odjavi uporabnika');
        }
    };

    if (isLoading || !event) return <div>Nalaganje...</div>;
    if (error) return <div className="text-red-600 text-center">{error}</div>;

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
            <div className="w-full max-w-xl bg-white shadow rounded-lg p-6">
                {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-64 object-cover rounded mb-4" />}
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
                        <input type="datetime-local" name="dateTime" value={editData?.dateTime?.slice(0, 16) || ''} onChange={handleEditChange} className="w-full border rounded p-2" />
                        <input type="text" name="location" value={editData?.location || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="Lokacija" />
                        <input type="url" name="imageUrl" value={editData?.imageUrl || ''} onChange={handleEditChange} className="w-full border rounded p-2" placeholder="URL slike" />
                        <select name="visibility" value={editData?.visibility || 'public'} onChange={handleEditChange} className="w-full border rounded p-2">
                            <option value="public">Javno</option>
                            <option value="private">Zasebno</option>
                            <option value="selected">Izbrani uporabniki</option>
                        </select>
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
                        <p className="mb-2"><strong>Vidnost:</strong> {event.visibility === 'public' ? 'Javen' : event.visibility === 'private' ? 'Zaseben' : 'Izbrani uporabniki'}</p>

                        {dateOptions.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-800 mb-2">Možni termini:</h3>
                                <ul className="space-y-2">
                                    {dateOptions.map(option => (
                                        <li key={option.id} className="flex justify-between items-center border p-2 rounded">
                                            <span>
                                                {new Date(option.dateOption).toLocaleString()}
                                                {option.isFinal && <span className="ml-2 text-green-600 font-semibold">(Izbran)</span>}
                                                {!option.isFinal && (
                                                    <span className="text-gray-500 text-sm ml-2">
                                                        ({option.votes?.length || 0} glasov)
                                                    </span>
                                                )}
                                            </span>
                                            {!option.isFinal && (
                                                <div className="flex gap-2">
                                                    {user && !option.votes?.some(v => v.userId === user.sub) && (
                                                        <button onClick={() => vote(option.id)} className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600">Glasuj</button>
                                                    )}
                                                    {isOwner && (
                                                        <button onClick={() => setAsFinal(option.id)} className="bg-green-600 text-white px-2 py-1 rounded text-sm hover:bg-green-700">Nastavi kot končni</button>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {user && canSignup && !showSignupForm && !isSignedUp && (
                            <button onClick={() => setShowSignupForm(true)} className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 mb-4">Prijavi se</button>
                        )}
                        {user && isSignedUp && (
                            <button onClick={handleCancelSignup} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mb-4">Odjavi se</button>
                        )}
                        {user && showSignupForm && (
                            <form onSubmit={handleSignupSubmit} className="space-y-2 mb-4">
                                <input type="text" name="name" value={signupData.name} onChange={handleSignupChange} placeholder="Ime" className="w-full border rounded p-2" />
                                <input type="text" name="surname" value={signupData.surname} onChange={handleSignupChange} placeholder="Priimek" className="w-full border rounded p-2" />
                                <input type="number" name="age" value={signupData.age} onChange={handleSignupChange} placeholder="Starost" className="w-full border rounded p-2" />
                                {signupError && <div className="text-red-600">{signupError}</div>}
                                {signupSuccess && <div className="text-green-600">{signupSuccess}</div>}
                                <div className="flex gap-2">
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Potrdi</button>
                                    <button type="button" onClick={() => setShowSignupForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">Prekliči</button>
                                </div>
                            </form>
                        )}

                        {event.allowSignup && (
                            <div className="mb-4 text-gray-700">Prijavljeni: {signups.length}{event.maxSignups ? ` / ${event.maxSignups}` : ''}</div>
                        )}

                        {isOwner && signups.length > 0 && (
                            <div className="mb-4">
                                <h3 className="font-semibold mb-2 text-gray-700">Prijavljeni:</h3>
                                <ul className="list-disc pl-5">
                                    {signups.map(s => (
                                        <li key={s.id} className="text-gray-700 flex items-center justify-between">
                                            <span>{s.name} {s.surname} ({s.age} let)</span>
                                            <button
                                                onClick={() => handleOwnerRemoveSignup(s.userId)}
                                                className="ml-2 text-red-600 hover:underline text-sm"
                                                disabled={user?.sub === s.userId}
                                            >
                                                Odjavi
                                            </button>
                                        </li>
                                    ))}
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