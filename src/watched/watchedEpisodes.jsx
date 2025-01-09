import React, { useState, useEffect } from 'react';
import EpisodeModal from '../modal/episodeModal';
import './watchedEpisodes.css';

const WatchedEpisodes = () => {
  const [episodesBySeasons, setEpisodesBySeasons] = useState({});
  const [loading, setLoading] = useState(true);
  const [openSeasons, setOpenSeasons] = useState({});
  const [selectedEpisode, setSelectedEpisode] = useState(null);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);

  const SEASONS_CONFIG = {
    'S01': { episodes: 11 },
    'S02': { episodes: 10 },
    'S03': { episodes: 10 },
    'S04': { episodes: 10 },
    'S05': { episodes: 10 }
  };

  useEffect(() => {
    const fetchAllEpisodes = async () => {
      try {
        setLoading(true);
        const episodes = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`https://rickandmortyapi.com/api/episode?page=${page}`);
          const data = await response.json();
          episodes.push(...data.results);
          hasMore = data.info.next !== null;
          page++;
        }

        const watchedEpisodes = JSON.parse(localStorage.getItem('rickAndMortyWatchedEpisodes') || '[]');
        setWatchedEpisodes(watchedEpisodes);

        const seasonsData = {};
        episodes.forEach(episode => {
          const seasonCode = episode.episode.substring(0, 3);
          if (!seasonsData[seasonCode]) {
            seasonsData[seasonCode] = {
              episodes: [],
              totalEpisodes: SEASONS_CONFIG[seasonCode]?.episodes || 0
            };
          }
          seasonsData[seasonCode].episodes.push({
            ...episode,
            isWatched: watchedEpisodes.includes(episode.url)
          });
        });

        setEpisodesBySeasons(seasonsData);
      } catch (error) {
        console.error('Error loading episodes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEpisodes();
  }, []);

  const toggleEpisodeWatched = (episodeUrl, event) => {
    event.stopPropagation();
    const newWatchedEpisodes = watchedEpisodes.includes(episodeUrl)
      ? watchedEpisodes.filter(url => url !== episodeUrl)
      : [...watchedEpisodes, episodeUrl];
    
    setWatchedEpisodes(newWatchedEpisodes);
    localStorage.setItem('rickAndMortyWatchedEpisodes', JSON.stringify(newWatchedEpisodes));
    updateEpisodesState(newWatchedEpisodes);
  };

  const toggleSeasonWatched = (seasonCode, event) => {
    event.stopPropagation();
    const seasonEpisodes = episodesBySeasons[seasonCode].episodes;
    const allWatched = seasonEpisodes.every(episode => watchedEpisodes.includes(episode.url));
    
    let newWatchedEpisodes;
    if (allWatched) {
      newWatchedEpisodes = watchedEpisodes.filter(url => 
        !seasonEpisodes.some(episode => episode.url === url)
      );
    } else {
      const episodesToAdd = seasonEpisodes
        .filter(episode => !watchedEpisodes.includes(episode.url))
        .map(episode => episode.url);
      newWatchedEpisodes = [...watchedEpisodes, ...episodesToAdd];
    }

    setWatchedEpisodes(newWatchedEpisodes);
    localStorage.setItem('rickAndMortyWatchedEpisodes', JSON.stringify(newWatchedEpisodes));
    updateEpisodesState(newWatchedEpisodes);
  };

  const toggleSeasonOpen = (seasonCode) => {
    setOpenSeasons(prev => ({
      ...prev,
      [seasonCode]: !prev[seasonCode]
    }));
  };

  const updateEpisodesState = (watchedEpisodes) => {
    setEpisodesBySeasons(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(seasonCode => {
        updated[seasonCode].episodes = updated[seasonCode].episodes.map(episode => ({
          ...episode,
          isWatched: watchedEpisodes.includes(episode.url)
        }));
      });
      return updated;
    });
  };

  const getSeasonProgress = (seasonCode) => {
    const season = episodesBySeasons[seasonCode];
    if (!season) return 0;
    const watchedCount = season.episodes.filter(ep => ep.isWatched).length;
    return Math.round((watchedCount / season.episodes.length) * 100);
  };

  if (loading) {
    return <div className="loading-message">Cargando episodios...</div>;
  }

  return (
    <div className="watched-episodes-container">
      <h1 className="watched-title">Ver Episodios</h1>
      
      {Object.keys(episodesBySeasons).map(seasonCode => (
        <div key={seasonCode} className="season-container">
          <div className="season-header" onClick={() => toggleSeasonOpen(seasonCode)}>
            <div className="season-info">
              <h2 className="season-title">
                Temporada {seasonCode.substring(1)}
                <span className={`season-toggle-icon ${openSeasons[seasonCode] ? 'open' : ''}`}>
                  ▼
                </span>
              </h2>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${getSeasonProgress(seasonCode)}%` }}
                />
              </div>
              <span className="progress-text">{getSeasonProgress(seasonCode)}% visto</span>
            </div>
            <button 
              className="toggle-season-button"
              onClick={(e) => toggleSeasonWatched(seasonCode, e)}
            >
              {getSeasonProgress(seasonCode) === 100 ? 'Desmarcar temporada' : 'Marcar temporada'}
            </button>
          </div>

          <div className={`episodes-container ${openSeasons[seasonCode] ? 'open' : ''}`}>
            <div className="episodes-grid">
              {episodesBySeasons[seasonCode].episodes.map(episode => (
                <div 
                  key={episode.id} 
                  className={`episode-card ${episode.isWatched ? 'watched' : ''}`}
                >
                  <div className="episode-content">
                    <div className="episode-check">{episode.isWatched ? '✓' : ''}</div>
                    <h3 className="episode-name">{episode.name}</h3>
                    <p className="episode-code">{episode.episode}</p>
                    <p className="episode-date">{episode.air_date}</p>
                    <div className="episode-actions">
                      <button 
                        className="watch-toggle"
                        onClick={(e) => toggleEpisodeWatched(episode.url, e)}
                      >
                        {episode.isWatched ? 'Marcar como no visto' : 'Marcar como visto'}
                      </button>
                      <button 
                        className="view-details"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEpisode(episode.url);
                        }}
                      >
                        Ver detalles
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {selectedEpisode && (
        <EpisodeModal 
          episodeUrl={selectedEpisode}
          onClose={() => setSelectedEpisode(null)}
          isWatched={watchedEpisodes.includes(selectedEpisode)}
          onToggleWatched={() => toggleEpisodeWatched(selectedEpisode)}
        />
      )}
    </div>
  );
};

export default WatchedEpisodes;
