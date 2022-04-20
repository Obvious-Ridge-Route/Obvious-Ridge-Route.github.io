document.addEventListener('DOMContentLoaded', () => { 
    let button = document.querySelector("#learn-more");
    button.onclick = () => {
      let os = getMobileOS()
      doScrolling("#main", os === 'Iphone' ? 300 : os === "iOS" ? 1000 : 50);
    };
    
    const getMobileOS = () => {
      const ua = navigator.userAgent
      if (/android/i.test(ua)) {
        return "Android"
      }
      if(/iPhone/.test(ua)){
        return "Iphone"
      }
      else if (/iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)){
        return "iOS"
      }
      return "Other"
    }
    
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