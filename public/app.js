const API_URL = 'https://pokeapi.co/api/v2/pokemon';
const TYPE_URL = 'https://pokeapi.co/api/v2/type';

const state = {
    page: 1,
    limit: 20,
    offset: 0,
    filterType: '',
    searchTerm: '',
    currentList: [],
    modal: null
};

const el = {
    loading: document.getElementById('loading'),
    grid: document.getElementById('pokemonGrid'),
    typeSelect: document.getElementById('typeFilter'),
    search: document.getElementById('s'),
    pageInfo: document.getElementById('pageInfo'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    modalEl: document.getElementById('m'),
    modalTitle: document.getElementById('modalTitle'),
    modalBody: document.getElementById('modalBody')
};

window.onload = async () => {
    state.modal = new bootstrap.Modal(el.modalEl);
    generateSkeletons();
    await loadTypes();
    await loadPokemons();
};


function toggleLoading(isLoading) {
    el.loading.style.display = isLoading ? "flex" : "none";
    el.grid.style.display = isLoading ? "none" : "flex";
}

function generateSkeletons() {
    const sk = `
        <div class="col-md-3">
            <div class="card p-3 skeleton" style="height: 250px; background: #eee;"></div>
        </div>
    `;
    el.loading.innerHTML = sk.repeat(state.limit);
}

function updatePaginationUI() {
    const filtering = state.filterType !== "";

    el.pageInfo.textContent = filtering
        ? `Mostrando: ${state.filterType}`
        : `Página ${state.page}`;

    el.prevBtn.disabled = state.page === 1 || filtering;
    el.nextBtn.disabled = filtering;
}

async function loadTypes() {
    try {
        const res = await fetch(TYPE_URL);
        const data = await res.json();

        data.results.forEach(t => {
            const opt = document.createElement("option");
            opt.value = t.name;
            opt.textContent = t.name[0].toUpperCase() + t.name.slice(1);
            el.typeSelect.appendChild(opt);
        });
    } catch {
        console.error("Erro ao carregar tipos.");
    }
}

async function loadPokemons() {
    toggleLoading(true);

    try {
        let list = [];
        if (state.filterType) {
            const res = await fetch(`${TYPE_URL}/${state.filterType}`);
            const data = await res.json();
            const max = Math.min(data.pokemon.length, 50);
            list = data.pokemon.slice(0, max).map(i => i.pokemon);
        } else {
            state.offset = (state.page - 1) * state.limit;
            const res = await fetch(`${API_URL}?limit=${state.limit}&offset=${state.offset}`);
            const data = await res.json();
            list = data.results;
        }
        state.currentList = await Promise.all(
            list.map(async (item) => {
                const res = await fetch(item.url);
                return await res.json();
            })
        );

        renderGrid();
    } catch (err) {
        console.error(err);
        alert("Erro ao carregar Pokémons.");
    } finally {
        toggleLoading(false);
        updatePaginationUI();
    }
}

function renderGrid() {
    el.grid.innerHTML = "";

    const search = state.searchTerm.toLowerCase();

    const filtered = state.currentList.filter(p =>
        p.name.includes(search) ||
        p.id.toString().includes(search)
    );

    if (filtered.length === 0) {
        el.grid.innerHTML = `<div class="col-12 text-center text-muted">Nenhum Pokémon encontrado.</div>`;
        return;
    }

    const isDark = document.body.classList.contains("bg-dark");
    const cardClass = isDark
        ? "card h-100 p-3 text-center shadow-sm bg-secondary text-white"
        : "card h-100 p-3 text-center shadow-sm";

    filtered.forEach(p => {
        const types = p.types.map(t =>
            `<span class="badge bg-secondary me-1">${t.type.name}</span>`
        ).join("");

        const card = document.createElement("div");
        card.className = "col-md-3 col-sm-6";

        card.innerHTML = `
            <div class="${cardClass}" onclick="showDetails(${p.id})" style="cursor:pointer;">
                <img src="${p.sprites.front_default}" class="card-img-top mx-auto" style="width:96px">
                <h5 class="mt-2 text-capitalize">#${p.id} ${p.name}</h5>
                ${types}
            </div>
        `;

        el.grid.appendChild(card);
    });
}

async function showDetails(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        const p = await res.json();

        const speciesRes = await fetch(p.species.url);
        const species = await speciesRes.json();

        const entry = species.flavor_text_entries.find(e => e.language.name === "en");
        const desc = entry?.flavor_text.replace(/\f/g, " ") || "Sem descrição disponível.";

        el.modalTitle.textContent = `#${p.id} ${p.name.toUpperCase()}`;

        const types = p.types.map(t =>
            `<span class="badge bg-primary me-1">${t.type.name}</span>`
        ).join("");

        const stats = p.stats.map(s => `
            <div class="mb-1">
                <small>${s.stat.name}</small>
                <div class="progress" style="height:10px;">
                    <div class="progress-bar bg-success" style="width:${(s.base_stat / 255) * 100}%"></div>
                </div>
            </div>
        `).join("");

        el.modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-5 text-center">
                    <img src="${p.sprites.other["official-artwork"].front_default}" class="img-fluid mb-3">
                    ${types}
                    <p><strong>Altura:</strong> ${p.height / 10}m | 
                       <strong>Peso:</strong> ${p.weight / 10}kg</p>
                </div>

                <div class="col-md-7">
                    <p class="fst-italic bg-light text-dark p-2 rounded border">${desc}</p>
                    <h6>Estatísticas</h6>
                    ${stats}
                </div>
            </div>
        `;

        state.modal.show();
    } catch {
        alert("Erro ao carregar detalhes.");
    }
}

function x() {
    document.body.classList.toggle("bg-dark");
    document.body.classList.toggle("text-white");

    const items = document.querySelectorAll(".card, .modal-content");
    items.forEach(i => i.classList.toggle("bg-secondary"));
    items.forEach(i => i.classList.toggle("text-white"));
}

async function f() {
    const term = el.search.value;
    const type = el.typeSelect.value;

    state.searchTerm = term;

    if (type !== state.filterType) {
        state.filterType = type;
        state.page = 1;
        await loadPokemons();
    } else {
        renderGrid();
    }
}

function r() {
    el.search.value = "";
    el.typeSelect.value = "";
    state.searchTerm = "";
    state.filterType = "";
    state.page = 1;
    loadPokemons();
}

function p1() {
    if (state.page > 1) {
        state.page--;
        loadPokemons();
    }
}

function p2() {
    state.page++;
    loadPokemons();
}
