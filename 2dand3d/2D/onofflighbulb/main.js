window.onload = function () {

    const lamp = document.getElementsByClassName('lamp')[0];
  
    window.addEventListener('click', function () {
      lamp.classList.toggle('is-on');
    });
  
  };