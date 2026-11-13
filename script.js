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

// Logoen i toppbaren bytter til Top Logo_2 ved hover – det styres i style.css (.logo-hover).
const reduserBevegelse = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ===== Header på forsiden =====
// Headeren (WORK / logo / INFO) dukker opp når forsiden er halvveis scrollet ut av bildet.
// (Halvveis, ikke helt, så den også kommer frem på høye skjermer der siden er kort.)
const intro = document.querySelector(".intro");
const header = document.querySelector(".header");
if (intro && header) {
  new IntersectionObserver(([entry]) => {
    header.classList.toggle("synlig", !entry.isIntersecting);
  }, { rootMargin: "-50% 0px 0px 0px" }).observe(intro);
}

// ===== Effekt på skog-logoen =====
// Velg effekt: "blekk" (blekk i vann), "vann" (flytende) eller "handtegnet" (skjelvende strek)
const SKOG_EFFEKT = "blekk";

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

  if (SKOG_EFFEKT === "blekk") {
    // Blekk i vann: de hvite strekene forvrenges og flyter sakte, og et mykt slør av
    // blekk siver ut rundt dem. Begge vokser og avtar i en rolig «pust» som aldri stopper.
    // Grainen ligger bare på sløret, så selve logoen forblir hel.
    // Verdiene under gjelder for en logo som er 550 px bred, og skaleres med logoen.
    const BLEKK_FART = 0.22;     // høyere = raskere strømmer
    const PUST_SEKUNDER = 9;     // hvor lang tid én «pust» tar
    const FORVRENGNING = 1;      // hvor mye strekene forvrenges (f.eks. 0.5–2)
    const SLOER_STYRKE = 1;      // hvor langt sløret (glowen) siver ut (f.eks. 0.5–1.5)
    const GRAIN_FART = 90;       // millisekunder per nytt grain-mønster (høyere = roligere)

    const f = document.querySelector("#skog-blekk");
    const stroem = f.querySelector('[result="stroem"]');
    const blekk = f.querySelector('[result="blekk"]');
    const virvel = f.querySelector('[result="virvel"]');
    const mykt = f.querySelector('[result="mykt"]');
    const sloer = f.querySelector('[result="sloer"]');
    const korn = f.querySelector('[result="korn"]');
    const logo = introEl.querySelector(".intro-logo img");
    const start = performance.now();
    let sist = 0;
    let sistKorn = 0;
    let kornSeed = 1;
    const tegn = (na) => {
      if (na - sist > 33) { // ca. 30 bilder i sekundet
        sist = na;
        const k = (logo.getBoundingClientRect().width || 550) / 550;
        const sek = (na - start) / 1000;
        const t = sek * BLEKK_FART;
        const pust = 0.5 - 0.5 * Math.cos((sek / PUST_SEKUNDER) * Math.PI * 2); // 0 → 1 → 0
        stroem.setAttribute("baseFrequency", `${((0.011 + 0.003 * Math.sin(t)) / k).toFixed(5)} ${((0.016 + 0.004 * Math.cos(t * 0.7)) / k).toFixed(5)}`);
        blekk.setAttribute("scale", ((6 + 8 * pust) * k * FORVRENGNING).toFixed(2));
        virvel.setAttribute("baseFrequency", `${((0.028 + 0.006 * Math.sin(t * 1.3 + 1)) / k).toFixed(5)} ${((0.036 + 0.008 * Math.cos(t * 0.9 + 2)) / k).toFixed(5)}`);
        mykt.setAttribute("stdDeviation", ((1.6 + 2.4 * pust) * k * SLOER_STYRKE).toFixed(2));
        sloer.setAttribute("scale", ((16 + 22 * pust) * k * SLOER_STYRKE).toFixed(2));
      }
      if (na - sistKorn > GRAIN_FART) {
        sistKorn = na;
        kornSeed = (kornSeed % 50) + 1;
        korn.setAttribute("seed", kornSeed);
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
