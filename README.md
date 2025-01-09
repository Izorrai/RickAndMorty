# Rick and Morty Explorer App

## Descripción
Una aplicación web interactiva que permite explorar el universo de Rick and Morty, ofreciendo múltiples formas de descubrir y gestionar personajes, episodios y favoritos. La aplicación incluye un buscador tradicional, un buscador interactivo tipo quiz, y un sistema de seguimiento de episodios vistos.

## Tecnologías Utilizadas
- React 18
- React Router DOM
- CSS puro
- Vite como bundler

## API
La aplicación consume la [Rick and Morty API](https://rickandmortyapi.com/), utilizando los siguientes endpoints:
- `/character` - Para obtener información de personajes
- `/episode` - Para obtener información de episodios
- `/location`- Para obtener informacion de la localización de los personajes.

## Funcionalidades

### 1. Buscador Principal
- Búsqueda en tiempo real de personajes
- Visualización de resultados en grid responsive
- Información detallada de cada personaje:
  - Estado (vivo/muerto/desconocido)
  - Especie
  - Origen
  - Ubicación actual
  - Lista de episodios donde aparece

### 2. Buscador Interactivo (Quiz)
- Búsqueda guiada a través de preguntas
- Filtros dinámicos que se actualizan según selecciones previas:
  - Estado del personaje
  - Especie
  - Género
  - Origen
- Resultados filtrados en tiempo real

### 3. Sistema de Favoritos
- Marcado de personajes como favoritos
- Persistencia de favoritos en localStorage
- Sección dedicada para ver todos los favoritos
- Gestión de favoritos (añadir/eliminar)

### 4. Gestión de Episodios
- Organización por temporadas
- Progreso visual por temporada
- Funcionalidades por episodio:
  - Marcar como visto/no visto
  - Ver detalles del episodio
  - Enlaces a episodios
- Modal de detalles con:
  - Información del episodio
  - Lista de personajes que aparecen
  - Paginación de personajes (12 por página)

### 5. Batalla de favoritos
- Juego estilo Tinder
    - Puedes elegir matar o que el personaje se matenga vivo
    - Animaciones y transiciones suaves
    - Indicadores de estado y progreso

### 6. Interfaz de Usuario
- Diseño responsive
- Navegación inferior
- Animaciones y transiciones suaves
- Feedback visual para todas las acciones
- Indicadores de estado y progreso

### 7. Características Técnicas
- Persistencia de datos en localStorage
- Manejo de estados con React hooks
- Lazy loading de imágenes
- Sistema de rutas con React Router
- Gestión eficiente de peticiones a la API

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/Izorrai/RickAndMorty

# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## Estructura del Proyecto
```
src/

├── buscador/
├── buscador.jsx
└── buscador.css
├── form/
├── searchForm.jsx
└── searchForm.css
├── favorites/
├── favorites.jsx
└── favorites.css
└── watched/
├── watchedEpisodes.jsx
└── watchedEpisodes.css
├── modal/
├── episodeModal.jsx
└── modal.css
└── App.jsx
```

## Características Pendientes
- [ ] Búsqueda avanzada con múltiples filtros
- [ ] Sistema de autenticación
- [ ] Compartir listas de favoritos
- [ ] Estadísticas de visualización
- [ ] Modo oscuro

## Contribución
Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia
[MIT](https://choosealicense.com/licenses/mit/)

## Contacto
[Tu información de contacto]

## Agradecimientos
- [Rick and Morty API](https://rickandmortyapi.com/) por proporcionar los datos
- Adult Swim por crear esta increíble serie
- La comunidad de React por sus recursos y herramientas
