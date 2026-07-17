/**
 * Dashboard de Gestión de Viajes
 * ------------------------------------------------------------------
 * INFRAESTRUCTURA DINÁMICA (basada en datos):
 * Toda la interfaz (secciones del dashboard, columnas de visibilidad,
 * pestañas del editor y matriz por modo) se GENERA a partir de un único
 * archivo de datos: data/secciones.json. El HTML solo aporta contenedores
 * vacíos; el JavaScript los rellena.
 *
 * ➜ Para AGREGAR UNA SECCIÓN NUEVA, de forma VISUAL:
 *      Entra al panel de administración (/admin), colección "Secciones del
 *      Dashboard", y añade una sección con sus proveedores. Se guarda en
 *      data/secciones.json (en el repositorio). No hay que tocar el código.
 *
 * MODO DE NAVEGACIÓN: cada proveedor tiene dos URLs posibles:
 *   - enlace_portal  → versión CON acceso (login de la empresa)
 *   - enlace_publico → versión SIN login (web / buscador público)
 * El botón "Modo" del header alterna cuál se usa. Si un proveedor no tiene
 * URL para el modo activo, se oculta automáticamente.
 */

// ─── ESTADO DE CONFIGURACIÓN (se llena al cargar data/secciones.json) ──────────
// Cada sección es un archivo JSON dentro de esta carpeta. Se descubren listando
// la carpeta con la API de GitHub (repo público). El CMS (colección de carpeta)
// crea/edita esos archivos; así agregar una sección es 100% visual.
const REPO_GITHUB   = 'dani71153/Dashboard-Develompent--Juanytours';
const RAMA_GITHUB   = 'main';
const CARPETA_SECCIONES = 'data/secciones';
const CACHE_CONFIG_KEY  = 'configCache';

let SECCIONES = [];           // metadata de cada sección (+ IDs derivados)
let CATEGORIAS = {};          // key → sección
let CAT_KEYS = [];            // orden de las claves de sección
let SECCION_POR_TOGGLE = {};  // toggleId → sección
let originalData = null;      // { categorias: { key: [proveedores] } } — nunca se muta

/** Lista los archivos .json de la carpeta de secciones usando la API de GitHub. */
async function listarArchivosSecciones() {
    const url = `https://api.github.com/repos/${REPO_GITHUB}/contents/${CARPETA_SECCIONES}?ref=${RAMA_GITHUB}`;
    const res = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!res.ok) throw new Error(`API de GitHub HTTP ${res.status}`);
    const arr = await res.json();
    return arr.filter(f => f.type === 'file' && f.name.toLowerCase().endsWith('.json'))
              .map(f => f.name);
}

/** Descarga y parsea un archivo de sección (ruta relativa, mismo origen). */
async function fetchSeccion(nombreArchivo) {
    try {
        const res = await fetch(`${CARPETA_SECCIONES}/${nombreArchivo}`);
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.warn(`No se pudo leer ${nombreArchivo}:`, e.message);
        return null;
    }
}

/**
 * Descubre las secciones (carpeta vía API de GitHub), descarga cada archivo,
 * las ordena por `orden` y construye el estado de la app. Si algo falla, usa
 * la última configuración guardada en caché (localStorage).
 */
async function cargarConfig() {
    let lista;
    try {
        const archivos = await listarArchivosSecciones();
        const secciones = await Promise.all(archivos.map(fetchSeccion));
        lista = secciones.filter(Boolean);
        if (!lista.length) throw new Error('La carpeta de secciones está vacía o no se pudo leer.');

        lista.sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999));
        localStorage.setItem(CACHE_CONFIG_KEY, JSON.stringify(lista)); // respaldo
    } catch (err) {
        const cache = localStorage.getItem(CACHE_CONFIG_KEY);
        if (!cache) throw err; // sin respaldo → que el arranque muestre el error
        console.warn('Usando configuración en caché (fallo al leer la carpeta):', err.message);
        lista = JSON.parse(cache);
    }

    aplicarConfig(lista);
}

/** Construye SECCIONES / CATEGORIAS / CAT_KEYS / originalData desde la lista de secciones. */
function aplicarConfig(lista) {
    SECCIONES          = [];
    CATEGORIAS         = {};
    SECCION_POR_TOGGLE = {};
    originalData       = { categorias: {} };

    lista.forEach(item => {
        const s = {
            key:            item.key,
            titulo:         item.titulo,
            label:          item.label,
            color:          item.color,
            tint:           item.tint,
            // Visibilidad por defecto de la SECCIÓN en cada modo (default: visible).
            defaultAcceso:  item.defaultAcceso  !== false,
            defaultPublico: item.defaultPublico !== false,
            // IDs derivados de la clave (no se guardan en el JSON).
            sectionId:   `section-${item.key}`,
            listId:      `${item.key}-list`,
            checklistId: `checklist-${item.key}`,
            toggleId:    `toggle-${item.key}`,
        };
        SECCIONES.push(s);
        CATEGORIAS[s.key] = s;
        SECCION_POR_TOGGLE[s.toggleId] = s;
        originalData.categorias[s.key] = item.proveedores || [];
    });

    CAT_KEYS = Object.keys(CATEGORIAS);
}

/** ¿La sección tiene al menos un proveedor cargado? */
function tieneDatos(cat) {
    return !!(originalData && originalData.categorias[cat] && originalData.categorias[cat].length);
}

/** Muestra un mensaje claro si no se pudieron cargar las secciones. */
function mostrarErrorCarga(err) {
    console.error('Error al cargar la configuración:', err);
    const cont = document.getElementById('dashboard-container');
    if (!cont) return;

    const esArchivoLocal = location.protocol === 'file:';
    const causa = esArchivoLocal
        ? `Abriste la página directamente desde el disco (<code>file://</code>). Por seguridad,
           el navegador no permite leer archivos así. Debes servir la carpeta por HTTP:
           usa la extensión <b>Live Server</b> de VS Code, o ejecuta
           <code>npx serve</code> (o <code>python -m http.server</code>) dentro de la carpeta del proyecto,
           y abre la dirección <code>http://localhost</code> que te indique.`
        : `No se pudo leer la carpeta <code>${CARPETA_SECCIONES}</code>.
           Puede ser un problema de red o un límite temporal de la API de GitHub;
           vuelve a intentar en unos minutos.`;

    cont.innerHTML = `
        <div style="grid-column:1/-1; background:#fee2e2; border:1px solid #fecaca;
                    border-left:4px solid #ef4444; border-radius:10px; padding:1.25rem 1.5rem;
                    color:#7f1d1d; max-width:760px; margin:1rem auto; line-height:1.6;">
            <h2 style="margin:0 0 .5rem; color:#b91c1c; font-size:1rem;">No se pudieron cargar los datos</h2>
            <p style="margin:0 0 .5rem;">${causa}</p>
            <p style="margin:.5rem 0 0; font-size:.85rem; color:#991b1b;">
                Detalle técnico: ${err && err.message ? err.message : err}
            </p>
        </div>`;
}

// ─── NORMALIZACIÓN DE DATOS DEL CMS ────────────────────────────────────────────
// El CMS puede guardar rutas/URLs en formatos que rompen en GitHub Pages
// (ruta de logo con barra inicial, o URL sin https://). Las corregimos aquí.

/** Normaliza la ruta de un logo: quita la barra inicial para que sea relativa. */
function rutaLogo(logo) {
    if (!logo) return '';
    if (/^(https?:)?\/\//i.test(logo) || logo.startsWith('data:')) return logo; // URL o data-uri
    return logo.replace(/^\/+/, ''); // "/assets/img/x.png" → "assets/img/x.png"
}

/** Normaliza una URL: si no trae protocolo, le antepone https:// */
function normalizarUrl(u) {
    const url = (u || '').trim();
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || /^(mailto:|tel:)/i.test(url)) return url;
    return 'https://' + url; // "prueba.com/login" → "https://prueba.com/login"
}

// ─── MODO: acceso (login) vs público (sin login) ──────────────────────────────
const MODOS = { acceso: 'enlace_portal', publico: 'enlace_publico' };
let activeModo = localStorage.getItem('dashboardModo') || 'acceso';

/** Devuelve la URL del proveedor según el modo activo (string vacío si no tiene). */
function urlDeProveedor(proveedor, modo = activeModo) {
    return normalizarUrl(proveedor[MODOS[modo]] || '');
}

// ─── VISIBILIDAD DE SECCIONES POR MODO ─────────────────────────────────────────
/**
 * ¿Debe verse la sección `toggleId` en el modo indicado?
 * Prioridad: preferencia local del usuario > default de producción (del repo).
 */
function getModoVisible(modo, toggleId) {
    const guardado = localStorage.getItem(`modo_vis_${modo}_${toggleId}`);
    if (guardado !== null) return guardado === 'true'; // preferencia del usuario

    const seccion = SECCION_POR_TOGGLE[toggleId];
    if (!seccion) return true;
    return modo === 'publico' ? seccion.defaultPublico : seccion.defaultAcceso;
}

/** Guarda la preferencia de visibilidad de una sección para un modo concreto. */
function setModoVisible(modo, toggleId, visible) {
    localStorage.setItem(`modo_vis_${modo}_${toggleId}`, visible ? 'true' : 'false');
}

/**
 * Clave de visibilidad de un PROVEEDOR individual, separada por modo.
 * Así un mismo proveedor (ej. CheckIN) puede estar oculto en público y visible
 * con acceso. `itemId` es el id del enlace: `${cat}-item-${indice}`.
 */
function itemVisKey(itemId, modo = activeModo) {
    return `vis_${modo}_${itemId}`;
}

// ─── GENERADORES DE HTML (construyen la UI desde SECCIONES) ────────────────────
/** Construye las tarjetas de sección del dashboard dentro de #dashboard-container. */
function construirSecciones() {
    const cont = document.getElementById('dashboard-container');
    cont.innerHTML = '';

    SECCIONES.forEach(s => {
        const section = document.createElement('section');
        section.id = s.sectionId;
        section.className = 'dashboard-section';
        if (s.color) section.style.setProperty('--cat', s.color);
        if (s.tint)  section.style.setProperty('--tint', s.tint);

        const h2 = document.createElement('h2');
        h2.textContent = s.titulo;

        const wrapper = document.createElement('div');
        wrapper.className = 'data-wrapper';

        const ol = document.createElement('ol');
        ol.id = s.listId;
        ol.className = 'data-list';
        if (!tieneDatos(s.key)) {
            ol.innerHTML = '<li class="seccion-vacia">Sin proveedores aún</li>';
        }

        wrapper.appendChild(ol);
        section.appendChild(h2);
        section.appendChild(wrapper);
        cont.appendChild(section);
    });
}

/** Construye las columnas (botón + checklist) del tab Visibilidad del modal. */
function construirColumnasVisibilidad() {
    const grid = document.getElementById('config-grid');
    if (!grid) return;
    grid.innerHTML = '';

    SECCIONES.forEach(s => {
        const col = document.createElement('div');
        col.className = 'config-column';

        const btn = document.createElement('button');
        btn.id = s.toggleId;
        btn.className = 'config-item active';
        btn.textContent = `Ocultar ${s.label}`;

        const ol = document.createElement('ol');
        ol.id = s.checklistId;
        ol.className = 'config-checklist-box';
        if (!tieneDatos(s.key)) {
            ol.innerHTML = '<li><span class="editor-empty">Sin proveedores aún</span></li>';
        }

        col.appendChild(btn);
        col.appendChild(ol);
        grid.appendChild(col);
    });
}

/** Construye las pestañas de categoría del Editor de Datos (solo secciones con datos). */
function construirTabsEditor() {
    const tabs = document.getElementById('editor-cat-tabs');
    if (!tabs) return;
    tabs.innerHTML = '';

    // Solo secciones que ya tienen proveedores aparecen como pestaña del editor.
    CAT_KEYS.filter(tieneDatos).forEach((cat, i) => {
        const btn = document.createElement('button');
        btn.className = 'editor-cat-tab' + (i === 0 ? ' active' : '');
        btn.dataset.cat = cat;
        btn.textContent = CATEGORIAS[cat].label;
        tabs.appendChild(btn);
    });
}

// ─── DATOS ────────────────────────────────────────────────────────────────────
// Devuelve una copia de originalData con los overrides del usuario (editor) aplicados.
function getDataWithEdits() {
    const data = JSON.parse(JSON.stringify(originalData));
    CAT_KEYS.forEach(cat => {
        data.categorias[cat].forEach((p, i) => {
            const stored = localStorage.getItem(`edit_${cat}_${i}`);
            if (stored) {
                try { Object.assign(p, JSON.parse(stored)); } catch (e) {}
            }
        });
    });
    return data;
}

/** Renderiza todas las secciones (tarjetas + checklists) desde originalData. */
function renderTodo() {
    const data = getDataWithEdits();
    CAT_KEYS.forEach(cat => {
        loadCategoria(cat, data);
        renderChecklist(cat, data);
    });
    return data;
}

// Re-renderiza una categoría en el dashboard y en su checklist del modal.
function reRenderSection(cat) {
    const data = getDataWithEdits();
    loadCategoria(cat, data);
    renderChecklist(cat, data);
    applyFilters();
}

// ─── RENDER DE TARJETAS (genérico para cualquier categoría) ────────────────────
/**
 * Vuelca todos los proveedores de una categoría dentro de su lista del DOM.
 * @param {string} cat  - Clave de CATEGORIAS (ej. 'mayoristas').
 * @param {Object} data - Objeto con data.categorias[cat].
 */
function loadCategoria(cat, data) {
    const contenedor = document.getElementById(CATEGORIAS[cat].listId);
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const provs = data.categorias[cat];
    if (!provs.length) {
        contenedor.innerHTML = '<li class="seccion-vacia">Sin proveedores aún</li>';
        return;
    }
    provs.forEach((_, i) => crearElemento(cat, data, i, contenedor));
}

/**
 * Crea el enlace + logo de un proveedor y lo inserta en el contenedor.
 * El href depende del MODO activo; si no hay URL para ese modo, la tarjeta
 * queda marcada con data-sinurl="true" para que applyFilters la oculte.
 */
function crearElemento(cat, data, indice, contenedor) {
    const proveedor = data.categorias[cat][indice];
    const url       = urlDeProveedor(proveedor);

    const link = document.createElement('a');
    link.href = url || '#';
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.id = `${cat}-item-${indice}`;
    link.dataset.nombre    = proveedor.nombre.toLowerCase();
    link.dataset.prioridad = proveedor.prioridad || 'alta';
    link.dataset.urgente   = proveedor.urgente ? 'true' : 'false';
    link.dataset.sinurl    = url ? 'false' : 'true'; // sin enlace para el modo actual
    // Default de producción (del repo): oculto por defecto en cada modo si el campo es false.
    link.dataset.defAcceso  = proveedor.mostrar_acceso  === false ? 'oculto' : 'visible';
    link.dataset.defPublico = proveedor.mostrar_publico === false ? 'oculto' : 'visible';

    const logo = rutaLogo(proveedor.logo);
    if (logo) {
        const img = document.createElement('img');
        img.src = logo;
        img.alt = `${proveedor.nombre} Logo`;
        img.title = `Visitar el portal de ${proveedor.nombre}`;
        img.classList.add('logo-item');
        img.style.position = 'relative';
        // Si el logo no carga, mostramos el nombre en texto (evita el ícono roto).
        img.addEventListener('error', () => img.replaceWith(logoFallback(proveedor.nombre)));
        link.appendChild(img);
    } else {
        link.appendChild(logoFallback(proveedor.nombre));
    }
    contenedor.appendChild(link);
}

/** Crea un rótulo de texto para usar cuando un proveedor no tiene logo o este falla. */
function logoFallback(nombre) {
    const span = document.createElement('span');
    span.className = 'logo-fallback';
    span.textContent = nombre;
    return span;
}

// ─── VISIBILIDAD DE SECCIONES (Ocultar/Mostrar Mayoristas, Hoteles…) ───────────
/**
 * Sincroniza el texto y color de un botón "Ocultar/Mostrar X" con el estado de su sección.
 */
function sincronizarBotonSeccion(boton, etiqueta, display) {
    if (!boton) return;
    if (display === 'none') {
        boton.textContent = `Mostrar ${etiqueta}`;
        boton.classList.add('btn-off');
    } else {
        boton.textContent = `Ocultar ${etiqueta}`;
        boton.classList.remove('btn-off');
    }
}

/**
 * Aplica a TODAS las secciones la visibilidad configurada para el modo activo.
 * Se llama al cargar y cada vez que se cambia de modo.
 */
function aplicarVisibilidadPorModo() {
    SECCIONES.forEach(conf => {
        const seccion = document.getElementById(conf.sectionId);
        const boton   = document.getElementById(conf.toggleId);
        if (!seccion) return;

        const display = getModoVisible(activeModo, conf.toggleId) ? 'block' : 'none';
        seccion.style.display = display;
        sincronizarBotonSeccion(boton, conf.label, display);
    });
}

/**
 * Conecta un botón "Ocultar/Mostrar X" con su sección.
 * El clic edita la preferencia DEL MODO ACTIVO (misma fuente de verdad que la
 * matriz de configuración del modal). Reemplaza a las antiguas show* .
 */
function setupSectionToggle(conf) {
    const boton   = document.getElementById(conf.toggleId);
    const seccion = document.getElementById(conf.sectionId);
    if (!boton || !seccion) return;

    boton.addEventListener('click', () => {
        const nuevoVisible = seccion.style.display === 'none'; // si está oculta, la mostramos
        setModoVisible(activeModo, conf.toggleId, nuevoVisible);
        seccion.style.display = nuevoVisible ? 'block' : 'none';
        sincronizarBotonSeccion(boton, conf.label, seccion.style.display);
        renderMatrizModos(); // reflejar en la matriz si el modal está abierto
    });
}

// ─── MODO ACCESO / PÚBLICO ─────────────────────────────────────────────────────
function setupModoToggle() {
    const btn = document.getElementById('btnModo');
    if (!btn) return;

    const pintar = () => {
        const esPublico = activeModo === 'publico';
        btn.textContent = esPublico ? '🌐 Público' : '🔒 Con acceso';
        btn.classList.toggle('modo-publico', esPublico);
        btn.title = esPublico
            ? 'Mostrando webs públicas (sin login). Clic para cambiar a portales con acceso.'
            : 'Mostrando portales con acceso (login). Clic para cambiar a webs públicas.';
        actualizarHintVisibilidad();
    };

    pintar();

    btn.addEventListener('click', () => {
        activeModo = activeModo === 'acceso' ? 'publico' : 'acceso';
        localStorage.setItem('dashboardModo', activeModo);
        pintar();

        // Al cambiar de modo: aplicar qué secciones se ven, re-render de tarjetas
        // (URL del nuevo modo) y de los checklists (visibilidad individual por modo).
        aplicarVisibilidadPorModo();
        const data = getDataWithEdits();
        CAT_KEYS.forEach(cat => {
            loadCategoria(cat, data);
            renderChecklist(cat, data);
        });
        applyFilters();
    });
}

/** Actualiza el texto que indica qué modo se está editando en la pestaña Visibilidad. */
function actualizarHintVisibilidad() {
    const hint = document.getElementById('vis-modo-hint');
    if (!hint) return;
    hint.textContent = activeModo === 'publico'
        ? '🌐 Editando la visibilidad del modo: Público'
        : '🔒 Editando la visibilidad del modo: Con acceso';
}

// ─── MATRIZ DE CONFIGURACIÓN: qué secciones se ven en cada modo ────────────────
/**
 * Dibuja la tabla del modal donde el usuario marca, por sección y por modo,
 * si esa sección debe mostrarse. Cada checkbox escribe directo en la config.
 */
function renderMatrizModos() {
    const body = document.getElementById('modo-config-body');
    if (!body) return;
    body.innerHTML = '';

    SECCIONES.forEach(conf => {
        const tr = document.createElement('tr');

        const tdNombre = document.createElement('td');
        tdNombre.className = 'modo-config-nombre';
        tdNombre.textContent = conf.label;
        tr.appendChild(tdNombre);

        ['acceso', 'publico'].forEach(modo => {
            const td = document.createElement('td');
            td.className = 'modo-config-check';

            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = getModoVisible(modo, conf.toggleId);
            cb.addEventListener('change', () => {
                setModoVisible(modo, conf.toggleId, cb.checked);
                // Si tocamos el modo que se está viendo ahora, aplicarlo al instante.
                if (modo === activeModo) aplicarVisibilidadPorModo();
            });

            td.appendChild(cb);
            tr.appendChild(td);
        });

        body.appendChild(tr);
    });
}

// ─── BÚSQUEDA Y FILTROS ─────────────────────────────────────────────────────────
let activeSearch   = '';
let activePriority = 'todos';

/**
 * Única fuente de verdad de la visibilidad de cada tarjeta. Combina:
 *   1. Oculto manualmente (checkbox del modal → localStorage).
 *   2. Sin URL para el modo activo (data-sinurl).
 *   3. Búsqueda por nombre.
 *   4. Filtro por prioridad / urgente.
 */
function applyFilters() {
    const search = activeSearch.toLowerCase().trim();

    document.querySelectorAll('.data-list > a').forEach(link => {
        // Preferencia local del usuario > default de producción (del repo).
        const stored = localStorage.getItem(itemVisKey(link.id));
        const defOculto = (activeModo === 'publico' ? link.dataset.defPublico : link.dataset.defAcceso) === 'oculto';
        const oculto = stored !== null ? stored === 'none' : defOculto;
        const sinUrl = link.dataset.sinurl === 'true';
        if (oculto || sinUrl) { link.style.display = 'none'; return; }

        const nombre    = link.dataset.nombre    || '';
        const prioridad = link.dataset.prioridad || 'alta';
        const urgente   = link.dataset.urgente   === 'true';

        const matchSearch   = !search || nombre.includes(search);
        const matchPriority = activePriority === 'todos'
            || (activePriority === 'urgente' && urgente)
            || prioridad === activePriority;

        link.style.display = (matchSearch && matchPriority) ? 'inline-block' : 'none';
    });
}

function loadSearchAndFilters() {
    document.getElementById('search-input').addEventListener('input', e => {
        activeSearch = e.target.value;
        applyFilters();
    });

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activePriority = btn.dataset.priority;
            applyFilters();
        });
    });
}

// ─── CHECKLIST DEL MODAL (Visibilidad por proveedor) ───────────────────────────
/**
 * Crea un <li> con checkbox para un proveedor. Al cambiar, guarda el estado
 * en localStorage y deja que applyFilters aplique la visibilidad real (para
 * respetar también el modo y los filtros activos).
 */
function crearCheckbox(cat, data, indice, contenedor) {
    const proveedor  = data.categorias[cat][indice];
    // Clave por MODO ACTIVO: el mismo proveedor puede estar oculto en un modo
    // y visible en el otro.
    const itemId = `${cat}-item-${indice}`;

    const li    = document.createElement('li');
    const label = document.createElement('label');
    label.classList.add('checkbox-label');
    label.setAttribute('data-id', proveedor.id || indice);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `${cat}-checkbox-${indice}`;
    // Preferencia local del usuario > default de producción (del repo).
    const stored = localStorage.getItem(itemVisKey(itemId));
    const defOculto = (activeModo === 'publico' ? proveedor.mostrar_publico : proveedor.mostrar_acceso) === false;
    checkbox.checked = stored !== null ? stored !== 'none' : !defOculto;

    checkbox.addEventListener('change', () => {
        localStorage.setItem(itemVisKey(itemId), checkbox.checked ? 'inline-block' : 'none');
        applyFilters();
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${proveedor.nombre}`));
    li.appendChild(label);
    contenedor.appendChild(li);
}

function renderChecklist(cat, data) {
    const contenedor = document.getElementById(CATEGORIAS[cat].checklistId);
    if (!contenedor) return;
    contenedor.innerHTML = '';
    const provs = data.categorias[cat];
    if (!provs.length) {
        contenedor.innerHTML = '<li><span class="editor-empty">Sin proveedores aún</span></li>';
        return;
    }
    provs.forEach((_, i) => crearCheckbox(cat, data, i, contenedor));
}

// ─── EDITOR DE DATOS ───────────────────────────────────────────────────────────
function renderEditorForCat(cat) {
    document.querySelectorAll('.editor-cat-tab').forEach(t =>
        t.classList.toggle('active', t.dataset.cat === cat));

    const list = document.getElementById('editor-provider-list');
    list.innerHTML = '';

    const data      = getDataWithEdits();
    const providers = data.categorias[cat];

    providers.forEach((p, i) => {
        const hasEdit = !!localStorage.getItem(`edit_${cat}_${i}`);

        const card = document.createElement('div');
        card.className = 'editor-card' + (hasEdit ? ' is-edited' : '');

        card.innerHTML = `
            <img class="editor-preview" alt="${p.nombre}">
            <div class="editor-fields">
                <input class="editor-input" data-field="nombre"         placeholder="Nombre">
                <input class="editor-input" data-field="enlace_portal"  placeholder="URL con acceso (login)">
                <input class="editor-input" data-field="enlace_publico" placeholder="URL pública (sin login)">
                <input class="editor-input editor-input-logo" data-field="logo" placeholder="Ruta del logo">
            </div>
            <div class="editor-actions">
                <button class="btn-edit-save" type="button">Guardar</button>
                <button class="btn-edit-reset" type="button" title="Restablecer original">↩</button>
            </div>`;

        // Asignar valores sin riesgo de XSS
        card.querySelector('.editor-preview').src               = rutaLogo(p.logo);
        card.querySelector('[data-field="nombre"]').value         = p.nombre;
        card.querySelector('[data-field="enlace_portal"]').value  = p.enlace_portal || '';
        card.querySelector('[data-field="enlace_publico"]').value = p.enlace_publico || '';
        card.querySelector('[data-field="logo"]').value           = p.logo;
        if (!hasEdit) card.querySelector('.btn-edit-reset').hidden = true;

        // Preview en vivo al cambiar la ruta del logo
        const logoInput = card.querySelector('[data-field="logo"]');
        const preview   = card.querySelector('.editor-preview');
        logoInput.addEventListener('input', () => { preview.src = logoInput.value; });

        // Guardar
        card.querySelector('.btn-edit-save').addEventListener('click', () => {
            const edits = {};
            card.querySelectorAll('.editor-input').forEach(inp => {
                edits[inp.dataset.field] = inp.value.trim();
            });
            localStorage.setItem(`edit_${cat}_${i}`, JSON.stringify(edits));
            reRenderSection(cat);
            renderEditorForCat(cat);
        });

        // Restablecer original
        card.querySelector('.btn-edit-reset').addEventListener('click', () => {
            localStorage.removeItem(`edit_${cat}_${i}`);
            reRenderSection(cat);
            renderEditorForCat(cat);
        });

        list.appendChild(card);
    });
}

// ─── MODAL DE OPCIONES ─────────────────────────────────────────────────────────
function loadOptions() {
    const modal = document.getElementById('modalOpciones');
    const btnAbrir = document.getElementById('btnAbrir');
    const btnX = document.getElementById('btnCerrar');
    const btnFinalizar = document.getElementById('btnCerrarModal');

    const cerrarModal = () => {
        const modalContent = document.querySelector('.modal-content');
        modalContent.classList.add('modal-exit-anim');
        setTimeout(() => {
            modal.style.display = 'none';
            modalContent.classList.remove('modal-exit-anim');
        }, 200);
    };

    btnAbrir.addEventListener('click', () => { modal.style.display = 'block'; });
    btnX.addEventListener('click', cerrarModal);
    if (btnFinalizar) btnFinalizar.addEventListener('click', cerrarModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) cerrarModal();
    });
}

// ─── TABS DEL MODAL ────────────────────────────────────────────────────────────
function loadModalTabs() {
    const modalTabs    = document.querySelectorAll('.modal-tab');
    const panels       = document.querySelectorAll('.tab-panel');
    const masterToggle = document.querySelector('.section-master-toggle');
    let editorReady    = false;

    modalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            modalTabs.forEach(t => t.classList.remove('active'));
            panels.forEach(p => { p.hidden = true; });
            tab.classList.add('active');
            document.getElementById(`tab-${tab.dataset.tab}`).hidden = false;

            masterToggle.style.display = tab.dataset.tab === 'visibilidad' ? '' : 'none';

            if (tab.dataset.tab === 'editor' && !editorReady) {
                editorReady = true;
                renderEditorForCat('mayoristas');
            }

            if (tab.dataset.tab === 'modos') {
                renderMatrizModos();
            }
        });
    });

    document.querySelectorAll('.editor-cat-tab').forEach(tab => {
        tab.addEventListener('click', () => renderEditorForCat(tab.dataset.cat));
    });
}

// ─── RESTABLECER A CONFIGURACIÓN DE PRODUCCIÓN ─────────────────────────────────
/**
 * Borra las preferencias LOCALES de visibilidad (secciones y proveedores, en
 * ambos modos) y el modo guardado, de modo que la app vuelva a mostrar lo que
 * define el repositorio. No toca zoom, tamaño ni ediciones de datos.
 */
function restablecerProduccion() {
    const ok = confirm(
        '¿Restablecer la visibilidad a la configuración de producción?\n\n' +
        'Se borrarán TUS cambios locales de mostrar/ocultar (secciones y proveedores) ' +
        'y se volverá a lo definido en el repositorio. No afecta el zoom ni el tamaño.'
    );
    if (!ok) return;

    Object.keys(localStorage)
        .filter(k => k.startsWith('modo_vis_') || k.startsWith('vis_') || k === 'dashboardModo')
        .forEach(k => localStorage.removeItem(k));

    location.reload(); // recarga limpia: se reaplican los defaults del repo
}

function setupResetProduccion() {
    const btn = document.getElementById('btnResetProduccion');
    if (btn) btn.addEventListener('click', restablecerProduccion);
}

// ─── ZOOM ──────────────────────────────────────────────────────────────────────
function loadZoom() {
    const badge     = document.getElementById('zoom-badge');
    const btnOut    = document.getElementById('zoom-out');
    const btnIn     = document.getElementById('zoom-in');
    const container = document.getElementById('dashboard-container');

    let current = parseInt(localStorage.getItem('dashboardZoom') || '100');

    function applyZoom(val) {
        current = Math.min(150, Math.max(60, val));
        container.style.zoom = current / 100;
        badge.textContent = current + '%';
        localStorage.setItem('dashboardZoom', current);
    }

    applyZoom(current);

    btnOut.addEventListener('click',   () => applyZoom(current - 10));
    btnIn.addEventListener('click',    () => applyZoom(current + 10));
    badge.addEventListener('dblclick', () => applyZoom(100));
}

// ─── TAMAÑO DE TARJETAS ─────────────────────────────────────────────────────────
// Controla --card-min: el ancho mínimo de cada tarjeta del dashboard. Más ancho =
// tarjetas más grandes y menos columnas. Persiste en localStorage.
const CARD_SIZE_DEFAULT = 260;
const CARD_SIZE_MIN = 160;
const CARD_SIZE_MAX = 440;

function aplicarTamano(px) {
    const valor = Math.min(CARD_SIZE_MAX, Math.max(CARD_SIZE_MIN, px));
    document.documentElement.style.setProperty('--card-min', valor + 'px');
    localStorage.setItem('dashboardCardSize', valor);

    const slider = document.getElementById('size-slider');
    const label  = document.getElementById('size-value');
    if (slider) slider.value = valor;
    if (label)  label.textContent = valor + 'px';
    document.querySelectorAll('.size-presets button').forEach(b =>
        b.classList.toggle('active', parseInt(b.dataset.size, 10) === valor));
    return valor;
}

function loadTamano() {
    let actual = parseInt(localStorage.getItem('dashboardCardSize') || CARD_SIZE_DEFAULT, 10);
    aplicarTamano(actual);

    const slider = document.getElementById('size-slider');
    if (slider) slider.addEventListener('input', () => aplicarTamano(parseInt(slider.value, 10)));

    document.querySelectorAll('.size-presets button').forEach(btn =>
        btn.addEventListener('click', () => aplicarTamano(parseInt(btn.dataset.size, 10))));
}

// ─── ARRANQUE ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Iniciando carga de la aplicación...');

    // 1. Cargamos la configuración (secciones + proveedores) desde el archivo.
    try {
        await cargarConfig();
    } catch (err) {
        mostrarErrorCarga(err);
        return; // Sin datos no hay nada que construir.
    }

    // 2. Construimos la UI (contenedores vacíos → HTML) desde SECCIONES.
    construirSecciones();
    construirColumnasVisibilidad();
    construirTabsEditor();

    // 3. Renderizamos tarjetas y checklists dentro de esos contenedores.
    renderTodo();

    // 4. Conectamos los escuchadores de visibilidad de cada sección.
    SECCIONES.forEach(s => setupSectionToggle(s));

    // 5. Resto de controles.
    setupModoToggle();
    loadOptions();
    loadModalTabs();
    loadZoom();
    loadTamano();
    loadSearchAndFilters();
    setupResetProduccion();

    // 6. Aplicamos qué secciones se ven según el modo activo + filtros iniciales.
    aplicarVisibilidadPorModo();
    applyFilters();

    console.log('Interfaz sincronizada con LocalStorage');
});

// ─── LOGIN (deshabilitado, se conserva para uso futuro) ────────────────────────
function IniciarSesion() {
    const session = JSON.parse(localStorage.getItem('session'));
    if (!session || Date.now() > session.expires) {
        window.location.href = 'pages/login.html';
    }
}
