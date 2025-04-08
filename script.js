//Navbar scrolling behavior

document.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('.site-header');
  let lastScroll = parseInt(sessionStorage.getItem('lastScrollPosition') || 0);
  
  // Apply the correct class immediately on page load based on stored position
  if (lastScroll > 0) {
      header.classList.add('is-scroll-down');
      header.classList.remove('is-scroll-up');
  }

  // Restore scroll position if there was one
  if (lastScroll > 0) {
      window.scrollTo(0, lastScroll);
  }

  window.addEventListener('scroll', () => {
      const currentScroll = window.scrollY;

      // Simple scroll direction detection
      if (currentScroll > lastScroll) {
          header.classList.add('is-scroll-down');
          header.classList.remove('is-scroll-up');
      } else {
          header.classList.add('is-scroll-up');
          header.classList.remove('is-scroll-down');
      }

      lastScroll = currentScroll;
      
      // Store current scroll position
      sessionStorage.setItem('lastScrollPosition', currentScroll.toString());
  });

  setTimeout(() => {
    header.classList.add('is-loaded');
}, 100);
  
  // Store header state before unload
  window.addEventListener('beforeunload', () => {
      const isScrollDown = header.classList.contains('is-scroll-down');
      sessionStorage.setItem('headerScrolledDown', isScrollDown.toString());
  });
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSliders);




//Customer testimonials

const testimonials = [
    {
      personImg: "assets/testimonials1.png",
      logoImg: "assets/icons/netflix-logo.svg",
      quote: "Back when the video streaming industry started to boom, GLOBL helped us duplicate the size of our engineering in just 18 months, a crucial feat to Netflix's present success. Their tech-driven approach and their legacy talent network made them the perfect partner during our hypergrowth phase.",
      person: "Alice Parkinson",
      title: "Product Management Lead at Netflix"
    },
    {
      personImg: "assets/testimonials2.png",
      logoImg: "assets/icons/shopify-logo.svg",
      quote: "Incorporating GLOBL talent matching and automated HR workflowsinto our global TA processes, along their skills-based strategy, has allowed us to identify the right talent for our teams and reduce the time it takes to fill vacancies,  all while creating an overall better candidate experience.",
      person: "Michael Chen",
      title: "CTO at Shopify"
    },
    {
      personImg: "assets/testimonials3.png",
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