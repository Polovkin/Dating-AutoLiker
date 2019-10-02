


function checkId (arr,i) {
    let arrId = [];
    let itemId = arr.getElementsByClassName(bodyItemClass +'-warn')[0].getAttribute('data-id');

};
function checkCity(arr,i) {
    return arr[i].getElementsByClassName(bodyItemClass +'-user-city')[0].innerHTML === 'Киев';
}
let bodyItemClass = 'tf-rd-feed-body_item';
let arr = document.getElementsByClassName(bodyItemClass);




function deleteProfile (arr,i) {
   return arr[i].getElementsByClassName('tf-rd-feed-body_warn-menu tf-rd-none tf-rd-feed-body_warn-menu-mut')[0].getElementsByTagName('div')[2].click();
}

function sendMassage(arrElement) {

}
// Красаува. Удаляем повторяющиеся мачи и не из Киева


let elementInner;


let element;

for (let i = 0; i < arr.length; i++) {

    elementInner = arr[i].getElementsByClassName('tf-rd-feed-body_item-user-city')[0].innerHTML;// Получить город

    if (elementInner !== 'Киев') {
        elementSkip = arr[i].getElementsByClassName('tf-rd-feed-body_warn-menu tf-rd-none tf-rd-feed-body_warn-menu-mut')[0]; //Елемент с 3-мя div
        elementSkip.getElementsByTagName('div')[2].click(); // удаляем
    }
    arrId[i] = arr[i].getElementsByClassName('tf-rd-feed-body_item-warn')[0].getAttribute('data-id');
    //arrId[i] = element[0].getAttribute('data-id');

    console.log(arrId);
}

//arr[i]> проверить город, проверить айди, если чо - удалить.




for (let i = 0; i < arr.length; i++) {
    if (checkCity(arr[i]) || checkId(arr[i])) {
        deleteProfile(arr[i]);
        sendMassage(arr[i]);
    }
}




