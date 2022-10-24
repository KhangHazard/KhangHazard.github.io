// Validation Sign in
var usernameSignin = document.querySelector('#usernameSignin')
var passwordSignin = document.querySelector('#passwordSignin')
var formSigninValid = document.querySelector('.form-signin')


function showError(input, message){
  let parent = input.parentElement;
  let small = parent.querySelector('.small-signin')
  parent.classList.add('errorSignin')
  small.innerText = message
}

function showSuccess(input){
  let parent = input.parentElement;
  let small = parent.querySelector('.small-signin')
  parent.classList.remove('errorSignin')
  small.innerText = ''
}

function checkEmptyError(listInput){
  let isEmptyError = false;
  listInput.forEach(input => {
    input.value = input.value.trim()

    if (!input.value){
      isEmptyError = true;
      showError(input, 'Cannot be empty')
    }else{
      showSuccess(input)
    }
  });

  return isEmptyError;
}



// function checkLengthError(input, min, max){
//   input.value = input.value.trim()

//   if (input.value.length < min){
//     showError(input, `Must have at least ${min} characters.`)
//     return true
// }

//   if (input.value.length > max){
//     showError(input, `Must not exceed ${max} characters.`)
//     return true
//   }

//   return false
// }

formSigninValid.addEventListener('submit', function(e){
  e.preventDefault()
  
  let isEmptyError = checkEmptyError([usernameSignin, passwordSignin])
  // let isUsernameLengthError = checkLengthError(usernameSignin, 8, 24)
})



// Validation Sign up
var usernameSignup = document.querySelector('#usernameSignup')
var passwordSignup = document.querySelector('#passwordSignup')
var email = document.querySelector('#email')
var rePassword = document.querySelector('#re-password')
var checkBox = document.querySelector('#check-box')
var formSignupValid = document.querySelector('.form-signup')


function showErrorSignup(inputSignup, messageSignup){
  let parentSignup = inputSignup.parentElement;
  let smallSignup = parentSignup.querySelector('.small-signup')
  parentSignup.classList.add('errorSignup')
  smallSignup.innerText = messageSignup
}

function showSuccessSignup(inputSignup){
  let parentSignup = inputSignup.parentElement;
  let smallSignup = parentSignup.querySelector('.small-signup')
  parentSignup.classList.remove('errorSignup')
  smallSignup.innerText = ''
}

function checkEmptyErrorSignup(listInputSignup){
  let isEmptyErrorSignup = false;
  listInputSignup.forEach(inputSignup => {
    inputSignup.value = inputSignup.value.trim()

    if (!inputSignup.value){
      isEmptyErrorSignup = true;
      showErrorSignup(inputSignup, 'Cannot be empty')
    }else{
      showSuccessSignup(inputSignup)
    }
  });

  return isEmptyErrorSignup;
}

function checkEmailErrorSignup(inputSignup){
  const regexEmail =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  inputSignup.value = inputSignup.value.trim()
  let isEmailErrorSignup = !regexEmail.test(inputSignup.value)
  if (regexEmail.test(inputSignup.value)){
    showSuccessSignup(inputSignup)
  } else{
    showErrorSignup(inputSignup, 'Email Invalid')
  }

  return isEmailErrorSignup
}

function checkLengthErrorSignup(inputSignup, minSignup, maxSignup){
  inputSignup.value = inputSignup.value.trim()

  if (inputSignup.value.length < minSignup){
    showErrorSignup(inputSignup, `Must have at least ${minSignup} characters.`)
    return true
}

  if (inputSignup.value.length > maxSignup){
    showErrorSignup(inputSignup, `Must not exceed ${maxSignup} characters.`)
    return true
  }

  return false
}

function checkMatchPasswordErrorSignup(passwordInput, rePasswordInput){
  if (passwordInput.value !== rePasswordInput.value){
    showErrorSignup(rePasswordInput, 'The passwords entered do not match.')
  }
}

function checkCheckBoxeError(theForm) {
  if (
  theForm.checked === false) 
  {
      alert ('You didn\'t choose any of the checkboxes!');
      return false;
  } else {    
      return true;
  }
}

formSignupValid.addEventListener('submit', function(e){
  e.preventDefault()

  let isEmptyErrorSignup = checkEmptyErrorSignup([usernameSignup, email, passwordSignup, rePassword])
  let isEmailErrorSignup = checkEmailErrorSignup(email)
  let isUsernameLengthErrorSignup = checkLengthErrorSignup(usernameSignup, 8, 24)
  let isPasswordLengthErrorSignup = checkLengthErrorSignup(passwordSignup, 8, 24)
  let isMatchErrorSignup = checkMatchPasswordErrorSignup(passwordSignup, rePassword)
  let isCheckBoxErrorSignup = checkCheckBoxeError(checkBox)

})