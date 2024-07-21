const cards = [
    'https://picsum.photos/id/237/100/100', 
    'https://picsum.photos/id/238/100/100',
    'https://picsum.photos/id/239/100/100',
    'https://picsum.photos/id/240/100/100',
    'https://picsum.photos/id/241/100/100',
    'https://picsum.photos/id/242/100/100',
    'https://picsum.photos/id/243/100/100',
    'https://picsum.photos/id/244/100/100'
  ];
const gameBoard = document.getElementById('game-board');
const infos = document.getElementById('infos');
const win = document.getElementById('win');
const startButton = document.getElementById('start-game');
const resetButton = document.getElementById('reset-game');
let selectedCards = [];
//Chronomètre
let chrono = document.getElementById('chrono');
//On initialise est arrêté à true
let isStopped = true;
//On initialise les variables de temps à 0
let seconds = 0;
let minutes = 0;
//Secondes écoulées
let timeout = 0;

//Fonction pour démarrer le chrono
const startChrono = () => {
    if(isStopped){
        isStopped= false;
    }
    incrementSeconds();
   //On desactive le bouton start
   startButton.disabled = true;
}

//fonction pour arrêter le chrono
const stopChrono = () => {
    if(!isStopped){
        isStopped = true;
    }
    clearTimeout(timeout);
}

//Fonction pour incrémenter les secondes
const incrementSeconds = () => {
    if(isStopped){
        return;
    } else {
        seconds = parseInt(seconds);
        minutes = parseInt(minutes);
        //On incrémente les secondes
        seconds++;
        //On incrémente les minutes
        if(seconds >= 60){
            seconds = 0;
            minutes++;
        }
        //On affiche les secondes
        if(seconds < 10){
            seconds = "0" + seconds;
        }
        //On affiche les minutes
        if(minutes < 10){
            minutes = "0" + minutes;
        }

        chrono.textContent = `${minutes}:${seconds}`;
        timeout = setTimeout(incrementSeconds, 1000);
    }
}


//On démarre le chrono click sur le gameBoard 
startButton.addEventListener('click', startChrono);


//Fonction pour reset le jeu
resetButton.addEventListener('click', () => {
    gameBoard.innerHTML = '';
    win.innerHTML = '';
    selectedCards = [];
    allCards = duplicateArray(cards);
    allCards = shuffleArray(allCards);
    allCards.forEach(card => {
        const cardHtml = createCard(card);
        gameBoard.appendChild(cardHtml);
    });
    //On remet le chrono à 0
    minutes = 0;
    seconds = 0;
    chrono.innerHTML = "00:00";
    startButton.disabled = false;
    stopChrono();
});
    

//Fonction pour créer une carte
function createCard(cardUrl){
    const card = document.createElement('div');
    card.classList.add('card');
    card.dataset.value = cardUrl;

    const cardContent = document.createElement('img');
    cardContent.classList.add('card-content');
    cardContent.src= cardUrl;

    card.appendChild(cardContent);

    card.addEventListener('click', onCardClick);
    return card;
}

//Fonction pour dupliquer un tableau
function duplicateArray(arraySimple){
    let arrayDouble = [];
    arrayDouble.push(...arraySimple);
    arrayDouble.push(...arraySimple);

    return arrayDouble;
}

//Fonction pour mélanger un tableau
function shuffleArray(arrayToshuffle){
    const arrayShuffled = arrayToshuffle.sort(() => 0.5 - Math.random());
    return arrayShuffled;
}

//Fonction pour gérer le click sur une carte
function onCardClick(e){
    //Si le chrono n'est pas démarré, on ne peut pas cliquer sur les cartes
    if(startButton.disabled == true){
        //On retourne la carte cliquée
        const card = e.target.parentElement;
        card.classList.add('flip');
        //On ajoute une carte à la liste des cartes sélectionnées
        selectedCards.push(card);
        //Si on a déjà 2 cartes sélectionnées, pour éviter les bugs
        if(selectedCards.length > 2){
            selectedCards.forEach(card => {
                card.classList.remove('flip');
            });
            selectedCards = [];
            selectedCards.push(card);
            card.classList.add('flip');
        }
        //Si on a 2 cartes sélectionnées
        if(selectedCards.length == 2){
            setTimeout(() => {
                if(selectedCards[0].dataset.value == selectedCards[1].dataset.value){
                    //on a trouvé une paire
                    selectedCards[0].classList.add("matched");
                    selectedCards[1].classList.add("matched");
                    selectedCards[0].removeEventListener('click', onCardClick);
                    selectedCards[1].removeEventListener('click', onCardClick);
                    const allCardsNotMatched = document.querySelectorAll('.card:not(.matched)');
                    if(allCardsNotMatched.length == 0){
                        const winContent = document.createElement('p');
                        if(minutes == 0){
                            winContent.textContent = `Bravo, vous avez gagné en ${seconds} secondes`;
                        } else if(minutes >0) {
                            winContent.textContent = `Bravo, vous avez gagné en ${minutes} minutes et ${seconds} secondes`;
                        }
                        win.appendChild(winContent);
                        //On stocke le score en cookie
                        let score = `${minutes}:${seconds}`;
                        setCookie("score", score, 365);
                        //On stocke le score dans le tableau des scores en cookie
                        if (valueCookie("scores") != null){
                            let scores = JSON.parse(valueCookie("scores"));
                            let score = `${minutes}:${seconds}`;
                            let scoreSeconds = scoreInSeconds(score);
                            scores.push(scoreSeconds);
                            setCookie("scores", JSON.stringify(scores), 365);
                        } else {                            
                        let scores = [];
                        let score = `${minutes}:${seconds}`;
                        let scoreSeconds = scoreInSeconds(score);
                        scores.push(scoreSeconds);
                        setCookie("scores", JSON.stringify(scores), 365);
                        }
                        //On stocke le top score en cookie
                        if( valueCookie("topScore") == null || valueCookie("topScore") > score){
                            setCookie("topScore", score, 365);
                        }
                        //On met à jour l'affichage
                        displayTopScore();
                        displayLastScore();
                        displayAverageScore();
                        //On arrête le chronomètre
                        stopChrono();
                        clearTimeout(timeout);
                    }
                }
                else{
                    //on s'est trompé
                    selectedCards[0].classList.remove("flip");
                    selectedCards[1].classList.remove("flip");
                }
                selectedCards = [];
            }, 500);
        }
    }
}

let allCards = duplicateArray(cards);
//Mélanger le tableau
allCards = shuffleArray(allCards);
allCards.forEach(card => {
    const cardHtml = createCard(card);
    gameBoard.appendChild(cardHtml);
})

//Fonction pour créer un cookie
function setCookie(name, value, days){
    let date = new Date();
    date.setTime(date.getTime() + (days*24*60*60*1000));
    let expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

//Fonction pour récupérer la valeur d'un cookie
function valueCookie(name){
    let cookieName = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split(';');
    for(let i = 0; i < cookieArray.length; i++){
        let cookie = cookieArray[i];
        while(cookie.charAt(0) == ' '){
            cookie = cookie.substring(1);
        }
        if(cookie.indexOf(cookieName) == 0){
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return null;
}


//Fonction pour récupérer le score en secondes
function scoreInSeconds(score){
    let scoreArray = score.split(':');
    let scoreSeconds = parseInt(scoreArray[0])*60 + parseInt(scoreArray[1]);
    return scoreSeconds;
}

//Fonction pour afficher le Top Score
function displayTopScore(){
    let topScore = valueCookie("topScore");
    let topScoreElement = document.getElementById('top-score');
    if(topScore != null){
        topScoreElement.textContent = `Top score : ${topScore}`;
    }
    else{
        topScoreElement.textContent = "Top score : Pas de score";
    }
}

//Fonction pour afficher le dernier score
function displayLastScore(){
    let lastScore = valueCookie("score");
    let lastScoreElement = document.getElementById('last-score');
    if(lastScore != null){
        lastScoreElement.textContent = `Dernier score : ${lastScore}`;
    }
    else{
        lastScoreElement.textContent = "Dernier score : Pas de score";
    }   
}

//On affiche le score moyen
function displayAverageScore(){
    if(valueCookie("scores") == null){
        return;
    }
    let scores = JSON.parse(valueCookie("scores"));
    let total = 0;
    scores.forEach(score => {
        total += score;
    });
    let average = total / scores.length;
    //On convertit en minutes et secondes
    let averageMinutes = Math.floor(average / 60);
    //On récupère le reste de la divisione et on arrondit à l'entier le plus proche
    let averageSeconds = Math.round(average % 60);
    average = `${averageMinutes}:${averageSeconds}`;
    let averageElement = document.getElementById('average-score');
    averageElement.textContent = `Score moyen : 0${average}`;
}

displayTopScore();
displayLastScore();
displayAverageScore();






