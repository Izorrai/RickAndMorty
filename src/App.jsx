import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import RickAndMortySearch from '../src/buscador/buscador';
import RickAndMortyFormSearch from '../src/form/searchForm';
import Favorites from '../src/favorites/favorites';
import WatchedEpisodes from '../src/watched/watchedEpisodes';
import './App.css';

// SVG Components
const SearchIcon = () => (
  <svg 
    className="nav-svg-icon" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const GameIcon = () => (
  <svg 
    className="nav-svg-icon" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
  >
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function App() {
  return (
    <Router>
      <div className="main-container">
        <Routes>
          <Route path="/" element={<RickAndMortySearch />} />
          <Route path="/search" element={<RickAndMortyFormSearch />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/watched" element={<WatchedEpisodes />} />
        </Routes>

        <nav className="bottom-nav">
          <NavLink to="/" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <SearchIcon />
            <span className="nav-text">Buscar</span>
          </NavLink>
          
          <NavLink to="/favorites" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">★</span>
            <span className="nav-text">Favoritos</span>
          </NavLink>
          
          <NavLink to="/search" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <GameIcon />
            <span className="nav-text">Juego</span>
          </NavLink>
          
          <NavLink to="/watched" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">✓</span>
            <span className="nav-text">Vistos</span>
          </NavLink>
        </nav>
      </div>
    </Router>
  );
}

export default App;