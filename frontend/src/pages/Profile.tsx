import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import slLocale from '@fullcalendar/core/locales/sl';
import { Helmet } from 'react-helmet-async';

interface UserProfile {
    auth0Id: string;
    name: string;
    surname: string;
    email: string;
    picture?: string;
    description?: string;
    wantsNotifications?: boolean;
}

interface EventData {
    id: string;
    title: string;
    dateTime: string;
    ownerId: string;
    registered?: boolean;
}

const Profile = () => {
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [form, setForm] = useState({ name: '', surname: '', description: '', picture: '', wantsNotifications: false });
    const [edit, setEdit] = useState(false);
    const [error, setError] = useState('');
    const [events, setEvents] = useState<EventData[]>([]);
    const [registeredIds, setRegisteredIds] = useState<string[]>([]);
    const [filter, setFilter] = useState<'all' | 'created' | 'registered'>('all');
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProfile = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setProfile(data);
                setForm({
                    name: data.name || '',
                    surname: data.surname || '',
                    description: data.description || '',
                    picture: data.picture || '',
                    wantsNotifications: data.wantsNotifications || false
                });
            } catch {
                setError('Napaka pri pridobivanju profila');
            }
        };

        const fetchEvents = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch('http://localhost:5000/api/events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setEvents(data);
            } catch {
                console.error('Napaka pri dogodkih');
            }
        };

        fetchProfile();
        fetchEvents();
    }, [getAccessTokenSilently, isAuthenticated]);

    useEffect(() => {
        if (profile) {
            fetchRegistrations();
        }
    }, [profile]);

    useEffect(() => {
        document.title = 'Profil | EventEase';
    }, []);

    const fetchRegistrations = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch(`http://localhost:5000/api/signups/user/${profile?.auth0Id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json(); // npr. ["event1", "event3"]
            setRegisteredIds(data);
        } catch (error) {
            console.error('Napaka pri pridobivanju prijav:', error);
        }
    };

    const handleSave = async () => {
        try {
            const token = await getAccessTokenSilently();
            const res = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            setProfile(data);
            setEdit(false);
        } catch {
            setError('Napaka pri shranjevanju profila');
        }
    };

    const filteredEvents = events
        .map(e => ({
            ...e,
            registered: registeredIds.includes(e.id)
        }))
        .filter(event => {
            if (filter === 'all') return true;
            if (filter === 'created') return event.ownerId === profile?.auth0Id;
            if (filter === 'registered') return event.registered;
            return true;
        });

    if (isLoading) return <div>Nalaganje...</div>;
    if (!isAuthenticated) return <div>Za ogled profila se morate prijaviti.</div>;
    if (error) return <div className="text-center text-red-600">{error}</div>;
    if (!profile) return <div>Nalaganje...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
            <Helmet>
                <title>Profil | EventEase</title>
            </Helmet>
            <div className="w-full max-w-xl">
                <div className="flex flex-col items-center">
                    {profile.picture && (
                        <img src={profile.picture} alt={profile.name} className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg -mt-8 mb-4" />
                    )}
                </div>
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="w-full text-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profile.name || <span className="text-gray-400">[Dodaj ime]</span>} {profile.surname || <span className="text-gray-400">[Dodaj priimek]</span>}
                            </h1>
                            <p className="text-gray-600">{profile.email}</p>
                            <p className="text-gray-600 text-xs">ID: {profile.auth0Id}</p>
                        </div>
                    </div>
                    <div className="mt-4">
                        {edit ? (
                            <div className="flex flex-col items-center space-y-2">
                                <input type="text" placeholder="Ime" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border p-2 rounded w-full max-w-xs" />
                                <input type="text" placeholder="Priimek" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} className="border p-2 rounded w-full max-w-xs" />
                                <div className="w-full max-w-xs">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Naloži profilno sliko</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={async (e) => {
                                            if (!e.target.files || e.target.files.length === 0) return;
                                            setUploading(true);
                                            const file = e.target.files[0];
                                            const formData = new FormData();
                                            formData.append('image', file);
                                            try {
                                                const token = await getAccessTokenSilently();
                                                const res = await fetch('http://localhost:5000/api/users/upload-image', {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${token}` },
                                                    body: formData
                                                });
                                                const data = await res.json();
                                                setForm(f => ({ ...f, picture: data.url }));
                                            } catch {
                                                alert('Napaka pri uploadu slike!');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                        className="border p-2 rounded w-full"
                                        disabled={uploading}
                                    />
                                    {uploading && <div className="text-xs text-gray-500 mt-1">Nalaganje slike ...</div>}
                                    {form.picture && (
                                        <div className="relative mt-2 w-20 h-20">
                                            <img src={form.picture} alt="Predogled" className="w-20 h-20 object-cover rounded-full border" />
                                            <button
                                                type="button"
                                                onClick={() => setForm(f => ({ ...f, picture: '' }))}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700"
                                                title="Odstrani sliko"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <textarea placeholder="Opis" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border p-2 rounded w-full max-w-xs mt-2" />
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={form.wantsNotifications}
                                        onChange={e => setForm(f => ({ ...f, wantsNotifications: e.target.checked }))}
                                        className="form-checkbox"
                                    />
                                    <span className="text-gray-900">Želim prejemati obvestila o novih dogodkih</span>
                                </label>
                                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Shrani</button>
                            </div>
                        ) : (
                            <>
                                <p className="mt-4 text-gray-700 text-center">{profile.description || <span className="text-gray-400">[Dodaj opis]</span>}</p>
                                <p className="text-sm text-center text-gray-600">
                                    Obvestila: {profile.wantsNotifications ? 'Vključena' : 'Izključena'}
                                </p>
                                <button onClick={() => setEdit(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Uredi profil</button>
                            </>
                        )}
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-center mb-4">Koledar dogodkov</h2>

                    <div className="mb-4 text-center">
                        <label className="mr-2 font-semibold text-gray-700">Filtriraj:</label>
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="p-2 border rounded-md"
                        >
                            <option value="all">Vsi dogodki</option>
                            <option value="created">Moji dogodki</option>
                            <option value="registered">Prijavljen</option>
                        </select>
                    </div>

                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={filteredEvents.map(e => ({
                            id: e.id,
                            title: e.title,
                            date: e.dateTime
                        }))}
                        height="auto"
                        eventClick={(info) => {
                            info.jsEvent.preventDefault();
                            navigate(`/events/${info.event.id}`);
                        }}
                        locale={slLocale}
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;