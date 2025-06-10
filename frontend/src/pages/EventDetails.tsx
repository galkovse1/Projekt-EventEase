import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';
const API_BASE = import.meta.env.VITE_BACKEND_URL;

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
        email?: string;
        description?: string;
    };
    dateOptions?: {
        id: string;
        dateOption: string;
        isFinal: boolean;
        votes: { userId: string }[];
    }[];
    VisibleToUsers?: {
        auth0Id: string;
        name: string;
        surname?: string;
        email?: string;
    }[];
    signupDeadline?: string;
}

interface Signup {
    id: string;
    name: string;
    surname: string;
    age: number;
    userId?: string;
}

// Funkcija za pretvorbo UTC v lokalni čas za <input type="datetime-local" />
function formatLocalForInput(utcString: string) {
    const date = new Date(utcString);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

    const [showUserModal, setShowUserModal] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        fetchEvent();
        fetchSignups();
    }, [id]);

    useEffect(() => {
        document.title = event ? `Dogodek: ${event.title} | EventEase` : 'Dogodek | EventEase';
    }, [event]);

    useEffect(() => {
        if (isEditing && editData?.visibility === 'selected') {
            setSelectedUsers(editData.VisibleToUsers || []);
        }
    }, [isEditing, editData]);

    const fetchEvent = async () => {
        try {
            const headers: any = {};
            if (user) {
                const token = await getAccessTokenSilently();
                headers.Authorization = `Bearer ${token}`;
            }

            const res = await fetch(`${API_BASE}/api/events/${id}`, {
                headers
            });

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
            const res = await fetch(`${API_BASE}/api/signups/${id}`);
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

    const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/users/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();
            const filtered = data.filter((u: any) => !selectedUsers.some(su => su.auth0Id === u.auth0Id));
            setSearchResults(filtered);
        } catch (err) {
            // ignore
        }
    };

    const addUser = (user: any) => {
        setSelectedUsers(prev => [...prev, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeUser = (auth0Id: string) => {
        setSelectedUsers(prev => prev.filter(u => u.auth0Id !== auth0Id));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editData) return;
        try {
            const token = await getAccessTokenSilently();
            const body: any = { ...editData };

            const previousIds = event?.VisibleToUsers?.map(u => u.auth0Id) || [];
            const currentIds = selectedUsers.map(u => u.auth0Id);
            const newlyAdded = selectedUsers.filter(u => !previousIds.includes(u.auth0Id));

            body.visibleTo = currentIds;
            body.newlyAddedUsers = newlyAdded.map(u => u.auth0Id);

            const response = await fetch(`${API_BASE}/api/events/${event?.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
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
            const res = await fetch(`${API_BASE}/api/events/${event?.id}`, {
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
            await fetch(`${API_BASE}/api/events/vote/${dateOptionId}`, {
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
            await fetch(`${API_BASE}/api/events/${event?.id}/final-date/${dateOptionId}`, {
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
            await fetch(`${API_BASE}/api/events/vote/${dateOptionId}`, {
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
            const res = await fetch(`${API_BASE}/api/signups/${event?.id}`, {
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
            await fetch(`${API_BASE}/api/signups/${event?.id}/${user.sub}`, {
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
                await fetch(`${API_BASE}/api/signups/${event?.id}/${userIdToRemove}`, {
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
                {event.User && (
                    <button
                        type="button"
                        className="flex items-center gap-3 mb-6 focus:outline-none"
                        onClick={() => setShowUserModal(true)}
                        style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                        <img
                            src={event.User.picture || '/logo.png'}
                            alt="Organizator"
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-300"
                        />
                        {(event.User.name || event.User.surname) && (
                            <span className="font-semibold text-lg text-gray-900">
                                {event.User.name} {event.User.surname}
                            </span>
                        )}
                    </button>
                )}
                {showUserModal && event.User && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" onClick={() => setShowUserModal(false)}>
                        <div
                            className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center min-w-[300px] relative"
                            onClick={e => e.stopPropagation()}
                        >
                            <img
                                src={event.User.picture || '/logo.png'}
                                alt="Organizator"
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 mb-4"
                            />
                            {(event.User.name || event.User.surname) && (
                                <div className="text-xl font-bold text-gray-900 mb-1">{event.User.name} {event.User.surname}</div>
                            )}
                            {event.User.email && (
                                <div className="text-gray-700 mb-1">{event.User.email}</div>
                            )}
                            {event.User.description && (
                                <div className="text-gray-600 text-center mb-2">{event.User.description}</div>
                            )}
                            <button
                                className="mt-4 px-6 py-2 bg-[#363636] text-white rounded-lg font-semibold hover:bg-[#444]"
                                onClick={() => setShowUserModal(false)}
                            >Zapri</button>
                        </div>
                    </div>
                )}
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
                        <input type="text" name="location" value={editData?.location || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="Lokacija" />
                        <input type="url" name="imageUrl" value={editData?.imageUrl || ''} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg" placeholder="URL slike" />
                        <select name="visibility" value={editData?.visibility || 'public'} onChange={handleEditChange} className="w-full border rounded-lg p-3 text-lg">
                            <option value="public">Javno</option>
                            <option value="private">Zasebno</option>
                            <option value="selected">Izbrani uporabniki</option>
                        </select>
                        {editData?.visibility === 'selected' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dodaj uporabnike</label>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Išči po imenu..."
                                    ref={searchInputRef}
                                    className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]"
                                />
                                <ul className="mt-2">
                                    {searchResults.map(user => (
                                        <li key={user.auth0Id} className="cursor-pointer hover:bg-gray-100 px-2 py-1 text-gray-900" onClick={() => addUser(user)}>
                                            {user.name} {user.surname} ({user.email})
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-2">
                                    {selectedUsers.map(user => (
                                        <span key={user.auth0Id} className="inline-block bg-gray-100 text-gray-900 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                                            {user.name} {user.surname}
                                            <button type="button" className="ml-1 text-red-500" onClick={() => removeUser(user.auth0Id)}>×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700 mb-1">Datum in čas</label>
                            <input
                                type="datetime-local"
                                name="dateTime"
                                id="dateTime"
                                value={editData?.dateTime ? formatLocalForInput(editData.dateTime) : ''}
                                onChange={handleEditChange}
                                className="w-full border rounded-lg p-3 text-lg"
                            />
                        </div>
                        {editData?.allowSignup && (
                            <div>
                                <label htmlFor="signupDeadline" className="block text-sm font-medium text-gray-700 mb-1">Zadnji dan prijave</label>
                                <input
                                    type="datetime-local"
                                    name="signupDeadline"
                                    value={editData?.signupDeadline ? formatLocalForInput(editData.signupDeadline) : ''}
                                    onChange={handleEditChange}
                                    className="w-full border rounded-lg p-3 text-lg"
                                    max={editData?.dateTime ? formatLocalForInput(editData.dateTime) : undefined}
                                />
                            </div>
                        )}
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
                            <span>
                                <strong>Datum:</strong>{' '}
                                {dateOptions && dateOptions.length > 1
                                    ? (dateOptions.some(opt => opt.isFinal)
                                        ? new Date(event.dateTime).toLocaleString()
                                        : 'Možnost izbire')
                                    : new Date(event.dateTime).toLocaleString()}
                            </span>
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