import { useEffect, useState } from 'react';
import api from '../api/axiosInstance';
import type { User } from '../types/index';
import { UserCard } from '../components/UserCard';
import { Loading } from '../components/Loading';
import { Search, AlertCircle } from 'lucide-react';

export const Home = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
 
    api.get('/users')
      .then(res => {
        setUsers(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Yazarlar yüklenirken hata oluştu:", err);
        setError("Yazarlar listesi şu anda alınamıyor. Lütfen daha sonra tekrar deneyiniz.");
      })
      .finally(() => setLoading(false));
  }, []);

  
  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.company?.name.toLowerCase().includes(search.toLowerCase())
  );

  
  if (loading) return <Loading />;

  
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <AlertCircle size={48} className="text-red-500 mb-4" />
      <h3 className="text-xl font-bold text-slate-800 mb-2">Sistemsel Bir Hata Oluştu</h3>
      <p className="text-slate-500 max-w-sm">{error}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
      >
        Tekrar Dene
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-6 py-12">
       
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
            Yazar Kadromuz
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto mb-10 text-lg">
            Hana Travel içerik dünyasına yön veren profesyonel yazarlarımızı keşfedin.
          </p>
          
          
          <div className="relative max-w-xl mx-auto group">
            <Search className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={24} />
            <input 
              className="w-full p-4 pl-14 bg-white border-2 border-transparent rounded-2xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none text-lg transition-all"
              placeholder="Yazar ismi veya şirket ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-xl font-medium">"{search}" ile eşleşen bir yazar bulunamadı.</p>
          </div>
        ) : (
         
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map(u => <UserCard key={u.id} user={u} />)}
          </div>
        )}
      </div>
    </div>
  );
};