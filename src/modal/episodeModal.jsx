import React, { useState, useEffect } from 'react';
import './modal.css';

const CHARACTERS_PER_PAGE = 12;

const EpisodeModal = ({ episodeUrl, onClose, isWatched, onToggleWatched }) => {
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchEpisodeData = async () => {
      try {
        setLoading(true);
        const response = await fetch(episodeUrl);
        const data = await response.json();
        setEpisode(data);

       
        const charactersData = await Promise.all(
          data.characters.map(url => fetch(url).then(res => res.json()))
        );
        setCharacters(charactersData);
        
      } catch (err) {
        setError('Error al cargar los datos del episodio');
      } finally {
        setLoading(false);
      }
    };

    if (episodeUrl) {
      fetchEpisodeData();
    }
  }, [episodeUrl]);

  // Calcular el total de páginas
  const totalPages = Math.ceil(characters.length / CHARACTERS_PER_PAGE);

  // Obtener los personajes de la página actual
  const getCurrentCharacters = () => {
    const startIndex = (currentPage - 1) * CHARACTERS_PER_PAGE;
    const endIndex = startIndex + CHARACTERS_PER_PAGE;
    return characters.slice(startIndex, endIndex);
  };

  if (!episodeUrl) return null;

  if (loading) {
    return (
      <div className="episode-modal-overlay" onClick={onClose}>
        <div className="episode-modal-content" onClick={e => e.stopPropagation()}>
          <div className="episode-modal-loading">Cargando...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="episode-modal-overlay" onClick={onClose}>
        <div className="episode-modal-content" onClick={e => e.stopPropagation()}>
          <div className="episode-modal-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="episode-modal-overlay" onClick={onClose}>
      <div className="episode-modal-content" onClick={e => e.stopPropagation()}>
        <button className="episode-modal-close" onClick={onClose}>×</button>
        
        <div className="episode-modal-header">
          <h2 className="episode-modal-title">{episode.name}</h2>
          
          <div className="episode-modal-info">
            <p><strong>Código del episodio:</strong> {episode.episode}</p>
            <p><strong>Fecha de emisión:</strong> {episode.air_date}</p>
          </div>

          <button 
            className={`watch-toggle-button ${isWatched ? 'watched' : ''}`}
            onClick={onToggleWatched}
          >
            {isWatched ? '✓ Episodio visto' : 'Marcar como visto'}
          </button>
          <a 
          href={`https://pepinillo-rick.web.app/rym/?=${episode.episode.substring(1, 3)}&${episode.episode.substring(4)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="view-episode"
          >
        Ver capítulo
        </a>
        </div>

        <div className="episode-modal-body">
          <h3 className="episode-modal-subtitle">
            Personajes que aparecen ({characters.length})
          </h3>

          <div className="episode-characters-grid">
            {getCurrentCharacters().map(character => (
              <div key={character.id} className="episode-character-card">
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="episode-character-image"
                />
                <p className="episode-character-name">{character.name}</p>
              </div>
            ))}
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button 
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className="pagination-info">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              className="pagination-button"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeModal;