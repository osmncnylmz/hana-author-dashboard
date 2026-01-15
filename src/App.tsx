import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { UserDetail } from './pages/UserDetail';
import { FavoritesProvider } from './context/FavoritesContext';

export default function App() {
  return (
    <FavoritesProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <h1 className="text-xl font-bold text-blue-600 tracking-tight">HANA TRAVEL <span className="text-gray-400">| Case Study</span></h1>
            </div>
          </header>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/user/:id" element={<UserDetail />} />
          </Routes>
        </div>
      </BrowserRouter>
    </FavoritesProvider>
  );
}