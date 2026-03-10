document.addEventListener('DOMContentLoaded', function() {
    let scrollPosition = 0;
    const toggleMenu = function() {
        const menu = document.getElementById('menu');
        menu.classList.toggle('is-active');

        // Store current scroll position
        if (menu.classList.contains('is-active')) {
            scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
            document.body.style.top = `-${scrollPosition}px`;
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            window.scrollTo(0, scrollPosition);
        }
    };

    // Header submenu functionality
    const initHeaderSubmenu = function() {
        const isSubElements = document.querySelectorAll('.is-sub');
        
        // Global timeout for all submenus
        let globalHideTimeout;
        
        // Function to close all submenus and remove active classes
        const closeAllSubmenus = function() {
            document.querySelectorAll('.header-sub.is-show').forEach(function(submenu) {
                submenu.classList.remove('is-show');
                // Use slideUp for mobile/tablet
                if (window.innerWidth < 1024) {
                    $(submenu).slideUp(300);
                }
            });
            document.querySelectorAll('.is-sub.is-active').forEach(function(element) {
                element.classList.remove('is-active');
            });
            document.querySelectorAll('a.is-user.is-active, a.is-lender.is-active').forEach(function(element) {
                element.classList.remove('is-active');
            });
        };
        
        // Function to open a specific submenu
        const openSubmenu = function(submenuElement, activeElement) {
            clearTimeout(globalHideTimeout);
            closeAllSubmenus();
            submenuElement.classList.add('is-show');
            // Use slideDown for mobile/tablet
            if (window.innerWidth < 1024) {
                $(submenuElement).slideDown(300);
            }
            if (activeElement) {
                activeElement.classList.add('is-active');
            }
        };
        
        isSubElements.forEach(function(isSubElement) {
            const headerSub = isSubElement.querySelector('.header-sub');
            const linkElement = isSubElement.querySelector('a');
            
            if (!headerSub || !linkElement) return;
            
            // Remove existing event listeners
            const newIsSubElement = isSubElement.cloneNode(true);
            const newHeaderSub = newIsSubElement.querySelector('.header-sub');
            const newLinkElement = newIsSubElement.querySelector('a');
            
            isSubElement.parentNode.replaceChild(newIsSubElement, isSubElement);
            
            if (window.innerWidth > 1024) {
                // PC: Hover functionality with global timeout
                const showSubmenu = function() {
                    clearTimeout(globalHideTimeout);
                    openSubmenu(newHeaderSub, newIsSubElement);
                };
                
                const hideSubmenu = function() {
                    clearTimeout(globalHideTimeout);
                    globalHideTimeout = setTimeout(function() {
                        closeAllSubmenus();
                    }, 300);
                };
                
                // Show on mouseenter of is-sub
                newIsSubElement.addEventListener('mouseenter', showSubmenu);
                
                // Hide on mouseleave of is-sub
                newIsSubElement.addEventListener('mouseleave', hideSubmenu);
                
                // Keep submenu open when hovering over it
                newHeaderSub.addEventListener('mouseenter', showSubmenu);
                newHeaderSub.addEventListener('mouseleave', hideSubmenu);
                
            } else {
                // Tablet/Mobile: Click functionality
                // Check if this is user/lender submenu (special case)
                const isUserOrLender = newLinkElement.classList.contains('is-user') || 
                                     newLinkElement.classList.contains('is-lender');
                
                if (isUserOrLender) {
                    // Special case for is-user and is-lender: click on 'a' to toggle submenu
                    newLinkElement.addEventListener('click', function(e) {
                        e.preventDefault(); // Prevent navigation
                        if (newHeaderSub.classList.contains('is-show')) {
                            closeAllSubmenus();
                        } else {
                            openSubmenu(newHeaderSub, newLinkElement);
                        }
                    });
                } else {
                    // Regular is-sub: click on li to toggle, a to navigate
                    newIsSubElement.addEventListener('click', function(e) {
                        // If clicked on the link, allow default behavior
                        if (e.target.tagName === 'A' || e.target.closest('a')) {
                            return; // Let the link work normally
                        }
                        // If clicked elsewhere on the li, toggle submenu
                        e.preventDefault();
                        if (newHeaderSub.classList.contains('is-show')) {
                            closeAllSubmenus();
                        } else {
                            openSubmenu(newHeaderSub, newIsSubElement);
                        }
                    });
                    
                    // Ensure the link works normally
                    newLinkElement.addEventListener('click', function(e) {
                        // Don't prevent default - let the link work
                    });
                }
            }
        });
    };
    
    // Initialize header submenu
    initHeaderSubmenu();
    
    // Initialize mobile submenu state - hide all submenus on mobile
    if (window.innerWidth < 1024) {
        document.querySelectorAll('.header-sub').forEach(function(submenu) {
            if (!submenu.classList.contains('is-show')) {
                $(submenu).hide();
            }
        });
    }
    
    // Match Height functionality
    const initMatchHeight = function() {
        // Function to match height for elements with same data-match-height attribute
        const matchHeight = function() {
            const groups = {};
            
            // Group elements by data-match-height value
            document.querySelectorAll('.js-match-height').forEach(function(element) {
                const groupName = element.getAttribute('data-match-height');
                if (groupName) {
                    if (!groups[groupName]) {
                        groups[groupName] = [];
                    }
                    groups[groupName].push(element);
                }
            });
            
            // Apply match height for each group (only on desktop)
            if (window.innerWidth >= 768) {
                Object.keys(groups).forEach(function(groupName) {
                    const elements = groups[groupName];
                    let maxHeight = 0;
                    
                    // Reset height to auto to calculate natural height
                    elements.forEach(function(element) {
                        element.style.height = 'auto';
                    });
                    
                    // Find maximum height
                    elements.forEach(function(element) {
                        const height = element.offsetHeight;
                        if (height > maxHeight) {
                            maxHeight = height;
                        }
                    });
                    
                    // Apply maximum height to all elements in group
                    elements.forEach(function(element) {
                        element.style.height = maxHeight + 'px';
                    });
                });
            } else {
                // Reset height on mobile
                resetMatchHeight();
            }
        };
        
        // Function to reset all match heights
        const resetMatchHeight = function() {
            document.querySelectorAll('.js-match-height').forEach(function(element) {
                element.style.height = 'auto';
            });
        };
        
        // Initial match
        matchHeight();
        
        // Handle window resize with debounce
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                matchHeight();
            }, 250);
        });
    };
    
    // Initialize match height
    initMatchHeight();
    
    // MV Video Slider functionality
    const initMVSlider = function() {
        const mvContainer = document.querySelector('.mv');
        const mvItems = document.querySelectorAll('.mv__item');
        
        if (!mvContainer || mvItems.length === 0) return;
        
        let currentIndex = 0;
        let autoPlayInterval;
        const autoPlayDelay = 5000; // 5 seconds
        
        // Function to show specific slide
        const showSlide = function(index) {
            // Remove active class from all items
            mvItems.forEach(function(item) {
                item.classList.remove('is-active');
            });
            
            // Add active class to current item
            if (mvItems[index]) {
                mvItems[index].classList.add('is-active');
            }
        };
        
        // Function to go to next slide
        const nextSlide = function() {
            currentIndex = (currentIndex + 1) % mvItems.length;
            showSlide(currentIndex);
        };
        
        // Function to start auto-play
        const startAutoPlay = function() {
            autoPlayInterval = setInterval(nextSlide, autoPlayDelay);
        };
        
        // Function to stop auto-play
        const stopAutoPlay = function() {
            if (autoPlayInterval) {
                clearInterval(autoPlayInterval);
            }
        };
        
        // Initialize slider
        const initSlider = function() {
            // Show first slide
            showSlide(0);
            
            // Start auto-play
            startAutoPlay();
            
            // Pause on hover
            mvContainer.addEventListener('mouseenter', stopAutoPlay);
            mvContainer.addEventListener('mouseleave', startAutoPlay);
        };
        
        // Wait for videos to be ready before starting
        const videos = mvContainer.querySelectorAll('video');
        let loadedVideos = 0;
        
        if (videos.length > 0) {
            videos.forEach(function(video) {
                // Handle video loaded data
                video.addEventListener('loadeddata', function() {
                    loadedVideos++;
                    if (loadedVideos === videos.length) {
                        initSlider();
                    }
                });
                
                // Handle video error
                video.addEventListener('error', function() {
                    loadedVideos++;
                    if (loadedVideos === videos.length) {
                        initSlider();
                    }
                });
                
                // Fallback if videos don't load
                setTimeout(function() {
                    if (loadedVideos < videos.length) {
                        initSlider();
                    }
                }, 3000);
            });
        } else {
            // No videos, initialize immediately
            initSlider();
        }
    };
    
    // Initialize MV slider
    initMVSlider();
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // Close all submenus and clear any pending timeouts on resize
            document.querySelectorAll('.header-sub.is-show').forEach(function(submenu) {
                submenu.classList.remove('is-show');
            });
            document.querySelectorAll('.is-sub.is-active').forEach(function(element) {
                element.classList.remove('is-active');
            });
            document.querySelectorAll('a.is-user.is-active, a.is-lender.is-active').forEach(function(element) {
                element.classList.remove('is-active');
            });
            
            // Reset submenu display state based on screen size
            if (window.innerWidth < 1024) {
                // Mobile: hide all submenus initially
                document.querySelectorAll('.header-sub').forEach(function(submenu) {
                    $(submenu).hide();
                });
            } else {
                // Desktop: show all submenus (they're controlled by CSS hover)
                document.querySelectorAll('.header-sub').forEach(function(submenu) {
                    $(submenu).show();
                });
            }
            
            // Reinitialize submenu functionality
            initHeaderSubmenu();
        }, 250);
    });

    // Toggle menu button
    const toggleMenuBtn = document.querySelector('.js-open-menu');
    if (toggleMenuBtn) {
        toggleMenuBtn.addEventListener('click', function(e) {
            e.preventDefault();
            this.closest('.header').classList.toggle('is-active');
            toggleMenu();
        });
    }

    $("a[href*='#']").click(function (e) {
        e.preventDefault();
        if (location.pathname.replace(/^\//, "") == this.pathname.replace(/^\//, "") && location.hostname == this.hostname) {
          var $target = $(this.hash);
          $target = $target.length && $target || $("[name=" + this.hash.slice(1) + "]");
          header = 0;

          if(this.closest('.header') && window.innerWidth < 1024){
            this.closest('.header').classList.toggle('is-active');
            toggleMenu();
          }

          if($('body').find('header-fix') && window.innerWidth > 1024){
            header = 0;
          }else{
            header = $("#header").innerHeight();
          }
      
          if ($target.length) {
            var targetOffset = $target.offset().top - header;
            $("html,body").animate({
              scrollTop: targetOffset
            }, 1000);
            return false;
          }
        }
    });

    // Header scroll functionality
    const initHeaderScroll = function() {
        const header = document.querySelector('.header');
        const headerBefore = document.querySelector('.header__before');
        const headerAfter = document.querySelector('.header__after');
        let lastScrollTop = 0;
        let scrollThreshold = 100; // Scroll threshold before applying header-fix
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > scrollThreshold) {
                if (scrollTop > lastScrollTop) {
                    // Scrolling down - add header-fix class
                    header.classList.add('header-fix');
                    if (headerBefore) headerBefore.classList.add('header-fix');
                    if (headerAfter) headerAfter.classList.add('header-fix');
                } else {
                    // Scrolling up - remove header-fix class
                    header.classList.remove('header-fix');
                    if (headerBefore) headerBefore.classList.remove('header-fix');
                    if (headerAfter) headerAfter.classList.remove('header-fix');
                }
            } else {
                // At top - remove header-fix class
                header.classList.remove('header-fix');
                if (headerBefore) headerBefore.classList.remove('header-fix');
                if (headerAfter) headerAfter.classList.remove('header-fix');
            }
            
            lastScrollTop = scrollTop;
        });
    };
    
    // Initialize header scroll
    initHeaderScroll();

    AOS.init({
        duration: 800,
        easing: '',
        once: true,
    });


    const swiper = new Swiper('#top_mv', {
        slidesPerView: 'auto',
        centeredSlides: true,
        loop: true,
        spaceBetween: 10,
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // },
    });

    const slide01 = new Swiper('.slider01', {
        slidesPerView: 'auto',
        // loop: true,
        spaceBetween: 30,
        speed: 1200,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });


    const slide02 = new Swiper('.slider02', {
        slidesPerView: 'auto',
        loop: true,
        spaceBetween: 30,
        speed: 1200,
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
    });


});

$(".js-submenu").on("click", function(){
  if($(window).innerWidth() < 1025){
      if($(this).hasClass("is-subActive")){
          $(this).removeClass("is-subActive");
          $(this).find('.sub').slideUp();
      }else{
          $(this).addClass("is-subActive");
          $(this).find('.sub').slideDown();
      }
  }
});

$('.js-tab').click(function() {
  var tabId = $(this).attr('data-tab');
  var container = $(this).closest('.tab');
  
  container.find('.js-tab').removeClass('is-active');
  $(this).addClass('is-active');
  
  container.find('.js-tab__content').removeClass('is-active');
  container.find('#' + tabId).addClass('is-active');
});

var mainview = document.getElementById("mainview");
//mainviewアニメーション
setTimeout(() => {
	if(mainview){
    mainview.classList.remove('anime-off');
  }
}, 200);

//スクロールアニメーション
let fadeInTarget = document.querySelectorAll('.anime-set');
for (let i = 0; i < fadeInTarget.length; i++){
	fadeInTarget[i].classList.add('anime-off');
}
window.addEventListener('scroll', () => {
	for (let i = 0; i < fadeInTarget.length; i++){
		const animeRect = fadeInTarget[i].getBoundingClientRect().top;
		const animeScroll = window.pageYOffset || document.documentElement.scrollTop;
		const animeOffset = animeRect + animeScroll;
		const animeWindowHeight = window.innerHeight;
		if (animeScroll > animeOffset - (animeWindowHeight * 0.8)) {
			fadeInTarget[i].classList.remove('anime-off');
		} else {
			fadeInTarget[i].classList.add('anime-off');
		}
	}
});

$(function(){
  $(".faqDl dt").on('click',function(){
    $(this).toggleClass("on");
    $(this).next("dd").stop().slideToggle(300);
    return false;
  });
})

  const initOpeningHours = () => {
    const openingHours = document.querySelector('.js-opening-hours');
    const toggleBtn = document.querySelector('.js-opening-hours-toggle');
    let isScrolling = false;
    let scrollTimer;

    if (!openingHours || !toggleBtn) return;

    toggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openingHours.classList.toggle('is-closed');
    });

    window.addEventListener('scroll', () => {
      if (openingHours && !openingHours.classList.contains('is-closed')) {
        isScrolling = true;
        clearTimeout(scrollTimer);
        
        scrollTimer = setTimeout(() => {
          if (isScrolling) {
            openingHours.classList.add('is-closed');
            isScrolling = false;
          }
        }, 100);
      }
    });
  };

  initOpeningHours();

  // ========================================
// Page Loader with Shine Effect
// ========================================
const initLoading = () => {
  return new Promise((resolve) => {
    setTimeout(() => {      
      setTimeout(() => {        
        setTimeout(() => {          
          $('main').addClass('show');
          resolve();
        }, 700);
      }, 1500);
    }, 510);
  });
};

const initMvAnimation = () => {
  const mvSection = document.querySelector('.top-mv');
  if (!mvSection) return;

    setTimeout(() => {
        const mvImg = mvSection.querySelector('.mv__title01');
        if (mvImg) mvImg.classList.add('mv-visible');
    }, 200);

    setTimeout(() => {
        const mvImg = mvSection.querySelector('.mv__title02');
        if (mvImg) mvImg.classList.add('mv-visible');
    }, 400);

    const advanceItems = mvSection.querySelectorAll('.mv__frame li');
    if (advanceItems.length > 0) {
        advanceItems.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('mv-visible');
        }, 400 + (index * 200));
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.classList.contains('page-top')) {
    initLoading().then(() => {
        $('main').addClass('show');
        initMvAnimation();
    });
  } else {
    initMvAnimation();
  }
});

// List03 Accordion functionality
const initList03Accordion = function() {
    const list03Items = document.querySelectorAll('.list03__item');
    
    if (list03Items.length === 0) return;
    
    list03Items.forEach(function(item) {
        const question = item.querySelector('.list03__q');
        const content = item.querySelector('.list03__content');
        
        if (!question || !content) return;
        
        question.addEventListener('click', function(e) {
            e.preventDefault();
            
            const isCurrentlyOpen = question.classList.contains('is-open');
            
            // Close all other items
            list03Items.forEach(function(otherItem) {
                if (otherItem !== item) {
                    const otherQuestion = otherItem.querySelector('.list03__q');
                    const otherContent = otherItem.querySelector('.list03__content');
                    
                    otherQuestion.classList.remove('is-open');
                    $(otherContent).slideUp(300);
                }
            });
            
            // Toggle current item
            if (isCurrentlyOpen) {
                question.classList.remove('is-open');
                $(content).slideUp(300);
            } else {
                question.classList.add('is-open');
                $(content).slideDown(300);
            }
        });
    });
};

// Initialize list03 accordion
initList03Accordion();