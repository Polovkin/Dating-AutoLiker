let idArr = document.querySelectorAll('.tf-rd-feed-body_item-new');
alert(idArr[1]);

function clickOnMail() {
    let arr = document.querySelectorAll('tbody tr');
    for (let i = 0; i < arr.length; i++) {
        if (i % 3 === 0) {

        }
    }
}

clickOnMail();


arr = document.querySelectorAll('tbody tr[role="row"]');
for (let i = 0; i < arr.length; i++) {
    if (i===3) {
        idName = arr[i].getAttribute('id');
        document.getElementById(idName).click();
    }
}



arr = document.querySelectorAll('li[data-tooltip="Архивировать"]');
let className;
for (let i = 0; i < arr.length; i++) {
    if (i % 2 === 0) {
        setInterval()
        let a = arr[i].getAttribute('class');
        className = a.split(' ')[0];
        document.getElementsByClassName(className)[0].click();
    }
}

documnet.getElementsByTagName().click();
document.getElementsByClassName('profile-action--yes')[0].click();
