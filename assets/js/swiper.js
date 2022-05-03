const swiper = new Swiper('.swiper', {
    direction: 'vertical',
    loop: true,
    pagination: {
      el: '.swiper-pagination',
    },
    breakpoints: {
      320: {
        slidesPerView: 1,
        spaceBetween: 0
      },
      1300: {
        slidesPerView: 2,
        spaceBetween: -200,
        centeredSlides:true
      }
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    direction: 'horizontal',
  });
  