let pokemonList = [];
let pokemonFilterList = [];
let minimumPokemonPerPage = 1;
let maximumPokemonPerPage = 20;
let searchForPokemon = '';
let pokemonTypes = '';


const state = {
    allPokemon: [],
    filteredPokemon: [],
    currentPage: 1,
    itemsPerPage: 20,
    searchTerm: '',
    typeFilter: '',
};

const API = 'https://pokeapi.co/api/v2/pokemon'; // API with all pokemon
const API2 = 'https://pokeapi.co/api/v2/type'; // API with pokemon category

const domElements = {
    loading: document.getElementById('loading'),
    pokemonGrid: document.getElementById('pokemonGrid'),
    typeFilter: document.getElementById('typeFilter'),
    searchInput: document.getElementById('s'),
    pageInfo: document.getElementById('pageInfo'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    modal: new bootstrap.Modal(document.getElementById('m')),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody'),
};

function showLoading(show) {
    domElements.loading.style.display = show ? 'flex' : 'none';
    domElements.pokemonGrid.style.display = show ? 'none' : 'flex';
}

function createSkeletons() {
    const skeletonHTML = '<div class="col-md-3"><div class="skeleton"></div></div>';
    domElements.loading.innerHTML = skeletonHTML.repeat(state.itemsPerPage);
}

async function populateTypeFilter() {
    try {
        const response = await fetch(API_TYPE);
        const data = await response.json();
        for (const type of data.results) {
            const option = document.createElement('option');
            option.value = type.name;
            option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            domElements.typeFilter.appendChild(option);
        }
    } catch (error) {
        console.error('Erro ao carregar os tipos:', error);
    }
}

async function carregarTiposEPagina() {

    document.getElementById('loading').innerHTML = '';
    for(var i = 0; i < 20; i++) {
        document.getElementById('loading').innerHTML += '<div class="col-md-3"><div class="skeleton"></div></div>';
    }

    try {
        var r = await fetch(API2);
        var dt = await r.json();
        var sel = document.getElementById('typeFilter');
        for(var i = 0; i < dt.results.length; i++) {
            var opt = document.createElement('option');
            opt.value = dt.results[i].name;
            opt.textContent = dt.results[i].name.charAt(0).toUpperCase() + dt.results[i].name.slice(1);
            sel.appendChild(opt);
        }
    } catch(err) {
        console.log('erro');
    }

    carregarPokemons();
}

async function carregarPokemons() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';

    try {
        var off = (minimumPokemonPerPage - 1) * maximumPokemonPerPage;
        var ur = API + '?limit=' + maximumPokemonPerPage + '&offset=' + off;
        var r = await fetch(ur);
        var dt = await r.json();

        var pro = [];
        for(var i = 0; i < dt.results.length; i++) {
            pro.push(fetch(dt.results[i].url));
        }

        var r = await Promise.all(pro);
        pokemonList = [];
        for(var i = 0; i < r.length; i++) {
            var pokemon = await r[i].json();
            pokemonList.push(pokemon);
        }

        pokemonFilterList = [...pokemonList];
        UNIFOR();
    } catch(error) {
        console.log('erro ao carregar');
        alert('Erro ao carregar Pokémons!');
    }
}

async function category() {
    document.getElementById('loading').style.display = 'flex';
    document.getElementById('pokemonGrid').style.display = 'none';

    try {
        const pokemonCategory = API2 + '/' + pokemonTypes;
        const response = await fetch(pokemonCategory);
        const sizePokemonList = await response.json();
        const listPokemon = [];

        const limitForPage = sizePokemonList.pokemon.length > 100 ? 100 : sizePokemonList.pokemon.length; // Limita a 100
        for(let index = 0; index < limitForPage; index++) {
            listPokemon.push(fetch(sizePokemonList.pokemon[index].pokemon.url));
        }

        const promise = await Promise.all(listPokemon);
        pokemonList = [];
        for(let index = 0; index < promise.length; index++) {
            const pokemon = await promise[index].json();
            pokemonList.push(pokemon);
        }

        pokemonFilterList = [...pokemonList];
        UNIFOR();
    } catch(error) {
        console.log('erro ao carregar tipo');
        alert('Erro ao carregar Pokémons do tipo!');
    }
}

function UNIFOR() {
    let pokemonId = document.getElementById('pokemonGrid');
    let filter = pokemonFilterList;
    pokemonId.innerHTML = '';

    if(searchForPokemon !== '') {
        filter = filter.filter(product => {
            return product.name.toLowerCase().includes(searchForPokemon.toLowerCase()) || product.id.toString().includes(searchForPokemon);
        });
    }

    for(let index = 0; index < filter.length; index++) {
        let element = filter[index];
        let htmlDivElement = document.createElement('div');
        htmlDivElement.className = 'col-md-3';

        let html = `<div class="c" onclick="showDetails(${element.id})">`;
        html = html + '<img src="' + element.sprites.front_default + '" class="i" alt="' + element.name + '">';
        html = html + '<h5 class="text-center">#' + element.id + ' ' + element.name.charAt(0).toUpperCase() + element.name.slice(1) + '</h5>';
        html = html + '<div class="text-center">';

        for(let index = 0; index < element.types.length; index++) {
            let typeName = element.types[index].type.name;
            html = html + '<span class="badge type-' + typeName + '">' + typeName + '</span> ';
        }

        html = html + '</div></div>';
        htmlDivElement.innerHTML = html;
        pokemonId.appendChild(htmlDivElement);
    }

    document.getElementById('loading').style.display = 'none';
    document.getElementById('pokemonGrid').style.display = 'flex';

    if(pokemonTypes !== '') {
        document.getElementById('pageInfo').textContent = 'Mostrando ' + filter.length + ' Pokémons';
    } else {
        document.getElementById('pageInfo').textContent = 'Página ' + minimumPokemonPerPage;
    }

    document.getElementById('prevBtn').disabled = minimumPokemonPerPage === 1 || pokemonTypes !== '';
    document.getElementById('nextBtn').disabled = pokemonTypes !== '';
}

async function f() {
    searchForPokemon = document.getElementById('s').value;
    pokemonTypes = document.getElementById('typeFilter').value;

    // Se tem filtro de tipo, busca pokémons daquele tipo
    if(pokemonTypes !== '') {
        await category();
    } else {
        UNIFOR();
    }
}

function r() {
    document.getElementById('s').value = '';
    document.getElementById('typeFilter').value = '';
    searchForPokemon = '';
    pokemonTypes = '';
    minimumPokemonPerPage = 1;
    carregarPokemons();
}

function p1() {
    if(minimumPokemonPerPage > 1) {
        minimumPokemonPerPage--;
        if(pokemonTypes !== '') {
            UNIFOR();
        } else {
            carregarPokemons();
        }
    }
}

function p2() {
    minimumPokemonPerPage++;
    if(pokemonTypes !== '') {
        UNIFOR();
    } else {
        carregarPokemons();
    }
}

function x() {
    document.body.classList.toggle('dark');
}

async function Minhe_nha(id) {
    try {
        var xpto = await fetch(API + '/' + id);
        var p = await xpto.json();

        var zyz = await fetch(p.species.url);
        var m = await zyz.json();

        var desc = '';
        for(var i = 0; i < m.flavor_text_entries.length; i++) {
            if(m.flavor_text_entries[i].language.name === 'en') {
                desc = m.flavor_text_entries[i].flavor_text;
                break;
            }
        }

        document.getElementById('modalTitle').textContent = '#' + p.id + ' ' + p.name.charAt(0).toUpperCase() + p.name.slice(1);

        var ph = '<div class="row"><div class="col-md-6">';
        ph += '<div class="sprite-container">';
        ph += '<div><img src="' + p.sprites.front_default + '" alt="front"><p class="text-center">Normal</p></div>';
        ph += '<div><img src="' + p.sprites.front_shiny + '" alt="shiny"><p class="text-center">Shiny</p></div>';
        ph += '</div>';

        ph += '<p><strong>Tipo:</strong> ';
        for(var i = 0; i < p.types.length; i++) {
            ph += '<span class="badge type-' + p.types[i].type.name + '">' + p.types[i].type.name + '</span> ';
        }
        ph += '</p>';

        ph += '<p><strong>Altura:</strong> ' + (p.height / 10) + ' m</p>';
        ph += '<p><strong>Peso:</strong> ' + (p.weight / 10) + ' kg</p>';

        ph += '<p><strong>Habilidades:</strong> ';
        for(var i = 0; i < p.abilities.length; i++) {
            ph += p.abilities[i].ability.name;
            if(i < p.abilities.length - 1) ph += ', ';
        }
        ph += '</p>';

        ph += '</div><div class="col-md-6">';

        ph += '<p><strong>Descrição:</strong></p>';
        ph += '<p>' + desc.replace(/\f/g, ' ') + '</p>';

        ph += '<h6>Estatísticas:</h6>';
        for(var i = 0; i < p.stats.length; i++) {
            var stat = p.stats[i];
            var percentage = (stat.base_stat / 255) * 100;
            ph += '<div><small>' + stat.stat.name + ': ' + stat.base_stat + '</small>';
            ph += '<div class="stat-bar"><div class="stat-fill" style="width: ' + percentage + '%"></div></div></div>';
        }

        ph += '</div></div>';

        document.getElementById('modalBody').innerHTML = ph;

        var mod = new bootstrap.Modal(document.getElementById('m'));
        mod.show();

    } catch(error) {
        console.log('erro');
        alert('Erro ao carregar detalhes!');
    }
}


async function initializeApp() {
    createSkeletons();
    await populateTypeFilter();
}

window.onload = function() {
    carregarTiposEPagina();

};
