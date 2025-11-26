//Este script se ejecuta en el navegador del cliente

document.addEventListener('DOMContentLoaded', () => {
    //Verificamos en qué página estamos para ejecutar la función correspondiente
    const path = window.location.pathname;

    if (path.endsWith('/') || path.endsWith('/index.html')) {
        loadClaims();
        setupEventListeners(); // Configuramos los listeners para los botones
    }

    if (path.endsWith('/formulario.html')) {
        handleFormSubmit();
    }
});

//Función para manejar el envío del formulario
function handleFormSubmit() {
    const form = document.getElementById('claimForm');
    if (!form) return; //Salimos si no encontramos el formulario

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); //Evitamos que el formulario se envíe de la forma tradicional

          const formData = new FormData(form);
        const data = {};
        // Convertimos FormData a un objeto plano para poder guardarlo en sessionStorage
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Guardamos los datos del formulario en sessionStorage para que loader.html los pueda usar
        sessionStorage.setItem('claimFormData', JSON.stringify(data));
        
        // Redirigimos inmediatamente a la página del loader
        window.location.href = '/loader.html';
    });
}


//Función para cargar y mostrar las reclamaciones en la tabla
async function loadClaims() {
    try {
        // 1. Hacemos una petición GET a nuestra API para obtener los datos
        const response = await fetch('/api/claims');
        if (!response.ok) {
            throw new Error('No se pudo cargar la información de las reclamaciones.');
        }
        
        const claims = await response.json();
        const tableBody = document.getElementById('claims-table-body');
        
        // 2. Limpiamos el contenido actual de la tabla (el mensaje "Cargando...")
        tableBody.innerHTML = '';

        // 3. Si no hay reclamaciones, mostramos un mensaje
        if (claims.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5">No hay reclamaciones registradas.</td></tr>';
            return;
        }

        // 4. Recorremos cada reclamación y creamos una fila en la tabla
        claims.forEach(claim => {
            const row = document.createElement('tr');
            
            // Si la reclamación está completada, añadimos una clase a la fila
            if (!claim.active) {
                row.classList.add('completed');
            }

            // Formateamos la fecha para que sea más legible
            const formattedDate = new Date(claim.breachDate).toLocaleDateString('es-ES');

            // Creamos los botones de acción o el texto de estado
            const actionsCell = claim.active
                ? `
                    <button class="action complete" data-id="${claim.id}">Completar</button>
                    <button class="action delete" data-id="${claim.id}">Eliminar</button>
                  `
                : '<span>Completada</span>';

            row.innerHTML = `
                <td>${claim.email || 'No proporcionado'}</td>
                <td>${claim.relationship}</td>
                <td>${claim.behaviourType}</td>
                <td>${formattedDate}</td>
                <td>${actionsCell}</td>
            `;
            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error('Error:', error);
        const tableBody = document.getElementById('claims-table-body');
        tableBody.innerHTML = '<tr><td colspan="5">Error al cargar las reclamaciones. Inténtalo de nuevo más tarde.</td></tr>';
    }
}

// Función para configurar los listeners de los botones de acción
function setupEventListeners() {
    const tableBody = document.getElementById('claims-table-body');

    tableBody.addEventListener('click', async (event) => {
        const target = event.target;
        const claimId = target.dataset.id;

        if (!claimId) return; // No se hizo clic en un botón con ID

        // Si se hace clic en el botón de completar
        if (target.classList.contains('complete')) {
            if (confirm('¿Estás seguro de que quieres marcar esta reclamación como completada?')) {
                const response = await fetch(`/api/claims/${claimId}/complete`, { method: 'PUT' });
                if (response.ok) {
                    loadClaims(); // Recargamos la lista para ver el cambio
                } else {
                    alert('Error al completar la reclamación.');
                }
            }
        }

        // Si se hace clic en el botón de eliminar
        if (target.classList.contains('delete')) {
            if (confirm('¿Estás seguro de que quieres eliminar esta reclamación? Esta acción no se puede deshacer.')) {
                const response = await fetch(`/api/claims/${claimId}`, { method: 'DELETE' });
                if (response.ok) {
                    loadClaims(); // Recargamos la lista para ver el cambio
                } else {
                    alert('Error al eliminar la reclamación.');
                }
            }
        }
    });
}
