// Éléments du DOM
const startOverlay = document.getElementById('start-overlay');
const btnStart = document.getElementById('btn-start');
const rulesModal = document.getElementById('rules-modal');
const btnRulesOk = document.getElementById('btn-rules-ok');
const gameContainer = document.getElementById('game-container');
const bgMusic = document.getElementById('bg-music');

const organizerView = document.getElementById('organizer-view');
const playerView = document.getElementById('player-view');
const whatsappSection = document.getElementById('whatsapp-section');
const selectedBoxLabel = document.getElementById('selected-box-label');
const btnWhatsapp = document.getElementById('btn-whatsapp');

const resultScreen = document.getElementById('result-screen');
const resultMessage = document.getElementById('result-message');

let targetBox = null;

// Vérification de la présence d'un paramètre 'target' dans l'URL (Lien Joueur)
const urlParams = new URLSearchParams(window.location.search);
const targetFromUrl = urlParams.get('target');

// Démarrage du jeu (Lancement musique)
btnStart.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    bgMusic.play().catch(e => console.log("Lecture audio restreinte"));

    if (targetFromUrl) {
        // C'est un Joueur : On saute l'affichage des règles et de la vue organisateur
        targetBox = atob(targetFromUrl); // Décodage de la boîte
        organizerView.classList.add('hidden');
        playerView.classList.remove('hidden');
        gameContainer.classList.remove('hidden');
    } else {
        // C'est l'Organisateur : Affichage des Règles
        rulesModal.classList.remove('hidden');
    }
});

// Bouton "J'ai compris" des règles
btnRulesOk.addEventListener('click', () => {
    rulesModal.classList.add('hidden');
    gameContainer.classList.remove('hidden');
});

// Choix de la boîte par l'Organisateur
function selectCorrectBox(box) {
    targetBox = box;
    selectedBoxLabel.textContent = box;
    whatsappSection.classList.remove('hidden');

    // Génération du lien codé pour WhatsApp
    const encodedBox = btoa(box);
    const gameUrl = `${window.location.origin}${window.location.pathname}?target=${encodedBox}`;
    
    const whatsappText = `Rejoins la partie des Interrupteurs (Alice in Borderland) ! Clique sur ce lien pour jouer : ${gameUrl}`;
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;

    btnWhatsapp.onclick = () => {
        window.open(whatsappUrl, '_blank');
    };
}

// Choix de la boîte par le Joueur
function playerChooseBox(chosenBox) {
    resultScreen.classList.remove('hidden');

    if (chosenBox === targetBox) {
        resultMessage.textContent = "VICTOIRE ! VOUS AVEZ TROUVÉ LA BONNE BOÎTE !";
        resultMessage.style.color = "#00ff66";
    } else {
        resultMessage.textContent = "GAME OVER";
        resultMessage.style.color = "#ff0033";
    }
}
