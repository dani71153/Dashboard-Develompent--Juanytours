async function JsonFetch() {
    const respuesta = await fetch('data/info.json');
    const data = await respuesta.json();
    console.log(data);
    console.log(data.nombre);
    console.log(data.version);


    loadGDS(data); // Llamamos a la función para cargar los datos en el DOM 

   return data;
};


function loadGDS(data) {

    const contenedor = document.getElementById('gds-list'); //Obtiene el elemento desde el DOM
    contenedor.innerHTML = ''; // Limpia el contenido anterior del contenedor

    const carga = document.createElement('li');
    carga.textContent = `Cargando datos de ${data.proveedores[0].nombre}`;
    contenedor.appendChild(carga);

    const nombre = document.createElement('li');
    nombre.textContent = `Servicio: ${data.proveedores[0].servicio}`;
    contenedor.appendChild(nombre);

    const version = document.createElement('li');
    version.textContent = `Versión: ${data.dashboard_info.version}`;
    contenedor.appendChild(version);

}
//Llamamos la funcion para que se ejecute.

document.addEventListener('DOMContentLoaded', JsonFetch); //Esto hace que el navegador espere a que este cargado todo para ejecutar la funcion
