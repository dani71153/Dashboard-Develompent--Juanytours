/**
 * Lógica del Panel de Control (settings.js)
 */

document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('toggle-gds');

    // 1. Función para actualizar la apariencia del botón
    const actualizarInterfazBoton = (estado) => {
        if (estado === 'none') {
            btn.textContent = 'Mostrar GDS';
            btn.style.backgroundColor = '#27ae60'; // Verde para mostrar
        } else {
            btn.textContent = 'Ocultar GDS';
            btn.style.backgroundColor = '#3498db'; // Azul para ocultar
        }
    };

    // 2. Sincronización Inicial: Leer memoria al abrir la ventanita
    const estadoInicial = localStorage.getItem('toggle-gds') || 'block';
    actualizarInterfazBoton(estadoInicial);

    // 3. Evento Click: El "Mando a Distancia"
    btn.addEventListener('click', () => {
        // Consultamos el estado actual guardado
        const estadoActual = localStorage.getItem('toggle-gds') || 'block';
        
        // Calculamos el nuevo estado (Toggle)
        const nuevoEstado = (estadoActual === 'block') ? 'none' : 'block';
        
        // --- LA MAGIA ---
        // Guardamos en LocalStorage. Esto dispara el evento 'storage' en el Index.html
        localStorage.setItem('toggle-gds', nuevoEstado);
        
        // Actualizamos el botón en esta ventana
        actualizarInterfazBoton(nuevoEstado);

        // Intento de comunicación directa (opcional pero acelera el proceso)
        if (window.opener && !window.opener.closed) {
            try {
                // Si el index tiene esta función, la ejecutamos desde aquí
                window.opener.aplicarCambios(); 
            } catch (e) {
                // Ignorar si hay restricciones de dominio
            }
        }
    });
});