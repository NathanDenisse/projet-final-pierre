//dimension zone de jeu
var LARGEUR = window.innerWidth;
var HAUTEUR = window.innerHeight;

var angle = 90;

// variables pour les scores
var vie, score, best;
vie = 3;
score = 0;
best = 0;
var statut = "start";

var canvas;

//variables pour créer les sprites
var nebula, vaisseau, start;
//variables pour les images
var nebulaImg,
  vaisseauImg,
  thrustImg,
  rockImg,
  laserImg,
  startImg,
  explosionImg;
flecheImg;
//variables pour les groupes
var rock_groupe, laser_groupe;

function preload() {
  //télécharger les images ici
  nebulaImg = loadImage("nebula.jpeg");
  vaisseauImg = loadImage("spaceship.png");
  thrustImg = loadImage("thrust.png");
  rockImg = loadImage("rock.png");
  laserImg = loadImage("laser.png");
  startImg = loadImage("play.png");
  flecheImg = loadImage("fleche.png");

  explosionImg = loadAnimation(
    "e0.png",
    "e1.png",
    "e2.png",
    "e3.png",
    "e4.png",
    "e5.png",
    "e6.png",
    "e7.png",
    "e8.png",
    "e9.png",
    "e10.png",
    "e11.png",
    "e12.png",
    "e13.png",
    "e14.png",
    "e15.png"
  );
}

function setup() {
  //créer et positionner le Canvas
  canvas = createCanvas(LARGEUR, HAUTEUR);
  canvas.position(0, 175);

  //créer le vaisseau
  vaisseau = createSprite(LARGEUR / 2, HAUTEUR / 2, 20, 20);
  vaisseau.addAnimation("spaceship", vaisseauImg);
  vaisseau.addAnimation("thrust", thrustImg);
  vaisseau.scale = 0.15;
  vaisseau.debug = false;
  vaisseau.setCollider("rectangle", 0, 0, 450, 350);
  vaisseau.visible = false;

  //créer les groupe
  rock_groupe = createGroup();
  laser_groupe = createGroup();

  //Bouton Start
  start = createSprite(LARGEUR * 0.1, HAUTEUR * 0.25, 20, 20);
  start.addImage(startImg);
  start.scale = 0.1;

  //Flèche Rouge
  fleche = createSprite(LARGEUR * 0.1, HAUTEUR * 0.1);
  fleche.addImage(flecheImg);
  fleche.scale = 0.25;
  fleche.rotation = 90;
}

function draw() {
  // Permet d'enlever le background
  clear();

  // START
  if (statut === "start") {
    //mettre le background invisible
    background(0, 0);
    start.visible = true;
    fleche.visible = true;

    //Donner les instructions pour jouer
    fill("black");
    textSize(16);
    text(
      "COMMANDES\nTourner à gauche : Q \nTourner à droite : D \nAvancer : Z  \nTirer : ENTRER",
      LARGEUR * 0.02,
      HAUTEUR * 0.7,
      300
    );

    //Appuyer sur le bouton Start
    if (mousePressedOver(start)) {
      start.visible = false;
      statut = "play";
      vaisseau.visible = true;
      fleche.visible = false;
    }
  }

  //tourner le vaisseau
  vaisseau.rotation = angle;

  if (keyDown("q")) {
    angle -= 10;
  }
  if (keyDown("d")) {
    angle += 10;
  }
  //faire avancer le vaisseau
  if (keyDown("z")) {
    vaisseau.velocityX += 5 * Math.cos(radians(angle));
    vaisseau.velocityY += 5 * Math.sin(radians(angle));
    vaisseau.changeAnimation("thrust");
  }
  if (keyWentUp("z")) {
    vaisseau.changeAnimation("spaceship");
  }
  //faire ralentir le vaisseau
  vaisseau.velocityX *= 0.9;
  vaisseau.velocityY *= 0.9;

  //traverser l'écran
  traverser(vaisseau);

  // PLAY
  if (statut === "play") {
    //mettre un fond noir transparent
    background(0, 150);

    //vies et score
    textFont("Georgia");
    textSize(30);
    fill("white");
    text("Lives : " + vie, 20, 80);
    text("Score : " + score, 20, 40);
    fill("red");
    text("Best : " + best, LARGEUR - 150, 40);

    //générer rocks et lasers
    rock_spawner();
    laser_spawner();

    //collision rocher-vaisseau
    for (var i = 0; i < rock_groupe.length; i++) {
      traverser(rock_groupe.get(i));

      if (rock_groupe.get(i).isTouching(vaisseau)) {
        var explosion1 = createSprite(
          rock_groupe.get(i).x,
          rock_groupe.get(i).y
        );
        explosion1.addAnimation("explosion", explosionImg);
        explosion1.scale = 3;
        explosion1.lifetime = 10;

        rock_groupe.get(i).destroy();
        vie -= 1;
      }
    }

    //collision rocher-laser
    for (var j = 0; j < laser_groupe.length; j++) {
      for (var k = 0; k < rock_groupe.length; k++) {
        if (laser_groupe.get(j).isTouching(rock_groupe.get(k))) {
          var explosion2 = createSprite(
            rock_groupe.get(k).x,
            rock_groupe.get(k).y
          );
          explosion2.addAnimation("explosion", explosionImg);
          explosion2.scale = 3;
          explosion2.lifetime = 10;

          laser_groupe.get(j).destroy();
          rock_groupe.get(k).destroy();
          score += 100;
        }
      }
    }
  }

  // GAME OVER
  if (vie === 0) {
    statut = "gameOver";
  }
  if (statut === "gameOver") {
    rock_groupe.destroyEach();
    laser_groupe.destroyEach();

    //text Game Over
    textFont("Georgia");
    textSize(60);
    fill("RED");
    text("GAME OVER", LARGEUR / 2 - 180, HAUTEUR * 0.22);

    vaisseau.visible = false;
    start.visible = true;
    if (score > best) {
      best = score;
    }

    //rejouer
    if (mousePressedOver(start)) {
      start.visible = false;
      statut = "play";
      vie = 3;
      vaisseau.visible = true;
      vaisseau.x = LARGEUR / 2;
      vaisseau.y = HAUTEUR / 2;
    }
  }

  drawSprites();
}
function traverser(sprite) {
  if (sprite.x > LARGEUR) {
    sprite.x = 0;
  }
  if (sprite.x < 0) {
    sprite.x = LARGEUR;
  }
  if (sprite.y > HAUTEUR) {
    sprite.y = 0;
  }
  if (sprite.y < 0) {
    sprite.y = HAUTEUR;
  }
}

function rock_spawner() {
  if (World.frameCount % 30 === 0) {
    //positions aléatoire du rocher
    var rockX, rockY;
    rockX = LARGEUR * Math.random();
    rockY = HAUTEUR * Math.random();

    while (
      Math.abs(rockX - vaisseau.x) < 100 &&
      Math.abs(rockY - vaisseau.y) < 100
    ) {
      rockX = LARGEUR * Math.random();
      rockY = HAUTEUR * Math.random();
    }

    var rock = createSprite(rockX, rockY, 30, 30);
    rock.addImage(rockImg);
    rock.scale = 0.15;
    rock.rotationSpeed = 3 * Math.random();
    rock.velocityY = (10 * Math.random() - 5) * (1 + score / 5000);
    rock.velocityX = (10 * Math.random() - 5) * (1 + score / 5000);
    rock.lifetime = 400;

    rock.setCollider("circle", 0, 0, 220);

    rock_groupe.add(rock);
  }
}

function laser_spawner() {
  if (keyDown("enter") && laser_groupe.length < 35) {
    var laser;
    laser = createSprite(vaisseau.x, vaisseau.y);
    laser.addImage(laserImg);
    laser.scale = 0.3;
    laser.rotation = angle;

    laser.x = vaisseau.x + 45 * Math.cos(radians(angle));
    laser.y = vaisseau.y + 45 * Math.sin(radians(angle));

    laser.velocityX = 8 * Math.cos(radians(angle));
    laser.velocityY = 8 * Math.sin(radians(angle));

    laser.lifetime = 100;

    laser_groupe.add(laser);
    //laser.debug = true;
    laser.setCollider("rectangle", -10, 0, 120, 60);
  }
}
