/**
 * Recupera los datos de configuración y proveedores desde un archivo JSON local.
 * * Esta función realiza una petición asíncrona mediante fetch, convierte la 
 * respuesta a un objeto JavaScript y dispara la renderización inicial del 
 * dashboard llamando a loadGDS.
 * * @async
 * @returns {Promise<Object>} Devuelve una promesa que resuelve con los datos del JSON.
 */
// Datos originales del JSON (nunca se mutan)
let originalData = null;

// Devuelve una copia del JSON con los overrides del usuario aplicados
function getDataWithEdits() {
    const data = JSON.parse(JSON.stringify(originalData));
    ['mayoristas', 'hoteles', 'aviones'].forEach(cat => {
        data.categorias[cat].forEach((p, i) => {
            const stored = localStorage.getItem(`edit_${cat}_${i}`);
            if (stored) {
                try { Object.assign(p, JSON.parse(stored)); } catch(e) {}
            }
        });
    });
    return data;
}

// Re-renderiza una categoría en el dashboard y en el checklist del modal
function reRenderSection(cat) {
    const data = getDataWithEdits();
    if (cat === 'mayoristas') { loadMayoristas(data); renderChecklistMayoristas(data); }
    if (cat === 'hoteles')    { loadHoteles(data);    renderChecklistHoteles(data);    }
    if (cat === 'aviones')    { loadAviones(data);    renderChecklistAviones(data);    }
    applyFilters();
}

async function JsonFetch() {
    // IniciarSesion(); // Login deshabilitado temporalmente

    const [resMayoristas, resHoteles, resAviones] = await Promise.all([
        fetch('data/mayoristas.json'),
        fetch('data/hoteles.json'),
        fetch('data/aviones.json'),
    ]);

    const [dataMayoristas, dataHoteles, dataAviones] = await Promise.all([
        resMayoristas.json(),
        resHoteles.json(),
        resAviones.json(),
    ]);

    // Reconstruimos la misma estructura que espera el resto del código
    originalData = {
        categorias: {
            mayoristas: dataMayoristas.proveedores,
            hoteles:    dataHoteles.proveedores,
            aviones:    dataAviones.proveedores,
        }
    };

    const data = getDataWithEdits();
    loadMayoristas(data);
    loadHoteles(data);
    loadAviones(data);
    renderChecklistMayoristas(data);
    renderChecklistHoteles(data);
    renderChecklistAviones(data);
    return data;
}

function loadOptions() {
    const modal = document.getElementById('modalOpciones');
    const btnAbrir = document.getElementById('btnAbrir');
    const btnX = document.getElementById('btnCerrar'); // La "X"
    const btnFinalizar = document.getElementById('btnCerrarModal'); // El botón del footer

    // Función reutilizable para cerrar
    const cerrarModal = () => {
        const modalContent = document.querySelector('.modal-content');
        
        // 1. Añadimos la clase de animación al contenido
        modalContent.classList.add('modal-exit-anim');

        // 2. Esperamos a que termine la animación (200ms) para ocultar el modal completo
        setTimeout(() => {
            modal.style.display = 'none';
            
            // 3. Limpiamos la clase para que la próxima vez que abra esté normal
            modalContent.classList.remove('modal-exit-anim');
        }, 200); 
    };
    
    // Abrir
    btnAbrir.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Cerrar con la X
    btnX.addEventListener('click', cerrarModal);

    // Cerrar con el botón Finalizar
    if (btnFinalizar) {
        btnFinalizar.addEventListener('click', cerrarModal);
    }

    // Cerrar al hacer clic fuera de la caja blanca
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            cerrarModal();
        }
    });

    
}

/**
 * Carga los enlaces e imágenes de los proveedores de GDS en el DOM.
 * Obtiene el contenedor, limpia el contenido previo y genera dinámicamente 
 * los elementos visuales accediendo a los datos del JSON.
 * @param {Object} data - El objeto JSON con la información de la empresa y proveedores.
 */
function loadMayoristas(data) {
    const contenedor = document.getElementById('mayoristas-list');
    contenedor.innerHTML = '';
    data.categorias.mayoristas.forEach((_, i) => crearElementoMayoristas(data, i, contenedor));
}

function loadHoteles(data) {
    const contenedorHoteles = document.getElementById('hoteles-list');
    contenedorHoteles.innerHTML = '';
    data.categorias.hoteles.forEach((_, i) => crearElementoHoteles(data, i, contenedorHoteles));
}

function loadAviones(data) {
    const contenedorAviones = document.getElementById('aviones-list');
    contenedorAviones.innerHTML = '';
    data.categorias.aviones.forEach((_, i) => crearElementoAviones(data, i, contenedorAviones));
}

/**
 * Crea un elemento de enlace con imagen para un proveedor y lo añade al DOM.
 * @param {Object} data - El objeto JSON completo con la información.
 * @param {number} indice - La posición del proveedor en el array.
 * @param {HTMLElement} contenedor - El elemento del DOM donde se insertará el link.
 * Esto se desarrollo para hacer una version intuitiva para mi que estoy aprendiendo para agregar 
 * los demas modulos, de manera que yo lo entienda y pueda replicar de manera sencilla
 * En esta función se crea un enlace con una imagen para cada proveedor de GDS, utilizando la información del JSON. Se asignan atributos como href, alt y title para mejorar la accesibilidad y usabilidad. Luego, se inserta el enlace en el contenedor del DOM correspondiente.
 */
function crearElementoMayoristas(data,indice, contenedor) {

    const proveedor =data.categorias.mayoristas[indice]; // Obtiene el proveedor específico del arreglo de proveedores usando el índice proporcionado

    const linkgmayoristas = document.createElement('a');
    linkgmayoristas.href = proveedor.enlace_portal; // Asigna el enlace al atributo href del elemento
    linkgmayoristas.textContent = ``; // Asigna el texto al elemento usando el valor de la informacion obtenida
    linkgmayoristas.target = '_blank'; // Hace que el enlace se abra en una nueva pestaña
    linkgmayoristas.rel = 'noopener noreferrer'; // Mejora la seguridad al abrir el enlace en una nueva pestaña
    linkgmayoristas.id = `mayoristas-item-${indice}`;
    linkgmayoristas.dataset.nombre    = proveedor.nombre.toLowerCase();
    linkgmayoristas.dataset.prioridad = proveedor.prioridad || 'alta';
    linkgmayoristas.dataset.urgente   = proveedor.urgente ? 'true' : 'false';

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardado = localStorage.getItem(`mayoristas-item-${indice}`);
    
    if (estadoGuardado) {
        // Si existe una nota guardada, la aplicamos de inmediato
        linkgmayoristas.style.display = estadoGuardado;
    }
    // ------------------------------
    const imgtestmayoristas = document.createElement('img');
    imgtestmayoristas.src = proveedor.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgtestmayoristas.alt = `${proveedor.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgtestmayoristas.title = `Visitar el portal de ${proveedor.nombre}`; // Asigna el título al atributo title del elemento
    // AÑADIMOS LA CLASE:
    imgtestmayoristas.classList.add('logo-mayorista');
    imgtestmayoristas.style.position = 'relative'; // Centra la imagen dentro del enlace  
    // Metemos la imagen DENTRO del enlace
    linkgmayoristas.appendChild(imgtestmayoristas);
    contenedor.appendChild(linkgmayoristas);
    
}


function showMayoristas() {
    const mayoristasList = document.getElementById('toggle-mayoristas'); 
    // Seguimos la misma logica anterior, buscamos el elemento que queremos trabajar por Identificador, en este caso
    // Seleccionamos los botones y la caja que quiero hacer invisible.
    const sectionContainer = document.getElementById('section-mayoristas');

    // setupVisualSync('toggle-gds', section-gds, gdsList);

    mayoristasList.addEventListener('click', function() {

        // MEJORA: Añadimos || sectionContainer.style.display === '' 
        // porque a veces el JS no lee el CSS externo en el primer clic.
        if (sectionContainer.style.display === 'none' || sectionContainer.style.display === '') { 
            sectionContainer.style.display = 'block';
            mayoristasList.textContent = 'Ocultar Mayoristas'; // Definimos el cambio de texto
        } else {
            sectionContainer.style.display = 'none';
            mayoristasList.textContent = 'Mostrar Mayoristas'; 
        }

        // --- BLOQUE DE PERSISTENCIA (GUARDAR) ---
        // Guardamos el estado bajo el ID del elemento
        // localStorage.setItem('toggle-gds', sectionContainer.style.display);
        gestionarPersistencia('toggle-mayoristas',sectionContainer,'toggle-mayoristas','mayoristas');
    }); // <--- AQUÍ CERRAMOS EL LISTENER DEL CLICK


} // <--- CIERRE FINAL DE LA FUNCIÓN showGDS



//Hoteles

function crearElementoHoteles(data,indice, contenedor) {

    const proveedorHoteles =data.categorias.hoteles[indice]; // Obtiene el proveedor específico del arreglo de proveedores usando el índice proporcionado

    const linkHoteles= document.createElement('a');
    linkHoteles.href = proveedorHoteles.enlace_portal; // Asigna el enlace al atributo href del elemento
    linkHoteles.textContent = ``; // Asigna el texto al elemento usando el valor de la informacion obtenida
    linkHoteles.target = '_blank'; // Hace que el enlace se abra en una nueva pestaña
    linkHoteles.rel = 'noopener noreferrer'; // Mejora la seguridad al abrir el enlace en una nueva pestaña
    linkHoteles.id = `hoteles-item-${indice}`;
    linkHoteles.dataset.nombre    = proveedorHoteles.nombre.toLowerCase();
    linkHoteles.dataset.prioridad = proveedorHoteles.prioridad || 'alta';
    linkHoteles.dataset.urgente   = proveedorHoteles.urgente ? 'true' : 'false';

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardadoHoteles = localStorage.getItem(`hoteles-item-${indice}`);
    
    if (estadoGuardadoHoteles) {
        // Si existe una nota guardada, la aplicamos de inmediato
        linkHoteles.style.display = estadoGuardadoHoteles;
    }
    // ------------------------------
    const imgHoteles = document.createElement('img');
    imgHoteles.src = proveedorHoteles.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgHoteles.alt = `${proveedorHoteles.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgHoteles.title = `Visitar el portal de ${proveedorHoteles.nombre}`; // Asigna el título al atributo title del elemento
    imgHoteles.classList.add('logo-hoteles');
    imgHoteles.style.position = 'relative'; // Centra la imagen dentro del enlace  
    // Metemos la imagen DENTRO del enlace
    linkHoteles.appendChild(imgHoteles);
    contenedor.appendChild(linkHoteles);
    
}


function showHoteles() {
    const hotelsList = document.getElementById('toggle-hotels'); 
    //Seguimos la misma logica anterior, buscamos el elemento que queremos trabajar por Identificador, en este caso
    //Seleccionamos los botones y la caja que quiero hacer invisible.
    const sectionContainerHoteles = document.getElementById('section-hoteles');

    //Agregamos un trigger de eventos, y dentro del trigger de eventos definimos la accion que se va a tomar
    // cuando se haga ese evento, es basicamente lo que se espera que suceda al presionar el elemento que llame del DOM
    //Al clickearlo se dispara la funcion y ejecuta las condicionales que ameritan.
    hotelsList.addEventListener('click', function(){

        if(sectionContainerHoteles.style.display == 'none'){ //Si, no se muestra, se pasa al else.
            sectionContainerHoteles.style.display='block';
            hotelsList.textContent = 'Ocultar Hoteles'; //Definimos el cambio de texto
        }else {

            sectionContainerHoteles.style.display='none';
            hotelsList.textContent = 'Mostrar Hoteles'; 
        }
        
        // --- BLOQUE DE PERSISTENCIA (GUARDAR) ---
        // Guardamos el estado bajo el ID del elemento
        // localStorage.setItem('toggle-gds', sectionContainer.style.display);
        gestionarPersistencia('toggle-hotels',sectionContainerHoteles,'toggle-hotels','Hoteles');
    });
}

///Final de HOTELES




function crearElementoAviones(data,indice, contenedor) {

    const proveedorAviones =data.categorias.aviones[indice]; // Obtiene el proveedor específico del arreglo de proveedores usando el índice proporcionado

    const linkAviones= document.createElement('a');
    linkAviones.href = proveedorAviones.enlace_portal; // Asigna el enlace al atributo href del elemento
    linkAviones.textContent = ``; // Asigna el texto al elemento usando el valor de la informacion obtenida
    linkAviones.target = '_blank'; // Hace que el enlace se abra en una nueva pestaña
    linkAviones.rel = 'noopener noreferrer'; // Mejora la seguridad al abrir el enlace en una nueva pestaña
    linkAviones.id = `aviones-item-${indice}`;
    linkAviones.dataset.nombre    = proveedorAviones.nombre.toLowerCase();
    linkAviones.dataset.prioridad = proveedorAviones.prioridad || 'alta';
    linkAviones.dataset.urgente   = proveedorAviones.urgente ? 'true' : 'false';

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardadAviones = localStorage.getItem(`aviones-item-${indice}`);
    
    if (estadoGuardadAviones) {
        linkAviones.style.display = estadoGuardadAviones;
    }
    // ------------------------------
    const imgAviones = document.createElement('img');
    imgAviones.src = proveedorAviones.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgAviones.alt = `${proveedorAviones.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgAviones.title = `Visitar el portal de ${proveedorAviones.nombre}`; // Asigna el título al atributo title del elemento
        // AÑADIMOS LA CLASE:
    imgAviones.classList.add('logo-aviones');
    // Metemos la imagen DENTRO del enlace
    linkAviones.appendChild(imgAviones);
    contenedor.appendChild(linkAviones);
    
}

function showFlights() {
    const flightList = document.getElementById('toggle-airplanes'); 
    //Seguimos la misma logica anterior, buscamos el elemento que queremos trabajar por Identificador, en este caso
    //Seleccionamos los botones y la caja que quiero hacer invisible.
    const sectionContainerFlights = document.getElementById('section-aviones');

    //Agregamos un trigger de eventos, y dentro del trigger de eventos definimos la accion que se va a tomar
    // cuando se haga ese evento, es basicamente lo que se espera que suceda al presionar el elemento que llame del DOM
    //Al clickearlo se dispara la funcion y ejecuta las condicionales que ameritan.
    flightList.addEventListener('click', function(){

        if(sectionContainerFlights.style.display == 'none'){ //Si, no se muestra, se pasa al else.
            sectionContainerFlights.style.display='block';
            flightList.textContent = 'Ocultar Aviones'; //Definimos el cambio de texto
        }else {

            sectionContainerFlights.style.display='none';
            flightList.textContent = 'Mostrar Aviones'; 
        }

                // --- BLOQUE DE PERSISTENCIA (GUARDAR) ---
        // Guardamos el estado bajo el ID del elemento
        // localStorage.setItem('toggle-gds', sectionContainer.style.display);
        gestionarPersistencia('toggle-airplanes',sectionContainerFlights,'toggle-airplanes','Aviones');
    });
}

function showCarRentals() {
    const carlist = document.getElementById('toggle-cars'); 
    //Seguimos la misma logica anterior, buscamos el elemento que queremos trabajar por Identificador, en este caso
    //Seleccionamos los botones y la caja que quiero hacer invisible.
    const sectionContainerCar = document.getElementById('section-renta');

    //Agregamos un trigger de eventos, y dentro del trigger de eventos definimos la accion que se va a tomar
    // cuando se haga ese evento, es basicamente lo que se espera que suceda al presionar el elemento que llame del DOM
    //Al clickearlo se dispara la funcion y ejecuta las condicionales que ameritan.
    carlist.addEventListener('click', function(){
        if (sectionContainerCar.style.display === 'none') {
            sectionContainerCar.style.display = 'block';
        } else {
            sectionContainerCar.style.display = 'none';
        }
        gestionarPersistencia('toggle-cars', sectionContainerCar, 'toggle-cars', 'RentCar');
    });
}

/**
 * Oculta o muestra un proveedor específico de la lista.
 * @param {number} indice - El número del proveedor que queremos afectar.
 */
function toggleProveedorEspecifico(indice) {
    const idElemento = `mayoristas-item-${indice}`;
    const elemento = document.getElementById(idElemento);
    
    if (elemento) {
        let nuevoEstado;
        if (elemento.style.display === 'none') {
            nuevoEstado = 'inline-block';
        } else {
            nuevoEstado = 'none';
        }

        // Aplicamos el cambio visual
        elemento.style.display = nuevoEstado;

        // --- BLOQUE DE PERSISTENCIA (GUARDAR) ---
        // Guardamos el estado bajo el ID del elemento
        localStorage.setItem(idElemento, nuevoEstado);
    }
}

/**
 * Lee las preferencias guardadas y sincroniza el estado de la interfaz al iniciar.
 * * Este método utiliza un sistema de "Clave-Valor" (Key-Value):
 * 1. Key (Clave): Es el nombre de la "carpeta" en LocalStorage donde reside el dato.
 * 2. ID: Es la dirección del elemento en el HTML para aplicar los cambios visuales.
 * * @example
 * // Si la Key 'toggle-hotels' tiene el Valor 'none', 
 * // la función ocultará la sección y cambiará el texto del botón.
 */
async function cargarEstadoPersistente() {
    const configuraciones = [
        { btn: 'toggle-mayoristas', section: 'section-mayoristas', key: 'toggle-mayoristas', label: 'Mayoristas' },
        { btn: 'toggle-hotels', section: 'section-hoteles', key: 'toggle-hotels', label: 'Hoteles' },
        { btn: 'toggle-airplanes', section: 'section-aviones', key: 'toggle-airplanes', label: 'Aviones' },
        { btn: 'toggle-cars', section: 'section-renta', key: 'toggle-cars', label: 'RentCar' }
    ];

    configuraciones.forEach(conf => {
        const btn = document.getElementById(conf.btn);
        const section = document.getElementById(conf.section);
        const savedStatus = localStorage.getItem(conf.key);

        if (savedStatus && section && btn) {
            section.style.display = savedStatus;
            
            // Sincronizar texto y COLOR
            if (savedStatus === 'none') {
                btn.textContent = `Mostrar ${conf.label}`;
                btn.classList.add('btn-off');
            } else {
                btn.textContent = `Ocultar ${conf.label}`;
                btn.classList.remove('btn-off');
            }
        }
    });
}
/**
 * Persiste la visibilidad de un módulo en la memoria del navegador y actualiza la interfaz.
 * * @param {string} key - El nombre de la "carpeta" o etiqueta en LocalStorage. 
 * Es independiente del ID del botón; sirve para recuperar el dato 
 * aunque el diseño del HTML cambie en el futuro.
 * @param {HTMLElement} seccion - El contenedor físico (div, section) que queremos ocultar o mostrar.
 * @param {HTMLElement} boton - El elemento del DOM (botón/enlace) que recibe el clic.
 * @param {string} etiqueta - El nombre legible (ej: "Vuelos") para construir el texto dinámico.
 */
function guardarPreferenciaUI(key, seccion, boton, etiqueta) {
    // 1. Capturamos el estado actual de la sección
    const estadoActual = seccion.style.display;
    
    // 2. Guardamos en el "archivador" (LocalStorage) bajo la etiqueta 'key'
    localStorage.setItem(key, estadoActual);
    
    // 3. Actualizamos el texto del botón basándonos en el estado recién guardado
    boton.textContent = (estadoActual === 'none') ? `Mostrar ${etiqueta}` : `Ocultar ${etiqueta}`;
}

function gestionarPersistencia(key, seccion, botonId, etiqueta) {
    const boton = document.getElementById(botonId); // Obtenemos el botón
    const estadoActual = seccion.style.display;
    
    // 1. Guardamos en la "memoria" del navegador
    localStorage.setItem(key, estadoActual);
    
    // 2. Lógica de colores y texto
    if (estadoActual === 'none') {
        boton.textContent = `Mostrar ${etiqueta}`;
        boton.classList.add('btn-off'); // <-- Ponemos el color "Apagado"
    } else {
        boton.textContent = `Ocultar ${etiqueta}`;
        boton.classList.remove('btn-off'); // <-- Volvemos al color original (Celeste)
    }
}

/**
 * Sincroniza un elemento y un botón basado en una clave de LocalStorage
 * @param {string} key - Clave de LocalStorage (ej: 'toggle-gds')
 * @param {HTMLElement} container - El contenedor que se oculta/muestra
 * @param {HTMLElement} trigger - El botón que cambia de texto
 */
function setupVisualSync(key, container, trigger) {
    const updateUI = (value) => {
        // Si el valor es nulo (no existe en storage), no hacemos nada
        if (value === null) return;
        
        container.style.display = value;
        // Usamos una lógica similar a tus labels
        const etiqueta = key.replace('toggle-', '').toUpperCase(); 
        trigger.textContent = (value === 'none') ? `Mostrar ${etiqueta}` : `Ocultar ${etiqueta}`;
    };

    // Escucha cambios de OTRAS pestañas (Ajustes -> Index)
    window.addEventListener('storage', (event) => {
        if (event.key === key) {
            updateUI(event.newValue);
        }
    });

    // Carga el estado inicial nada más arrancar
    updateUI(localStorage.getItem(key));
}

// ─── BÚSQUEDA Y FILTROS ───────────────────────────────────────────────────────

let activeSearch   = '';
let activePriority = 'todos';

function applyFilters() {
    const search = activeSearch.toLowerCase().trim();

    document.querySelectorAll('#mayoristas-list a, #hoteles-list a, #aviones-list a').forEach(link => {
        const manuallyHidden = localStorage.getItem(link.id) === 'none';
        if (manuallyHidden) { link.style.display = 'none'; return; }

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

// ─── EDITOR DE DATOS ─────────────────────────────────────────────────────────

function renderEditorForCat(cat) {
    // Actualizar pestañas de categoría
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
                <input class="editor-input" data-field="enlace_portal"  placeholder="URL del portal">
                <input class="editor-input editor-input-logo" data-field="logo" placeholder="Ruta del logo">
            </div>
            <div class="editor-actions">
                <button class="btn-edit-save" type="button">Guardar</button>
                <button class="btn-edit-reset" type="button" title="Restablecer original">↩</button>
            </div>`;

        // Asignar valores sin riesgo de XSS
        card.querySelector('.editor-preview').src                        = p.logo;
        card.querySelector('[data-field="nombre"]').value                = p.nombre;
        card.querySelector('[data-field="enlace_portal"]').value         = p.enlace_portal;
        card.querySelector('[data-field="logo"]').value                  = p.logo;
        if (!hasEdit) card.querySelector('.btn-edit-reset').hidden       = true;

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

// ─── TABS DEL MODAL ──────────────────────────────────────────────────────────

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

            // Mostrar/ocultar botón master según la pestaña activa
            masterToggle.style.display = tab.dataset.tab === 'visibilidad' ? '' : 'none';

            // Inicializar editor la primera vez que se abre
            if (tab.dataset.tab === 'editor' && !editorReady) {
                editorReady = true;
                renderEditorForCat('mayoristas');
            }
        });
    });

    // Sub-tabs de categoría dentro del editor
    document.querySelectorAll('.editor-cat-tab').forEach(tab => {
        tab.addEventListener('click', () => renderEditorForCat(tab.dataset.cat));
    });
}

// Unificamos todo en un solo escuchador para controlar el ORDEN
function loadZoom() {
    const badge     = document.getElementById('zoom-badge');
    const btnOut    = document.getElementById('zoom-out');
    const btnIn     = document.getElementById('zoom-in');
    const container = document.getElementById('dashboard-container');

    let current = parseInt(localStorage.getItem('dashboardZoom') || '100');

    function applyZoom(val) {
        current = Math.min(150, Math.max(60, val));
        container.style.zoom = current / 100;  // solo el contenido, nunca el modal
        badge.textContent = current + '%';
        localStorage.setItem('dashboardZoom', current);
    }

    applyZoom(current);

    btnOut.addEventListener('click',   () => applyZoom(current - 10));
    btnIn.addEventListener('click',    () => applyZoom(current + 10));
    badge.addEventListener('dblclick', () => applyZoom(100));
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Iniciando carga de la aplicación...");

    // 1. ESPERAMOS a que el JSON cargue y renderice (loadGDS)
    // Sin el 'await', el código sigue de largo antes de que existan los GDS
    await JsonFetch(); 

    // 2. Inicializamos los escuchadores de clics (Event Listeners)
    showMayoristas();
    showHoteles();
    showFlights();
    showCarRentals();
    loadOptions();
    loadModalTabs();
    loadZoom();
    loadSearchAndFilters();
    // 3. AHORA SÍ, cargamos la memoria.
    // Como pusimos 'await' arriba, aquí los elementos ya existen en el HTML.
    cargarEstadoPersistente();
    
    console.log("Interfaz sincronizada con LocalStorage");
});


// document.getElementById('checkbox-label-mayorista').addEventListener('click', function() {
//     toggleProveedorEspecifico(0); // Llama a la función para el índice 0
// }); 

//Se le agrego una variable, para que al entrar, si en la memoria del navegador, no hay una sesion activa, te redirija
//login.
function IniciarSesion(){

const session = JSON.parse(localStorage.getItem("session"));

if (!session || Date.now() > session.expires) {
  window.location.href = "pages/login.html";
}

}

//Creamos una funcion, que cree dentro de los 

/**
 * Genera dinámicamente un elemento <li> que contiene un checkbox
 * asociado a un proveedor mayorista y lo inserta en el DOM.
 *
 * Funcionalidad:
 * - Construye estructura: <li> → <label> → <input type="checkbox"> + texto.
 * - Persiste el estado del checkbox en localStorage.
 * - Restaura el estado guardado al recargar la página.
 *
 * ⚠ Nota arquitectónica:
 * Actualmente usa el índice como identificador único.
 * En producción debe utilizarse proveedor.id (ej: ID de Firestore).
 *
 * @function crearCheckboxMayorista
 *
 * @param {Object} data
 * Objeto JSON que contiene las categorías y mayoristas.
 *
 * @param {number} indice
 * Posición del proveedor dentro de data.categorias.mayoristas.
 *
 * @param {HTMLElement} contenedor
 * Elemento del DOM donde se insertará el <li>.
 *
 * @returns {void}
 */
function crearCheckboxMayorista(data, indice, contenedor) {

    const proveedor = data.categorias.mayoristas[indice];

    const li = document.createElement('li');

    const label = document.createElement('label');
    label.classList.add('checkbox-label-mayorista');
    label.setAttribute('data-id', proveedor.id || indice);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `mayoristas-checkbox-${indice}`;

    // Usamos el estado del elemento como única fuente de verdad
    const elementKey = `mayoristas-item-${indice}`;
    const estadoGuardado = localStorage.getItem(elementKey);
    // checked si el elemento está visible (o no tiene estado guardado aún)
    checkbox.checked = estadoGuardado !== 'none';

    checkbox.addEventListener('change', function () {
        const elemento = document.getElementById(`mayoristas-item-${indice}`);
        if (elemento) {
            const nuevoEstado = checkbox.checked ? 'inline-block' : 'none';
            elemento.style.display = nuevoEstado;
            localStorage.setItem(elementKey, nuevoEstado);
        }
    });

    const texto = document.createTextNode(` ${proveedor.nombre}`);

    label.appendChild(checkbox);
    label.appendChild(texto);
    li.appendChild(label);
    contenedor.appendChild(li);
}

function renderChecklistMayoristas(data) {
    const contenedor = document.getElementById('checklist-mayoristas');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    data.categorias.mayoristas.forEach((_, indice) => {
        crearCheckboxMayorista(data, indice, contenedor);
    });
}

function crearCheckboxHotel(data, indice, contenedor) {
    const proveedor = data.categorias.hoteles[indice];
    const elementKey = `hoteles-item-${indice}`;

    const li       = document.createElement('li');
    const label    = document.createElement('label');
    label.classList.add('checkbox-label');

    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.checked   = localStorage.getItem(elementKey) !== 'none';

    checkbox.addEventListener('change', function () {
        const elemento = document.getElementById(`hoteles-item-${indice}`);
        if (elemento) {
            const nuevoEstado = checkbox.checked ? 'inline-block' : 'none';
            elemento.style.display = nuevoEstado;
            localStorage.setItem(elementKey, nuevoEstado);
        }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${proveedor.nombre}`));
    li.appendChild(label);
    contenedor.appendChild(li);
}

function renderChecklistHoteles(data) {
    const contenedor = document.getElementById('checklist-hoteles');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    data.categorias.hoteles.forEach((_, indice) => {
        crearCheckboxHotel(data, indice, contenedor);
    });
}

function crearCheckboxAvion(data, indice, contenedor) {
    const proveedor = data.categorias.aviones[indice];
    const elementKey = `aviones-item-${indice}`;

    const li       = document.createElement('li');
    const label    = document.createElement('label');
    label.classList.add('checkbox-label');

    const checkbox     = document.createElement('input');
    checkbox.type      = 'checkbox';
    checkbox.checked   = localStorage.getItem(elementKey) !== 'none';

    checkbox.addEventListener('change', function () {
        const elemento = document.getElementById(`aviones-item-${indice}`);
        if (elemento) {
            const nuevoEstado = checkbox.checked ? 'inline-block' : 'none';
            elemento.style.display = nuevoEstado;
            localStorage.setItem(elementKey, nuevoEstado);
        }
    });

    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(` ${proveedor.nombre}`));
    li.appendChild(label);
    contenedor.appendChild(li);
}

function renderChecklistAviones(data) {
    const contenedor = document.getElementById('checklist-aviones');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    data.categorias.aviones.forEach((_, indice) => {
        crearCheckboxAvion(data, indice, contenedor);
    });
}