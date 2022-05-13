document.addEventListener('DOMContentLoaded', () => {
    
  const swiper = new Swiper('.swiper', {
    direction: 'vertical',
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable:true
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0,
        allowTouchMove:true
      },
      1300: {
        slidesPerView: 5,
        spaceBetween: 0,
        centeredSlides:true,
        allowTouchMove: false
      }
    },
    navigation: {
      nextEl: '.button-next',
      prevEl: '.button-prev',
    },
    direction: 'horizontal',
  });
  
  if (document.querySelector('html').classList.contains('dark')) {
      document.querySelectorAll('.swiper-slide').forEach(slide => slide.classList.add('slide-dark'))
    }
  })

 