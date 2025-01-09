import { useState, useEffect } from 'react';
import EpisodeModal from '../modal/episodeModal';
import './searchForm.css';

const QuizSearch = () => {
  const [allCharacters, setAllCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [watchedEpisodes, setWatchedEpisodes] = useState([]);
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  const questionStructure = [
    {
      id: 'status',
      question: "¡Empecemos! ¿Tu personaje está...?",
      getOptions: (chars) => {
        const statuses = new Set(chars.map(char => char.status));
        const options = Array.from(statuses).map(status => ({
          value: status.toLowerCase(),
          label: status === 'Alive' ? '💚 ¡Vivito y coleando!' :
                 status === 'Dead' ? '💀 Ya pasó a mejor vida...' :
                 '❓ Un completo misterio',
          displayValue: status
        }));
        return [...options, { value: '', label: '🎲 Me da igual' }];
      }
    },
    {
      id: 'species',
      question: "¿Qué rayos es?",
      getOptions: (chars) => {
        const species = new Set(chars.map(char => char.species));
        const options = Array.from(species).map(spec => {
          let emoji = '👽'; 
          switch(spec.toLowerCase()) {
            case 'human':
              emoji = '👤';
              break;
            case 'alien':
              emoji = '👽';
              break;
            case 'robot':
              emoji = '🤖';
              break;
            case 'animal':
              emoji = '🐾';
              break;
            case 'humanoid':
              emoji = '🧝';
              break;
            case 'cronenberg':
              emoji = '🧟';
              break;
            case 'mythological creature':
              emoji = '🐲';
              break;
            case 'disease':
              emoji = '🦠';
              break;
            default:
              emoji = '🌟';
          }
          return {
            value: spec.toLowerCase(),
            label: `${emoji} ${spec}`,
            displayValue: spec
          };
        });
        options.sort((a, b) => a.displayValue.localeCompare(b.displayValue));
        return [...options, { value: '', label: '🎭 Sorpréndeme' }];
      }
    },
    {
      id: 'gender',
      question: "¿Y su género es...?",
      getOptions: (chars) => {
        const genders = new Set(chars.map(char => char.gender));
        const options = Array.from(genders).map(gender => ({
          value: gender.toLowerCase(),
          label: gender === 'Male' ? '👨 Masculino' :
                 gender === 'Female' ? '👩 Femenino' :
                 gender === 'Genderless' ? '⭐ Sin género' :
                 '🌌 Desconocido',
          displayValue: gender
        }));
        return [...options, { value: '', label: '🎪 No me importa' }];
      }
    },
    {
      id: 'origin',
      question: "¿De dónde salió este ser?",
      getOptions: (chars) => {
        const origins = new Set(chars.map(char => char.origin.name));
        const options = Array.from(origins)
          .filter(origin => origin && origin !== 'unknown')
          .map(origin => {
            let emoji = '🌍'; 
            if (origin.toLowerCase().includes('earth')) {
              emoji = '🌎';
            } else if (origin.toLowerCase().includes('planet')) {
              emoji = '🪐';
            } else if (origin.toLowerCase().includes('space')) {
              emoji = '🚀';
            } else if (origin.toLowerCase().includes('dimension')) {
              emoji = '🌌';
            } else if (origin.toLowerCase().includes('citadel')) {
              emoji = '🏰';
            } else if (origin.toLowerCase().includes('cluster')) {
              emoji = '✨';
            }
            return {
              value: origin,
              label: `${emoji} ${origin}`
            };
          });
        options.sort((a, b) => a.label.localeCompare(b.label));
        return [...options, { value: '', label: '🎡 Cualquier lugar está bien' }];
      }
    }
  ];

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Cargar datos de localStorage
        const storedFavorites = JSON.parse(localStorage.getItem('rickAndMortyFavorites') || '[]');
        const storedWatchedEpisodes = JSON.parse(localStorage.getItem('rickAndMortyWatchedEpisodes') || '[]');
        setFavorites(storedFavorites);
        setWatchedEpisodes(storedWatchedEpisodes);

        // Cargar todos los personajes
        let allChars = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`https://rickandmortyapi.com/api/character?page=${page}`);
          const data = await response.json();
          
          // Para cada personaje en esta página, obtener info de episodios
          const charactersWithEpisodes = await Promise.all(
            data.results.map(async (character) => {
              const episodeData = await Promise.all(
                character.episode.map(async (episodeUrl) => {
                  try {
                    const episodeResponse = await fetch(episodeUrl);
                    const episodeInfo = await episodeResponse.json();
                    return {
                      url: episodeUrl,
                      code: episodeInfo.episode
                    };
                  } catch (error) {
                    console.error('Error fetching episode:', error);
                    return { url: episodeUrl, code: 'Unknown' };
                  }
                })
              );
              return {
                ...character,
                episodeData
              };
            })
          );
          
          allChars = [...allChars, ...charactersWithEpisodes];
          hasMore = data.info.next !== null;
          page++;
        }

        setAllCharacters(allChars);
        setFilteredCharacters(allChars);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleAnswer = (answer) => {
    const newAnswers = {
      ...answers,
      [questionStructure[currentStep].id]: answer
    };
    setAnswers(newAnswers);

    // Filtrar personajes basados en la nueva respuesta
    const newFilteredCharacters = allCharacters.filter(character => {
      return Object.entries(newAnswers).every(([key, value]) => {
        if (!value) return true; // Si no hay valor seleccionado, no filtramos
        if (key === 'origin') {
          return character.origin.name === value;
        }
        return character[key].toLowerCase() === value.toLowerCase();
      });
    });

    setFilteredCharacters(newFilteredCharacters);

    if (currentStep < questionStructure.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
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

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setFilteredCharacters(allCharacters);
    setShowResults(false);
  };

  if (loading) {
    return (
      <div className="quiz-container">
        <div className="loading-message">
          <h2>🔄 Cargando el multiverso...</h2>
          <p>Buscando en todas las dimensiones...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="quiz-container">
        <div className="results-header">
          <h2>🎉 ¡Aquí están tus resultados!</h2>
          <p>Encontré {filteredCharacters.length} personaje(s) que coinciden con tu búsqueda</p>
          <button className="reset-button" onClick={resetQuiz}>
            🔄 ¡Buscar otros!
          </button>
        </div>

        <div className="results-grid">
          {filteredCharacters.map(character => (
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
                  <p><span>Especie: </span>{character.species}</p>
                  <p><span>Origen: </span>{character.origin.name}</p>
                  <p><span>Ubicación: </span>{character.location.name}</p>
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
  }

  const currentOptions = questionStructure[currentStep].getOptions(filteredCharacters);

  return (
    <div className="quiz-container">
      <div className="question-container">
        <h2 className="question-text">{questionStructure[currentStep].question}</h2>
        
        <div className="options-grid">
          {currentOptions.map((option) => (
            <button
              key={option.value}
              className="option-button"
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="question-progress">
          <p>Pregunta {currentStep + 1} de {questionStructure.length}</p>
          <p>{filteredCharacters.length} personajes coinciden con tus respuestas</p>
        </div>
      </div>
    </div>
  );
};

export default QuizSearch;