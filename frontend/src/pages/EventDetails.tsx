import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    const { user, getAccessTokenSilently, isLoading, loginWithRedirect } = useAuth0();

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

    useEffect(() => {
        document.title = event ? `Dogodek: ${event.title} | EventEase` : 'Dogodek | EventEase';
    }, [event]);

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

    const deleteVote = async (dateOptionId: string) => {
        try {
            const token = await getAccessTokenSilently();
            await fetch(`http://localhost:5000/api/events/vote/${dateOptionId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchEvent();
        } catch {
            console.error('Napaka pri brisanju glasu');
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
        <div className="w-full min-h-screen bg-[#f7f7fa] px-4 py-12 flex justify-center items-start">
            <Helmet>
                <title>{event ? `Dogodek: ${event.title} | EventEase` : 'Dogodek | EventEase'}</title>
            </Helmet>
            <div className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl p-10">
                {event.imageUrl && <img src={event.imageUrl} alt={event.title} className="w-full h-72 object-cover rounded-2xl mb-6 shadow" />}
                {isOwner && !isEditing && (
                    <div className="flex gap-4 mb-6 justify-end">
                        <button onClick={handleEditClick} className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition-colors">Uredi</button>
                        <button onClick={handleDelete} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors">Izbriši</button>
                    </div>
                )}

                {isEditing ? (
                    <form onSubmit={handleEditSubmit} className="space-y-6">
                        <input type="text" name="title" value={editData?.title || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="Naslov" />
                        <textarea name="description" value={editData?.description || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="Opis" />
                        <input type="datetime-local" name="dateTime" value={editData?.dateTime?.slice(0, 16) || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" />
                        <input type="text" name="location" value={editData?.location || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="Lokacija" />
                        <input type="url" name="imageUrl" value={editData?.imageUrl || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="URL slike" />
                        <select name="visibility" value={editData?.visibility || 'public'} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg">
                            <option value="public">Javno</option>
                            <option value="private">Zasebno</option>
                            <option value="selected">Izbrani uporabniki</option>
                        </select>
                        <div className="flex gap-4 justify-end">
                            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">Shrani</button>
                            <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500 transition-colors">Prekliči</button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h1 className="text-4xl font-extrabold mb-4 text-gray-900 text-center">{event.title}</h1>
                        <p className="mb-4 text-gray-800 text-center text-lg">{event.description}</p>
                        <div className="flex flex-col md:flex-row md:justify-between gap-2 mb-4 text-gray-700 text-base">
                            <span><strong>Datum:</strong> {new Date(event.dateTime).toLocaleString()}</span>
                            <span><strong>Lokacija:</strong> {event.location}</span>
                        </div>
                        <p className="mb-4 text-gray-700 text-center"><strong>Vidnost:</strong> {event.visibility === 'public' ? 'Javen' : event.visibility === 'private' ? 'Zaseben' : 'Izbrani uporabniki'}</p>

                        {(dateOptions || []).length > 0 && (
                            <div className="mb-6">
                                <h3 className="font-semibold text-gray-900 mb-2 text-center">Možni termini:</h3>
                                <ul className="space-y-2">
                                    {(dateOptions || []).map(option => (
                                        <li key={option.id} className="flex justify-between items-center border p-3 rounded-xl bg-gray-50 shadow-sm">
                                            <span className="text-gray-900">
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
                                                    {user && (
                                                        option.votes?.some(v => v.userId === user.sub)
                                                            ? <button onClick={() => deleteVote(option.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-red-600">Zbriši glas</button>
                                                            : <button onClick={() => vote(option.id)} className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-blue-700">Glasuj</button>
                                                    )}
                                                    {isOwner && (
                                                        <button onClick={() => setAsFinal(option.id)} className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-green-700">Nastavi kot končni</button>
                                                    )}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* PRIJAVA NA DOGODEK */}
                        {event.allowSignup && !user && (
                            <button
                                onClick={() => loginWithRedirect()}
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 mb-6 w-full max-w-xs mx-auto block"
                            >
                                Prijavi se
                            </button>
                        )}
                        {user && canSignup && !showSignupForm && !isSignedUp && (
                            <button onClick={() => setShowSignupForm(true)} className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 mb-6 w-full max-w-xs mx-auto block">Prijavi se</button>
                        )}
                        {user && isSignedUp && (
                            <button onClick={handleCancelSignup} className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 mb-6 w-full max-w-xs mx-auto block">Odjavi se</button>
                        )}
                        {user && showSignupForm && (
                            <form onSubmit={handleSignupSubmit} className="space-y-4 mb-6">
                                <input type="text" name="name" value={signupData.name} onChange={handleSignupChange} placeholder="Ime" className="w-full border rounded-lg p-3 text-lg" />
                                <input type="text" name="surname" value={signupData.surname} onChange={handleSignupChange} placeholder="Priimek" className="w-full border rounded-lg p-3 text-lg" />
                                <input type="number" name="age" value={signupData.age} onChange={handleSignupChange} placeholder="Starost" className="w-full border rounded-lg p-3 text-lg" />
                                {signupError && <div className="text-red-600 text-center">{signupError}</div>}
                                {signupSuccess && <div className="text-green-600 text-center">{signupSuccess}</div>}
                                <div className="flex gap-4 justify-end">
                                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">Potrdi</button>
                                    <button type="button" onClick={() => setShowSignupForm(false)} className="bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-500">Prekliči</button>
                                </div>
                            </form>
                        )}

                        {event.allowSignup && (
                            <div className="mb-6 text-gray-900 text-center font-semibold">Prijavljeni: {signups.length}{event.maxSignups ? ` / ${event.maxSignups}` : ''}</div>
                        )}

                        {isOwner && signups.length > 0 && (
                            <div className="mb-4 bg-gray-50 rounded-2xl shadow p-6">
                                <h3 className="font-semibold mb-4 text-gray-900 text-center">Prijavljeni:</h3>
                                <ul className="list-disc pl-5">
                                    {signups.map(s => (
                                        <li key={s.id} className="text-gray-900 flex items-center justify-between py-1">
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