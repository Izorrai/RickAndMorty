import React, { useState, useEffect } from 'react';
import './favorites.css';

const Favorites = () => {
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        // Cargar favoritos al montar el componente
        const storedFavorites = localStorage.getItem('rickAndMortyFavorites');
        if (storedFavorites) {
            setFavorites(JSON.parse(storedFavorites));
        }
    }, []);

    const removeFromFavorites = (characterId) => {
        const updatedFavorites = favorites.filter(char => char.id !== characterId);
        setFavorites(updatedFavorites);
        localStorage.setItem('rickAndMortyFavorites', JSON.stringify(updatedFavorites));
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

    if (favorites.length === 0) {
        return (
            <div className="favorites-container">
                <h2 className="favorites-title">Mis Personajes Favoritos</h2>
                <div className="empty-favorites">
                    No tienes personajes favoritos aún.
                </div>
            </div>
        );
    }

    return (
        <div className="favorites-container">
            <h2 className="favorites-title">Mis Personajes Favoritos</h2>
            <div className="favorites-grid">
                {favorites.map((character) => (
                    <div key={character.id} className="favorite-card">
                        <button
                            className="remove-favorite"
                            onClick={() => removeFromFavorites(character.id)}
                            title="Eliminar de favoritos"
                        >
                            ×
                        </button>
                        <img
                            src={character.image}
                            alt={character.name}
                            className="favorite-image"
                        />
                        <div className="favorite-info">
                            <h3 className="favorite-name">{character.name}</h3>
                            <div className="favorite-details">
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
                                    <span>Ubicación: </span>
                                    {character.location.name}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Favorites;