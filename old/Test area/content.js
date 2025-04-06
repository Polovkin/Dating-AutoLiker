let bodyItemClass = 'tf-rd-feed-body_item';
let mainArr = document.getElementsByClassName(bodyItemClass);
let arrId = [];
let openerArr = [];
function getRandomArbitrary(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

function refreshArr() {
    mainArr = document.getElementsByClassName(bodyItemClass);
    for (let i = 0; i < mainArr.length; i++) {
        arrId[i] = getId(mainArr, i)
    }

}

function getId(arr, i) {
    return arr[i].getElementsByClassName(bodyItemClass + '-warn')[0].getAttribute('data-id');
}

function checkCity(arr, i) {
    return arr[i].getElementsByClassName(bodyItemClass + '-user-city')[0].innerHTML === 'Киев';
}

function deleteProfile(arr, i) {
    return arr[i].getElementsByClassName('tf-rd-feed-body_warn-menu tf-rd-none tf-rd-feed-body_warn-menu-mut')[0].getElementsByTagName('div')[2].click();
}

function checkId(arr, i) {
    refreshArr();
    for (let j = arr.length; j > i; j--) {
        if (getId(arr, i) === arrId[j]) {
            return true
        }
    }
}

function useChatWindow(className) {
    return document.getElementsByClassName(className)[0];
}

function sendMassage(arr,i) {
    let inputMsg = () => {
        useChatWindow('messenger-chat-compose-input').value = 'Привет,ты мне понравилась. Когда можем встретится погулять?';
    };
    let send = () => {
        useChatWindow('messenger-chat-compose-send blue-button').click();
    };
    //Open window
    document.getElementsByClassName('tf-rd-search-button-title tf-rd-feed-body-button-msg-title')[i].click();
    //Input
    setTimeout(inputMsg, 1000);
    //Send
    setTimeout(send, 2000);
}

//Наконец-то работает
function start(arr) {
    refreshArr();
    for (let i = 0; i < arr.length; i++) {
        if (checkId(arr, i) === true || checkCity(arr, i) !== true) {
            deleteProfile(arr, i);
        }
    }
    refreshArr();
    let j = 0;
    const timer = window.setInterval(function clickFor() {
        if (j === arr.length) {
            window.clearInterval(timer);
        }
        sendMassage(arr,0);
        deleteProfile(arr,0);
        refreshArr();
        j++;
    }, 3000);
}

//Надо удалять с начала массива












