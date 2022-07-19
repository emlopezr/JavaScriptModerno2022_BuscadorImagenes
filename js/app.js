// Selectores
const resultado = document.querySelector('#resultado');
const formulario = document.querySelector('#formulario');
const paginacion = document.querySelector('#paginacion');

// Variables
const registrosPorPagina = 60;
let totalPaginas;
let iterador;
let paginaActual = 1;

// Eventos
document.addEventListener('DOMContentLoaded', () => {
    formulario.addEventListener('submit', validarFormulario);
})

// Funciones principales
function validarFormulario(e) {
    // Prevenir isubmit predeterminado
    e.preventDefault();

    // Validar que se haya ingresado algo a la búsqueda
    const terminoBusqueda = document.querySelector('#termino').value;

    if (terminoBusqueda === '') {
        imprimirAlerta('Por favor agrega un término de búsqueda!', 3)
        return;
    }

    // Buscar las imagenes en la API de Pixabay
    buscarImagenes();
}

function buscarImagenes() {
    // Si el término tiene espacios, convertirlos en "+"
    const termino = document.querySelector('#termino').value;
    const query = termino.replace(' ', '+');

    // Enlace al API
    const key = '28727174-8563c69407d1e675fb23292bb';
    const url = `https://pixabay.com/api/?key=${key}&q=${query}&per_page=${registrosPorPagina}&page=${paginaActual}`;

    // Consulta al API
    fetch(url)
        .then(respuesta => respuesta.json())
        .then(resultado => {
            // Verificar si hay algún resultado
            const { totalHits } = resultado;

            if (totalHits === 0) {
                imprimirAlerta('No se encontraron resultados para esta búsqueda', 10)
                return;
            }

            // Calcular el número de páginas
            totalPaginas = calularPaginas(totalHits);

            // Imprimir las imagenes en pantalla
            imprimirImagenes(resultado.hits);
        })
        .catch(error => console.error(error));
}

function* crearPaginador(total) {
    // Genera¿dor que registra la cantida de elementos de acuerdo a la página
    for (let i = 1; i <= total; i++) yield i;
}

// Funciones de la UI
function imprimirImagenes(imagenes) {
    // Limpiar el HTML previo
    while (resultado.firstChild) resultado.removeChild(resultado.firstChild);

    const alerta = document.querySelector('.alerta')
    if (alerta) alerta.remove();

    // Iterar el arreglo de imagenes y construir el HTML
    imagenes.forEach(imagen => {
        // Extraer la información que usaremos
        const { likes, views, largeImageURL, webformatURL } = imagen;

        // Crear el elemento HTML de cada imagen
        const divImagen = document.createElement('DIV');
        divImagen.classList.add('w-1/2', 'md:w-1/3', 'lg:w-1/4', 'p-3', 'mb-4');
        divImagen.innerHTML = `
            <a href="${largeImageURL}" target="_blank" rel="noopener noreferrer">
                <div class="bg-white">
                    <img class="w-full" src="${webformatURL}">
                    <div class= "p-4">
                        <p class="font-bold">${views} <span class="font-light">Vistas</span></p>
                        <p class="font-bold">${likes} <span class="font-light">Me gusta</span></p>
                    </div>
                </div>
            </a>
        `

        // Imprimirlo en el DOM
        resultado.appendChild(divImagen);

    });

    // Paginador con el generador
    imprimirPaginador();
}

function imprimirPaginador() {
    iterador = crearPaginador(totalPaginas);

    // Limpiar el HTML previo
    while (paginacion.firstChild) paginacion.removeChild(paginacion.firstChild);

    // Ciclo infinito hasta que el iterador termine
    while (true) {
        const { value, done } = iterador.next();
        if (done) return;

        // Caso contrario, genera un botón por cada elemento del generador
        const boton = document.createElement('A');
        boton.classList.add('siguiente', 'bg-yellow-400', 'px-4', 'py-1', 'mr-2', 'font-bold', 'mb-4', 'rounded');
        boton.textContent = value;
        boton.href = '#';
        boton.dataset.pagina = value;

        // Funcionalidad de pasar de página
        boton.onclick = () => {
            // Cambiar la página actual y buscar de nuevo en la API
            paginaActual = value;
            buscarImagenes();
        }

        // Imprimir en el HTML
        paginacion.appendChild(boton);
    }
}

function imprimirAlerta(mensaje, tiempo) {
    // Solo imprimir una alerta a la vez -> Eliminar la pasada y agregar esta
    const alertaPrevia = document.querySelector('.alerta');

    if (alertaPrevia) {
        alertaPrevia.remove();
        return imprimirAlerta(mensaje, tiempo);
    }

    // Crear el elemento HTML e insertarlo
    const alerta = document.createElement('P');
    alerta.classList.add('bg-red-100', 'border-red-400', 'text-red-700', 'px-4', 'py-3', 'rounded', 'max-w-lg', 'mx-auto', 'mt-6', 'text-center', 'alerta')
    alerta.innerHTML = `
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">${mensaje}</span>
    `
    formulario.appendChild(alerta)

    // Quitar la alerta luego de X segundos
    setTimeout(() => {
        alerta.remove();
    }, tiempo * 1000);
}

// Helpers
const calularPaginas = total => parseInt(Math.ceil(total / registrosPorPagina));