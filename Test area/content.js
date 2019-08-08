

window.count = 0;
window.started = false;

function start() {
  console.log('start');

    started = true;
    window.badooInterval = setInterval(e => {
      window.document.querySelectorAll('sidebar__logo').click();
      let limit = document.querySelectorAll('.ovl__content');
      if (!limit.length && eval(`limit[0].innerText.search("You're out of votes!") > -1`)) {
        console.log('усе! концерт окончен.!. приходите завтра,1,')
        clearInterval(window.badooInterval);
        console.log('Успели поставить лайков => ' + count);
      } else {
        window.createDiv();
        count++;
        console.log('Поставили лайков => ' + count);
      }

    }, 1000);

}
start();
function stop() {
  console.log('stop')
  clearInterval(window.badooInterval);
  started = false;
}
function mouseEnter(e) {
  e.target.style.background = 'red'
  e.target.style.border = "3px solid red"
}
function mouseLeave(e) {
  e.target.style.background = 'unset'
  e.target.style.border = "3px solid white"
}



