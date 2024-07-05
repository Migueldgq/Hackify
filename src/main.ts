import "./main.css";
import { init as authenticatorInit, login, logout } from "./auth";
import {
  getMyPlaylists,
  initPlayer,
  playTrack,
  togglePlay,
  getPlaylist,
  getCategories,
  getPlaylistsCategory,
  getUserTracks,
} from "./api";
import { isStillLogged } from "./tokenRefresh";

const publicSection = document.getElementById("publicSection")!;
const privateSection = document.getElementById("privateSection")!;
const profileSection = document.getElementById("profileSection")!;
const playlistsSection = document.getElementById("playlistsSection")!;
const actionsSection = document.getElementById("actionsSection")!;

const navigation = document.querySelector(".navigation") as HTMLElement;
const homebutton = document.getElementById("homebutton");
const searchbutton = document.getElementById("searchbutton");
const playlistbutton = document.getElementById("playlistbutton");
const headingtext = document.getElementById("heading-text");
const footer = document.getElementById("footer");
const toggleButton = document.getElementById("menubutton");
const dropdownMenu = document.querySelector(".dropdown-menu");
const profileasidebutton = document.getElementById("profileasidebutton");
const myfavasidebutton = document.getElementById("myfavasidebutton");
const songUl = document.getElementById("song");
const playlistsUl = document.getElementById("playlists");

async function init() {
  let profile: UserProfile | undefined;
  try {
    profile = await authenticatorInit();
    initPlayer(document.getElementById("embed-iframe")!);
  } catch (error) {
    console.error(error);
  }

  initPublicSection(profile);
  initPrivateSection(profile);
}

function initPublicSection(profile?: UserProfile): void {
  document.getElementById("loginButton")!.addEventListener("click", login);
  renderPublicSection(!!profile);
}
function renderPublicSection(render: boolean): void {
  publicSection.style.display = render ? "none" : "block";
}

function initPrivateSection(profile?: UserProfile): void {
  renderPrivateSection(!!profile);
  initMenuSection();
  initProfileSection(profile);
  initPlaylistSection(profile);
  initActionsSection();
}
// function renderPrivateSection(isLogged: boolean) {
//   privateSection.style.display = isLogged ? "block" : "none";

// }

function renderPrivateSection(isLogged: boolean, profile?: UserProfile): void {
  if (
    !homebutton ||
    !searchbutton ||
    !playlistbutton ||
    !headingtext ||
    !footer ||
    !profileasidebutton ||
    !myfavasidebutton ||
    !songUl ||
    !playlistsUl
  ) {
    return;
  }

  // Mostrar u ocultar secciones según el estado de inicio de sesión
  privateSection.style.display = isLogged ? "block" : "none";
  footer.style.display = isLogged ? "flex" : "none";

  // Manejar el botón Home
  homebutton.addEventListener("click", () => {
    closeAside();
    clearDOM();
    renderActionsSection(isStillLogged());
    headingtext.innerHTML = `<h1>Home</h1>`;
  });

  // Manejar el botón Search
  searchbutton.addEventListener("click", () => {
    closeAside();
    clearDOM();
    renderSearchSection(isStillLogged());
    headingtext.innerHTML = `<h1>Search</h1>`;
  });

  // Manejar el botón Playlists
  playlistbutton.addEventListener("click", () => {
    closeAside();
    clearDOM(); // Limpiar sección de canciones

    songUl.style.display = "none";
    playlistsUl.style.display = "none";

    playlistsUl.style.display = "flex";

    headingtext.innerHTML = `<h1>Mis playlists</h1>`;

    getMyPlaylists(localStorage.getItem("accessToken")!).then(
      (playlists: PlaylistRequest): void => {
        renderPlaylistsSection(!!profile);
        renderPlaylists(playlists);
      }
    );
  });

  // Manejar el botón Profile
  profileasidebutton.addEventListener("click", () => {
    closeAside();
    clearDOM();
    renderProfileSection(!!profile);
    if (profile) {
      renderProfileData(profile);
    }
    headingtext.innerHTML = `<h1>Profile</h1>`;
  });

  // Manejar el botón Mis favoritos
  myfavasidebutton.addEventListener("click", async () => {
    closeAside();
    clearDOM();
    headingtext.innerHTML = `<h1>Mis favoritos</h1>`;
    await displayUserTracks();
  });
}

function initMenuSection(): void {
  document.getElementById("profileButton")!.addEventListener("click", () => {
    renderProfileSection(profileSection.style.display !== "none");
  });
  document.getElementById("playlistsButton")!.addEventListener("click", () => {
    renderPlaylistsSection(playlistsSection.style.display !== "none");
  });
  document.getElementById("logoutButton")!.addEventListener("click", logout);
}

function initProfileSection(profile?: UserProfile | undefined) {
  renderProfileSection(!!profile);
  if (profile) {
    renderProfileData(profile);
  }
}
function renderProfileSection(render: boolean) {
  profileSection.style.display = render ? "none" : "block";
}
function renderProfileData(profile: UserProfile) {
  document.getElementById("displayName")!.innerText = profile.display_name;
  document.getElementById("id")!.innerText = profile.id;
  document.getElementById("email")!.innerText = profile.email;
  document.getElementById("uri")!.innerText = profile.uri;
  document
    .getElementById("uri")!
    .setAttribute("href", profile.external_urls.spotify);
  document.getElementById("url")!.innerText = profile.href;
  document.getElementById("url")!.setAttribute("href", profile.href);
}

function initPlaylistSection(profile?: UserProfile): void {
  if (profile) {
    getMyPlaylists(localStorage.getItem("accessToken")!).then(
      (playlists: PlaylistRequest): void => {
        renderPlaylistsSection(!!profile);
        renderPlaylists(playlists);
      }
    );
  }
}
function renderPlaylistsSection(render: boolean) {
  playlistsSection.style.display = render ? "none" : "block";
}
function renderPlaylists(playlists: PlaylistRequest) {
  const playlistSection = document.getElementById("playlists");
  if (!playlistSection) {
    throw new Error("Element not found");
  }
  playlistSection.innerHTML = playlists.items
    .map((playlist) => {
      return `<li data-id="${playlist.id}" class="playlist-card">
      
      <img class="playlist-image" src="${playlist.images[0].url}">
      <div class="playlist-info">
      <p>${playlist.name}</p>
      <p>Playlist • ${playlist.owner.display_name}</p>
      </div>
      </li>`;
    })
    .join("");

  Array.from(playlistSection.getElementsByTagName("li")).forEach((li) => {
    li.addEventListener("click", async function () {
      const token = localStorage.getItem("accessToken");
      const playlistId = this.getAttribute("data-id");
      const playlistName = this.querySelector(".playlist-info p")?.textContent;

      console.log("Click en playlist", playlistId);

      if (playlistId && token) {
        try {
          // Obtener los detalles de la playlist y luego los tracks
          const playlistDetails = await getPlaylist(token, playlistId);
          // Ocultar la sección de playlists

          if (!playlistsUl) return;
          playlistsUl.style.display = "none";

          console.log(playlistDetails);

          // Renderizar los tracks de la playlist con el nombre de la playlist
          renderPlaylistsTracks(playlistDetails, playlistName || "Playlist");
        } catch (error) {
          console.error("Error fetching playlist details:", error);
        }
      } else {
        console.error("Token or Playlist ID is null");
      }
    });
  });
}

function renderPlaylistsTracks(songs: PlaylistSong, playlistName: string) {
  const songSection = document.getElementById("song");
  if (!songSection) {
    throw new Error("Element not found");
  }

  // Update the heading text with the playlist name
  const headingtext = document.getElementById("heading-text");
  if (headingtext) {
    headingtext.innerHTML = `<h1>${playlistName}</h1>`;
  }
  if (!songUl) return;
  songUl.style.display = "flex";

  songSection.innerHTML = songs
    .map((song) => {
      return `<li class="song-card">
      <img class="song-image" src="${song.track.album.images[0].url}">
      <div class="song-info">
      <p class="song-name"s>${song.track.name}</p>
      <p class="song-artist">${song.track.artists[0].name}</p>
      </div>
      </li>`;
    })
    .join("");
}

async function displayCategories() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No access token found");
    return;
  }
  try {
    const categories = await getCategories(token);
    const categoryList = document.getElementById("categoryList");
    if (!categoryList) {
      throw new Error("Category list element not found");
    }

    const categoryItems = categories.categories.items.map((category) => {
      const li = document.createElement("li");
      li.textContent = category.name;
      li.setAttribute("data-id", category.id);
      li.addEventListener("click", async function () {
        const token = localStorage.getItem("accessToken");
        const categoryId = this.getAttribute("data-id");
        if (categoryId && token) {
          console.log(token);
          await getPlaylistsCategory(token, categoryId);
        } else {
          console.error("Token or Playlist ID is null");
        }
      });
      return li;
    });

    categoryList.append(...categoryItems);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const privateSection = document.getElementById("privateSection");
  if (privateSection) {
    displayCategories();
  }
});

function initActionsSection(): void {
  document.getElementById("changeButton")!.addEventListener("click", () => {
    playTrack("spotify:track:11dFghVXANMlKmJXsNCbNl"); // solo a modo de ejemplo
  });
  document.getElementById("playButton")!.addEventListener("click", () => {
    togglePlay();
  });

  renderActionsSection(false);
}
function renderActionsSection(render: boolean) {
  actionsSection.style.display = render ? "block" : "none";
}

function renderSearchSection(render: boolean) {
  navigation.style.display = render ? "block" : "none";
}

function clearDOM() {
  navigation.style.display = "none";
  actionsSection.style.display = "none";
  profileSection.style.display = "none";
  playlistsSection.style.display = "none";
}

function closeAside() {
  if (dropdownMenu?.classList.contains("active")) {
    dropdownMenu.classList.remove("active");
  }

  if (!dropdownMenu?.classList.contains("active")) {
    document
      .querySelectorAll(".toggle-aside-option")
      .forEach((el) => el.classList.remove("active"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const asideOptions = document.querySelectorAll(".aside-options");

  if (toggleButton && dropdownMenu) {
    toggleButton.addEventListener("click", () => {
      dropdownMenu.classList.toggle("active");
      // Al cerrar el aside, ocultar todos los rectángulos amarillos
      if (!dropdownMenu.classList.contains("active")) {
        document
          .querySelectorAll(".toggle-aside-option")
          .forEach((el) => el.classList.remove("active"));
      }
    });
  }

  asideOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Primero, desactivar cualquier .toggle-aside-option activo
      document
        .querySelectorAll(".toggle-aside-option")
        .forEach((el) => el.classList.remove("active"));

      // Activar el toggle-aside-option correspondiente
      const toggleAsideOption = option.previousElementSibling as HTMLElement;
      if (toggleAsideOption) {
        toggleAsideOption.classList.toggle("active");
        console.log("Seleccionado");
      }
    });
  });
});

async function displayUserTracks() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.error("No token found");
    return;
  }

  try {
    const userTracks = await getUserTracks(token);

    // Crear el contenedor ul donde se mostrarán las canciones
    const tracksList = document.createElement("ul");
    tracksList.id = "tracksList"; // Asignamos un id para referencia futura

    userTracks.forEach((track: any) => {
      const trackItem = document.createElement("li");
      const trackName = document.createElement("span");
      trackName.textContent = track.track.name; // Asignar el nombre de la canción
      const trackImage = document.createElement("img");
      trackImage.src = track.track.album.images[0].url; // Asignar la imagen de la canción
      trackImage.alt = track.track.name;
      trackImage.style.width = "50px";

      trackItem.appendChild(trackImage);
      trackItem.appendChild(trackName);
      tracksList.appendChild(trackItem);
    });
    const headingText = document.getElementById("heading-text");
    if (headingText) {
      headingText.appendChild(tracksList);
    }
  } catch (error) {
    console.error("Error fetching user tracks:", error);
  }
}
document.addEventListener("DOMContentLoaded", init);
