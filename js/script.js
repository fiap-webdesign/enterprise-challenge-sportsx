const hamburgerBtn = document.querySelector(".hamburguer");
const hamburgerIcon = document.querySelector(".hamburguer i");
const navMenu = document.querySelector(".main-nav ul");

hamburgerBtn.addEventListener("click", () => {
    navMenu.classList.toggle("active");

    // Alterna o ícone para X
    if (hamburgerIcon.classList.contains("fa-bars")) {
        hamburgerIcon.classList.remove("fa-bars");
        hamburgerIcon.classList.add("fa-xmark");
    } else {
        hamburgerIcon.classList.remove("fa-xmark");
        hamburgerIcon.classList.add("fa-bars");
    }
});

const track = document.querySelector(".testimonial-track");
const slides = Array.from(track.children);
const prevBtn = document.querySelector(".carousel-btn.prev");
const nextBtn = document.querySelector(".carousel-btn.next");

let currentIndex = 0;

function updateCarousel() {
  const slideWidth = slides[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
}

nextBtn.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % slides.length;
  updateCarousel();
});

prevBtn.addEventListener("click", () => {
  currentIndex = (currentIndex - 1 + slides.length) % slides.length;
  updateCarousel();
});