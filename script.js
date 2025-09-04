//Navbar scrolling behavior and restoring page position for internal navigation

document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.site-header, .site-header--services');
  const currentPath = window.location.pathname;
  const previousPath = sessionStorage.getItem('previousPagePath');
  
  // If navigating to a new page, scroll to top
  if (previousPath !== currentPath) {
    window.scrollTo(0, 0);
    // Reset header state for new page
    headers.forEach(header => {
      header.classList.add('is-scroll-up');
      header.classList.remove('is-scroll-down');
    });
  } else {
    // On refresh, restore header state
    const wasHeaderHidden = sessionStorage.getItem('headerHidden') === 'true';
    headers.forEach(header => {
      if (wasHeaderHidden) {
        header.classList.add('is-scroll-down');
        header.classList.remove('is-scroll-up');
      } else {
        header.classList.add('is-scroll-up');
        header.classList.remove('is-scroll-down');
      }
    });
  }
  
  // Store current path for next navigation
  sessionStorage.setItem('previousPagePath', currentPath);
  
  // Handle scroll events for header visibility
  let lastScroll = window.scrollY;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    let isHeaderHidden = false;
    
    // Update header classes based on scroll direction
    headers.forEach(header => {
      if (currentScroll > lastScroll && currentScroll > 50) {
        header.classList.add('is-scroll-down');
        header.classList.remove('is-scroll-up');
        isHeaderHidden = true;
      } else {
        header.classList.add('is-scroll-up');
        header.classList.remove('is-scroll-down');
        isHeaderHidden = false;
      }
    });
    
    // Store header state for potential refresh
    sessionStorage.setItem('headerHidden', isHeaderHidden.toString());
    lastScroll = currentScroll;
  });
  
  // Add loaded class after a brief delay
  setTimeout(() => {
    headers.forEach(header => header.classList.add('is-loaded'));
  }, 100);
});


//Active navbar link tracking and styling

document.addEventListener('DOMContentLoaded', () => {
  // Get all navigation links
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Set active class based on current URL
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    
    // Check if current URL ends with the link's path
    if (currentPath.endsWith(linkPath)) {
      link.classList.add('active');
    }
  });
});




//Open quote popup 

document.addEventListener('DOMContentLoaded', () => {
  const popupForm = document.querySelector('popup-form');
  const ctaButtons = document.querySelectorAll('.cta, .footer-cta');
  
  if (popupForm) {
    ctaButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        popupForm.open();
      });
    });
  } else {
    console.error('Could not find popup-form');
  }
});






// Slider logic
function initSliders() {
  // Helpers for consistent metrics across viewports
  const getTranslateX = (el) => {
    const t = el.style.transform || '';
    const simple = t.match(/translateX\((-?\d+(?:\.\d+)?)px\)/);
    if (simple) return parseFloat(simple[1]);
    // Fallback for matrix transforms if ever set by CSS
    const m = t.match(/matrix\([^,]+,[^,]+,[^,]+,[^,]+,\s*(-?\d+(?:\.\d+)?)\s*,/);
    if (m) return parseFloat(m[1]);
    const m3 = t.match(/matrix3d\((?:[^,]+,){12}\s*(-?\d+(?:\.\d+)?)\s*,/);
    if (m3) return parseFloat(m3[1]);
    return 0;
  };

  const getStepDistance = (container) => {
    const cards = container.querySelectorAll('.service-card');
    if (cards.length >= 2) {
      const a = cards[0].getBoundingClientRect();
      const b = cards[1].getBoundingClientRect();
      // Distance from left edges includes margins and CSS gap
      return Math.round(b.left - a.left);
    }
    if (cards.length === 1) {
      return Math.round(cards[0].getBoundingClientRect().width);
    }
    return 0;
  };

  const getMaxTranslate = (wrapper, container) => {
    // Negative or zero. Uses scrollWidth so CSS gap is included.
    return Math.min(0, wrapper.clientWidth - container.scrollWidth);
  };
  // Get all sliders on the page
  const sliderWrappers = document.querySelectorAll('.slider-wrapper');
  
  // Loop through each slider and initialize it
  sliderWrappers.forEach(sliderWrapper => {
    const cardSlider = sliderWrapper.querySelector('.card-slider');
    if (!cardSlider) return; // Skip if no card slider inside
    
    let isDragging = false;
    let startX;
    let baseTranslate;
    let hasMoved = false;
    let currentTranslate = 0; // Track live translate during drag
    
    // Initialize this specific slider
    sliderWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      
      isDragging = true;
      hasMoved = false;
      startX = e.pageX - sliderWrapper.offsetLeft;
      baseTranslate = getTranslateX(cardSlider);
      currentTranslate = baseTranslate;
          
      cardSlider.style.transition = 'none';
      cardSlider.classList.add('is-dragging');
    });
    
    // Use event delegation to handle mousemove and mouseup on document level
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const x = e.pageX - sliderWrapper.offsetLeft;
      const walk = x - startX;
      
      if (Math.abs(walk) > 5) {
        hasMoved = true;
      }
      
      // Limit drag movement to one card distance from the grab point
      const step = getStepDistance(cardSlider);
      const limitedWalk = step > 0 ? Math.max(-step, Math.min(step, walk)) : walk;

      const newTranslate = baseTranslate + limitedWalk;
      const maxTranslate = getMaxTranslate(sliderWrapper, cardSlider);
      const boundedTranslate = Math.max(maxTranslate, Math.min(0, newTranslate));
      
      currentTranslate = boundedTranslate;
      cardSlider.style.transform = `translateX(${boundedTranslate}px)`;
    });
    
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      
      isDragging = false;
      cardSlider.style.transition = 'transform 0.3s ease-out';
      cardSlider.classList.remove('is-dragging');

      // Snap to either the start position or exactly one step based on drag distance
      const moved = currentTranslate - baseTranslate;
      const step = getStepDistance(cardSlider);
      const threshold = step * 0.3; // drag at least 30% of a card to advance
      let targetTranslate = baseTranslate;

      if (step > 0 && Math.abs(moved) >= threshold) {
        const direction = moved < 0 ? -1 : 1; // left drag is negative
        targetTranslate = baseTranslate + direction * step;
      }

      // Respect bounds
      const maxTranslate = getMaxTranslate(sliderWrapper, cardSlider);
      const boundedTarget = Math.max(maxTranslate, Math.min(0, targetTranslate));

      cardSlider.style.transform = `translateX(${boundedTarget}px)`;
      // Update base translate for next interaction
      currentTranslate = boundedTarget;
    });

    // Touch support
    sliderWrapper.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      isDragging = true;
      hasMoved = false;
      startX = touch.pageX - sliderWrapper.offsetLeft;
      baseTranslate = getTranslateX(cardSlider);
      currentTranslate = baseTranslate;
      cardSlider.style.transition = 'none';
      cardSlider.classList.add('is-dragging');
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const touch = e.touches[0];
      const x = touch.pageX - sliderWrapper.offsetLeft;
      const walk = x - startX;
      if (Math.abs(walk) > 5) {
        hasMoved = true;
      }
      const step = getStepDistance(cardSlider);
      const limitedWalk = step > 0 ? Math.max(-step, Math.min(step, walk)) : walk;
      const newTranslate = baseTranslate + limitedWalk;
      const maxTranslate = getMaxTranslate(sliderWrapper, cardSlider);
      const boundedTranslate = Math.max(maxTranslate, Math.min(0, newTranslate));
      currentTranslate = boundedTranslate;
      // Prevent vertical scroll when actively swiping horizontally
      e.preventDefault();
      cardSlider.style.transform = `translateX(${boundedTranslate}px)`;
    }, { passive: false });

    document.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      cardSlider.style.transition = 'transform 0.3s ease-out';
      cardSlider.classList.remove('is-dragging');

      const moved = currentTranslate - baseTranslate;
      const step = getStepDistance(cardSlider);
      const threshold = step * 0.3;
      let targetTranslate = baseTranslate;
      if (step > 0 && Math.abs(moved) >= threshold) {
        const direction = moved < 0 ? -1 : 1;
        targetTranslate = baseTranslate + direction * step;
      }
      const maxTranslate = getMaxTranslate(sliderWrapper, cardSlider);
      const boundedTarget = Math.max(maxTranslate, Math.min(0, targetTranslate));
      cardSlider.style.transform = `translateX(${boundedTarget}px)`;
      currentTranslate = boundedTarget;
    }, { passive: true });
    
    // Handle link clicks
    cardSlider.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', (e) => {
        if (hasMoved) {
          e.preventDefault();
          hasMoved = false;
        }
      });
    });
    
    // Prevent dragging on images
    cardSlider.querySelectorAll('img, a').forEach(element => {
      element.addEventListener('dragstart', (e) => e.preventDefault());
    });
  });
}

// Separate function for arrow navigation
function initSliderArrows() {
  // Find all arrow buttons
  const arrowButtons = document.querySelectorAll('.arrow-btn');
  
  arrowButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Find the nearest slider to this button
      const section = button.closest('section');
      if (!section) return;
      
      const sliderWrapper = section.querySelector('.slider-wrapper');
      const cardSlider = section.querySelector('.card-slider');
      if (!sliderWrapper || !cardSlider) return;
      
      // Determine direction using explicit markers or icon alt text
      let direction = button.getAttribute('data-direction');
      if (!direction) {
        const img = button.querySelector('img');
        const alt = (img?.getAttribute('alt') || '').toLowerCase();
        if (alt.includes('prev') || alt.includes('left')) direction = 'prev';
        else direction = 'next';
      }
      
      // Calculate how far to move (distance between adjacent cards)
      const cards = cardSlider.querySelectorAll('.service-card');
      if (cards.length === 0) return;
      const step = (cards.length >= 2)
        ? Math.round(cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left)
        : Math.round(cards[0].getBoundingClientRect().width);
      
      // Get current translation value
      const currentTranslate = (cardSlider.style.transform)
        ? (parseFloat(cardSlider.style.transform.match(/-?\d+(?:\.\d+)?/)?.[0] || '0'))
        : 0;
      
      // Calculate new translation value
      let newTranslate;
      if (direction === 'prev') {
        // Move right (increase translate value)
        newTranslate = currentTranslate + step;
      } else {
        // Move left (decrease translate value)
        newTranslate = currentTranslate - step;
      }
      
      // Apply bounds
      const maxTranslate = Math.min(0, sliderWrapper.clientWidth - cardSlider.scrollWidth);
      const boundedTranslate = Math.max(maxTranslate, Math.min(0, newTranslate));
      
      // Apply transition for smooth sliding
      cardSlider.style.transition = 'transform 0.3s ease-out';
      cardSlider.style.transform = `translateX(${boundedTranslate}px)`;
    });
  });
}

// Initialize both functionalities when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initSliders();
  initSliderArrows();
  // Ensure translate stays within bounds on resize/orientation changes
  window.addEventListener('resize', () => {
    document.querySelectorAll('.slider-wrapper').forEach(wrapper => {
      const track = wrapper.querySelector('.card-slider');
      if (!track) return;
      const current = parseFloat(track.style.transform?.match(/-?\d+(?:\.\d+)?/)?.[0] || '0');
      const maxTranslate = Math.min(0, wrapper.clientWidth - track.scrollWidth);
      const bounded = Math.max(maxTranslate, Math.min(0, current));
      if (bounded !== current) {
        track.style.transition = 'transform 0.2s ease-out';
        track.style.transform = `translateX(${bounded}px)`;
      }
    });
  });
});


//Customer testimonials

const testimonials = [
    {
      personImg: "assets/testimonials1.jpg",
      logoImg: "assets/icons/netflix-logo.svg",
      quote: "Back when the video streaming industry started to boom, GLOBL helped us duplicate the size of our engineering in just 18 months, a crucial feat to Netflix's present success. Their tech-driven approach and their legacy talent network made them the perfect partner during our hypergrowth phase.",
      person: "Alice Parkinson",
      title: "Product Management Lead at Netflix"
    },
    {
      personImg: "assets/testimonials2.jpg",
      logoImg: "assets/icons/shopify-logo.svg",
      quote: "Incorporating GLOBL talent matching and automated HR workflowsinto our global TA processes, along their skills-based strategy, has allowed us to identify the right talent for our teams and reduce the time it takes to fill vacancies,  all while creating an overall better candidate experience.",
      person: "Michael Chen",
      title: "CTO at Shopify"
    },
    {
      personImg: "assets/testimonials3.jpg",
      logoImg: "assets/icons/zoom-logo.svg",
      quote: "Seeing skills as the labor market currency allows you to hire faster and better, because you're looking at the skill, not only the individual and the positions they have held before. It allows you to be relevant in the market and to move with pace. That's what GLOBL taught us.",
      person: "Sarah Williams",
      title: "VP of Engineering at Zoom"
    }
  ];
  
  document.addEventListener('DOMContentLoaded', function() {
    // Find our blessed elements using the scripture of data attributes
    const card = document.querySelector('[data-testimonial-container]');
    const personImg = document.querySelector('[data-person-img]');
    const logoImg = document.querySelector('[data-company-logo]');
    const quote = document.querySelector('[data-quote]');
    const personName = document.querySelector('[data-person-name]');
    const personTitle = document.querySelector('[data-person-title]');
    const prevBtn = document.querySelector('[data-direction="prev"]');
    const nextBtn = document.querySelector('[data-direction="next"]');
    
    let currentIndex = 0;
    let timer;
    
    // The divine function that changes our testimonial
    function updateTestimonial(index) {
      // Fade out the card like a sinner fading into redemption
      card.style.opacity = 0;
      
      setTimeout(() => {
        // Update the content like refreshing the soul
        personImg.src = testimonials[index].personImg;
        personImg.alt = testimonials[index].person;
        logoImg.src = testimonials[index].logoImg;
        quote.textContent = testimonials[index].quote;
        
        // Update the text nodes directly - clean as a baptismal pool
        const nameNode = personName.childNodes[0];
        nameNode.nodeValue = testimonials[index].person + ' ';
        personTitle.textContent = testimonials[index].title;
        
        // Bring it back into the light of the Lord
        card.style.opacity = 1;
      }, 500);
    }
    
    function startAutoRotation() {
      // Clear any existing timers like washing away sins
      clearInterval(timer);
      
      timer = setInterval(() => {
        currentIndex = (currentIndex + 1) % testimonials.length;
        updateTestimonial(currentIndex);
      }, 7000);
    }
    
    // Wire up them buttons with the power of direct data selection
    prevBtn.addEventListener('click', () => {
      clearInterval(timer);
      currentIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
      updateTestimonial(currentIndex);
      startAutoRotation();
    });
    
    nextBtn.addEventListener('click', () => {
      clearInterval(timer);
      currentIndex = (currentIndex + 1) % testimonials.length;
      updateTestimonial(currentIndex);
      startAutoRotation();
    });
    
    // Make sure we have that heavenly transition
    card.style.transition = 'opacity 0.3s ease';
    
    // Start spreading the good word
    startAutoRotation();
  });




  
