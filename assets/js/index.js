document.addEventListener('DOMContentLoaded', () => {
  const { location: { pathname } } = window
  switch (pathname) {
    case pathname.startsWith('/index') ? pathname : '/' :
    case '/sustaindao':
    case '/miestro':
    case '/concave':
      document.querySelector('html').classList.add('dark');
      break;
    default: break;
  }
  let logo = document.querySelector('nav img')
  if (document.querySelector('html').classList.contains('dark')) {
    logo.src = logo.dataset.dark_src;
  } else {
    logo.src = logo.dataset.src;
  }
  const getMobileOS = () => {
    const ua = navigator.userAgent
    if (/android/i.test(ua)) {
      return "Android"
    }
    if (/iPhone/.test(ua)) {
      return "Iphone"
    }
    else if (/iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) {
      return "iOS"
    }
    return "Other"
  }
  let os = getMobileOS();
  let button = document.querySelector("#learn-more");
  if(button){
    button.onclick = () => {
      doScrolling("#works", os === 'Iphone' ? 300 : os === "iOS" ? 1000 : 50);
    };
  }
  let btnGroup = document.querySelectorAll('.btn-group')
  btnGroup.forEach(group => {
      let anchors = [...group.children]
      anchors.forEach(a => {
         const { location: { pathname } } = window;
          if(pathname !== '/'){
            a.href = a.dataset.href;
            return;
          }
          a.addEventListener('click', e => {
            let str = e.target.dataset.href;
            let res = str.match(/#\w+/g).toString();
            doScrolling(`${res}`, os === 'Iphone' ? 300 : os === "iOS" ? 1000 : 50)
          })
      })
     
  })

  function getElementY(query) {
    return (
      window.pageYOffset +
      document.querySelector(query).getBoundingClientRect().top
    );
  }

  function doScrolling(element, duration) {
    var startingY = window.pageYOffset;
    var elementY = getElementY(element);
    var targetY =
      document.body.scrollHeight - elementY < window.innerHeight
        ? document.body.scrollHeight - window.innerHeight
        : elementY;
    var diff = targetY - startingY;
    var easing = function (t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    };
    var start;

    if (!diff) return;
    window.requestAnimationFrame(function step(timestamp) {
      if (!start) start = timestamp;
      var time = timestamp - start;
      var percent = Math.min(time / duration, 1);
      percent = easing(percent);
      window.scrollTo(0, startingY + diff * percent);
      if (time < duration) {
        window.requestAnimationFrame(step);
      }
    });
  }

    const form = document.getElementById('submit-data');
    const username = document.getElementById('fullname');
    const email = document.getElementById('email');
    const message = document.getElementById('message');
    let modal = document.getElementById('success-modal')

    function openSuccessModal(){
      modal.style.animation = 'fadeIn 2s';
      modal.classList.remove('opacity-0')
      modal.classList.remove('z-[-1]')
      form.classList.add('opacity-0')
    }

    form.addEventListener('submit',function(e) {
      e.preventDefault()
      let errorMessages = [];
      if(username.value === '' || username.value.length < 3){
        errorMessages.push({type:'fullname', value:'Username is required and should be at least 3 characters long'})
      } else {
        username.nextElementSibling.innerText=''
      }
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(!re.test(email.value.trim())){
        errorMessages.push({type:'email', value:'Email is not valid.'})
      } else {
        email.nextElementSibling.innerText=''
      }
      if(message.value === '' || message.value.length < 3){
        errorMessages.push({type:'message', value:'Message is required and should be at least 3 characters long'})
      } else {
        message.nextElementSibling.innerText=''
      }
      if(errorMessages.length > 0){
        return errorMessages.map(message => {
          console.log(message)
          let inputsDiv = e.target.querySelectorAll('.form-input')
          inputsDiv.forEach(el => {
            let input = el.children[0]
            if(input.id === message.type){
              input.nextElementSibling.innerText = message.value
            }
          })
        })
      }
      openSuccessModal()
    });
    document.querySelector('.close-btn').addEventListener('click', e => {
      modal.style.animation = 'fadeOut 1.5s';
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.classList.add('z-[-1]')
        form.classList.remove('opacity-0')
      },1500)
    })
})
