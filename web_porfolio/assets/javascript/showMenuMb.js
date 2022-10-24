var menuMbLink = document.querySelector('.mobile__menu-icon')
var menuMb = document.querySelector('.header__navbar-list');

function showMenuMb(){
    menuMb.classList.toggle('show-menu-mb')
}

menuMbLink.addEventListener('click', showMenuMb)