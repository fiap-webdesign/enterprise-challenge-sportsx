const hamburgerBtn = document.querySelector(".hamburguer");
const navMenu = document.querySelector("#menu-principal");

if (hamburgerBtn && navMenu) {
  const hamburgerIcon = hamburgerBtn.querySelector("i");
  const compactNavigation = window.matchMedia("(max-width: 1200px)");

  const setMenuExpanded = (expanded) => {
    navMenu.classList.toggle("active", expanded);
    hamburgerBtn.setAttribute("aria-expanded", String(expanded));
    hamburgerBtn.setAttribute("aria-label", expanded ? "Fechar menu de navegação" : "Abrir menu de navegação");
    hamburgerIcon?.classList.toggle("fa-bars", !expanded);
    hamburgerIcon?.classList.toggle("fa-xmark", expanded);
  };

  hamburgerBtn.addEventListener("click", () => {
    setMenuExpanded(!navMenu.classList.contains("active"));
  });

  navMenu.addEventListener("click", (event) => {
    if (event.target.closest("a[href]")) setMenuExpanded(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navMenu.classList.contains("active")) {
      setMenuExpanded(false);
      hamburgerBtn.focus();
    }
  });

  compactNavigation.addEventListener("change", () => {
    const focusInMenu = navMenu.contains(document.activeElement);
    setMenuExpanded(false);
    if (compactNavigation.matches && focusInMenu) hamburgerBtn.focus();
  });
}

const track = document.querySelector(".testimonial-track");
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

if (track && prevBtn && nextBtn && track.children.length > 1) {
  const slides = Array.from(track.children);
  let currentIndex = 0;

  const updateCarousel = (index) => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== currentIndex));
    });
  };

  prevBtn.addEventListener("click", () => updateCarousel(currentIndex - 1));
  nextBtn.addEventListener("click", () => updateCarousel(currentIndex + 1));
  updateCarousel(0);
}

(function () {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  const form = document.querySelector(".map-search-section .search-form");
  const input = form.querySelector(".search-input");
  const searchButton = form.querySelector(".search-button");
  const status = document.getElementById("map-search-status");

  // As coordenadas representam os locais apresentados na demonstração.
  const places = [
    {
      id: "90-graus",
      name: "90 Graus Escalada",
      coords: [-23.6025, -46.6734],
      type: "Academia de escalada",
      address: "Av. João Pedro Cardoso, 107",
      rating: 5,
      reviews: 39
    },
    {
      id: "fabrica-vila-madalena",
      name: "Fábrica Escalada (Vila Madalena)",
      coords: [-23.5577, -46.6914],
      type: "Academia de escalada",
      address: "R. da Paz dos Lírios, 1978",
      rating: 4.9,
      reviews: 144
    }
  ];

  const normalize = (text) => text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

  const leaflet = window.L;
  const map = leaflet?.map(mapEl, { scrollWheelZoom: false }).setView([-23.55052, -46.63331], 12);
  if (map) {
    leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
    }).addTo(map);
  } else {
    mapEl.hidden = true;
    document.getElementById("map-unavailable").hidden = false;
  }

  const cards = Array.from(document.querySelectorAll(".location-card"));
  const locations = places.map((place) => {
    const card = cards.find((item) => item.dataset.id === place.id);
    const searchable = normalize(`${card.querySelector(".location-name").textContent} ${card.querySelector(".location-details").textContent}`);
    const marker = map ? leaflet.marker(place.coords, { alt: place.name, title: place.name }) : null;

    if (marker) {
      marker.bindPopup(`
        <strong>${place.name}</strong><br>
        ${place.type}<br>
        <small>${place.address}</small><br>
        <small>★ ${place.rating} (${place.reviews} avaliações)</small>
      `);
      const highlightCard = () => {
        cards.forEach((item) => item.classList.toggle("is-active", item === card));
      };
      marker.on("click", highlightCard);

      const mapButton = card.querySelector(".location-map-button");
      mapButton.hidden = false;
      card.addEventListener("click", () => {
        map.setView(place.coords, 15);
        marker.openPopup();
        highlightCard();
        mapEl.scrollIntoView({ block: "nearest" });
        marker.getElement()?.focus({ preventScroll: true });
      });
    }

    return { card, marker, searchable };
  });

  function applyFilter() {
    const terms = normalize(input.value).split(" ").filter(Boolean);
    const visibleMarkers = [];
    let visibleCount = 0;

    for (const { card, marker, searchable } of locations) {
      const matches = terms.every((term) => searchable.includes(term));
      card.hidden = !matches;
      if (matches) {
        visibleCount += 1;
        if (marker) {
          marker.addTo(map);
          visibleMarkers.push(marker);
        }
      } else {
        card.classList.remove("is-active");
        marker?.remove();
      }
    }

    if (visibleMarkers.length > 0) {
      map.fitBounds(leaflet.latLngBounds(visibleMarkers.map((marker) => marker.getLatLng())).pad(0.2), { maxZoom: 15 });
    }

    if (visibleCount === 0) {
      status.textContent = "Nenhum local encontrado. Tente outro nome, bairro ou modalidade.";
    } else {
      status.textContent = visibleCount === 1 ? "1 local encontrado." : `${visibleCount} locais encontrados.`;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    applyFilter();
  });
  input.addEventListener("input", applyFilter);
  input.disabled = false;
  searchButton.disabled = false;
  applyFilter();
})();
