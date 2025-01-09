import React, { useState, useEffect, useRef } from 'react';
import './favoriteGame.css';

// Icono de corazón
const HeartIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="w-6 h-6"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

// Icono de espada (reemplazando la X)
const SwordIcon = () => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    className="w-6 h-6"
  >
    <path d="M2 21h5l9-9-5-5-9 9v5z" />
    <path d="M15 4l5 5M14 5L5 14" />
  </svg>
);

const CharacterCard = ({ character, onSelect, onReject, isFinalRound, isWinner }) => {
    const cardRef = useRef(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);

    const handleDragStart = (clientX) => {
        setIsDragging(true);
        setDragStart({ x: clientX, y: 0 });
    };

    const handleDrag = (clientX) => {
        if (!isDragging) return;
        
        const offset = clientX - dragStart.x;
        setDragOffset({ x: offset, y: 0 });
        
        if (offset > 100) {
            cardRef.current.classList.add('dragging-right');
            cardRef.current.classList.remove('dragging-left');
        } else if (offset < -100) {
            cardRef.current.classList.add('dragging-left');
            cardRef.current.classList.remove('dragging-right');
        } else {
            cardRef.current.classList.remove('dragging-right', 'dragging-left');
        }
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        // Si se desplazó lo suficiente, hacer la selección o el rechazo
        if (dragOffset.x > 100) {
            onSelect(character);
        } else if (dragOffset.x < -100) {
            onReject(character);
        }

        setDragOffset({ x: 0, y: 0 });

        // Espera para permitir que la transición termine
        setTimeout(() => {
            cardRef.current.classList.remove('dragging-right', 'dragging-left');
        }, 300);
    };

    const handleMouseDown = (e) => {
        handleDragStart(e.clientX);
    };

    const handleMouseMove = (e) => {
        handleDrag(e.clientX);
    };

    const handleMouseUp = () => {
        handleDragEnd();
    };

    const handleTouchStart = (e) => {
        handleDragStart(e.touches[0].clientX);
    };

    const handleTouchMove = (e) => {
        handleDrag(e.touches[0].clientX);
    };

    const handleTouchEnd = () => {
        handleDragEnd();
    };

    const handleButtonClick = (direction) => {
        const cardElement = cardRef.current;
        
        // Si se hace clic en el botón "Me gusta"
        if (direction === 'right') {
            cardElement.classList.add('dragging-right');
            setTimeout(() => onSelect(character), 300); // Esperar la transición antes de hacer la acción
        }
        // Si se hace clic en el botón "Rechazar"
        else {
            cardElement.classList.add('dragging-left');
            setTimeout(() => onReject(character), 300); // Esperar la transición antes de hacer la acción
        }
        
        // Eliminar el efecto después de la animación.
        setTimeout(() => {
            cardElement.classList.remove('dragging-right', 'dragging-left');
        }, 300);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [isDragging]);

    const cardStyle = {
        transform: `translateX(${dragOffset.x}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease'
    };

    return (
        <div className={`character-card-container ${isWinner ? 'winner-card' : ''}`}>
            <div 
                ref={cardRef}
                className="battle-card"
                style={cardStyle}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <div className="status-overlay">
                    <span className="status-text like">¡VIVIR POR AHORA!</span>
                    <span className="status-text nope">¡MORIR!</span>
                </div>
                <img 
                    src={character.image} 
                    alt={character.name} 
                    className="character-image"
                />
                <div className="character-info">
                    <h3 className="character-name">{character.name}</h3>
                    <p className="character-species">{character.species}</p>
                    <p className="character-status">Estado: {character.status}</p>
                </div>
            </div>
            
            {!isWinner && (
                <div className="action-buttons">
                    <button 
                        onClick={() => handleButtonClick('left')} 
                        className="reject-button"
                        aria-label="Rechazar"
                    >
                        <SwordIcon />
                    </button>
                    <button 
                        onClick={() => handleButtonClick('right')} 
                        className="like-button"
                        aria-label="Me gusta"
                    >
                        <HeartIcon />
                    </button>
                </div>
            )}
        </div>
    );
};

const Favorites = () => {
    const [leftCharacter, setLeftCharacter] = useState(null);
    const [rightCharacter, setRightCharacter] = useState(null);
    const [remainingCharacters, setRemainingCharacters] = useState([]);
    const [winner, setWinner] = useState(null);
    const [inProgress, setInProgress] = useState(true);
    const [isFinalRound, setIsFinalRound] = useState(false);

    useEffect(() => {
        const storedFavorites = JSON.parse(localStorage.getItem('rickAndMortyFavorites') || '[]');
        if (storedFavorites.length >= 2) {
            setLeftCharacter(storedFavorites[0]);
            setRightCharacter(storedFavorites[1]);
            setRemainingCharacters(storedFavorites.slice(2));
        }
    }, []);

    useEffect(() => {
        if (remainingCharacters.length === 0 && leftCharacter && rightCharacter) {
            setIsFinalRound(true);
        }
    }, [remainingCharacters.length, leftCharacter, rightCharacter]);

    const handleSelect = (selected) => {
        if (isFinalRound) {
            setWinner(selected);
            setLeftCharacter(null);
            setRightCharacter(null);
            setInProgress(false);
        } else if (remainingCharacters.length > 0) {
            if (selected === leftCharacter) {
                setRightCharacter(remainingCharacters[0]);
            } else {
                setLeftCharacter(rightCharacter);
                setRightCharacter(remainingCharacters[0]);
            }
            setRemainingCharacters(prev => prev.slice(1));
        }
    };

    const handleReject = (rejected) => {
        if (isFinalRound) {
            const winner = rejected === leftCharacter ? rightCharacter : leftCharacter;
            setWinner(winner);
            setLeftCharacter(null);
            setRightCharacter(null);
            setInProgress(false);
        } else if (remainingCharacters.length > 0) {
            if (rejected === leftCharacter) {
                setLeftCharacter(remainingCharacters[0]);
            } else {
                setRightCharacter(remainingCharacters[0]);
            }
            setRemainingCharacters(prev => prev.slice(1));
        }
    };

    if (!inProgress && winner) {
        return (
            <div className="favorites-container">
                <div className="favorites-header">
                    <h1>¡Tenemos un ganador!</h1>
                </div>
                <div className="winner-display">
                    <CharacterCard 
                        character={winner}
                        onSelect={() => {}}
                        onReject={() => {}}
                        isFinalRound={false}
                        isWinner={true}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <div className="favorites-header">
                <h1>Batalla de Favoritos</h1>
            </div>
            
            <div className="battle-grid">
                {leftCharacter && (
                    <CharacterCard 
                        character={leftCharacter} 
                        onSelect={handleSelect} 
                        onReject={handleReject}
                        isFinalRound={isFinalRound}
                        isWinner={false}
                    />
                )}
                {rightCharacter && (
                    <CharacterCard 
                        character={rightCharacter} 
                        onSelect={handleSelect} 
                        onReject={handleReject}
                        isFinalRound={isFinalRound}
                        isWinner={false}
                    />
                )}
            </div>

            <div className="instructions">
                Usa los botones de corazón y espada para matar o para que sobreviva el personaje
            </div>

            <div className="remaining-count">
                {isFinalRound ? (
                    <span>¡Última decisión! Elige tu favorito final</span>
                ) : (
                    <span>Quedan {remainingCharacters.length + 2} personajes por comparar</span>
                )}
            </div>
        </div>
    );
};

export default Favorites;
