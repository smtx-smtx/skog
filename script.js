// Myk inntoning av elementer med klassen "reveal" når de scrolles inn i bildet
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// Oppdaterer årstallet i footeren automatisk
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ===== Logo-flimmer =====
// Når musen er over logoen, bytter den raskt mellom variasjonene under.
// Legg til/fjern filer i lista for å endre hvilke variasjoner som brukes (de ligger i assets/).
const LOGO_VARIASJONER = ["logo-1.png", "logo-2.svg", "logo-3.svg", "logo-4.svg"];
const LOGO_FART = 90; // millisekunder per bilde – lavere tall = raskere flimmer

const logoLink = document.querySelector(".logo");
const logoImg = logoLink && logoLink.querySelector("img");
const reduserBevegelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (logoImg && !reduserBevegelse) {
  const original = logoImg.getAttribute("src");
  const mappe = original.slice(0, original.lastIndexOf("/") + 1); // "assets/" eller "../assets/"
  const bilder = LOGO_VARIASJONER.map((fil) => mappe + fil);

  // Last inn alle variasjonene på forhånd, så det ikke blinker tomt
  bilder.forEach((src) => { const i = new Image(); i.src = src; });

  let timer = null;
  let steg = 0;

  const start = () => {
    if (timer) return;
    steg = 0;
    logoImg.src = bilder[0];
    timer = setInterval(() => {
      steg = (steg + 1) % bilder.length;
      logoImg.src = bilder[steg];
    }, LOGO_FART);
  };

  const stopp = () => {
    clearInterval(timer);
    timer = null;
    logoImg.src = original;
  };

  logoLink.addEventListener("mouseenter", start);
  logoLink.addEventListener("mouseleave", stopp);
  logoLink.addEventListener("focus", start);
  logoLink.addEventListener("blur", stopp);
}

// ===== Header på forsiden =====
// Headeren (Arbeid / logo / Kontakt) dukker først opp når forsiden er scrollet forbi.
const intro = document.querySelector(".intro");
const header = document.querySelector(".header");
if (intro && header) {
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("synlig", !entry.isIntersecting);
  }, { rootMargin: "-120px 0px 0px 0px" }).observe(intro);
}

// ===== Effekt på skog-logoen =====
// Velg effekt: "vann" (flytende) eller "handtegnet" (skjelvende strek)
const SKOG_EFFEKT = "handtegnet";

const introEl = document.querySelector(".intro");
if (introEl && !reduserBevegelse) {
  introEl.dataset.effekt = SKOG_EFFEKT;

  if (SKOG_EFFEKT === "handtegnet") {
    // Bytter mellom noen få «tegninger», som i en håndtegnet animasjon.
    // Styrken settes med scale="3" i #skog-wiggle i index.html (høyere = mer).
    const WIGGLE_FART = 130; // millisekunder per «tegning»
    const turbulens = document.querySelector("#skog-wiggle feTurbulence");
    const seeds = [1, 7, 13];
    let n = 0;
    setInterval(() => {
      n = (n + 1) % seeds.length;
      turbulens.setAttribute("seed", seeds[n]);
    }, WIGGLE_FART);
  }

  if (SKOG_EFFEKT === "vann") {
    // Myk bølging: mønsteret endres litt og litt hele tiden.
    // Styrken settes med scale="0.008" i #skog-vann i index.html (høyere = mer).
    const VANN_FART = 0.35; // høyere = raskere bølger
    const turbulens = document.querySelector("#skog-vann feTurbulence");
    const start = performance.now();
    let sist = 0;
    const tegn = (na) => {
      if (na - sist > 33) { // ca. 30 bilder i sekundet
        sist = na;
        const t = ((na - start) / 1000) * VANN_FART;
        const fx = 1.5 + 0.35 * Math.sin(t);
        const fy = 4 + 0.9 * Math.cos(t * 0.8);
        turbulens.setAttribute("baseFrequency", `${fx.toFixed(5)} ${fy.toFixed(5)}`);
      }
      requestAnimationFrame(tegn);
    };
    requestAnimationFrame(tegn);
  }
}

// ===== Info-overlay =====
// Teksten i Info endres her. Overlayen åpnes av alle lenker til "#info".
const INFO_HTML = `
  <div class="wrap">
    <div class="about-top">
      <button class="about-close" type="button">CLOSE</button>
    </div>
    <div class="about-body">
      <div class="about-row">
        <h2>About</h2>
        <p>My name is Elias, currently studying Design &amp; Visual Communication at the University of Bergen.</p>
      </div>

      <div class="about-row">
        <h2>Education</h2>
        <ul>
          <li>BA – Design &amp; Visual Communication</li>
          <li>University of Bergen</li>
        </ul>
      </div>

      <div class="about-row">
        <h2>Experience</h2>
        <ul>
          <li>Volunteer Designer – HULEN Bergen</li>
          <li>2026–</li>
        </ul>
      </div>

      <div class="about-row">
        <h2>Skills</h2>
        <ul>
          <li>Figma</li>
          <li>Adobe Creative Cloud</li>
          <li>Risograph printing</li>
        </ul>
      </div>

      <div class="about-row">
        <h2>Contact</h2>
        <ul>
          <li><a href="https://www.instagram.com/eliasoskog/" target="_blank" rel="noopener">Instagram</a></li>
          <li><a href="https://www.linkedin.com/in/elias-olai-skog-703422351/" target="_blank" rel="noopener">LinkedIn</a></li>
          <li><a href="mailto:eliasolaiskog@gmail.com">eliasolaiskog@gmail.com</a></li>
        </ul>
      </div>
    </div>
  </div>`;

const about = document.createElement("div");
about.className = "about";
about.id = "info";
about.setAttribute("role", "dialog");
about.setAttribute("aria-modal", "true");
about.setAttribute("aria-label", "Info");
about.innerHTML = INFO_HTML;
document.body.appendChild(about);

let forrigeFokus = null;
const aapneAbout = () => {
  forrigeFokus = document.activeElement;
  about.classList.add("open");
  document.body.classList.add("about-open");
  about.querySelector(".about-close").focus({ preventScroll: true });
};
const lukkAbout = () => {
  about.classList.remove("open");
  document.body.classList.remove("about-open");
  if (location.hash === "#info") history.replaceState(null, "", location.pathname + location.search);
  if (forrigeFokus) forrigeFokus.focus({ preventScroll: true });
};

document.querySelectorAll('a[href="#info"]').forEach((a) =>
  a.addEventListener("click", (e) => { e.preventDefault(); aapneAbout(); })
);
about.querySelector(".about-close").addEventListener("click", lukkAbout);
// Klikk på tomt område (ikke på tekst/lenker) lukker også
about.addEventListener("click", (e) => {
  if (!e.target.closest("a, button, .about-row")) lukkAbout();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && about.classList.contains("open")) lukkAbout();
});
if (location.hash === "#info") aapneAbout();
