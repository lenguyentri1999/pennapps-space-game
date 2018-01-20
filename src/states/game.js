import * as firebase from 'firebase';

class Game extends Phaser.State {

    constructor() {
        super();
        firebase.initializeApp({
            apiKey: "AIzaSyCTpeoii5DHFeaaw6OK6j68Q6d_WW4fuy8",
            authDomain: "newagent-f3b16.firebaseapp.com",
            databaseURL: "https://newagent-f3b16.firebaseio.com",
            projectId: "newagent-f3b16",
            storageBucket: "newagent-f3b16.appspot.com",
            messagingSenderId: "469349041880"
        });
    }

    preload(){
        this.game.load.image('ship', 'assets/sprites/spaceship.png');
    }

    create() {
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

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    makeFood() {
        const x = this.game.rnd.integerInRange(0, this.game.width);
        const y = this.game.rnd.integerInRange(0, this.game.height);
        const food = this.game.add.sprite(x, y, 'ship');
        food.scale.setTo(0.06125, 0.06125);
    }


}

export default Game;
