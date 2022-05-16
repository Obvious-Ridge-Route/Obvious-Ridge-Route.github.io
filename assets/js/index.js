document.addEventListener('DOMContentLoaded', () => {
  const {
    location: { pathname },
  } = window;
  switch (pathname) {
    case pathname.startsWith('/index') ? pathname : '/':
    case '/sustaindao':
    case '/miestro':
    case '/concave':
      document.querySelector('html').classList.add('dark');
      break;
    default:
      break;
  }
  let logo = document.querySelector('nav img');
  if (document.querySelector('html').classList.contains('dark')) {
    logo.src = logo.dataset.dark_src;
  } else {
    logo.src = logo.dataset.src;
  }
  let button = document.querySelector('#learn-more');
  if (button) {
    button.onclick = () => {
      zenscroll.to(document.getElementById('works'));
    };
  }
  let btnGroup = document.querySelectorAll('.btn-group');
  btnGroup.forEach((group) => {
    let anchors = [...group.children];
    anchors.forEach((a) => {
      const {
        location: { pathname },
      } = window;
      if (pathname !== '/') {
        a.href = a.dataset.href;
        return;
      }
      a.addEventListener('click', (e) => {
        let str = e.target.dataset.href;
        let res = str.match(/#\w+/g).toString();
        zenscroll.to(document.querySelector(`${res}`));
      });
    });
  });
  const form = document.getElementById('submit-data');
  const username = document.getElementById('fullname');
  const email = document.getElementById('email');
  const message = document.getElementById('message');
  let modal = document.getElementById('success-modal');

  function openSuccessModal() {
    modal.style.animation = 'fadeIn 2s';
    modal.classList.remove('opacity-0');
    modal.classList.remove('z-[-1]');
    form.classList.add('opacity-0');
    message.value = '';
    email.value = '';
    username.value = '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    let errorMessages = [];
    if (username.value === '' || username.value.length < 3) {
      errorMessages.push({
        type: 'fullname',
        value:
          'Username is required and should be at least 3 characters long',
      });
    } else {
      username.nextElementSibling.innerText = '';
    }
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email.value.trim())) {
      errorMessages.push({
        type: 'email',
        value: 'Email is not valid.',
      });
    } else {
      email.nextElementSibling.innerText = '';
    }
    if (message.value === '' || message.value.length < 3) {
      errorMessages.push({
        type: 'message',
        value:
          'Message is required and should be at least 3 characters long',
      });
    } else {
      message.nextElementSibling.innerText = '';
    }
    if (errorMessages.length > 0) {
      return errorMessages.map((message) => {
        let inputsDiv = document.querySelectorAll('.form-input');
        inputsDiv.forEach((el) => {
          let input = el.children[0];
          if (input.id === message.type) {
            input.nextElementSibling.innerText = message.value;
          }
        });
      });
    }
    openSuccessModal();
  });
  document
    .querySelector('.close-btn')
    .addEventListener('click', (e) => {
      modal.style.animation = 'fadeOut 1.5s';
      modal.classList.add('opacity-0');
      setTimeout(() => {
        modal.classList.add('z-[-1]');
        form.classList.remove('opacity-0');
      }, 1500);
    });
});
