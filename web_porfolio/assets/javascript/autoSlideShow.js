
let autoSlideIndex = 0;
autoShowSlides();

function autoShowSlides() {
  let a;
  let autoSlides = document.getElementsByClassName("home__background");
  let autoDots = document.getElementsByClassName("auto-dot");
  for (a = 0; a < autoSlides.length; a++) {
    autoSlides[a].style.display = "none";  
  }
  autoSlideIndex++;
  if (autoSlideIndex > autoSlides.length) {autoSlideIndex = 1}    
  for (a = 0; a < autoDots.length; a++) {
    autoDots[a].className = autoDots[a].className.replace(" autoActive", "");
  }
  autoSlides[autoSlideIndex-1].style.display = "block";  
  autoDots[autoSlideIndex-1].className += " autoActive";
  setTimeout(autoShowSlides, 3000); // Change image every 2 seconds
}