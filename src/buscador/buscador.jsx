import { useState, useEffect } from 'react';
import EpisodeModal from '../modal/episodeModal';
import './buscador.css';

const RickAndMortySearch = () => {
  const [query, setQuery] = useState('');
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem('rickAndMortyFavorites') || '[]');
    const storedWatchedEpisodes = JSON.parse(localStorage.getItem('rickAndMortyWatchedEpisodes') || '[]');
    setFavorites(storedFavorites);
    setWatchedEpisodes(storedWatchedEpisodes);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        searchCharacters();
      } else {
        setCharacters([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const searchCharacters = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://rickandmortyapi.com/api/character/?name=${query}`);
      const data = await response.json();
      
      if (data.error) {
        setError('No se encontraron personajes');
        setCharacters([]);
      } else {
        // Obtener información de episodios
        const charactersWithEpisodes = await Promise.all(
          data.results.map(async (character) => {
            const episodeData = await Promise.all(
              character.episode.map(async (episodeUrl) => {
                const episodeResponse = await fetch(episodeUrl);
                const episodeInfo = await episodeResponse.json();
                return {
                  url: episodeUrl,
                  code: episodeInfo.episode
                };
              })
            );
            return {
              ...character,
              episodeData
            };
          })
        );
        setCharacters(charactersWithEpisodes);
      }
    } catch (err) {
      setError('Error al buscar personajes');
      setCharacters([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (character) => {
    const newFavorites = favorites.some(fav => fav.id === character.id)
      ? favorites.filter(fav => fav.id !== character.id)
      : [...favorites, character];
    
    setFavorites(newFavorites);
    localStorage.setItem('rickAndMortyFavorites', JSON.stringify(newFavorites));
  };

  const toggleWatchedEpisode = (episodeUrl) => {
    const newWatchedEpisodes = watchedEpisodes.includes(episodeUrl)
      ? watchedEpisodes.filter(url => url !== episodeUrl)
      : [...watchedEpisodes, episodeUrl];
    
    setWatchedEpisodes(newWatchedEpisodes);
    localStorage.setItem('rickAndMortyWatchedEpisodes', JSON.stringify(newWatchedEpisodes));
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'alive':
        return 'status-alive';
      case 'dead':
        return 'status-dead';
      default:
        return 'status-unknown';
    }
  };

  return (
    <div className="container">
      <div className="search-section">
        <h1 className="title">Rick and Morty Buscador</h1>
        
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Escribe para buscar personajes..."
              className="search-input"
            />
            <span className="search-icon"></span>
          </div>
        </div>

        {loading && (
          <div className="loading-message">
            Buscando personajes...
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>

      <div className={`results-section ${characters.length > 0 ? 'visible' : ''}`}>
        <div className="characters-grid">
          {characters.map((character) => (
            <div key={character.id} className="character-card">
              <button
                className={`favorite-button ${favorites.some(fav => fav.id === character.id) ? 'active' : ''}`}
                onClick={() => toggleFavorite(character)}
                title={favorites.some(fav => fav.id === character.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                ★
              </button>
              <img
                src={character.image}
                alt={character.name}
                className="character-image"
              />
              <div className="character-info">
                <h2 className="character-name">{character.name}</h2>
                <div className="character-details">
                  <p>
                    <span>Estado: </span>
                    <span className={`status-badge ${getStatusClass(character.status)}`}>
                      {character.status}
                    </span>
                  </p>
                  <p>
                    <span>Especie: </span>
                    {character.species}
                  </p>
                  <p>
                    <span>Origen: </span>
                    {character.origin.name}
                  </p>
                  <p>
                    <span>Ubicación: </span>
                    {character.location.name}
                  </p>
                  <p className="episodes-list">
                    <span>Episodios: </span>
                    {character.episodeData?.map((episode, index) => (
                      <span key={episode.url}>
                        <button 
                          className={`episode-link ${watchedEpisodes.includes(episode.url) ? 'watched' : ''}`}
                          onClick={() => {
                            setSelectedEpisode(episode.url);
                            if (!watchedEpisodes.includes(episode.url)) {
                              toggleWatchedEpisode(episode.url);
                            }
                          }}
                        >
                          {episode.code}
                        </button>
                        {index < character.episodeData.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
      {selectedEpisode && (
        <EpisodeModal 
          episodeUrl={selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
          isWatched={watchedEpisodes.includes(selectedEpisode)}
          onToggleWatched={() => toggleWatchedEpisode(selectedEpisode)}
        />
      )}
    </div>
  );
};

export default RickAndMortySearch;