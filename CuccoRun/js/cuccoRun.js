$(document).ready(function() {
   console.log("documentReady called")
   $('#startModal').modal('show')
   pause = true

   window.onkeydown = function(event) {
      if (event.keyCode == 80) {
         console.log("p was pressed")
         if (pause) {
            pause = false
            link.body.data.gravityScale = 1
            $("#pauseButton").html("Pause")
         }
         else {
            pause = true
            link.body.data.gravityScale = 0
            pausedY = link.position.y
            link.animations.stop(0)
            $("#pauseButton").html("Resume")
         }
      }
   }

   $('#submitScore').click(function () {
      console.log("submitScore button pressed " + $('#player_name').val())
      if ($('#player_name').val() != "") {
         writeData($('#player_name').val(), numberJumped)
         $('#player_name').prop("disabled", true)
         $('#submitScore').prop("disabled", true)
      }
   })

   $('#startModal').on('hidden.bs.modal', function () {
      console.log("modal hidden")
      pause = false
      //hitCucco() // for debug
   })
   $('#restartModal').on('hidden.bs.modal', function () {
      numberCuccos = 0
      numberJumped = 0
      game.world.removeAll()
      create()
      pause = false
      $('#player_name').prop("disabled", false)
      $('#submitScore').prop("disabled", false)
   })

   game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, '', { preload: preload, create: create, update: update });
});


var game
var link
var text
var cuccoGroup
var jumpButton
var groundLevel = window.innerHeight*.9
var cuccoCollisionGroup, linkCollisionGroup
var numberCuccos = 0
var numberJumped = 0
var tune, death_music
var pausedY = groundLevel
var isJumping = false
var isRising = false
var isFalling = false
var pause

WebFontConfig = {
   //  The Google Fonts we want to load (specify as many as you like in the array)
   google: {
      families: ['Revalia']
   }
};


function preload() {
   game.load.spritesheet("link", "assets/link6_sprite.png", 118, 120, 4)

   game.load.image("cucco", "assets/cucco.png")
   game.load.image("background", "assets/background.png")
   game.load.image("platform", "assets/platform.png")

   game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js')

   game.load.audio('hyrule', "assets/hyrule_field.mp3")
   game.load.audio('death', "assets/death.mp3")

   console.log(groundLevel)
   if (groundLevel > 768*.9) {
      groundLevel = 768*.9
      pausedY = groundLevel
   }
}


//Create a new game that fills the screen
//game = new Phaser.Game(window.innerWidth * window.devicePixelRatio, window.innerHeight * window.devicePixelRatio, Phaser.AUTO);
function create() {
   // Set the background colour to blue
   //game.stage.background
   //background = game.add.sprite(0, 0, "background")
   background = game.add.tileSprite(0, 0, 2000, window.innerHeight, "background")
   var style = { font: "32px Revalia", align: "center" };
   text = game.add.text(40, 30, "Cuccos: " + numberJumped, style);

   tune = game.add.audio('hyrule');
   death_music = game.add.audio('death')
   //tune.play();

   // Start the P2 Physics Engine
   game.physics.startSystem(Phaser.Physics.P2JS);
   game.physics.p2.setImpactEvents(true);

   // Set the gravity
   game.physics.p2.gravity.y = 1200;

   link = createObject("link", window.innerWidth*.3, groundLevel, 80, 120);
   link.body.setRectangle(60,100)
   linkCollisionGroup = game.physics.p2.createCollisionGroup()
   link.body.setCollisionGroup(linkCollisionGroup)
   link.animations.add('move', [3,2,1,0], 10, true);

   cuccoGroup = game.add.group()
   cuccoCollisionGroup = game.physics.p2.createCollisionGroup()
   generateCucco()
   link.body.collides(cuccoCollisionGroup)
   link.body.createGroupCallback(cuccoCollisionGroup, hitCucco, this)


   cursors = game.input.keyboard.createCursorKeys();
   jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
   //pauseButton = game.input.keyboard.addKey(Phaser.Keyboard.P);
}

function generateCucco() {
   numberCuccos++
   text.setText("Cuccos: " + numberJumped)

   cucco = createObject("cucco", window.innerWidth, link.position.y-(Math.floor(Math.random() * 150)));
   if (numberCuccos % (15-(numberCuccos/10)) < 1) {
      scale = 1.5
   }
   else if (numberCuccos % (5-(numberCuccos/10)) < 1) {
      scale = .7
   }
   else if (numberCuccos % (32-(numberCuccos/10)) < 1) {
      scale = 2.5
   }
   else {
      scale = .5
   }
   cucco.scale.setTo(scale, scale)
   cucco.body.setCircle(30*scale*2)
   cucco.body.data.gravityScale = 0

   cuccoGroup.add(cucco)
   cucco.body.setCollisionGroup(cuccoCollisionGroup)
   cucco.body.collides(linkCollisionGroup)
}


function createObject(objectName, y_start, x_start) {
   var object = game.add.sprite(y_start, x_start, objectName)
   game.physics.p2.enable(object, false);
   object.body.fixedRotation = true
   return object;
}


function hitCucco() {
   link.animations.stop()
   //tune.stop()
   link.body.setZeroVelocity()
   link.body.data.gravityScale = 0
   pausedY = link.body.y
   console.log("pausedY is " + pausedY)
   death_music.play()
   pause = true
   window.setTimeout(function() {
      $('#restartModal').modal('show')
      $('h2').html("You died after " + numberJumped + " Cuccos")
      $('#highScores').load('scoreBoard.html')

      readData()
   }, 300);
   //localStorage.setItem("diedOnce", "true")
}


function update() {
   //console.log(pause)
   if (link.position.y >= groundLevel) {
      link.body.velocity.y = 0
      link.body.y = groundLevel
   }
   if (link.position.y < 50) {
      link.body.velocity.y = 0
      link.body.y = 50
   }

   if (pause) {
      console.log(pausedY)
      link.body.y = pausedY
   }
   if (!pause) {
      if (cuccoGroup.getAt(cuccoGroup.length - 1).position.x < (window.innerWidth*.5 + 5*numberCuccos)) {
         generateCucco()
      }

      background.tilePosition.x -= (2.5 + isJumping)
      link.animations.play('move');

      // if (jumpButton.isDown) {
      //    link.body.moveUp(600);
      //    isJumping = true
      // }
      // else {
      //    isJumping = false
      // }
      if (jumpButton.isDown) {
         if (!isFalling) {
            isRising = true
            isJumping = true
         }
      }
      else {
         if (isRising) {
            isRising = false
            isFalling = true
         }
      }

      if (isRising) {
         link.body.moveUp(600)
      }
      if (isFalling && link.position.y >= groundLevel) {
         isFalling = false
         isJumping = false
      }
   }

   //console.log(cuccoGroup.length)
   cuccoGroup.forEach(function(cucco) {
      cucco.body.velocity.y = 0
      if (!pause) {
         //console.log("moving left")
         cucco.body.moveLeft(200+(7*numberCuccos)*(isJumping+1))
      }
      else {
         cucco.body.setZeroVelocity()
      }

      if (cucco.position.x < 2 && cucco.position.x > -2 && !pause) {
         numberJumped++
         text.setText("Cuccos: " + numberJumped)
      }
   })
}

function changeVolume(pointer) {
    if (pointer.y < 100) {
        music.mute = false;
    }
    else if (pointer.y < 300) {
        music.volume += 0.1;
    }
    else {
        music.volume -= 0.1;
    }
}
