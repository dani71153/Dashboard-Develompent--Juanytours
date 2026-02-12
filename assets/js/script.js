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
    });
}


document.addEventListener('DOMContentLoaded', JsonFetch); //Esto hace que el navegador espere a que este cargado todo para ejecutar la funcion
document.addEventListener('DOMContentLoaded',showGDS);