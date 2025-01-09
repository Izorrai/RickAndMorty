// api rick and morty

const url = "https://rickandmortyapi.com/api/character/?name=";

export const apiCall = async (url) => {
    const response = await fetch(url);
    const data = await response.json();
    return data;
};


