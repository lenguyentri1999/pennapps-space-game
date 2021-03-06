import * as firebase from 'firebase';

class Game extends Phaser.State {

    //---------------- INITIALIZE FIREBASE APP -------------------
    constructor() {
        super();
        firebase.initializeApp({
         apiKey: "AIzaSyBHKXbK6D4nZefsDB8Nt3pW6DNae_JgJsQ",
         authDomain: "pennapps2018.firebaseapp.com",
         databaseURL: "https://pennapps2018.firebaseio.com",
         projectId: "pennapps2018",
         storageBucket: "",
         messagingSenderId: "286224470364"
        });
    }

    //--------------- LOAD IMAGE OF SHIP  -------------
    preload(){
        this.game.load.image('ship', 'assets/sprites/spaceship.png');
        this.playerName = localStorage.getItem("playerName");
        this.obj ={
          playerName: this.playerName,
          status: "alive",
          currentScale: 0.5
        }
        console.log(this.playerName);

        //--------------------- LOAD IMAGE OF STAR ----------
        this.game.load.image('star', 'assets/sprites/star_2.png');
        this.foodArray = {};
        this.count = 0

        //---------- LOAD THE MUSIC ----------

    }

    create() {

      //----------- ADDING A FIELD OF STARS AS THE BACKGROUND ----------------
      this.starfield = this.game.add.tileSprite(0, 0, 1000, 800, 'background');
      //this.music = this.game.add.audio('4chanfrog');
      //this.music.play();

      //---------------- STORE A LIST OF PEOPLE AS PLAYERS ------------
        this.players = {};
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.game.add.sprite(200, 200, 'ship');
        this.player.scale.setTo(0.5, 0.5);
        const storedKey = localStorage.getItem('gmoon_key');
        if(storedKey !== 'null' && storedKey !== null) {
            this.player.key = storedKey;
        } else {
            this.player.key = this.uuidv4();
            localStorage.setItem('gmoon_key', this.player.key);
        }

        //------------- ENABLE THINGS THAT MOVE WITH POINTER ---------
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);


        //-------------- STORE PLAYER'S ID AS KEY AND POSITION AS VALUE ------------
        this.playerTexts = {}
        var otherStyle = {
          font: "32px Arial",
          fill: "#FFFFFF",
          wordWrap: true,
          wordWrapWidth: this.player.width,
          align: "center"
        };
        firebase.database().ref('players').on('child_added', child => {
            if(child.key !== this.player.key) {
                const p = this.game.add.sprite(child.val().x, child.val().y, 'ship');
                p.playerName = child.val().playerName;
                this.playerTexts[child.key] = this.game.add.text(0,0, child.val().playerName.toUpperCase(),otherStyle);
                p.scale.setTo(child.val().currentScale || 0.5, child.val().currentScale || 0.5);
                this.players[child.key] = p;

            }
        });
        firebase.database().ref('players').child(this.player.key).onDisconnect().set(null);
        firebase.database().ref('players').on('child_removed', child => {
            this.players[child.key].destroy();
        })

        this.game.time.events.loop(Phaser.Timer.SECOND, this.makeFood, this);

        //--------------- ADD PLAYER'S NAME AND STATUS AND SCALE TO THE DATABASE -----------------
        firebase.database().ref('players').child(this.player.key).set(this.obj);

        //=============== ADD THE TEXT ======================
        var style = {
          font: "20px Arial",
          fill: "#FFFFFF",
          wordWrap: true,
          wordWrapWidth: this.player.width,
          align: "center"
        };
        this.name = this.game.add.text(0,0, this.playerName.toUpperCase(),style);
        // this.name.anchor.set(0.5);
        console.log(this.playerTexts);

    }

    update() {

        /*firebase.database().ref('players').on('child_added', child => {
            if(child.key !== this.player.key) {
                const p = this.game.add.sprite(child.val().x, child.val().y, 'ship');
                p.playerName = child.val().playerName;
                this.playerTexts[child.key] = this.game.add.text(0,0, child.val().playerName.toUpperCase(),otherStyle);
                p.scale.setTo(child.val().currentScale || 0.5, child.val().currentScale || 0.5);
                this.players[child.key] = p;

            }
        });*/

      //-------- MOVE THE BACKGROUND AS THE PLAYER MOVES ---------
        this.starfield.tilePosition.y += 2;
        this.starfield.tilePosition.x += 2;

        //------------------ MOVE THE PLAYER SPACESHIP AS THE PLAYER POINTER MOVES ----------
        this.game.physics.arcade.moveToPointer(this.player, 60, this.game.input.activePointer, 161);
        firebase.database().ref('players').child(this.player.key).update(this.player.position);



        //-----------CHANGE TEXT TO FOLLOW SPRITE FOR THE USER ----------
        this.name.x = Math.floor(this.player.x+this.name.width);
        this.name.y = Math.floor(this.player.y);

        //-----------CHANGE TEXT TO FOLLOW SPRITE FOR OTHER USERS ----------
        for (var id in this.playerTexts){
          var otherText = this.playerTexts[id];
          otherText.x = Math.floor()
        }



        //-------------------- DRAW ALL THE FOOD ---------------------
        firebase.database().ref('players').once('value', (snap) => {
            snap.forEach(child => {
                if(child.key !== this.player.key) {
                    this.players[child.key].position.set(child.val().x, child.val().y);
                    this.players[child.key].currentScale = child.val().currentScale || 0.5
                    //Update text to follow players
                    this.playerTexts[child.key].x = child.val().x+this.name.width;
                    this.playerTexts[child.key].y = child.val().y;

                }
            })
        });


        //------------- WHEN PLAYER HITS A STAR -----------------
        // if (this.foodArray.length > 0){
          for (var starKey in this.foodArray){
            console.log(starKey);
            var boundsA = this.player.getBounds();
            var boundsB = this.foodArray[starKey].getBounds();
            console.log(this.foodArray[starKey])
            var collisionDetection = Phaser.Rectangle.intersects(boundsA, boundsB);
            console.log(collisionDetection)
            if (collisionDetection == true){
                //Make spaceship grows bigger
                this.count++;
                this.player.currentScale =0.5+0.01*this.count
                this.player.scale.setTo(this.player.currentScale, this.player.currentScale);
                firebase.database().ref('players').child(this.player.key).update({
                  currentScale: this.player.currentScale
                })
                this.foodArray[starKey].kill();
                firebase.database().ref("stars").child(starKey).remove();
                delete this.foodArray[starKey];

                console.log('successfully delete');
            }
          }
        // }


        //------------ CHECK COLLISION DETECTION OF OTHER PLAYERS ------
        for (var otherPlayer in this.players){
          try{
            var otherSprite = this.players[otherPlayer];
            console.log("other spriteeeeee", otherSprite);

              var boundsC = this.player.getBounds();
              var boundsD = otherSprite.getBounds();
              var eatOtherPeople = Phaser.Rectangle.intersects(boundsC, boundsD);



                  firebase.database().ref('players').child(otherPlayer).once('value').then(success => {

                      var otherscale = success.val().currentScale;

                      if (eatOtherPeople == true){
                          if(this.player.currentScale > otherscale){
                              firebase.database().ref('players').child(otherPlayer).update({status: "dead"});
                              //otherSprite.kill();
                          }
                          else if(this.player.currentScale < otherscale){
                              firebase.database().ref('players').child(this.player).update({status: "dead"});

                          }
                          else{ return }

                      }
                  });

                  firebase.database().ref('players').child(this.player.key).once('value').then(snap => {
                      if(snap.val().status == 'dead'){
                          //game.state.end
                          this.game.state.start('gameover');
                      }
                  });


          }

          catch(e){
            console.error(e);
          }


        }

    }


    //--------------- THIS FUNCTION IS CALLED WHEN GAME OVER --------------------
    endGame() {
        this.player.kill();
        delete this.player;

        this.game.state.start('menu');
    }

    //----------------------------- GENERATE RANDOM ID --------------------------
    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    //------------------ RANODMLY GENERATE FOOD -------------------
    makeFood() {
        const x = this.game.rnd.integerInRange(0, this.game.width);
        const y = this.game.rnd.integerInRange(0, this.game.height);
        const food = this.game.add.sprite(x, y, 'star');
        const foodKey = this.uuidv4();
        food.scale.setTo(0.015, 0.015);
        // this.foodArray.push(food);

        //---------- CREATE A FOOD OBJECT --------

        this.foodArray[foodKey] = food;
        console.log(this.foodArray);

        //---------------------- PUSH THE FOOD OBJECT TO FIREBASE --------------
        firebase.database().ref("stars").child(foodKey).set({status:"not eaten"});
    }


}

export default Game;
