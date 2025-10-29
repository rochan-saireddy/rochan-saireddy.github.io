/*  script.js
    - creates 6 orb elements
    - places them randomly near the hero
    - on scroll beyond threshold, positions them along left/right walls (3 each)
    - applies 'settled' class for dynamic breathing animation
    - clicking an orb navigates to a page (change links below)
*/

// config: set your destination pages here
const PAGE_LINKS = [
  { name: 'Index', href: 'index.html' },
  { name: 'About', href: 'about.html' },
  { name: 'Interests', href: 'interests.html' },
  { name: 'Experience', href: 'experience.html' },
  { name: 'Resume', href: 'resume.html' },
  { name: 'Contact', href: 'contact.html' }
];

const orbsContainer = document.getElementById('orbs');
const viewport = { w: window.innerWidth, h: window.innerHeight };

// create orb elements
const orbs = PAGE_LINKS.map((p, i) => {
  const el = document.createElement('button');
  el.className = 'orb';
  el.setAttribute('aria-label', p.name);
  el.dataset.index = i;
  el.dataset.link = p.href;
  el.style.setProperty('--size', `${150 - i*6}px`); // slight size variation

  // label
  const lbl = document.createElement('span');
  lbl.className = 'label';
  lbl.textContent = p.name;
  el.appendChild(lbl);

  orbsContainer.appendChild(el);
  return el;
});

// helper: place orbs randomly around hero area initially
function placeInitialRandom() {
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 2;

  orbs.forEach((orb, i) => {
    // random angle and radius from center
    const angle = Math.random() * Math.PI * 2;
    const radius = (Math.min(innerWidth, innerHeight) * 0.18) + Math.random() * 40;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    orb.style.left = `${Math.max(24, Math.min(innerWidth - 24 - orb.offsetWidth, x - orb.offsetWidth/2))}px`;
    orb.style.top  = `${Math.max(24, Math.min(innerHeight - 24 - orb.offsetHeight, y - orb.offsetHeight/2))}px`;
    orb.dataset.state = 'floating';

    // random slow float motion using CSS transform jitter via requestAnimationFrame
    startFloating(orb);
  });
}

// floating motion while not settled (gentle)
function startFloating(orb) {
  let t = 0;
  const ampX = 8 + Math.random() * 8;
  const ampY = 6 + Math.random() * 10;
  const speed = 0.002 + Math.random()*0.003;

  function frame() {
    if (orb.dataset.state === 'settled') return;
    t += speed * 16;
    const dx = Math.cos(t * (0.8 + Math.random()*0.5)) * ampX;
    const dy = Math.sin(t * (0.7 + Math.random()*0.5)) * ampY;
    orb.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// settle orbs to walls: 3 left, 3 right
function settleToSides() {
  const leftX = 24; // px from left
  const rightX = innerWidth - 24; // px from left (we will subtract orb width)
  const gap = Math.min(120, innerHeight / 6);

  // compute top positions for 3 on left and 3 on right, spacing vertically
  const startY = window.scrollY + innerHeight * 0.25; // top anchor relative to viewport
  for (let i = 0; i < orbs.length; i++) {
    const orb = orbs[i];
    orb.dataset.state = 'settled';
    orb.classList.add('settled');

    const side = (i < 3) ? 'left' : 'right';
    orb.dataset.side = side;
    orb.setAttribute('data-side', side);

    const slotIndex = (i < 3) ? i : i - 3;
    const topPos = startY + slotIndex * gap;

    const orbWidth = orb.offsetWidth;
    const targetLeft = (side === 'left') ? (leftX) : (rightX - orbWidth);
    orb.style.left = `${Math.max(8, Math.min(innerWidth - orbWidth - 8, targetLeft))}px`;
    orb.style.top  = `${Math.max(window.scrollY + 20, Math.min(document.body.scrollHeight - orb.offsetHeight - 20, topPos))}px`;

    // label position adjustment:
    const lbl = orb.querySelector('.label');
    if (lbl) {
      if (side === 'left') { orb.setAttribute('data-side','left'); }
      else { orb.setAttribute('data-side','right'); }
    }
  }
}

// restore to initial (when scrolled back up)
function unsettle() {
  orbs.forEach((orb) => {
    orb.dataset.state = 'floating';
    orb.classList.remove('settled');
    orb.style.transform = '';
    // re-randomize small pos near hero
  });
  placeInitialRandom();
}

// set up click handlers (navigate)
orbs.forEach(orb => {
  orb.addEventListener('click', (e) => {
    e.preventDefault();
    const href = orb.dataset.link || 'index.html';
    // fade out effect
    document.documentElement.style.transition = 'opacity .35s ease';
    document.documentElement.style.opacity = '0';
    setTimeout(() => { window.location.href = href; }, 350);
  });
});

// scroll detection: when user scrolls past hero area, settle orbs
let didSettle = false;
function onScroll() {
  const threshold = window.innerHeight * 0.45;
  if (window.scrollY > threshold && !didSettle) {
    didSettle = true;
    settleToSides();
  } else if (window.scrollY <= threshold && didSettle) {
    didSettle = false;
    unsettle();
  }
}
window.addEventListener('scroll', onScroll);

// recalc on resize
window.addEventListener('resize', () => {
  // reposition if already settled
  if (didSettle) settleToSides();
});

// initial placement once DOM is ready
window.addEventListener('load', () => {
  placeInitialRandom();
});
