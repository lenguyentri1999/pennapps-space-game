class Menu extends Phaser.State {

    constructor() {
        super();
    }

    create() {

      //----------------------------- GET USER NAME ON THE WELCOME SCREEN -------------------------
      this.playerName = prompt("Please enter your name", "name");
        const text = this.add.text(this.game.width * 0.5, this.game.height * 0.5, "WELCOME, " + this.playerName.toUpperCase(), {
            font: '42px Arial', fill: '#ffffff', align: 'center'
        });
        localStorage.setItem('playerName', this.playerName);
        text.anchor.set(0.5);
        this.input.onDown.add(this.startGame, this);
    }

    update() {
    }

    startGame() {
        this.game.state.start('game');
    }

}

export default Menu;
