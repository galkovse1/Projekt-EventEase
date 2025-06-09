import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
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
    User?: {
        name: string;
        surname?: string;
        picture?: string;
    };
    dateOptions?: {
        id: string;
        dateOption: string;
        isFinal: boolean;
    }[];
}
console.log("VITE_BACKEND_URL", API_BASE);

const EventList = () => {
    const { getAccessTokenSilently, user } = useAuth0();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [location, setLocation] = useState('');
    const [date, setDate] = useState('');
    const [organizer, setOrganizer] = useState('');
    const [onlyMine, setOnlyMine] = useState(false);
    const dateInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let token = '';
                try {
                    token = await getAccessTokenSilently();
                } catch {
                    console.warn('Uporabnik ni prijavljen – nalagam javne dogodke');
                }

                const queryParams = new URLSearchParams();
                if (search) queryParams.append('search', search);
                if (location) queryParams.append('location', location);
                if (date) queryParams.append('date', date);
                if (organizer) queryParams.append('organizer', organizer);
                if (onlyMine && user) queryParams.append('onlyMine', 'true');

                const response = await fetch(`${API_BASE}/api/events/visible?${queryParams.toString()}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });

                const data = await response.json();
                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    setEvents([]);
                    console.error('Napaka: Backend ni vrnil array:', data);
                }
            } catch (error) {
                console.error('Napaka pri pridobivanju dogodkov:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [getAccessTokenSilently, search, location, date, organizer, onlyMine]);

    useEffect(() => {
        document.title = 'Dogodki | EventEase';
    }, []);

    if (loading) return <div className="p-4 text-center text-gray-600">Nalaganje...</div>;

    return (
        <>
            <Helmet>
                <title>Dogodki | EventEase</title>
            </Helmet>
            <div className="w-full min-h-screen bg-[#f7f7fa] px-4 py-16">
                <h1 className="text-4xl font-bold text-gray-900 mb-10 text-center tracking-tight">Dogodki</h1>
                <div className="w-full mx-auto mb-10 flex flex-col md:flex-row md:items-end gap-4 md:gap-6 justify-center">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Iskanje po naslovu</label>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Išči po naslovu ..."
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-base placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lokacija</label>
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            placeholder="Išči po lokaciji ..."
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-base placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Datum</label>
                        <div
                            onClick={() => dateInputRef.current?.showPicker?.()}
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus-within:ring-2 focus-within:ring-[#363636] cursor-pointer"
                        >
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full outline-none bg-transparent cursor-pointer"
                            />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Organizator</label>
                        <input
                            type="text"
                            value={organizer}
                            onChange={e => setOrganizer(e.target.value)}
                            placeholder="Išči po organizatorju ..."
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-base placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636] text-gray-900"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Prikaz</label>
                        <select
                            value={onlyMine ? 'mine' : 'all'}
                            onChange={e => setOnlyMine(e.target.value === 'mine')}
                            className="w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]"
                        >
                            <option value="all">Vsi dogodki</option>
                            <option value="mine">Samo moji dogodki</option>
                        </select>
                    </div>
                </div>
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 justify-items-center place-items-center">
                    {events.map((event) => {
                        const eventDate = new Date(event.dateTime);
                        const now = new Date();
                        const daysDiff = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                        let eventDateLabel: string;
                        let eventTimeLabel: string;

                        if (event.dateOptions && event.dateOptions.length > 1) {
                            const final = event.dateOptions.find(opt => opt.isFinal);
                            if (final) {
                                const finalDate = new Date(final.dateOption);
                                eventDateLabel = finalDate.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                                eventTimeLabel = finalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            } else {
                                eventDateLabel = 'Možnost izbire datuma';
                                eventTimeLabel = '';
                            }
                        } else {
                            const d = new Date(event.dateTime);
                            eventDateLabel = d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
                            eventTimeLabel = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                        return (
                            <div key={event.id} className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-xs flex flex-col transition-transform hover:scale-105 hover:shadow-2xl duration-200">
                                {event.imageUrl && (
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-6 flex flex-col flex-1 justify-between items-center text-center">
                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">{event.title}</h2>
                                    <div className="mb-2">
                                        {eventDateLabel === 'Možnost izbire datuma' ? (
                                            <Link to={`/events/${event.id}`} className="text-sm text-gray-500 italic hover:underline">
                                                Možnost izbire datuma
                                            </Link>
                                        ) : (
                                            <>
                                                <div className="text-lg font-bold text-gray-900">{eventDateLabel}</div>
                                                {eventTimeLabel && (
                                                    <div className="text-md text-gray-800">{eventTimeLabel}</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {eventDateLabel !== 'Možnost izbire datuma' && (
                                        <div className="text-gray-500 text-sm mb-2">
                                            {daysDiff >= 0 ? `Začne se čez ${daysDiff} dni` : 'Dogodek je potekel'}
                                        </div>
                                    )}
                                    <Link
                                        to={`/events/${event.id}`}
                                        className="inline-block bg-[#363636] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#444] text-center mt-2"
                                    >
                                        Več informacij
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default EventList;
