import "./main.css";
import { init as authenticatorInit, login, logout } from "./auth";
import { getMyPlaylists, initPlayer, playTrack, togglePlay } from "./api";
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

function renderPrivateSection(isLogged: boolean) {

  if (!homebutton || !searchbutton || !playlistbutton || !headingtext || !footer ) return;

  privateSection.style.display = isLogged ? "block" : "none";
  footer.style.display = isLogged ? "flex" : "none";

  homebutton.addEventListener("click", () => {

    clearDOM();
    
    renderActionsSection(isStillLogged());
    
    headingtext.innerHTML = `
    <h1>Home</h1>
    `;

  });

  searchbutton.addEventListener("click", () => {
    
    clearDOM();

    renderSearchSection(isStillLogged());
    
    headingtext.innerHTML = `
    <h1>Search</h1>
    `;
  });

  playlistbutton.addEventListener("click", () => {
    
    clearDOM();

    renderPlaylistSection(isStillLogged());
    
    headingtext.innerHTML = `
    <h1>Mis playlists</h1>
    `;
  })
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
  const playlist = document.getElementById("playlists");
  if (!playlist) {
    throw new Error("Element not found");
  }
  playlist.innerHTML = playlists.items
    .map((playlist) => {
      return `<li>${playlist.name}</li>`;
    })
    .join("");
}

function initActionsSection() {
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

function renderPlaylistSection (render: boolean) {
  playlistsSection.style.display = render ? "block" : "none";
}

function clearDOM() {
  navigation.style.display = "none";
  actionsSection.style.display = "none";
  playlistsSection.style.display = "none";
  profileSection.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("menubutton");
  const asideOptions = document.querySelectorAll(".aside-options");
  const dropdownMenu = document.querySelector(".dropdown-menu");

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

document.addEventListener("DOMContentLoaded", init);
