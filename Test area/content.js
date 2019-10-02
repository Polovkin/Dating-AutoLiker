let bodyItemClass = 'tf-rd-feed-body_item';
let mainArr = document.getElementsByClassName(bodyItemClass);
let arrId = [];

function refreshArr(arr, arr2) {
    arr = document.getElementsByClassName(bodyItemClass);
    for (let i = 0; i < mainArr.length; i++) {
        arr2[i] = getId(arr, i)
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
    refreshArr(arr, arrId);
    for (let j = arr.length; j > i; j--) {
        if (getId(arr, i) === arrId[j]) {
            return true
        }
    }
}

//Наконец-то работает
function deleteAllProfile(arr) {
    refreshArr(mainArr, arrId);
    for (let i = 0; i < arr.length; i++) {
        if (checkId(arr, i) === true || checkCity(arr,i) !== true) {
            deleteProfile(arr,i);
        }
    }
}








