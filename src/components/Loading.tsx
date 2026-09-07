import { Loader2 } from 'lucide-react';

export const Loading = () => (
  <div className="flex flex-col justify-center items-center min-h-[400px] w-full animate-in fade-in duration-500">
    <div className="relative flex items-center justify-center">
      <div className="absolute h-16 w-16 rounded-full border-4 border-slate-100"></div>
      <Loader2 
        className="h-16 w-16 text-blue-600 animate-spin transition-all" 
        strokeWidth={2.5}
      />
    </div>

    <div className="mt-8 text-center">
      <h3 className="text-xl font-bold text-slate-800 tracking-tight">Yükleniyor..</h3>
      <p className="text-slate-400 text-sm mt-1 font-medium italic">Hana Travel Dashboard</p>
    </div>

    <div className="mt-12 flex gap-1">
      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-bounce"></div>
    </div>
  </div>
);