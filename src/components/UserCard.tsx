import { Link } from 'react-router-dom';
import { Star, User as UserIcon, Mail, Building2, ChevronRight } from 'lucide-react';
import type { User } from '../types/index';
import { useFavorites } from '../context/favorites-context';

export const UserCard = ({ user }: { user: User }) => {
  const { favorites, toggleFavorite } = useFavorites();
  const isFav = favorites.includes(user.id);

  return (
    <div className="group relative bg-white border border-slate-100 p-7 rounded-[32px] shadow-sm hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.08)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      
      
      <button 
        onClick={() => toggleFavorite(user.id)} 
        className={`absolute top-6 right-6 p-2.5 rounded-2xl transition-all duration-300 ${
          isFav ? 'bg-yellow-50 shadow-sm' : 'bg-slate-50 hover:bg-slate-100'
        }`}
      >
        <Star 
          size={20} 
          className="transition-transform active:scale-125"
          fill={isFav ? "#EAB308" : "none"} 
          color={isFav ? "#EAB308" : "#94A3B8"} 
        />
      </button>

      
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 bg-blue-600 opacity-10 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
        <div className="relative w-full h-full bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
          <UserIcon size={28} />
        </div>
      </div>

   
      <div className="mb-6">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
          {user.name}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center text-slate-400 text-sm font-medium italic">
            <Mail size={14} className="mr-2" />
            {user.email}
          </div>
          <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-wider">
            <Building2 size={14} className="mr-2 text-blue-500" />
            {user.company.name}
          </div>
        </div>
      </div>

      
      <div className="pt-6 border-t border-slate-50">
        <Link 
          to={`/user/${user.id}`} 
          className="flex items-center justify-between w-full bg-slate-50 hover:bg-blue-600 group/btn px-5 py-3 rounded-2xl text-slate-700 hover:text-white font-bold text-sm transition-all duration-300"
        >
          <span>Profili İncele</span>
          <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>

      
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
    </div>
  );
};