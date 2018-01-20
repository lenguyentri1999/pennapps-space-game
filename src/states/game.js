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

    //--------------- LOAD IMAGE OF SHIP --------
    preload(){
        this.game.load.image('ship', 'assets/sprites/spaceship.png');
        this.game.load.image('bg', 'assets/background.jpg')
    }

    create() {

      this.starfield = this.game.add.tileSprite(0, 0, 1000, 800, 'background');

      //---------- STORE A LIST OF PEOPLE AS PLAYERS ------------
        this.players = {};
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.game.add.sprite(200, 200, 'ship');
        this.player.scale.setTo(0.25, 0.25);
        const storedKey = localStorage.getItem('gmoon_key');
        if(storedKey !== 'null' && storedKey !== null) {
            this.player.key = storedKey;
        } else {
            this.player.key = this.uuidv4();
            localStorage.setItem('gmoon_key', this.player.key);
        }

        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

        //-------------- STORE PLAYER'S ID AS KEY AND POSITION AS VALUE ------------
        firebase.database().ref('players').on('child_added', child => {
            if(child.key !== this.player.key) {
                const p = this.game.add.sprite(child.val().x, child.val().y, 'ship');
                p.scale.setTo(0.25, 0.25);
                this.players[child.key] = p;
            }
        });
        firebase.database().ref('players').child(this.player.key).onDisconnect().set(null);
        firebase.database().ref('players').on('child_removed', child => {
            this.players[child.key].destroy();
        })

        this.game.time.events.loop(Phaser.Timer.SECOND, this.makeFood, this);
    }

    update() {
        this.starfield.tilePosition.y += 2;
        this.starfield.tilePosition.x += 2;
        this.game.physics.arcade.moveToPointer(this.player, 60, this.game.input.activePointer, 500);
        // console.log(this.player.position);
        firebase.database().ref('players').child(this.player.key).set(this.player.position)
        firebase.database().ref('players').once('value', (snap) => {
            snap.forEach(child => {
                if(child.key !== this.player.key) {
                    this.players[child.key].position.set(child.val().x, child.val().y);
                }
            })
        });
    }

    endGame() {
        this.game.state.start('gameover');
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
        const food = this.game.add.sprite(x, y, 'ship');
        food.scale.setTo(0.06125, 0.06125);
    }


}

export default Game;