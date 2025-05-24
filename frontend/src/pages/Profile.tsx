import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
//V terminalu iz frontend mape zaženi: npm install @fullcalendar/react @fullcalendar/daygrid

interface UserProfile {
    auth0Id: string;
    name: string;
    surname: string;
    email: string;
    picture?: string;
    description?: string;
}

interface EventData {
    id: string;
    title: string;
    dateTime: string;
}

const Profile = () => {
    const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState({ name: '', surname: '', description: '', picture: '' });
    const [error, setError] = useState('');
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchProfile = async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await fetch('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('Napaka pri pridobivanju profila');
                const data = await res.json();
                setProfile(data);
                setForm({
                    name: data.name || '',
                    surname: data.surname || '',
                    description: data.description || '',
                    picture: data.picture || ''
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
                if (!res.ok) throw new Error('Napaka pri dogodkih');
                const data = await res.json();
                setEvents(data);
            } catch {
                console.error('Napaka pri dogodkih');
            }
        };

        fetchProfile();
        fetchEvents();
    }, [getAccessTokenSilently, isAuthenticated]);

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
            if (!res.ok) throw new Error('Napaka pri shranjevanju profila');
            const data = await res.json();
            setProfile(data);
            setEdit(false);
        } catch {
            setError('Napaka pri shranjevanju profila');
        }
    };

    if (isLoading) return <div>Nalaganje...</div>;
    if (!isAuthenticated) return <div>Za ogled profila se morate prijaviti.</div>;
    if (error) return <div className="text-center text-red-600">{error}</div>;
    if (!profile) return <div>Nalaganje...</div>;

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
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
                                <input type="url" placeholder="URL profilne slike" value={form.picture} onChange={e => setForm(f => ({ ...f, picture: e.target.value }))} className="border p-2 rounded w-full max-w-xs" />
                                <textarea placeholder="Opis" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border p-2 rounded w-full max-w-xs mt-2" />
                                <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Shrani</button>
                            </div>
                        ) : (
                            <>
                                <p className="mt-4 text-gray-700 text-center">{profile.description || <span className="text-gray-400">[Dodaj opis]</span>}</p>
                                <button onClick={() => setEdit(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-2">Uredi profil</button>
                            </>
                        )}
                    </div>
                </div>

                {/* Dodan koledar */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-center mb-4">Koledar dogodkov</h2>
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={events.map(e => ({
                            title: e.title,
                            date: e.dateTime
                        }))}
                        height="auto"
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
