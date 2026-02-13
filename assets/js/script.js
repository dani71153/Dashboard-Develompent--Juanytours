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

    loadGDS(data); 

    return data;
};


/**
 * Carga los enlaces e imágenes de los proveedores de GDS en el DOM.
 * Obtiene el contenedor, limpia el contenido previo y genera dinámicamente 
 * los elementos visuales accediendo a los datos del JSON.
 * @param {Object} data - El objeto JSON con la información de la empresa y proveedores.
 */
function loadGDS(data) {
    const contenedor = document.getElementById('gds-list');
    contenedor.innerHTML = ''; 
    crearElementoGDS(data, 0, contenedor);
    crearElementoGDS(data, 1, contenedor);
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
function crearElementoGDS(data,indice, contenedor) {

    const proveedor =data.proveedores[indice]; // Obtiene el proveedor específico del arreglo de proveedores usando el índice proporcionado

    const linkgds = document.createElement('a');
    linkgds.href = proveedor.enlace_portal; // Asigna el enlace al atributo href del elemento
    linkgds.textContent = ``; // Asigna el texto al elemento usando el valor de la informacion obtenida
    linkgds.target = '_blank'; // Hace que el enlace se abra en una nueva pestaña
    linkgds.rel = 'noopener noreferrer'; // Mejora la seguridad al abrir el enlace en una nueva pestaña
    linkgds.id = `gds-item-${indice}`;

    // --- LÓGICA DE PERSISTENCIA ---
    // Leemos la "libreta" para ver si ya había un estado guardado para este ID
    const estadoGuardado = localStorage.getItem(`gds-item-${indice}`);
    
    if (estadoGuardado) {
        // Si existe una nota guardada, la aplicamos de inmediato
        linkgds.style.display = estadoGuardado;
    }
    // ------------------------------
    const imgtestgds = document.createElement('img');
    imgtestgds.src = proveedor.logo; // Asigna la ruta de la imagen al atributo src del elemento
    imgtestgds.alt = `${proveedor.nombre} Logo`; // Asigna el texto alternativo al atributo alt del elemento
    imgtestgds.title = `Visitar el portal de ${proveedor.nombre}`; // Asigna el título al atributo title del elemento
    imgtestgds.style.width = '45px '; // Ajusta el tamaño de la imagen
    imgtestgds.style.height = 'auto';
    imgtestgds.style.position = 'relative'; // Centra la imagen dentro del enlace  
    // Metemos la imagen DENTRO del enlace
    linkgds.appendChild(imgtestgds);
    contenedor.appendChild(linkgds);
    
}


function showGDS() {
    const gdsList = document.getElementById('toggle-gds'); 
    //Seguimos la misma logica anterior, buscamos el elemento que queremos trabajar por Identificador, en este caso
    //Seleccionamos los botones y la caja que quiero hacer invisible.
    const sectionContainer = document.getElementById('section-gds');


    // --- BLOQUE DE RECUPERACIÓN (LEER AL CARGAR) ---
    // Apenas se ejecuta la función, preguntamos: "¿Había algo guardado?"
    const savedStatus = localStorage.getItem('toggle-gds');

    if (savedStatus) {
        // Aplicamos el estilo guardado (block o none)
        sectionContainer.style.display = savedStatus;
        // Actualizamos el texto del botón para que coincida
        gdsList.textContent = (savedStatus === 'none') ? 'Mostrar GDS' : 'Ocultar GDS';
    }
    
    //Agregamos un trigger de eventos, y dentro del trigger de eventos definimos la accion que se va a tomar
    // cuando se haga ese evento, es basicamente lo que se espera que suceda al presionar el elemento que llame del DOM
    //Al clickearlo se dispara la funcion y ejecuta las condicionales que ameritan.
    gdsList.addEventListener('click', function(){

        if(sectionContainer.style.display == 'none'){ //Si, no se muestra, se pasa al else.
            sectionContainer.style.display='block';
            gdsList.textContent = 'Ocultar GDS'; //Definimos el cambio de texto
        }else {

            sectionContainer.style.display='none';
            gdsList.textContent = 'Mostrar GDS'; 
        }
        // --- BLOQUE DE PERSISTENCIA (GUARDAR) ---
        // Guardamos el estado bajo el ID del elemento
        localStorage.setItem('toggle-gds', sectionContainer.style.display);
    });

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
    });
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
    const idElemento = `gds-item-${indice}`;
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


document.addEventListener('DOMContentLoaded', JsonFetch); //Esto hace que el navegador espere a que este cargado todo para ejecutar la funcion
document.addEventListener('DOMContentLoaded',showGDS);
document.addEventListener('DOMContentLoaded',showHoteles);
document.addEventListener('DOMContentLoaded',showFlights);
document.addEventListener('DOMContentLoaded',showCarRentals);
document.getElementById('ocultar-primero').addEventListener('click', function() {
    toggleProveedorEspecifico(0); // Llama a la función para el índice 0
}); 
// Buscamos el botón por su ID
const boton = document.getElementById('btnAbrir');

// Le asignamos la función cuando alguien haga clic
boton.addEventListener('click', function() {
    window.open("https://www.google.com", "_blank", "width=600,height=400");
});