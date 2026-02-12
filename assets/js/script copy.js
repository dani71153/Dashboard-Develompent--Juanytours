async function JsonFetch() {
    const respuesta = await fetch('data/info.json');
    const data = await respuesta.json();
    console.log(data);
    console.log(data.nombre);
    console.log(data.version);

    
    const contenedor = document.getElementById('json-data'); //Obtiene el elemento desde el DOM
    const InicioCarga = document.createElement('p'); //Crea un nuevo elemento parrafo para mostrar el mensaje de carga
    InicioCarga.textContent = 'Cargando datos...';  //Asigna el texto al elemento
    const nombreElemento = document.createElement('p'); // Creamos un nuevo elemento parrafo para mostrar el nombre
    nombreElemento.textContent = `Nombre: ${data.nombre}`;//Asignamos el texto al elemento usando el valor de la informacion obtenida
    contenedor.appendChild(InicioCarga);            
    contenedor.appendChild(nombreElemento);//Agregamos el nuevo elemento al contenedor en el DOM

    //Se repite el ciclo abajo.
    const versionElemento = document.createElement('p');
    versionElemento.textContent = `Versión: ${data.version}`;
    contenedor.appendChild(versionElemento);    

   return data;
};

//Llamamos la funcion para que se ejecute.

document.addEventListener('DOMContentLoaded', JsonFetch); //Esto hace que el navegador espere a que este cargado todo para ejecutar la funcion
