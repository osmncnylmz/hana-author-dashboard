import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosInstance';
import type { Post, User } from '../types'; 
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { PostForm } from '../components/PostForm';
import { Loading } from '../components/Loading';

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const [userRes, postsRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/posts?userId=${id}`)
        ]);
        setUser(userRes.data);
        setPosts(postsRes.data);
      } catch (err) {
        console.error("Yazar detayı yüklenirken hata oluştu:", err);
        setError("Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleAdd = async (title: string, body: string) => {
    try {
      const res = await api.post('/posts', { title, body, userId: Number(id) });

      // POST /posts answers with id 101 every time. It validates the payload and drops it.
      // Date.now() only has to keep the keys apart until the next reload clears the list.
      const newPost = { ...res.data, id: Date.now() };
      setPosts([newPost, ...posts]);
    } catch (err) {
      console.error("Post eklenirken hata oluştu:", err);
      alert("Post eklenemedi.");
    }
  };

  if (loading) return <Loading />;
  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8">
      <div className="max-w-4xl mx-auto p-6">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-slate-500 hover:text-blue-600 mb-8 font-semibold transition-colors group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> 
          Yazarlara Dön
        </button>

        {user && (
          <div className="mb-10">
            <h1 className="text-4xl font-black text-slate-900 mb-2">{user.name}</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                {user.company.name}
              </span>
              • {posts.length} Paylaşım
            </p>
          </div>
        )}

        <div className="mb-12">
          <PostForm onSubmit={handleAdd} />
        </div>

        <div className="flex items-center gap-2 mb-6 text-slate-800">
          <MessageSquare size={24} className="text-blue-500" />
          <h3 className="text-2xl font-bold">Yazılar</h3>
        </div>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-dashed text-center text-slate-400">
              Henüz bir yazı paylaşılmamış.
            </div>
          ) : (
            posts.map(p => (
              <article key={p.id} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-xl mb-3 text-slate-800 capitalize leading-snug">
                  {p.title}
                </h4>
                <p className="text-slate-600 leading-relaxed italic">
                  "{p.body}"
                </p>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};