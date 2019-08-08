function getRandomArbitrary(min, max) {
    return Math.ceil(Math.random() * (max - min) + min);
}

function checkUrl() {
    let currentAddress = String(window.location.href);

    // Cycle that check match URLS and redirect to cote area
    for (let i = 0; i < datingSites.length; i++) {
        //Check for vote area
        if (currentAddress === datingSites[i].addressVote) {
            return datingSites[i].voteFunction();
        }
        //Check for support sites and redirect to vote
        else if (currentAddress.includes(datingSites[i].addressUrl) === true) {
            return document.location.href = datingSites[i].addressVote;
        }
    }
    // Attention alert when URL incorrect
    // return alert('go to supported links');
}

let datingSites = [
    {
        name: 'mamba',
        addressUrl: 'https://mamba.ua',
        addressVote: 'https://mamba.ua/rating?from_item=2#/app',
        voteFunction: function mambaAutoLike() {
            let btnLikeName = '.photo-vote-ctrl-section__button';
            let btnSkipName = '.button_white_zone a:last-child';
            let i = 0;
            const timer = window.setInterval(function clickFor() {
                if (i === 250) {
                    window.clearInterval(timer);
                }
                i++;
                if (Boolean(document.querySelector(btnLikeName)) === true) {
                    document.querySelector(btnLikeName).click();
                } else {
                    document.querySelector(btnSkipName).click();
                }
            }, getRandomArbitrary(200, 1000));
        }
    },
    {
        name: 'topface',
        addressUrl: 'https://topface.com',
        addressVote: 'https://topface.com/dating/',
        voteFunction: function mambaAutoLike() {
            let btnLikeName = '.tf-rd-buttons-like-effect';
            let btnSkipName = '.button_white_zone a:last-child';
            let i = 0;
            const timer = window.setInterval(function clickFor() {
                if (i === 250) {
                    window.clearInterval(timer);
                }
                i++;
                document.querySelector(btnLikeName).click();
                // if (Boolean(document.querySelector(btnLikeName)) === true) {
                //     document.querySelector(btnLikeName).click();
                // } else {
                //     document.querySelector(btnSkipName).click();
                // }
            }, getRandomArbitrary(610, 700));
        }
    },
    {
        name: 'fotostrana',
        addressUrl: 'https://fotostrana.ru',
        addressVote: 'https://fotostrana.ru/meeting/',
        voteFunction: function fotostranaAutoLike() {
            let i = 0;
            const timer = window.setInterval(function clickFor() {
                if (i === 1000) {
                    window.clearInterval(timer);
                }
                i++;
                document.querySelector('.meet-yeap').click();
            }, getRandomArbitrary(100, 200));
        }
    },
    {
        name: 'tinder',
        addressUrl: 'https://tinder.com',
        addressVote: 'https://tinder.com/app/recs',
        voteFunction:  function tinderAutoLike() {
            let i = 0;
            const likeButton = document.getElementsByClassName("button Lts($ls-s) Z(0) Cur(p) Tt(u) Bdrs(50%) P(0) Fw($semibold) recsGamepad__button D(b) Bgc(#fff) Wc($transform) End(15px) Scale(1.1):h");
            const timer = window.setInterval(function clickFor() {
                if (i === 300) {
                    window.clearInterval(timer);
                }
                i++;
                likeButton[0].click();
            }, getRandomArbitrary(300, 500));
        }
    },
    {
        name: 'badoo',
        addressUrl: 'https://badoo.com',
        addressVote: 'https://badoo.com/encounters',
        voteFunction: function badooAutoLike() {
            let i = 0;
            const likeButton = document.getElementsByClassName("profile-action--yes");
            const timer = window.setInterval(function clickFor() {
                if (i === 300) {
                    window.clearInterval(timer);
                }
                i++;
                likeButton[0].click();
            }, getRandomArbitrary(300, 500));
        }
    },
];

checkUrl();

