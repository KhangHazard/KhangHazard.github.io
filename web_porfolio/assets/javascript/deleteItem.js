// SHOW FORM  SIGNIN/SIGNUP
const deleteItemLink1 = document.querySelector('.delete1')
const item1 = document.querySelector('.content__checkout-list .content__checkout-item:nth-child(1)')
const deleteItemLink2 = document.querySelector('.delete2')
const item2 = document.querySelector('.content__checkout-list .content__checkout-item:nth-child(2)')
const deleteItemLink3 = document.querySelector('.delete3')
const item3 = document.querySelector('.content__checkout-list .content__checkout-item:nth-child(3)')
const deleteItemLink4 = document.querySelector('.delete4')
const item4 = document.querySelector('.content__checkout-list .content__checkout-item:nth-child(4)')
const deleteItemLink5 = document.querySelector('.delete5')
const item5 = document.querySelector('.content__checkout-list .content__checkout-item:nth-child(5)')
const emptyCart = document.querySelector('.content__checkout-empty')
// const disable = document.querySelectorAll('.content__checkout-item')


function deleteItem1() {
    return item1.classList.add('delete-item')


}

function deleteItem2() {
    return item2.classList.add('delete-item')

}

function deleteItem3() {
    return item3.classList.add('delete-item')

}

function deleteItem4() {
    return item4.classList.add('delete-item')

}

function deleteItem5() {
    return item5.classList.add('delete-item')

}


let isItemDeleted1 =deleteItemLink1.addEventListener('click', deleteItem1)
let isItemDeleted2 =deleteItemLink2.addEventListener('click', deleteItem2)
let isItemDeleted3 =deleteItemLink3.addEventListener('click', deleteItem3)
let isItemDeleted4 =deleteItemLink4.addEventListener('click', deleteItem4)
let isItemDeleted5 =deleteItemLink5.addEventListener('click', deleteItem5)

if( isItemDeleted1 && isItemDeleted2  && isItemDeleted3 && isItemDeleted4 && isItemDeleted5){
    emptyCart.classList.add('show-empty-cart')
}
