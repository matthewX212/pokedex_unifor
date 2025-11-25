var a = [];
var b = [];
var c = 1;
var d = 30;
var e = '';
var f1 = '';
var g = null;

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
        const response = await fetch(API2); // Corrigido para usar API2 já que API_TYPE não estava definido
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
        
        // Limpa opções duplicadas antes de adicionar (boa prática)
        sel.innerHTML = '<option value="">Todos os tipos</option>';
        
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
        var off = (c - 1) * d;
        var ur = API + '?limit=' + d + '&offset=' + off;
        var r = await fetch(ur);
        var dt = await r.json();

        var pro = [];
        for(var i = 0; i < dt.results.length; i++) {
            pro.push(fetch(dt.results[i].url));
        }

        var r = await Promise.all(pro);
        a = [];
        for(var i = 0; i < r.length; i++) {
            var pokemon = await r[i].json();
            a.push(pokemon);
        }

        b = [...a];
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
        const pokemonCategory = API2 + '/' + f1;
        const response = await fetch(pokemonCategory);
        const sizePokemonList = await response.json();
        const listPokemon = [];

        const limitForPage = sizePokemonList.pokemon.length > 100 ? 100 : sizePokemonList.pokemon.length; // Limita a 100
        for(let index = 0; index < limitForPage; index++) {
            listPokemon.push(fetch(sizePokemonList.pokemon[index].pokemon.url));
        }

        const promise = await Promise.all(listPokemon);
        a = [];
        for(let index = 0; index < promise.length; index++) {
            const pokemon = await promise[index].json();
            a.push(pokemon);
        }

        b = [...a];
        UNIFOR();
    } catch(error) {
        console.log('erro ao carregar tipo');
        alert('Erro ao carregar Pokémons do tipo!');
    }
}

function UNIFOR() {
    let pokemonId = document.getElementById('pokemonGrid');
    let filter = b;
    pokemonId.innerHTML = '';

    if(e !== '') {
        filter = filter.filter(product => {
            return product.name.toLowerCase().includes(e.toLowerCase()) || product.id.toString().includes(e);
        });
    }

    for(let index = 0; index < filter.length; index++) {
        let element = filter[index];
        let htmlDivElement = document.createElement('div');
        htmlDivElement.className = 'col-md-3';

        // Aqui chama showDetails, que agora existe corretamente
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

    if(f1 !== '') {
        document.getElementById('pageInfo').textContent = 'Mostrando ' + filter.length + ' Pokémons';
    } else {
        document.getElementById('pageInfo').textContent = 'Página ' + c;
    }

    document.getElementById('prevBtn').disabled = c === 1 || f1 !== '';
    document.getElementById('nextBtn').disabled = f1 !== '';
}

async function f() {
    e = document.getElementById('s').value;
    f1 = document.getElementById('typeFilter').value;

    // Se tem filtro de tipo, busca pokémons daquele tipo
    if(f1 !== '') {
        await category();
    } else {
        UNIFOR();
    }
}

function r() {
    document.getElementById('s').value = '';
    document.getElementById('typeFilter').value = '';
    e = '';
    f1 = '';
    c = 1;
    carregarPokemons();
}

function p1() {
    if(c > 1) {
        c--;
        if(f1 !== '') {
            UNIFOR();
        } else {
            carregarPokemons();
        }
    }
}

function p2() {
    c++;
    if(f1 !== '') {
        UNIFOR();
    } else {
        carregarPokemons();
    }
}

function x() {
    document.body.classList.toggle('dark');
}

// --- AQUI ESTÁ A FUNÇÃO REFATORADA (SUBSTITUINDO A Minhe_nha) ---
async function showDetails(id) {
    try {
        const pokemonResponse = await fetch(`${API}/${id}`);
        const pokemon = await pokemonResponse.json();

        const speciesResponse = await fetch(pokemon.species.url);
        const speciesData = await speciesResponse.json();

        const flavorEntry = speciesData.flavor_text_entries.find(
            entry => entry.language.name === 'en'
        );
        const description = flavorEntry ? flavorEntry.flavor_text.replace(/\f/g, ' ') : 'Sem descrição disponível.';

        const modalTitle = document.getElementById('modalTitle');
        modalTitle.textContent = `#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

        const modalBody = document.getElementById('modalBody');
        
        const typesHtml = pokemon.types.map(t => 
            `<span class="badge type-${t.type.name}">${t.type.name}</span>`
        ).join(' ');

        const abilitiesHtml = pokemon.abilities.map(a => a.ability.name).join(', ');

        const statsHtml = pokemon.stats.map(stat => {
            const percentage = (stat.base_stat / 255) * 100;
            return `
                <div>
                    <small>${stat.stat.name}: ${stat.base_stat}</small>
                    <div class="stat-bar">
                        <div class="stat-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>`;
        }).join('');

        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <div class="sprite-container d-flex justify-content-around mb-3">
                        <div>
                            <img src="${pokemon.sprites.front_default}" alt="Normal" width="96">
                            <p class="text-center">Normal</p>
                        </div>
                        <div>
                            <img src="${pokemon.sprites.front_shiny}" alt="Shiny" width="96">
                            <p class="text-center">Shiny</p>
                        </div>
                    </div>
                    <p><strong>Tipo:</strong> ${typesHtml}</p>
                    <p><strong>Altura:</strong> ${pokemon.height / 10} m</p>
                    <p><strong>Peso:</strong> ${pokemon.weight / 10} kg</p>
                    <p><strong>Habilidades:</strong> ${abilitiesHtml}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Descrição:</strong></p>
                    <p class="text-muted">${description}</p>
                    <h6 class="mt-3">Estatísticas:</h6>
                    ${statsHtml}
                </div>
            </div>
        `;

        const modalElement = document.getElementById('m');
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();

    } catch (error) {
        console.error('Erro ao carregar detalhes do Pokémon:', error);
        alert('Não foi possível carregar os detalhes deste Pokémon.');
    }
}

async function initializeApp() {
    createSkeletons();
    await populateTypeFilter();
}

window.onload = function() {
    carregarTiposEPagina();
};