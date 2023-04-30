// API url
const img_url = "https://image.tmdb.org/t/p/w500/";
const api_url =
  "https://api.themoviedb.org/3/movie/top_rated?api_key=191528030c357419329af1198edbcb24&language=es-MX&page=";

// PAGINACION DE PELICULAS
let page = 1;
const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");

btnSiguiente.addEventListener("click", () => {
  if (page < 500) {
    page += 1;
    controladorPeliculas.cargar_y_mostrar();
  }
});

btnAnterior.addEventListener("click", () => {
  if (page > 1) {
    page -= 1;
    controladorPeliculas.cargar_y_mostrar();
  }
});

// CONTROLADOR DE PELICULAS
class PeliculasController {
  constructor() {
    this.listaPeliculas = [];
    this.info = [];
    this.contenedor_peliculas = document.getElementById("contenedor_peliculas");
    this.contenedor_info = document.getElementById("contenedor_info");
  }

  async cargar_y_mostrar() {
    const respuesta = await fetch(api_url + page);
    if (respuesta.status === 200) {
      const datos = await respuesta.json();
      this.listaPeliculas = datos.results;

      this.mostrarEnDOM();
      this.darEventoClickAPeliculas();
    } else {
      console.log("Error!");
    }
  }

  mostrarEnDOM() {
    // Limpiar el contenedor para recorrer todo el arreglo y que no se repitan las peliculas
    this.contenedor_peliculas.innerHTML = "";
    // Mostrar las peliculas en DOM de manera dinámica
    this.listaPeliculas.forEach((pelicula) => {
      this.contenedor_peliculas.innerHTML += `
      <div class="card text-center bg-dark mb-2 tarjeta">
        <div class="card-body">
          <img class="card-img-top" src="${img_url}${pelicula.poster_path}" alt="img">
          <div class="card-body">
            <div>
            <button
              type="button"
              id="mov-${pelicula.id}"
              class="css-button css-button-3d css-button-3d--green"
              data-bs-toggle="modal" data-bs-target="#exampleModal">
              <i class="fa-solid fa-plus"></i> Info
            </button>
            </div>
          </div>
        </div>
        </div> 
      `;
    });
  }

  darEventoClickAPeliculas() {
    this.listaPeliculas.forEach((pelicula) => {
      const btnInfo = document.getElementById(`mov-${pelicula.id}`);
      btnInfo.addEventListener("click", () => {
        this.mostrarInfoEnDOM(pelicula);
      });
    });
  }

  mostrarInfoEnDOM(pelicula) {
    // Limpiar el contenedor para recorrer todo el arreglo y que no se repitan las peliculas
    this.contenedor_info.innerHTML = "";
    this.info.push(pelicula);

    this.contenedor_info.innerHTML += `
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel"></h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <img src="${img_url}${pelicula.backdrop_path}" class="img-fluid rounded-start" alt="${pelicula.title}">
        <h3>${pelicula.title}</h3>
        <h4>Promedio de votos: ${pelicula.vote_average}</h4>
        <h5>Estreno: ${pelicula.release_date}</h5>
        <h6>Descripción:</h6>
        <p>${pelicula.overview}</p>
      </div>
      <div class="modal-footer footer-card">
        <button type="button" id="fav-${pelicula.id}" class="css-button css-button-3d--yellow">
          <i class="fa-solid fa-star"></i> Agregar a favoritas
        </button>
        <button type="button" class="btn btn-secondary close-button css-button" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
    `;
    this.darEventoClickAFav(pelicula);
  }

  darEventoClickAFav(pelicula) {
    const btnAgregarFav = document.getElementById(`fav-${pelicula.id}`);
    btnAgregarFav.addEventListener("click", () => {
      controladorFavoritas.agregar(pelicula);
      controladorFavoritas.guardarEnStorage();
      controladorFavoritas.mostrarEnDOM(tabla_favoritas);

      // TOASTIFY al agregar a favoritas
      Toastify({
        text: "Agregada a favoritas",
        duration: 1000,
        gravity: "bottom",
        position: "center",
      }).showToast();
    });
  }
}

class FavoritasController {
  constructor() {
    this.favoritas = [];
    this.tabla_favoritas = document.getElementById("tabla_favoritas");
  }

  verificarSiExisteLaPelicula(pelicula) {
    return this.favoritas.find((peli) => peli.id == pelicula.id);
  }

  agregar(pelicula) {
    let obj = this.verificarSiExisteLaPelicula(pelicula);
    if (!obj) {
      this.favoritas.push(pelicula);
    }
  }

  guardarEnStorage() {
    let favoritaJSON = JSON.stringify(this.favoritas);
    localStorage.setItem("favoritas", favoritaJSON);
  }

  verificarExistenciaEnStorage() {
    this.favoritas = JSON.parse(localStorage.getItem("favoritas")) || [];
    if (this.favoritas.length > 0) {
      this.mostrarEnDOM();
    }
  }

  limpiarTabla_Favoritas() {
    // Limpiar la tabla para recorrer todo el arreglo y que no se repitan las favoritas.
    this.tabla_favoritas.innerHTML = "";
  }

  borrar(pelicula) {
    let posicion = this.favoritas.findIndex(
      (peliFav) => pelicula.id == peliFav.id
    );

    if (!(posicion == -1)) {
      this.favoritas.splice(posicion, 1);
    }
  }

  mostrarEnDOM() {
    this.limpiarTabla_Favoritas();
    let tab = `
    <thead>
        <tr>
            <th scope="col">Poster</th>
            <th scope="col">Titulo</th>
            <th scope="col">Eliminar</th>
        </tr>
    </thead>
      <tbody>
`;
    this.favoritas.forEach((pelicula) => {
      tab += `
      <tr>
        <td><img src="${img_url}${pelicula.backdrop_path}" class="img-fluid rounded img-thumbnail" alt="movie"></td>
        <th scope="row">${pelicula.title}</th>
        <td>
          <button type="button" id="del-${pelicula.id}" class="btn btn-outline-dark">
            <i class="fa-solid fa-trash-can" style="color: #fa0000;"></i></i>
          </button>
        </td>
      </tr>
`;
      tab += `
    </tbody>
`;
      this.tabla_favoritas.innerHTML = tab;
    });

    this.favoritas.forEach((pelicula) => {
      const btnBorrarFav = document.getElementById(`del-${pelicula.id}`);

      btnBorrarFav.addEventListener("click", () => {
        //Configuración sweetalert para eliminar registros de favoritas
        Swal.fire({
          title: "Eliminar de favoritas!",
          text: "Estas seguro?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Si, Eliminar!",
        }).then((result) => {
          if (result.isConfirmed) {
            this.borrar(pelicula);
            this.guardarEnStorage();
            this.mostrarEnDOM();
            Swal.fire("Eliminada", "La película fue eliminada.", "success");
          }
        });
      });
    });
  }
}

// CONTROLLERS
const controladorPeliculas = new PeliculasController();
const controladorFavoritas = new FavoritasController();

controladorPeliculas.cargar_y_mostrar();

// Verifica favoritas en STORAGE y muestra en DOM si existen películas.
controladorFavoritas.verificarExistenciaEnStorage();
