/*  script.js
    - orbs randomly drift (bumble) around the hero section
    - on scroll, they glide to page sides
    - scroll back up => resume bumbling
    - click an orb = fade transition to linked page
*/

const PAGE_LINKS = [
  { name: 'Index', href: 'index.html' },
  { name: 'About', href: 'about.html' },
  { name: 'Interests', href: 'interests.html' },
  { name: 'Experience', href: 'experience.html' },
  { name: 'Resume', href: 'resume.html' },
  { name: 'Contact', href: 'contact.html' }
];

const orbsContainer = document.getElementById('orbs');
const orbs = PAGE_LINKS.map((p, i) => {
  const el = document.createElement('button');
  el.className = 'orb';
  el.dataset.link = p.href;

  const label = document.createElement('span');
  label.className = 'label';
  label.textContent = p.name;
  el.appendChild(label);

  orbsContainer.appendChild(el);
  return el;
});

// place orbs randomly near hero
function placeInitialRandom() {
  orbs.forEach((orb) => {
    orb.dataset.state = 'floating';
    orb.style.top = `${Math.random() * 80 + 10}%`;
    orb.style.left = `${Math.random() * 80 + 10}%`;
    startBumbling(orb);
  });
}

// random floating (bumble motion)
function startBumbling(orb) {
  let xSpeed = (Math.random() - 0.5) * 0.4; // random slow speed
  let ySpeed = (Math.random() - 0.5) * 0.4;

  function move() {
    if (orb.dataset.state === 'settled') return; // stop if settled

    let top = parseFloat(orb.style.top);
    let left = parseFloat(orb.style.left);

    // Bounce gently inside viewport boundaries
    if (top < 5 || top > 85) ySpeed *= -1;
    if (left < 5 || left > 85) xSpeed *= -1;

    orb.style.top = `${top + ySpeed}%`;
    orb.style.left = `${left + xSpeed}%`;

    requestAnimationFrame(move);
  }

  requestAnimationFrame(move);
}

// settle orbs neatly on scroll
function settleToSides() {
  const leftX = 5; // % from left
  const rightX = 85; // % from left
  const gap = 15; // vertical gap %

  orbs.forEach((orb, i) => {
    orb.dataset.state = 'settled';
    orb.classList.add('settled');

    const side = i < 3 ? 'left' : 'right';
    const x = side === 'left' ? leftX : rightX;
    const y = 25 + (i % 3) * gap;

    orb.style.transition = 'all 1.2s ease';
    orb.style.left = `${x}%`;
    orb.style.top = `${y}%`;
  });
}

// unsettle and go back to random floating
function unsettle() {
  orbs.forEach((orb) => {
    orb.dataset.state = 'floating';
    orb.classList.remove('settled');
    orb.style.transition = '';
    startBumbling(orb);
  });
}

// handle orb clicks
orbs.forEach((orb) => {
  orb.addEventListener('click', (e) => {
    e.preventDefault();
    document.documentElement.style.transition = 'opacity 0.35s ease';
    document.documentElement.style.opacity = '0';
    setTimeout(() => (window.location.href = orb.dataset.link), 350);
  });
});

// scroll watcher
let didSettle = false;
window.addEventListener('scroll', () => {
  const threshold = window.innerHeight * 0.45;
  if (window.scrollY > threshold && !didSettle) {
    didSettle = true;
    settleToSides();
  } else if (window.scrollY <= threshold && didSettle) {
    didSettle = false;
    unsettle();
  }
});

// recalc on resize if settled
window.addEventListener('resize', () => {
  if (didSettle) settleToSides();
});

window.addEventListener('load', placeInitialRandom);
