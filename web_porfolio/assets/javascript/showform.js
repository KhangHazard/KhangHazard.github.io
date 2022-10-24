// SHOW FORM  SIGNIN/SIGNUP
const showFormLink = document.querySelector('.js-buy-ticket')
const formSignin = document.querySelector('.form-signin')
const formSignup = document.querySelector('.form-signup')
const formContainerSignin = document.querySelector('.js-form-container-signin')
const formContainerSignup = document.querySelector('.js-form-container-signup')
const formBackSignin = document.querySelector('.js-form-back-signin')
const formCloseSignin = document.querySelector('.js-form-close-signin')
const formCloseSignup = document.querySelector('.js-form-close-signup')
const formSignupLink = document.querySelector('.signup-link')

function showSignin() {
    formSignin.classList.add('openSignin')
    formSignup.classList.remove('openSignup')
}

function hideSignin() {
    formSignin.classList.remove('openSignin')
}

function showSignup() {
    formSignup.classList.add('openSignup')
    formSignin.classList.remove('openSignin')
}

function hideSignup() {
    formSignup.classList.remove('openSignup')
}

showFormLink.addEventListener('click', showSignin)

formSignupLink.addEventListener('click', showSignup)

formBackSignin.addEventListener('click', showSignin)
formCloseSignin.addEventListener('click', hideSignin)
formCloseSignup.addEventListener('click', hideSignup)

formSignin.addEventListener('click', hideSignin)
formSignup.addEventListener('click', hideSignup)


formContainerSignin.addEventListener('click', function (event) {
    event.stopPropagation()
})

formContainerSignup.addEventListener('click', function (event) {
    event.stopPropagation()
})