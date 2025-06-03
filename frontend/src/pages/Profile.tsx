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
    const { getAccessTokenSilently, isAuthenticated, isLoading, user } = useAuth0();
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
    const [dragActive, setDragActive] = useState(false);

    // Funkcija za razčlenjevanje imena in priimka iz emaila
    function parseNameFromEmail(email: string): { name: string; surname: string } {
        const local = email.split('@')[0];
        const parts = local.split(/[._-]/); // loči po . _ ali -
        if (parts.length >= 2) {
            return { name: capitalize(parts[0]), surname: capitalize(parts[1]) };
        }
        return { name: capitalize(local), surname: '' };
    }
    function capitalize(str: string) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

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
                // Če ni imena/priiimka v bazi, poskusi auto-fill iz user (Google ali email)
                let name = data.name || '';
                let surname = data.surname || '';
                let picture = data.picture || '';
                if ((!name || !surname) && user) {
                    if (user.given_name && user.family_name) {
                        name = user.given_name;
                        surname = user.family_name;
                    } else if (user.name && user.name.split(' ').length >= 2) {
                        name = user.name.split(' ')[0];
                        surname = user.name.split(' ').slice(1).join(' ');
                    } else if (user.email) {
                        const parsed = parseNameFromEmail(user.email);
                        name = name || parsed.name;
                        surname = surname || parsed.surname;
                    }
                    if (user.picture && !picture) picture = user.picture;
                }
                setForm({
                    name,
                    surname,
                    description: data.description || '',
                    picture,
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
    }, [getAccessTokenSilently, isAuthenticated, user]);

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
        <div className="w-full min-h-screen bg-[#f7f7fa] px-4 py-12 flex flex-col items-center justify-start">
            <Helmet>
                <title>Profil | EventEase</title>
            </Helmet>
            <div className="w-full max-w-full md:max-w-[calc(100vw-16rem)] 2xl:max-w-7xl mx-auto">
                <div className="flex flex-col items-center">
                    <div className="w-48 h-48 mb-6">
                        {edit ? (
                            <div
                                className={`relative w-full h-full flex items-center justify-center border-2 border-dashed rounded-full transition-colors duration-200 ${dragActive ? 'border-[#363636] bg-gray-50' : 'border-gray-300 bg-gray-100'} cursor-pointer`}
                                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                                onDrop={async e => {
                                    e.preventDefault(); setDragActive(false);
                                    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
                                    setUploading(true);
                                    const file = e.dataTransfer.files[0];
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
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {form.picture ? (
                                    <img src={form.picture} alt={profile?.name} className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl" />
                                ) : (
                                    <span className="text-4xl text-gray-400">+</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    className="hidden"
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
                                    disabled={uploading}
                                />
                                {uploading && <div className="absolute bottom-2 text-xs text-gray-500">Nalaganje slike ...</div>}
                                {form.picture && (
                                    <button
                                        type="button"
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow"
                                        onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, picture: '' })); }}
                                    >
                                        &minus;
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center rounded-full bg-gray-100 border-2 border-gray-300">
                                {form.picture ? (
                                    <img src={form.picture} alt={profile?.name} className="w-full h-full object-cover rounded-full border-4 border-white shadow-2xl" />
                                ) : (
                                    <span className="text-6xl text-gray-400">{profile?.name?.[0]?.toUpperCase()}{profile?.surname?.[0]?.toUpperCase()}</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-white shadow-2xl rounded-3xl p-16 mb-12 relative flex flex-col items-center">
                    {!edit && (
                        <button
                            onClick={() => setEdit(true)}
                            type="button"
                            className="md:absolute md:top-6 md:right-6 bg-[#363636] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#444] text-lg md:self-auto self-center mt-2 md:mt-0 text-base px-4 py-2"
                        >
                            Uredi profil
                        </button>
                    )}
                    {edit ? (
                        <form className="flex flex-col items-center space-y-6 w-full max-w-lg">
                            <input type="text" placeholder="Ime" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="border border-gray-300 bg-white p-3 rounded-xl w-full text-lg placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900" disabled={!edit} />
                            <input type="text" placeholder="Priimek" value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} className="border border-gray-300 bg-white p-3 rounded-xl w-full text-lg placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900" disabled={!edit} />
                            <input type="email" placeholder="Email" value={profile?.email || user?.email || ''} disabled className="border border-gray-200 bg-gray-100 p-3 rounded-xl w-full text-lg placeholder-gray-400 text-gray-900" />
                            <textarea placeholder="Bio" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="border border-gray-300 bg-white p-3 rounded-xl w-full text-lg placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900" disabled={!edit} />
                            <label className="flex items-center space-x-2 w-full">
                                <input
                                    type="checkbox"
                                    checked={form.wantsNotifications}
                                    onChange={e => setForm(f => ({ ...f, wantsNotifications: e.target.checked }))}
                                    className="h-5 w-5 text-[#363636] border-gray-300 rounded"
                                />
                                <span className="text-base text-gray-900">Želim prejemati obvestila o dogodkih</span>
                            </label>
                            <button onClick={handleSave} type="button" className="bg-[#363636] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#444] w-full text-lg">Shrani</button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center w-full max-w-lg space-y-4 mt-4 md:mt-0">
                            <div className="w-full flex flex-col items-center">
                                <div className="text-3xl font-bold text-gray-900 mb-1">{form.name} {form.surname}</div>
                                <div className="text-lg text-gray-600 mb-2">{profile?.email || user?.email || ''}</div>
                            </div>
                            {form.description && (
                                <div className="w-full bg-gray-50 rounded-xl p-4 text-center text-lg text-gray-800 shadow-inner">{form.description}</div>
                            )}
                        </div>
                    )}
                </div>
                <div className="bg-white shadow-2xl rounded-3xl p-12">
                    <style>{`
        .fc .fc-button, .fc .fc-button-primary {
            background: #363636 !important;
            color: #fff !important;
            border: none !important;
            border-radius: 0.75rem !important;
            box-shadow: none !important;
            transition: background 0.2s;
        }
        .fc .fc-button:hover, .fc .fc-button-primary:hover {
            background: #444 !important;
            color: #fff !important;
        }
        .fc .fc-button.fc-button-active, .fc .fc-button-primary.fc-button-active {
            background: #222 !important;
            color: #fff !important;
        }
        .fc .fc-button:focus {
            outline: 2px solid #363636 !important;
            box-shadow: 0 0 0 2px #36363633 !important;
        }
        .fc .fc-col-header-cell-cushion, .fc .fc-daygrid-day-number {
            color: #363636 !important;
            font-weight: 500;
        }
        .fc .fc-event, .fc .fc-event-title, .fc .fc-daygrid-event-dot {
            background: none !important;
            color: #363636 !important;
            border: none !important;
            font-weight: 500;
        }
        .fc .fc-daygrid-event-dot {
            background: #363636 !important;
        }
        .fc .fc-more-link {
            color: #363636 !important;
            font-weight: 500;
        }
    `}</style>

                    {/* 🔘 Filter gumbi */}
                    <div className="mb-6 flex justify-center gap-4">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                filter === 'all' ? 'bg-[#363636] text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            Vsi dogodki
                        </button>
                        <button
                            onClick={() => setFilter('created')}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                filter === 'created' ? 'bg-[#363636] text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            Moji dogodki
                        </button>
                        <button
                            onClick={() => setFilter('registered')}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                                filter === 'registered' ? 'bg-[#363636] text-white' : 'bg-gray-200 text-gray-800'
                            }`}
                        >
                            Prijavljeni
                        </button>
                    </div>

                    {/* 📅 Koledar */}
                    <div className="rounded-2xl shadow-lg overflow-hidden">
                        <FullCalendar
                            plugins={[dayGridPlugin]}
                            initialView="dayGridMonth"
                            events={filteredEvents.map(e => ({
                                id: e.id, // Pomembno za navigacijo
                                title: e.title,
                                date: e.dateTime,
                                color: e.registered ? '#6366f1' : '#60a5fa',
                            }))}
                            eventClick={(info) => {
                                navigate(`/events/${info.event.id}`);
                            }}
                            locale={slLocale}
                            height={700}
                            contentHeight={700}
                            aspectRatio={2.6}
                            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek,dayGridDay' }}
                            buttonText={{ today: 'Danes', month: 'Mesec', week: 'Teden', day: 'Dan' }}
                            dayMaxEvents={2}
                            fixedWeekCount={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;