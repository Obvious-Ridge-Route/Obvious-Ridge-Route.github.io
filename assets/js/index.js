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
      modal.classList.remove('hidden')
    }

    function showError(input, message) {
       let error = input.nextElementSibling;
       error.innerText = message;
    }

    function showSucces(input) {
        input.nextElementSibling.innerText=''
        let messages = document.querySelectorAll('.warning-message');
        let isValid = [...messages].every(message => message.innerText.length === 0)
        if(isValid){
          openSuccessModal()
        }
      }

    function checkEmail(input) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if(re.test(input.value.trim())) {
            showSucces(input)
        }else {
            showError(input,'Email is not invalid');
        }
    }

    function checkLength(input, min ,max) {
        if(input.value.length < min) {
            showError(input, `${getFieldName(input)} must be at least ${min} characters`);
        }else if(input.value.length > max) {
            showError(input, `${getFieldName(input)} must be les than ${max} characters`);
        }else {
            showSucces(input);
        }
    }

    //get FieldName
    function getFieldName(input) {
        return input.id.charAt(0).toUpperCase() + input.id.slice(1);
    }
    form.addEventListener('submit',function(e) {
        e.preventDefault();
        checkLength(username,3,15);
        checkLength(message,3,250);
        checkEmail(email);
    });

    document.addEventListener('click', e => {
      if(e.target.id === 'success-modal' || e.target.classList[0] === 'close-btn'){
        modal.classList.add('hidden')
      }
    })

})
