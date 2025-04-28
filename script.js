//Navbar scrolling behavior

document.addEventListener('DOMContentLoaded', () => {
  const headers = document.querySelectorAll('.site-header, .site-header--services');
  let lastScroll = parseInt(sessionStorage.getItem('lastScrollPosition') || 0);
  
  // Apply the correct class immediately on page load based on stored position
  if (lastScroll > 0) {
    headers.forEach(header => {
      header.classList.add('is-scroll-down');
      header.classList.remove('is-scroll-up');
    });
  }

  // Restore scroll position if there was one
  if (lastScroll > 0) {
    window.scrollTo(0, lastScroll);
  }

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    // Simple scroll direction detection
    headers.forEach(header => {
      if (currentScroll > lastScroll) {
        header.classList.add('is-scroll-down');
        header.classList.remove('is-scroll-up');
      } else {
        header.classList.add('is-scroll-up');
        header.classList.remove('is-scroll-down');
      }
    });

    lastScroll = currentScroll;
    
    // Store current scroll position
    sessionStorage.setItem('lastScrollPosition', currentScroll.toString());
  });

  setTimeout(() => {
    headers.forEach(header => {
      header.classList.add('is-loaded');
    });
  }, 100);
  
  // Store header state before unload
  window.addEventListener('beforeunload', () => {
    // Using the first header's state for storage, assuming they'll be in sync
    const isScrollDown = headers[0].classList.contains('is-scroll-down');
    sessionStorage.setItem('headerScrolledDown', isScrollDown.toString());
  });
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
  // Get all sliders on the page
  const sliderWrappers = document.querySelectorAll('.slider-wrapper');
  
  // Loop through each slider and initialize it
  sliderWrappers.forEach(sliderWrapper => {
    const cardSlider = sliderWrapper.querySelector('.card-slider');
    if (!cardSlider) return; // Skip if no card slider inside
    
    let isDragging = false;
    let startX;
    let scrollLeft;
    let hasMoved = false;
    
    // Initialize this specific slider
    sliderWrapper.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      
      isDragging = true;
      hasMoved = false;
      startX = e.pageX - sliderWrapper.offsetLeft;
      scrollLeft = cardSlider.style.transform ? 
          parseInt(cardSlider.style.transform.match(/-?\d+/)?.[0] || 0) : 0;
          
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
      
      const newTranslate = scrollLeft + walk;
      const maxScroll = -(cardSlider.offsetWidth - sliderWrapper.offsetWidth + 125);
      const boundedTranslate = Math.max(maxScroll, Math.min(0, newTranslate));
      
      cardSlider.style.transform = `translateX(${boundedTranslate}px)`;
    });
    
    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      
      isDragging = false;
      cardSlider.style.transition = 'transform 0.3s ease-out';
      cardSlider.classList.remove('is-dragging');
    });
    
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
      
      // Determine direction based on button position (first or second arrow button)
      const isFirstButton = button === section.querySelector('.arrow-btn:first-of-type');
      const direction = isFirstButton ? 'prev' : 'next';
      
      // Calculate how far to move (one card width)
      const cards = cardSlider.querySelectorAll('.service-card');
      if (cards.length === 0) return;
      
      const card = cards[0];
      const cardStyle = window.getComputedStyle(card);
      const slideDistance = card.offsetWidth + 
                    parseInt(cardStyle.marginLeft) + 
                    parseInt(cardStyle.marginRight);
      
      // Get current translation value
      const currentTranslate = cardSlider.style.transform ? 
          parseInt(cardSlider.style.transform.match(/-?\d+/)?.[0] || 0) : 0;
      
      // Calculate new translation value
      let newTranslate;
      if (direction === 'prev') {
        // Move right (increase translate value)
        newTranslate = currentTranslate + slideDistance;
      } else {
        // Move left (decrease translate value)
        newTranslate = currentTranslate - slideDistance;
      }
      
      // Apply bounds
      const maxScroll = -(cardSlider.offsetWidth - sliderWrapper.offsetWidth + 125);
      const boundedTranslate = Math.max(maxScroll, Math.min(0, newTranslate));
      
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
      }, 350);
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