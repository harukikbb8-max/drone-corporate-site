/* ============================================
   Drone Corporate Site - Main JavaScript
   Enhanced with advanced animations and effects
   ============================================ */

/* --------------------------------------------------
   Utility: Detect reduced motion preference
   -------------------------------------------------- */
const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* --------------------------------------------------
   Utility: Detect touch device
   -------------------------------------------------- */
const isTouchDevice = () =>
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0 ||
  navigator.msMaxTouchPoints > 0;

/* --------------------------------------------------
   Utility: Linear interpolation (lerp)
   -------------------------------------------------- */
const lerp = (start, end, factor) => start + (end - start) * factor;

/* --------------------------------------------------
   Utility: Clamp a value between min and max
   -------------------------------------------------- */
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/* --------------------------------------------------
   Utility: Format number with commas
   -------------------------------------------------- */
const formatNumber = (num, decimals = 0) => {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/* --------------------------------------------------
   DOMContentLoaded: Initialize all modules
   -------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Core loading screen runs first; all other inits
  // are triggered after the loading sequence completes.
  initLoadingScreen(() => {
    // Existing functionality (enhanced)
    initHeader();
    initScrollAnimations();
    initPageTop();
    initPageTransition();
    initCountUp();
    initParticles();
    initHeroTypewriter();
    initMobileNav();
    initFilterButtons();
    initModal();

    // New features
    initScrollProgress();
    initCustomCursor();
    initHeroSlideshow();
    initParallax();
    initTextReveal();
    initTiltCards();
    initMagneticButtons();
    initLazyImages();
    initSmoothScroll();
  });
});


/* ==========================================================
   1. LOADING SCREEN
   Show loading animation, animate progress, then reveal page.
   ========================================================== */
function initLoadingScreen(onComplete) {
  const loader = document.querySelector('.loading-screen');

  // If no loading screen element exists, run the callback immediately
  if (!loader) {
    document.body.classList.add('loaded');
    if (typeof onComplete === 'function') onComplete();
    return;
  }

  const progressBar = loader.querySelector('.loading-screen__progress');
  const progressText = loader.querySelector('.loading-screen__percent');
  let progress = 0;
  let targetProgress = 0;
  let rafId = null;

  // Simulate loading progress that accelerates toward 90% then
  // waits for window.load to jump to 100%.
  const simulateInterval = setInterval(() => {
    if (targetProgress < 90) {
      targetProgress += Math.random() * 12 + 3;
      targetProgress = Math.min(targetProgress, 90);
    }
  }, 150);

  // When the window finishes loading, jump to 100%
  window.addEventListener('load', () => {
    clearInterval(simulateInterval);
    targetProgress = 100;
  });

  // Smooth animation loop for the progress bar
  function animateProgress() {
    progress = lerp(progress, targetProgress, 0.08);

    // Snap to target when close enough
    if (Math.abs(progress - targetProgress) < 0.5) {
      progress = targetProgress;
    }

    // Update DOM
    const rounded = Math.round(progress);
    if (progressBar) {
      progressBar.style.width = rounded + '%';
    }
    if (progressText) {
      progressText.textContent = rounded + '%';
    }

    if (rounded >= 100) {
      // Loading complete: fade out the loading screen
      cancelAnimationFrame(rafId);
      setTimeout(() => {
        loader.classList.add('fade-out');
        // After the CSS transition finishes, remove the loader
        loader.addEventListener('transitionend', function handler() {
          loader.removeEventListener('transitionend', handler);
          loader.style.display = 'none';
          document.body.classList.add('loaded');
          if (typeof onComplete === 'function') onComplete();
        });
        // Fallback in case transitionend does not fire
        setTimeout(() => {
          if (!document.body.classList.contains('loaded')) {
            loader.style.display = 'none';
            document.body.classList.add('loaded');
            if (typeof onComplete === 'function') onComplete();
          }
        }, 1200);
      }, 300);
      return;
    }

    rafId = requestAnimationFrame(animateProgress);
  }

  rafId = requestAnimationFrame(animateProgress);
}


/* ==========================================================
   2. SCROLL PROGRESS BAR
   Fixed progress indicator at the top of the viewport.
   ========================================================== */
function initScrollProgress() {
  // Create the progress bar element if it does not already exist
  let bar = document.querySelector('.scroll-progress');
  if (!bar) {
    bar = document.createElement('div');
    bar.classList.add('scroll-progress');
    bar.setAttribute('aria-hidden', 'true');
    // Inline styles so it works without additional CSS
    Object.assign(bar.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      height: '3px',
      width: '0%',
      background: 'linear-gradient(90deg, #FF6B00, #FF8C33)',
      zIndex: '10000',
      pointerEvents: 'none',
      transition: 'none',
      willChange: 'width'
    });
    document.body.appendChild(bar);
  }

  let ticking = false;

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    // Set CSS variable for external use and update the bar width
    document.documentElement.style.setProperty('--scroll-progress', progress + '%');
    bar.style.width = progress + '%';

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateProgress);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateProgress();
}


/* ==========================================================
   3. CUSTOM CURSOR
   Dot + follower circle with hover effects on interactive
   elements. Hidden on touch devices.
   ========================================================== */
function initCustomCursor() {
  // Do not initialize on touch devices or when reduced motion is preferred
  if (isTouchDevice() || prefersReducedMotion()) return;

  // Create cursor elements
  const dot = document.createElement('div');
  const follower = document.createElement('div');
  dot.classList.add('cursor-dot');
  follower.classList.add('cursor-follower');

  // Dot styles
  Object.assign(dot.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '6px',
    height: '6px',
    background: '#FF6B00',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '10001',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease',
    willChange: 'transform'
  });

  // Follower styles
  Object.assign(follower.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '36px',
    height: '36px',
    border: '1.5px solid rgba(255, 107, 0, 0.5)',
    borderRadius: '50%',
    pointerEvents: 'none',
    zIndex: '10001',
    transform: 'translate(-50%, -50%)',
    transition: 'width 0.3s ease, height 0.3s ease, border-color 0.3s ease, background 0.3s ease',
    willChange: 'transform'
  });

  document.body.appendChild(dot);
  document.body.appendChild(follower);

  // Add a body class so CSS can hide the default cursor
  document.body.classList.add('has-custom-cursor');

  let mouseX = 0;
  let mouseY = 0;
  let followerX = 0;
  let followerY = 0;
  let isHovering = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  // Detect hover over interactive elements
  const interactiveSelector = 'a, button, .btn, input[type="submit"], [role="button"]';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactiveSelector)) {
      isHovering = true;
      dot.style.width = '10px';
      dot.style.height = '10px';
      dot.style.background = 'rgba(255, 107, 0, 0.8)';
      follower.style.width = '50px';
      follower.style.height = '50px';
      follower.style.borderColor = 'rgba(255, 107, 0, 0.3)';
      follower.style.background = 'rgba(255, 107, 0, 0.05)';
    }
  }, { passive: true });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactiveSelector)) {
      isHovering = false;
      dot.style.width = '6px';
      dot.style.height = '6px';
      dot.style.background = '#FF6B00';
      follower.style.width = '36px';
      follower.style.height = '36px';
      follower.style.borderColor = 'rgba(255, 107, 0, 0.5)';
      follower.style.background = 'transparent';
    }
  }, { passive: true });

  // Smooth animation loop
  function animate() {
    // Dot follows instantly
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';

    // Follower trails with easing
    followerX = lerp(followerX, mouseX, 0.12);
    followerY = lerp(followerY, mouseY, 0.12);
    follower.style.left = followerX + 'px';
    follower.style.top = followerY + 'px';

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}


/* ==========================================================
   4. HERO IMAGE SLIDESHOW
   Crossfade background images with Ken Burns zoom.
   Reads image URLs from data-slides attribute (comma-separated).
   ========================================================== */
function initHeroSlideshow() {
  const hero = document.querySelector('[data-slides]');
  if (!hero) return;

  const slideUrls = hero.getAttribute('data-slides')
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  if (slideUrls.length === 0) return;

  // Create slide container
  const slideContainer = document.createElement('div');
  Object.assign(slideContainer.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    zIndex: '0'
  });
  slideContainer.setAttribute('aria-hidden', 'true');

  // Create two alternating slide layers for crossfade
  const layers = [];
  for (let i = 0; i < 2; i++) {
    const layer = document.createElement('div');
    Object.assign(layer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      opacity: i === 0 ? '1' : '0',
      transition: 'opacity 1.5s ease-in-out',
      willChange: 'opacity, transform'
    });
    slideContainer.appendChild(layer);
    layers.push(layer);
  }

  // Insert slide container as the first child of the hero
  hero.style.position = 'relative';
  hero.insertBefore(slideContainer, hero.firstChild);

  let currentIndex = 0;
  let activeLayer = 0;

  // Set initial image
  layers[0].style.backgroundImage = `url("${slideUrls[0]}")`;
  // Start Ken Burns on the first layer
  if (!prefersReducedMotion()) {
    layers[0].style.animation = 'kenBurns 5s ease-in-out forwards';
  }

  // Inject Ken Burns keyframes if not present
  if (!document.querySelector('#kb-keyframes')) {
    const style = document.createElement('style');
    style.id = 'kb-keyframes';
    style.textContent = `
      @keyframes kenBurns {
        0% { transform: scale(1); }
        100% { transform: scale(1.08); }
      }
    `;
    document.head.appendChild(style);
  }

  // Only run the slideshow if there are multiple images
  if (slideUrls.length < 2) return;

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slideUrls.length;
    const nextLayer = activeLayer === 0 ? 1 : 0;

    // Prepare the next layer
    layers[nextLayer].style.backgroundImage = `url("${slideUrls[currentIndex]}")`;
    layers[nextLayer].style.animation = 'none';
    layers[nextLayer].style.transform = 'scale(1)';

    // Force reflow
    void layers[nextLayer].offsetHeight;

    // Crossfade
    layers[nextLayer].style.opacity = '1';
    layers[activeLayer].style.opacity = '0';

    // Start Ken Burns on the new active layer
    if (!prefersReducedMotion()) {
      layers[nextLayer].style.animation = 'kenBurns 5s ease-in-out forwards';
    }

    activeLayer = nextLayer;
  }

  setInterval(nextSlide, 5000);
}


/* ==========================================================
   5. PARALLAX SCROLL EFFECT
   Elements with [data-parallax] shift via translate3d.
   data-speed controls the parallax multiplier (default 0.3).
   ========================================================== */
function initParallax() {
  const elements = document.querySelectorAll('[data-parallax]');
  if (!elements.length || prefersReducedMotion()) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    elements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed')) || 0.3;
      const rect = el.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;

      // Calculate offset from the center of the viewport
      const offset = (elementCenter - windowHeight / 2) * speed;

      el.style.transform = `translate3d(0, ${offset}px, 0)`;
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Initial call
  updateParallax();
}


/* ==========================================================
   6. TEXT REVEAL ANIMATION
   Elements with .text-reveal have their text split into
   lines/words and animated upward with stagger on scroll.
   ========================================================== */
function initTextReveal() {
  const elements = document.querySelectorAll('.text-reveal');
  if (!elements.length) return;

  // If reduced motion is preferred, just show text immediately
  if (prefersReducedMotion()) {
    elements.forEach(el => {
      el.style.opacity = '1';
    });
    return;
  }

  // Inject text-reveal keyframes
  if (!document.querySelector('#text-reveal-keyframes')) {
    const style = document.createElement('style');
    style.id = 'text-reveal-keyframes';
    style.textContent = `
      .text-reveal .word-wrap {
        display: inline-block;
        overflow: hidden;
        vertical-align: bottom;
      }
      .text-reveal .word-inner {
        display: inline-block;
        transform: translateY(105%);
        transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform;
      }
      .text-reveal.revealed .word-inner {
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  elements.forEach(el => {
    const text = el.textContent.trim();
    const words = text.split(/\s+/);

    // Clear original content
    el.textContent = '';

    words.forEach((word, i) => {
      const wrapper = document.createElement('span');
      wrapper.classList.add('word-wrap');

      const inner = document.createElement('span');
      inner.classList.add('word-inner');
      inner.textContent = word;
      // Stagger delay per word
      inner.style.transitionDelay = (i * 0.04) + 's';

      wrapper.appendChild(inner);
      el.appendChild(wrapper);

      // Add a text node for the space between words
      if (i < words.length - 1) {
        el.appendChild(document.createTextNode('\u00A0'));
      }
    });
  });

  // Trigger reveal on scroll using Intersection Observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
}


/* ==========================================================
   7. 3D TILT EFFECT
   Cards with .tilt-card tilt toward the cursor on mousemove.
   Max tilt: 10 degrees. Resets smoothly on mouseleave.
   ========================================================== */
function initTiltCards() {
  const cards = document.querySelectorAll('.tilt-card');
  if (!cards.length || isTouchDevice() || prefersReducedMotion()) return;

  const MAX_TILT = 10;

  cards.forEach(card => {
    // Ensure smooth reset on leave
    card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
    card.style.willChange = 'transform';
    card.style.transformStyle = 'preserve-3d';

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized values from -1 to 1
      const normalX = (x - centerX) / centerX;
      const normalY = (y - centerY) / centerY;

      const tiltX = -normalY * MAX_TILT; // Rotate around X axis
      const tiltY = normalX * MAX_TILT;  // Rotate around Y axis

      card.style.transition = 'none';
      card.style.transform =
        `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
      card.style.transform =
        'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
}


/* ==========================================================
   8. MAGNETIC BUTTON EFFECT
   Buttons with .btn-magnetic pull toward the cursor when
   the pointer is nearby. Spring back on leave.
   ========================================================== */
function initMagneticButtons() {
  const buttons = document.querySelectorAll('.btn-magnetic');
  if (!buttons.length || isTouchDevice() || prefersReducedMotion()) return;

  buttons.forEach(btn => {
    btn.style.transition = 'transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)';
    btn.style.willChange = 'transform';

    let rafId = null;
    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;

    function animate() {
      currentX = lerp(currentX, targetX, 0.15);
      currentY = lerp(currentY, targetY, 0.15);

      btn.style.transform = `translate(${currentX}px, ${currentY}px)`;

      // Stop animating once close enough to target
      if (
        Math.abs(currentX - targetX) > 0.1 ||
        Math.abs(currentY - targetY) > 0.1
      ) {
        rafId = requestAnimationFrame(animate);
      } else {
        btn.style.transform = `translate(${targetX}px, ${targetY}px)`;
        rafId = null;
      }
    }

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Pull strength: move up to 30% of button size
      const strength = 0.3;
      targetX = (e.clientX - centerX) * strength;
      targetY = (e.clientY - centerY) * strength;

      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    });

    btn.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      if (!rafId) {
        rafId = requestAnimationFrame(animate);
      }
    });
  });
}


/* ==========================================================
   9. SCROLL ANIMATIONS (Enhanced)
   Original fade-in/scale-in plus new types:
   blur-in, rotate-in, slide-up-big.
   Supports data-anim-speed, data-anim-delay, auto stagger.
   ========================================================== */
function initScrollAnimations() {
  const selector =
    '.fade-in, .fade-in-left, .fade-in-right, .scale-in, ' +
    '.blur-in, .rotate-in, .slide-up-big';
  const targets = document.querySelectorAll(selector);
  if (!targets.length) return;

  // If reduced motion, show everything immediately
  if (prefersReducedMotion()) {
    targets.forEach(el => el.classList.add('visible'));
    return;
  }

  // Inject styles for new animation types if they don't exist in CSS
  if (!document.querySelector('#enhanced-anim-styles')) {
    const style = document.createElement('style');
    style.id = 'enhanced-anim-styles';
    style.textContent = `
      /* Blur-in */
      .blur-in {
        opacity: 0;
        filter: blur(10px);
        transform: translateY(20px);
        transition: opacity 0.8s ease, filter 0.8s ease, transform 0.8s ease;
      }
      .blur-in.visible {
        opacity: 1;
        filter: blur(0);
        transform: translateY(0);
      }

      /* Rotate-in */
      .rotate-in {
        opacity: 0;
        transform: rotate(-5deg) translateY(30px);
        transition: opacity 0.7s ease, transform 0.7s ease;
      }
      .rotate-in.visible {
        opacity: 1;
        transform: rotate(0deg) translateY(0);
      }

      /* Slide-up-big */
      .slide-up-big {
        opacity: 0;
        transform: translateY(80px);
        transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
      }
      .slide-up-big.visible {
        opacity: 1;
        transform: translateY(0);
      }
    `;
    document.head.appendChild(style);
  }

  // Apply custom speed and delay from data attributes
  targets.forEach(el => {
    const speed = el.getAttribute('data-anim-speed');
    const delay = el.getAttribute('data-anim-delay');

    if (speed) {
      el.style.transitionDuration = speed + 's';
    }
    if (delay) {
      el.style.transitionDelay = delay + 's';
    }
  });

  // Auto-stagger: if a parent has .stagger-children, apply incrementing
  // delays to its direct children that match the animation selectors.
  document.querySelectorAll('.stagger-children').forEach(parent => {
    const children = parent.querySelectorAll(selector);
    children.forEach((child, index) => {
      // Only set stagger delay if no explicit delay is already set
      if (!child.getAttribute('data-anim-delay') && !child.style.transitionDelay) {
        child.style.transitionDelay = (index * 0.1) + 's';
      }
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  targets.forEach(target => observer.observe(target));
}


/* ==========================================================
   10. COUNT UP ANIMATION (Enhanced)
   Smooth easing, comma formatting, optional decimals via
   data-decimals attribute.
   ========================================================== */
function initCountUp() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-count'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const decimals = parseInt(el.getAttribute('data-decimals'), 10) || 0;
        const duration = parseInt(el.getAttribute('data-duration'), 10) || 2000;
        const startTime = performance.now();

        // Ease-out quart for smooth deceleration
        const easeOutQuart = (t) => 1 - Math.pow(1 - t, 4);

        // If reduced motion, skip animation and show final value
        if (prefersReducedMotion()) {
          el.textContent = prefix + formatNumber(target, decimals) + suffix;
          observer.unobserve(el);
          return;
        }

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easeOutQuart(progress);
          const current = easedProgress * target;

          el.textContent = prefix + formatNumber(current, decimals) + suffix;

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Ensure final value is exact
            el.textContent = prefix + formatNumber(target, decimals) + suffix;
          }
        };

        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}


/* ==========================================================
   11. IMAGE LAZY LOAD WITH FADE
   Images with data-src are loaded when they enter the
   viewport and fade in smoothly.
   ========================================================== */
function initLazyImages() {
  const images = document.querySelectorAll('img[data-src]');
  if (!images.length) return;

  // Inject lazy-load transition styles
  if (!document.querySelector('#lazy-img-styles')) {
    const style = document.createElement('style');
    style.id = 'lazy-img-styles';
    style.textContent = `
      img[data-src] {
        opacity: 0;
        transition: opacity 0.6s ease;
      }
      img[data-src].loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');

        // Create a temporary image to preload
        const tempImg = new Image();

        tempImg.onload = () => {
          img.src = src;
          if (srcset) {
            img.srcset = srcset;
          }
          // Remove data-src to mark as loaded
          img.removeAttribute('data-src');
          if (srcset) img.removeAttribute('data-srcset');

          // Trigger fade in on next frame
          requestAnimationFrame(() => {
            img.classList.add('loaded');
          });
        };

        tempImg.onerror = () => {
          // Even on error, remove from observer and show fallback
          img.removeAttribute('data-src');
          img.classList.add('loaded');
        };

        tempImg.src = src;
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '200px 0px',
    threshold: 0
  });

  images.forEach(img => observer.observe(img));
}


/* ==========================================================
   12. SMOOTH PAGE SCROLL
   Smooth scroll for anchor links with fixed header offset.
   Active nav link highlighting based on scroll position.
   ========================================================== */
function initSmoothScroll() {
  const headerHeight = parseInt(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--header-height'),
    10
  ) || 80;

  // Smooth scroll for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth'
      });

      // Update URL hash without jumping
      history.pushState(null, '', href);
    });
  });

  // Active nav link highlighting based on scroll position
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.header__nav-link, .mobile-nav__link');
  if (!sections.length || !navLinks.length) return;

  let scrollTicking = false;

  function highlightActiveLink() {
    const scrollPos = window.scrollY + headerHeight + 100;

    let activeId = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        activeId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('#' + activeId) && activeId) {
        link.classList.add('active');
      } else if (activeId) {
        link.classList.remove('active');
      }
    });

    scrollTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      requestAnimationFrame(highlightActiveLink);
      scrollTicking = true;
    }
  }, { passive: true });
}


/* ==========================================================
   EXISTING: Header Scroll Effect
   ========================================================== */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  const checkScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  checkScroll();
  window.addEventListener('scroll', checkScroll, { passive: true });
}


/* ==========================================================
   EXISTING: Page Top Button
   ========================================================== */
function initPageTop() {
  const btn = document.querySelector('.page-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'auto' : 'smooth'
    });
  });
}


/* ==========================================================
   EXISTING: Page Transition
   ========================================================== */
function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on page load
  overlay.classList.remove('active');

  // Fade out on link click
  const links = document.querySelectorAll(
    'a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="tel"]):not([target="_blank"])'
  );

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      overlay.classList.add('active');

      setTimeout(() => {
        window.location.href = href;
      }, 300);
    });
  });
}


/* ==========================================================
   EXISTING: Particle Background (Hero)
   ========================================================== */
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;

  // Skip particle animation if reduced motion is preferred
  if (prefersReducedMotion()) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.floor((canvas.width * canvas.height) / 15000);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.1
      });
    }
  }

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 140, 51, ${p.opacity})`;
      ctx.fill();

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const dx = p.x - particles[j].x;
        const dy = p.y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(255, 140, 51, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    });

    animationId = requestAnimationFrame(drawParticles);
  }

  resize();
  createParticles();
  drawParticles();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });
}


/* ==========================================================
   EXISTING: Hero Typewriter Effect
   ========================================================== */
function initHeroTypewriter() {
  const el = document.querySelector('.typewriter');
  if (!el) return;

  const text = el.getAttribute('data-text') || el.textContent;
  el.textContent = '';
  el.style.visibility = 'visible';

  // If reduced motion, show text immediately
  if (prefersReducedMotion()) {
    el.textContent = text;
    return;
  }

  let i = 0;
  const speed = 80;

  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }

  // Delay start
  setTimeout(type, 800);
}


/* ==========================================================
   EXISTING: Mobile Navigation
   ========================================================== */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (!hamburger || !mobileNav) return;

  hamburger.addEventListener('click', () => {
    const isActive = hamburger.classList.toggle('active');
    mobileNav.classList.toggle('active');
    document.body.style.overflow = isActive ? 'hidden' : '';

    // Update ARIA attribute
    hamburger.setAttribute('aria-expanded', isActive ? 'true' : 'false');
  });

  // Close on link click
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileNav.classList.remove('active');
      document.body.style.overflow = '';
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
}


/* ==========================================================
   EXISTING: Filter Buttons
   ========================================================== */
function initFilterButtons() {
  const buttons = document.querySelectorAll('.filter-btn');
  const items = document.querySelectorAll('[data-category]');
  if (!buttons.length || !items.length) return;

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      items.forEach(item => {
        if (filter === 'all' || item.getAttribute('data-category') === filter) {
          item.style.display = '';
          // Re-trigger animation
          item.classList.remove('visible');
          requestAnimationFrame(() => {
            item.classList.add('visible');
          });
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}


/* ==========================================================
   EXISTING: Modal
   ========================================================== */
function initModal() {
  const modalOverlay = document.querySelector('.modal-overlay');
  if (!modalOverlay) return;

  // Open modal
  document.querySelectorAll('[data-modal-open]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const modalId = trigger.getAttribute('data-modal-open');
      const modalContent = document.querySelector(`[data-modal-id="${modalId}"]`);

      if (modalContent) {
        // Populate modal body
        const body = modalOverlay.querySelector('.modal__body');
        if (body) {
          body.innerHTML = modalContent.innerHTML;
        }
        const title = modalOverlay.querySelector('.modal__title');
        if (title) {
          title.textContent = modalContent.getAttribute('data-modal-title') || '';
        }
      }

      modalOverlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  modalOverlay.querySelector('.modal__close')?.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
