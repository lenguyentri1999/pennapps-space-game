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
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.player = this.game.add.sprite(200, 200, 'ship');
        this.player.scale.setTo(0.25, 0.25);
        this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

        // this.input.onDown.add(this.endGame, this);
    }

    update() {
        this.game.physics.arcade.moveToPointer(this.player, 60, this.game.input.activePointer, 2000);
        console.log(this.player.position);
        firebase.database().ref('foo').set(this.player.position)

    }

    endGame() {
        this.game.state.start('gameover');
    }

}

export default Game;
