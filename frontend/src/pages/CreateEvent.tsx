import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { Helmet } from 'react-helmet-async';

const API_BASE = import.meta.env.VITE_BACKEND_URL;

type UserType = {
    auth0Id: string;
    name: string;
    surname: string;
    email: string;
    picture?: string | null;
};

const CreateEvent = () => {
    const navigate = useNavigate();
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        document.title = 'Ustvari dogodek | EventEase';
    }, []);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dateTime: '',
        location: '',
        imageUrl: '',
        allowSignup: false,
        maxSignups: '',
        visibility: 'private'
    });

    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<UserType[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
    const [multiDateMode, setMultiDateMode] = useState(false);
    const [multipleDates, setMultipleDates] = useState<string[]>([]);
    const [newDateInput, setNewDateInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const dateInputRef = useRef<HTMLInputElement | null>(null);
    const newDateInputRef = useRef<HTMLInputElement | null>(null);
    const [signupDeadline, setSignupDeadline] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
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
            const data: UserType[] = await res.json();
            const filtered = data.filter(u => !selectedUsers.some(su => su.auth0Id === u.auth0Id));
            setSearchResults(filtered);
        } catch (err) {
            console.error('Napaka pri iskanju uporabnikov:', err);
        }
    };

    const addUser = (user: UserType) => {
        setSelectedUsers(prev => [...prev, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const removeUser = (auth0Id: string) => {
        setSelectedUsers(prev => prev.filter(u => u.auth0Id !== auth0Id));
    };

    const validateForm = () => {
        if (!formData.title.trim()) {
            setError('Naslov je obvezen');
            return false;
        }

        if (!multiDateMode && !formData.dateTime) {
            setError('Datum je obvezen');
            return false;
        }

        if (!multiDateMode && new Date(formData.dateTime) < new Date()) {
            setError('Datum ne sme biti v preteklosti');
            return false;
        }

        if (multiDateMode && multipleDates.length < 2) {
            setError('Dodaj vsaj dva datuma za glasovanje');
            return false;
        }

        if (
            formData.visibility === 'selected' &&
            !multiDateMode &&
            signupDeadline &&
            formData.dateTime &&
            new Date(signupDeadline) >= new Date(formData.dateTime)
        ) {
            setError('Zadnji dan prijave mora biti pred začetkom dogodka!');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        try {
            const token = await getAccessTokenSilently();
            const {
                title,
                description,
                dateTime,
                location,
                imageUrl,
                allowSignup,
                maxSignups,
                visibility
            } = formData;

            const response = await fetch(`${API_BASE}/api/events`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    dateTime: multiDateMode ? new Date(multipleDates[0]).toISOString() : dateTime,
                    location,
                    imageUrl,
                    allowSignup,
                    maxSignups: maxSignups ? parseInt(maxSignups) : null,
                    visibility,
                    visibleTo: selectedUsers.map(u => u.auth0Id),
                    signupDeadline: visibility === 'selected' ? signupDeadline : undefined
                })
            });

            if (!response.ok) {
                throw new Error('Napaka pri ustvarjanju dogodka');
            }

            const newEvent = await response.json();

            // 🔽 Pošlji možnosti datumov, če je omogočeno glasovanje
            if (multiDateMode && multipleDates.length > 0) {
                await fetch(`${API_BASE}/api/events/${newEvent.id}/date-options`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({ dates: multipleDates })
                });
            }

            navigate('/events');
        } catch (err) {
            setError('Napaka pri ustvarjanju dogodka');
            console.error(err);
        }
    };


    return (
        <div className="w-full min-h-screen bg-[#f7f7fa] px-4 py-12 flex flex-col items-center justify-center">
            <Helmet>
                <title>Ustvari dogodek | EventEase</title>
            </Helmet>
            <div className="bg-white shadow-2xl rounded-3xl p-12 w-full max-w-full md:max-w-[calc(100vw-16rem)] lg:max-w-lg flex flex-col items-center mx-auto">
                <h1 className="text-4xl font-semibold text-gray-900 mb-10 text-center">Ustvari dogodek</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-8 w-full">
                    <div className="w-full">
                        <label className="block text-base font-medium text-gray-700 mb-2">Naloži sliko dogodka</label>
                        <div
                            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors duration-200 ${dragActive ? 'border-[#363636] bg-gray-50' : 'border-gray-300 bg-gray-100'} py-8 cursor-pointer`}
                            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                            onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                            onDrop={async e => {
                                e.preventDefault(); setDragActive(false);
                                if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
                                setUploading(true);
                                const file = e.dataTransfer.files[0];
                                const data = new FormData();
                                data.append('image', file);
                                try {
                                    const token = await getAccessTokenSilently();
                                    const res = await fetch(`${API_BASE}/api/events/upload-image`, {
                                        method: 'POST',
                                        headers: { Authorization: `Bearer ${token}` },
                                        body: data
                                    });
                                    const result = await res.json();
                                    setFormData(f => ({ ...f, imageUrl: result.url }));
                                } catch {
                                    alert('Napaka pri uploadu slike!');
                                } finally {
                                    setUploading(false);
                                }
                            }}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {formData.imageUrl ? (
                                <div className="relative w-32 h-32">
                                    <img src={formData.imageUrl} alt="Predogled" className="w-32 h-32 object-cover rounded-xl border" />
                                    <button
                                        type="button"
                                        onClick={e => { e.stopPropagation(); setFormData(f => ({ ...f, imageUrl: '' })); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow hover:bg-red-700"
                                        title="Odstrani sliko"
                                    >
                                        &times;
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span className="text-3xl text-gray-400 mb-2">+</span>
                                    <span className="text-gray-500">Povleci in spusti ali <span className="underline">izberi datoteko</span></span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        className="hidden"
                                        onChange={async (e) => {
                                            if (!e.target.files || e.target.files.length === 0) return;
                                            setUploading(true);
                                            const file = e.target.files[0];
                                            const data = new FormData();
                                            data.append('image', file);
                                            try {
                                                const token = await getAccessTokenSilently();
                                                const res = await fetch(`${API_BASE}/api/events/upload-image`, {
                                                    method: 'POST',
                                                    headers: { Authorization: `Bearer ${token}` },
                                                    body: data
                                                });
                                                const result = await res.json();
                                                setFormData(f => ({ ...f, imageUrl: result.url }));
                                            } catch {
                                                alert('Napaka pri uploadu slike!');
                                            } finally {
                                                setUploading(false);
                                            }
                                        }}
                                        disabled={uploading}
                                    />
                                    {uploading && <div className="text-xs text-gray-500 mt-2">Nalaganje slike ...</div>}
                                </>
                            )}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="location" className="block text-base font-medium text-gray-700 mb-1">Lokacija</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]" placeholder="Lokacija" />
                    </div>
                    <div>
                        <label htmlFor="title" className="block text-base font-medium text-gray-700 mb-1">Naslov</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]" placeholder="Vnesi naslov dogodka" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-base font-medium text-gray-700 mb-1">Opis</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]" placeholder="Dodaj opis dogodka" />
                    </div>
                    <div className="mb-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={multiDateMode}
                                onChange={(e) => setMultiDateMode(e.target.checked)}
                            />
                            <span className="text-gray-900">Omogoči več možnih datumov (glasovanje)</span>
                        </label>
                    </div>

                    {multiDateMode ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Dodaj možni datum</label>
                                <div className="flex gap-2">
                                    <div
                                        onClick={() => newDateInputRef.current?.showPicker?.()}
                                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus-within:ring-2 focus-within:ring-[#363636] cursor-pointer"
                                    >
                                        <input
                                            ref={newDateInputRef}
                                            type="datetime-local"
                                            value={newDateInput}
                                            onChange={(e) => setNewDateInput(e.target.value)}
                                            className="w-full outline-none bg-transparent cursor-pointer"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (newDateInput && !multipleDates.includes(newDateInput)) {
                                                setMultipleDates([...multipleDates, newDateInput]);
                                                setNewDateInput('');
                                            }
                                        }}
                                        className="bg-[#363636] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#444]"
                                    >
                                        Dodaj
                                    </button>
                                </div>
                            </div>

                            {multipleDates.length > 0 && (
                                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                    {multipleDates.map((d, i) => (
                                        <li key={i} className="flex justify-between items-center">
                                            <span>{new Date(d).toLocaleString()}</span>
                                            <button
                                                type="button"
                                                onClick={() => setMultipleDates(prev => prev.filter(val => val !== d))}
                                                className="text-red-600 hover:underline text-xs"
                                            >
                                                Odstrani
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    ) : (
                        <div>
                            <label htmlFor="dateTime" className="block text-base font-medium text-gray-700 mb-1">Datum in čas</label>
                            <div
                                onClick={() => dateInputRef.current?.showPicker?.()}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus-within:ring-2 focus-within:ring-[#363636] cursor-pointer"
                            >
                                <input
                                    ref={dateInputRef}
                                    type="datetime-local"
                                    id="dateTime"
                                    name="dateTime"
                                    value={formData.dateTime}
                                    onChange={handleChange}
                                    className="w-full outline-none bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>

                    )}

                    <div>
                        <label htmlFor="visibility" className="block text-base font-medium text-gray-700 mb-1">Vidnost dogodka</label>
                        <select id="visibility" name="visibility" value={formData.visibility} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]">
                            <option value="private">Zasebno (samo jaz)</option>
                            <option value="public">Javno (vsi)</option>
                            <option value="selected">Izbrani uporabniki</option>
                        </select>
                    </div>

                    {formData.visibility === 'selected' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dodaj uporabnike</label>
                            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Išči po imenu..." className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]" />
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

                    <div className="flex items-center">
                        <input type="checkbox" id="allowSignup" name="allowSignup" checked={formData.allowSignup} onChange={handleChange} className="h-4 w-4 text-[#363636] border-gray-300 rounded" />
                        <label htmlFor="allowSignup" className="ml-2 block text-base text-gray-900">Dovoli prijavo na dogodek</label>
                    </div>

                    {formData.allowSignup && (
                        <>
                        <div>
                            <label htmlFor="maxSignups" className="block text-base font-medium text-gray-700 mb-1">Maksimalno število prijav (pusti prazno za neomejeno)</label>
                            <input type="number" id="maxSignups" name="maxSignups" min="1" value={formData.maxSignups} onChange={handleChange} className="mt-1 block w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus:border-[#363636] focus:ring-2 focus:ring-[#363636]" />
                        </div>
                        <div className="mt-4">
                            <label htmlFor="signupDeadline" className="block text-sm font-medium text-gray-700 mb-1">Zadnji dan prijave</label>
                            <div
                                onClick={() => (document.getElementById('signupDeadline') as HTMLInputElement | null)?.showPicker?.()}
                                className="mt-1 w-full rounded-xl border border-gray-300 bg-white p-3 text-base text-gray-900 placeholder-gray-400 focus-within:ring-2 focus-within:ring-[#363636] cursor-pointer"
                            >
                                <input
                                    type="datetime-local"
                                    id="signupDeadline"
                                    name="signupDeadline"
                                    value={signupDeadline}
                                    onChange={e => setSignupDeadline(e.target.value)}
                                    className="w-full outline-none bg-transparent cursor-pointer"
                                    {...(!multiDateMode && formData.dateTime ? { max: formData.dateTime } : {})}
                                />
                            </div>
                        </div>
                        </>
                    )}

                    <div>
                        <button type="submit" className="w-full bg-[#363636] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#444] text-lg">Ustvari dogodek</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
