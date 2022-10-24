// SLIDESHOW
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("content__recommended-wrapper");
  let transferBtns = document.getElementsByClassName("transferBtn");
  if (n > slides.length) {slideIndex = 1}    
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";  
  }
  for (i = 0; i < transferBtns.length; i++) {
    transferBtns[i].className = transferBtns[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";  
  transferBtns[slideIndex-1].className += " active";
}