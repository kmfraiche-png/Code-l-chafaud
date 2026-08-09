// ==========================================
// VARIABLES DU JEU
// ==========================================
let mancheActuelle = 1;
let scoreJoueur = 0;
let scorePasseur = 0;

let boiteSecrete = "";
let reponseQ1 = "";
let reponseQ2 = "";

const bgMusic = document.getElementById("bg-music");
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// ==========================================
// EFFETS SONORES (Web Audio API)
// ==========================================
function playAnnonceChime() {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    playTone(880, 'sine', 0.15, 0);
    playTone(587.33, 'sine', 0.25, 0.15);
}

function playTone(freq, type, duration, delay) {
    setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }, delay * 1000);
}

// ==========================================
// SYNTHÈSE VOCALE AVEC DUCKING MUSICAL
// ==========================================
function parlerAnnonceur(texte, callback) {
    // Baisse temporaire du son de la musique (Ducking)
    bgMusic.volume = 0.2;
    playAnnonceChime();

    setTimeout(() => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(texte);
        const voices = synth.getVoices();

        const voixFr = voices.find(v => v.lang.includes('fr') && v.name.includes('Google')) 
                    || voices.find(v => v.lang.includes('fr'));

        if (voixFr) utterance.voice = voixFr;

        utterance.lang = 'fr-FR';
        utterance.rate = 0.85; 
        utterance.pitch = 0.8; 

        utterance.onend = () => {
            bgMusic.volume = 0.6; // La musique remonte
            if (callback) callback();
        };

        synth.speak(utterance);
    }, 400);
}

// ==========================================
// DÉMARRAGE DU JEU
// ==========================================
document.getElementById("btn-start").addEventListener("click", () => {
    document.getElementById("start-overlay").classList.add("hidden");
    
    // Lancer la musique
    bgMusic.volume = 0.6;
    bgMusic.play();

    // Diction des Règles Officielle
    const reglesText = "Bienvenue à tous les participants. Le jeu va bientôt commencer. Nom du jeu : Les Interrupteurs. Difficulté : Six de Cœur. Règles du jeu : Trois boîtes sont présentées : A, B et C. Une seule contient la liberté. Les deux autres contiennent de l'acide mortel. Le Passeur connaît la boîte gagnante. Le Joueur doit poser exactement deux questions à réponse obligatoire par OUI ou par NON. Règle impérative : Le Passeur a l'obligation stricte de mentir exactement une fois sur l'ensemble des deux questions. Pour gagner, le Joueur doit identifier la boîte contenant la liberté. S'il réussit, le joueur gagne la manche et remporte 4 points. Mais si le Joueur choisit une boîte remplie d'acide, le joueur perd la manche et les 4 points sont transférés au Passeur. Le jeu se déroule en deux manches. Préparation terminée. Le jeu commence.";

    parlerAnnonceur(reglesText, () => {
        changerBannerText("MANCHE 1 : Le Passeur doit secrètement choisir la boîte gagnante.");
    });
});

// ==========================================
// LOGIQUE DE LA PARTIE
// ==========================================
function changerBannerText(texte) {
    document.getElementById("banner-text").innerText = texte;
}

function choisirBoiteSecrete(boite) {
    boiteSecrete = boite;
    document.getElementById("passeur-controls").classList.add("hidden");
    document.getElementById("q1-controls").classList.remove("hidden");
    changerBannerText("La boîte a été choisie ! Le Joueur pose la Question 1 sur WhatsApp. Le Passeur enregistre sa réponse.");
}

function repondreQuestion(numQuestion, reponse) {
    if (numQuestion === 1) {
        reponseQ1 = reponse;
        document.getElementById("log-q1").innerHTML = `Question 1 : <b>${reponse}</b>`;
        document.getElementById("q1-controls").classList.add("hidden");
        document.getElementById("q2-controls").classList.remove("hidden");
        changerBannerText("Le Joueur pose la Question 2 sur WhatsApp. Le Passeur enregistre sa réponse.");
    } else if (numQuestion === 2) {
        reponseQ2 = reponse;
        document.getElementById("log-q2").innerHTML = `Question 2 : <b>${reponse}</b>`;
        document.getElementById("q2-controls").classList.add("hidden");
        document.getElementById("joueur-controls").classList.remove("hidden");
        changerBannerText("L'interrogatoire est terminé. Joueur, désignez la boîte gagnante !");
    }
}

function validerChoixJoueur(choix) {
    document.getElementById("joueur-controls").classList.add("hidden");

    const boxElem = document.getElementById(`box-${choix}`);

    if (choix === boiteSecrete) {
        // Victoire du Joueur
        scoreJoueur += 4;
        boxElem.classList.add("win");
        boxElem.querySelector(".box-status").innerText = "LIBERTÉ";
        document.getElementById("score-joueur").innerText = scoreJoueur;

        changerBannerText("GAME CLEAR ! Le joueur a trouvé la liberté.");
        parlerAnnonceur("Partie gagnée. Statut : Game Clear.");
    } else {
        // Défaite du Joueur / Victoire du Passeur
        scorePasseur += 4;
        boxElem.classList.add("lose");
        boxElem.querySelector(".box-status").innerText = "ACIDE";
        
        // Révéler la vraie boîte
        const realBox = document.getElementById(`box-${boiteSecrete}`);
        realBox.classList.add("win");
        realBox.querySelector(".box-status").innerText = "LIBERTÉ";

        document.getElementById("score-passeur").innerText = scorePasseur;

        changerBannerText("GAME OVER ! La boîte contenait de l'acide.");
        parlerAnnonceur("Vous êtes éliminés. Statut : Game Over.");
    }

    if (mancheActuelle === 1) {
        document.getElementById("next-manche-controls").classList.remove("hidden");
    } else {
        setTimeout(afficherFinDePartie, 3000);
    }
}

function lancerManche2() {
    mancheActuelle = 2;
    document.getElementById("manche-indicator").innerText = "MANCHE 2 / 2";
    document.getElementById("next-manche-controls").classList.add("hidden");

    // Re-initialiser les boîtes et l'historique
    document.querySelectorAll(".box").forEach(b => {
        b.className = "box";
        b.querySelector(".box-status").innerText = "";
    });
    document.getElementById("log-q1").innerHTML = "Question 1 : <i>En attente...</i>";
    document.getElementById("log-q2").innerHTML = "Question 2 : <i>En attente...</i>";

    document.getElementById("passeur-controls").classList.remove("hidden");
    changerBannerText("MANCHE 2 : Le Passeur doit secrètement choisir la boîte gagnante.");
}

function afficherFinDePartie() {
    let gagnantText = "";
    if (scoreJoueur > scorePasseur) {
        gagnantText = "Victoire finale du Joueur !";
    } else if (scorePasseur > scoreJoueur) {
        gagnantText = "Victoire finale du Passeur !";
    } else {
        gagnantText = "Égalité parfaite !";
    }

    changerBannerText(`FIN DU JEU. ${gagnantText}`);
    parlerAnnonceur(`Le jeu est terminé. ${gagnantText} Merci pour votre participation.`);
}
