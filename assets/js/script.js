/**
 * Recupera los datos de configuración y proveedores desde un archivo JSON local.
 * * Esta función realiza una petición asíncrona mediante fetch, convierte la 
 * respuesta a un objeto JavaScript y dispara la renderización inicial del 
 * dashboard llamando a loadGDS.
 * * @async
 * @returns {Promise<Object>} Devuelve una promesa que resuelve con los datos del JSON.
 */
async function JsonFetch() {
    const respuesta = await fetch('data/info.json');
    const data = await respuesta.json();
    
    // console.log(data);
    // console.log(data.nombre);
    // console.log(data.version);

    loadMayoristas(data);
    loadHoteles(data);
    loadAviones(data);
    return data;
};

function loadOptions(){

// Buscamos el botón por su ID
const boton = document.getElementById('btnAbrir');

// Le asignamos la función cuando alguien haga clic
boton.addEventListener('click', function() {
    window.open("pages/settings.html", "_blank", "width=600,height=400");
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
    crearElementoMayoristas(data, 0, contenedor);
    crearElementoMayoristas(data, 1, contenedor);
    crearElementoMayoristas(data, 2, contenedor);
    crearElementoMayoristas(data, 3, contenedor);
    crearElementoMayoristas(data, 4, contenedor);
    crearElementoMayoristas(data, 5, contenedor);
    crearElementoMayoristas(data, 6, contenedor);
    crearElementoMayoristas(data, 7, contenedor);
}

function loadHoteles(data) {
    const contenedorHoteles = document.getElementById('hoteles-list');
    contenedorHoteles.innerHTML = ''; 
    crearElementoHoteles(data, 0, contenedorHoteles);
    crearElementoHoteles(data, 1, contenedorHoteles);
    // crearElementoHoteles(data, 2, contenedorHoteles);
    // crearElementoHoteles(data, 3, contenedorHoteles);
    // crearElementoHoteles(data, 4, contenedorHoteles);
    // crearElementoHoteles(data, 5, contenedorHoteles);
    // crearElementoHoteles(data, 6, contenedorHoteles);
    // crearElementoHoteles(data, 7, contenedorHoteles);
    // crearElementoHoteles(data, 8, contenedorHoteles);
}

function loadAviones(data) {
    const contenedorAviones = document.getElementById('aviones-list');
    contenedorAviones.innerHTML = ''; 
    crearElementoAviones(data, 0, contenedorAviones);
    crearElementoAviones(data, 1, contenedorAviones);
    crearElementoAviones(data, 2, contenedorAviones);
    crearElementoAviones(data, 3, contenedorAviones);
    crearElementoAviones(data, 4, contenedorAviones);
    crearElementoAviones(data, 5, contenedorAviones);
    crearElementoAviones(data, 6, contenedorAviones);
    crearElementoAviones(data, 7, contenedorAviones);
    crearElementoAviones(data, 8, contenedorAviones);
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

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardadoHoteles = localStorage.getItem(`hoteles-item-${indice}`);
    
    if (estadoGuardadoHoteles) {c
        // Si existe una nota guardada, la aplicamos de inmediato
        linkHoteles.style.display = estadoGuardadoHoteles;
    }
    // ------------------------------
    const imgHoteles = document.createElement('img');
    imgHoteles.src = proveedorHoteles.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgHoteles.alt = `${proveedorHoteles.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgHoteles.title = `Visitar el portal de ${proveedorHoteles.nombre}`; // Asigna el título al atributo title del elemento
    imgHoteles.style.width = '45px '; // Ajusta el tamaño de la imagen
    imgHoteles.style.height = 'auto';
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
    linkAviones.id = `hoteles-item-${indice}`;

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardadoHoteles = localStorage.getItem(`hoteles-item-${indice}`);
    
    if (estadoGuardadoHoteles) {c
        // Si existe una nota guardada, la aplicamos de inmediato
        linkAviones.style.display = estadoGuardadoHoteles;
    }
    // ------------------------------
    const imgAviones = document.createElement('img');
    imgAviones.src = proveedorAviones.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgAviones.alt = `${proveedorAviones.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgAviones.title = `Visitar el portal de ${proveedorAviones.nombre}`; // Asigna el título al atributo title del elemento
    imgAviones.style.width = '45px '; // Ajusta el tamaño de la imagen
    imgAviones.style.height = 'auto';
    imgAviones.style.position = 'relative'; // Centra la imagen dentro del enlace  
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

        if(sectionContainerCar.style.display == 'none'){ //Si, no se muestra, se pasa al else.
            sectionContainerCar.style.display='block';
            carlist.textContent = 'Ocultar RentCar'; //Definimos el cambio de texto
        }else {

            sectionContainerCar.style.display='none';
            carlist.textContent = 'Mostrar RentCar'; 
        }
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

    // Definimos un mapa de las secciones que queremos persistir
    // ID del botón : { idSeccion: 'id', textoMostrar: '...', textoOcultar: '...', storageKey: '...' }
    const configuraciones = [
        { btn: 'toggle-mayoristas', section: 'section-mayoristas', key: 'toggle-mayoristas', label: 'Mayoristas' },
        { btn: 'toggle-hotels', section: 'section-hoteles', key: 'toggle-hotels', label: 'Hoteles' },
        { btn: 'toggle-airplanes', section: 'section-aviones', key: 'toggle-airplanes', label: 'Aviones' },
        { btn: 'toggle-cars', section: 'section-renta', key: 'toggle-cars', label: 'RentCar' }
    ];

    configuraciones.forEach(conf => { //no se usar un for en cada uno, pero me imagino que esta leyendo 
        const btn = document.getElementById(conf.btn);
        const section = document.getElementById(conf.section);
        const savedStatus = localStorage.getItem(conf.key);

        if (savedStatus && section && btn) {
            section.style.display = savedStatus;
            btn.textContent = (savedStatus === 'none') ? `Mostrar ${conf.label}` : `Ocultar ${conf.label}`;
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

function gestionarPersistencia(key, seccion, boton, etiqueta) {
    const estadoActual = seccion.style.display;
    
    // 1. Guardamos en la "memoria" del navegador
    localStorage.setItem(key, estadoActual);
    
    // 2. Actualizamos el texto del botón según el estado
    boton.textContent = (estadoActual === 'none') ? `Mostrar ${etiqueta}` : `Ocultar ${etiqueta}`;
    
    console.log(`Estado de ${etiqueta} guardado: ${estadoActual}`);
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

// Unificamos todo en un solo escuchador para controlar el ORDEN
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
    // 3. AHORA SÍ, cargamos la memoria. 
    // Como pusimos 'await' arriba, aquí los elementos ya existen en el HTML.
    cargarEstadoPersistente();
    
    console.log("Interfaz sincronizada con LocalStorage");
});


document.getElementById('ocultar-primero').addEventListener('click', function() {
    toggleProveedorEspecifico(0); // Llama a la función para el índice 0
}); 

/**
 * PUENTE DE COMUNICACIÓN
 * Expone la función de carga para que 'settings.js' pueda activarla.
 * Al usar windows.funcion() estoy declarando una funcion global en el contexto de la ventana
 */
window.aplicarCambios = function() {
    console.log("Recibida orden desde la ventana de opciones...");
    cargarEstadoPersistente(); 
};

/**
 * ESCUCHADOR AUTOMÁTICO
 * Si la ventana de opciones cambia el LocalStorage, esto actualiza el Index
 * aunque no uses window.opener.
 */
window.addEventListener('storage', (event) => {
    // Si el cambio en la memoria es sobre nuestros botones
    if (event.key.startsWith('toggle-')) {
        cargarEstadoPersistente();
    }
});