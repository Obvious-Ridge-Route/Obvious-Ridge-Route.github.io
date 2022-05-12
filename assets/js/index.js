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
})
