import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

interface PostFormProps {
  onSubmit: (title: string, body: string) => Promise<void>;
}

export const PostForm = ({ onSubmit }: PostFormProps) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title, body);
      setTitle('');
      setBody('');
    } catch (error) {
      console.error("Post gönderilirken hata:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form 
      onSubmit={handleFormSubmit} 
      className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 mb-10 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-black text-slate-800 flex items-center tracking-tight">
          <Sparkles className="mr-2 text-blue-500" size={24} /> 
          Yeni İçerik Oluştur
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">
          Draft Mode
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">İçerik Başlığı</label>
          <input 
            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all text-slate-700 placeholder:text-slate-300" 
            placeholder="Etkileyici bir başlık yazın..." 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            disabled={isSubmitting}
            required 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 ml-1">Düşünceleriniz</label>
          <textarea 
            className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:border-blue-500/20 focus:bg-white focus:ring-4 focus:ring-blue-50/50 transition-all text-slate-700 placeholder:text-slate-300 h-32 resize-none" 
            placeholder="Neler hakkında yazmak istersiniz?" 
            value={body} 
            onChange={e => setBody(e.target.value)} 
            disabled={isSubmitting}
            required 
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-blue-100 active:scale-[0.98]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Yayınlanıyor...
            </>
          ) : (
            <>
              <Send size={20} />
              Yayınla
            </>
          )}
        </button>
      </div>
    </form>
  );
};