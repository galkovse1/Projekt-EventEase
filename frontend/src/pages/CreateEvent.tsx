import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

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
            const res = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`);
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
        if (!formData.dateTime) {
            setError('Datum je obvezen');
            return false;
        }
        if (new Date(formData.dateTime) < new Date()) {
            setError('Datum ne sme biti v preteklosti');
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

            const response = await fetch('http://localhost:5000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    dateTime,
                    location,
                    imageUrl,
                    allowSignup,
                    maxSignups: maxSignups ? parseInt(maxSignups) : null,
                    visibility,
                    visibleTo: selectedUsers.map(u => u.auth0Id)
                })
            });

            if (!response.ok) {
                throw new Error('Napaka pri ustvarjanju dogodka');
            }

            navigate('/events');
        } catch (err) {
            setError('Napaka pri ustvarjanju dogodka');
            console.error(err);
        }
    };

    return (
        <div className="w-full min-h-screen bg-gray-100 px-4 py-8 flex justify-center items-start">
            <div className="bg-white shadow rounded-lg p-8 w-full max-w-md">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Nov dogodek</h1>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Naslov</label>
                        <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Opis</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>

                    <div>
                        <label htmlFor="dateTime" className="block text-sm font-medium text-gray-700">Datum in čas</label>
                        <input type="datetime-local" id="dateTime" name="dateTime" value={formData.dateTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>

                    <div>
                        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lokacija</label>
                        <input type="text" id="location" name="location" value={formData.location} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>

                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">URL slike</label>
                        <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                    </div>

                    <div>
                        <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Vidnost dogodka</label>
                        <select id="visibility" name="visibility" value={formData.visibility} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="private">Zasebno (samo jaz)</option>
                            <option value="public">Javno (vsi)</option>
                            <option value="selected">Izbrani uporabniki</option>
                        </select>
                    </div>

                    {formData.visibility === 'selected' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Dodaj uporabnike</label>
                            <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Išči po imenu..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                            <ul className="mt-2">
                                {searchResults.map(user => (
                                    <li key={user.auth0Id} className="cursor-pointer hover:bg-gray-100 px-2 py-1" onClick={() => addUser(user)}>
                                        {user.name} {user.surname} ({user.email})
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-2">
                                {selectedUsers.map(user => (
                                    <span key={user.auth0Id} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm mr-2 mb-2">
                    {user.name} {user.surname}
                                        <button type="button" className="ml-1 text-red-500" onClick={() => removeUser(user.auth0Id)}>×</button>
                  </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center">
                        <input type="checkbox" id="allowSignup" name="allowSignup" checked={formData.allowSignup} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                        <label htmlFor="allowSignup" className="ml-2 block text-sm text-gray-900">Dovoli prijavo na dogodek</label>
                    </div>

                    {formData.allowSignup && (
                        <div>
                            <label htmlFor="maxSignups" className="block text-sm font-medium text-gray-700">Maksimalno število prijav (pusti prazno za neomejeno)</label>
                            <input type="number" id="maxSignups" name="maxSignups" min="1" value={formData.maxSignups} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
                        </div>
                    )}

                    <div>
                        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">Ustvari dogodek</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;
