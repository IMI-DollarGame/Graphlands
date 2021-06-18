import Phaser from "phaser";
import { EventEmitter } from "events";

class BaseScene extends Phaser.Scene {
  constructor(key, config) {
    super(key);
    this.config = config;
    this.screenCenter = [config.width / 2, config.height / 3];
    this.fontSize = 40;
    this.lineHeight = 80;
    this.defaultTopBtnHeight = innerHeight / 20;
    this.bgMusic;

    this.completedLevel = [];
  }

  create() {
    this.creatingAllButtonsAndBG();
    this.soundMenu = this.sound.add("soundMenu", { volume: 0.5 });
  }

  createBGWithIslands() {
    const backGround = this.add
      .image(this.config.width / 2, this.config.height / 2, "blueSky")
      .setOrigin(0.5, 0.5)
      .setScale(1.8);
    backGround.x = backGround.displayWidth * 0.2;
    this.createFloatingIslands(18);
  }

  createMenu(menu, setupMenuEvents) {
    let lastMenuPositionY = 0;
    menu.forEach(menuItem => {
      const menuPosition = [
        this.screenCenter[0],
        this.screenCenter[1] + lastMenuPositionY
      ];
      menuItem.textGO = this.add
        .text(
          ...menuPosition,
          menuItem.text,
          this.game.config.defaultFontOptions
        )
        .setOrigin(0.5, 1);
      lastMenuPositionY += this.lineHeight;
      setupMenuEvents(menuItem);
    });
  }

  createBackButton() {
    const backButton = this.add
      .image(innerWidth / 20, innerHeight / 20, "arrow")
      .setInteractive()
      .setOrigin(0, 0);
    this.scaleObject(backButton, 25);

    backButton.on("pointerup", () => {
      this.playButtonSound();
      this.scene.start("MenuScene");
    });
  }

  displaySoundButton() {
    this.bgMusic = this.sound.add("music", { volume: 0.4, loop: true });

    this.soundMenu = this.sound.add("soundMenu", { volume: 0.5 });

    const musicOn = this.add
      .image(innerWidth * 0.85, this.defaultTopBtnHeight, "musicOn")
      .setOrigin(1, 0)
      .setInteractive();
    musicOn.visible = this.game.config.bgMusicPlaying;
    this.scaleObject(musicOn, 30);

    const musicOff = this.add
      .image(innerWidth * 0.85, this.defaultTopBtnHeight, "musicOff")
      .setOrigin(1, 0)
      .setInteractive();
    musicOff.visible = !this.game.config.bgMusicPlaying;
    this.scaleObject(musicOff, 30);

    const soundOn = this.add
      .image(innerWidth * 0.9, this.defaultTopBtnHeight, "soundOn")
      .setOrigin(1, 0)
      .setInteractive();
    soundOn.visible = this.game.config.soundPlaying;
    this.scaleObject(soundOn, 30);

    const soundOff = this.add
      .image(innerWidth * 0.9, this.defaultTopBtnHeight, "soundOff")
      .setOrigin(1, 0)
      .setInteractive();
    soundOff.visible = !this.game.config.soundPlaying;
    this.scaleObject(soundOff, 30);

    soundOn.on("pointerdown", () => {
      this.game.config.soundPlaying = false;
      soundOn.visible = this.game.config.soundPlaying;
      soundOff.visible = !this.game.config.soundPlaying;
    });

    soundOff.on("pointerdown", () => {
      this.game.config.soundPlaying = true;
      soundOn.visible = this.game.config.soundPlaying;
      soundOff.visible = !this.game.config.soundPlaying;
    });

    musicOn.on("pointerdown", () => {
      this.game.config.bgMusicPlaying = false;
      musicOff.visible = !this.game.config.bgMusicPlaying;
      musicOn.visible = this.game.config.bgMusicPlaying;
      this.game.sound.stopAll();
    });

    musicOff.on("pointerdown", () => {
      if (!this.sound.locked) {
        // already unlocked so play
        this.game.config.bgMusicPlaying = true;
        musicOff.visible = !this.game.config.bgMusicPlaying;
        musicOn.visible = this.game.config.bgMusicPlaying;
        this.bgMusic.play();
      } else {
        // wait for 'unlocked' to fire and then play
        this.bgMusic.once(Phaser.Sound.Events.UNLOCKED, () => {
          this.game.config.bgMusicPlaying = true;
          musicOff.visible = !this.game.config.bgMusicPlaying;
          musicOn.visible = this.game.config.bgMusicPlaying;
          this.bgMusic.play();
        });
      }
    });
  }

  createDevelopersTxt() {
    const xPos = this.config.width / 2;
    const yPos = this.config.height * 0.95;

    this.make.text({
      x: xPos,
      y: yPos,
      text: "Created by the group of enthusiasts",
      origin: { x: 0.5, y: 0.5 },
      style: {
        fontSize: "15px",
        fill: "#000",
        fontFamily: "Montserrat-Regular"
      }
    });
  }

  setupMenuEvents(menuItem) {
    const textGO = menuItem.textGO;
    textGO.setInteractive();

    textGO.on("pointerover", () => {
      textGO.setStyle({ fill: "#ff0" });
    });

    textGO.on("pointerout", () => {
      textGO.setStyle({ fill: "#fff" });
    });

    textGO.on("pointerup", () => {
      menuItem.scene && this.scene.start(menuItem.scene);
      this.playButtonSound();
    });
  }

  creatingAllButtonsAndBG() {
    //Creating BG with Islands
    //ORDER MATTERS
    if (this.config.bGWithIslands) {
      this.createBGWithIslands();
    }
    if (this.config.canGoBack) {
      this.createBackButton();
    }
    if (this.config.addDevelopers) {
      this.createDevelopersTxt();
    }
    if (this.config.hasSoundButton) {
      this.displaySoundButton();
    }
  }

  playButtonSound() {
    if (this.game.config.soundPlaying === true) {
      this.soundMenu.play();
    }
  }

  createFloatingIslands(per) {
    this.NegIsland7 = this.add.image(
      this.config.width * 0.3,
      this.config.height * 0.2,
      "node-7"
    );
    this.NegIsland5 = this.add.image(
      this.config.width * 0.2,
      this.config.height * 0.9,
      "node-5"
    );
    this.NegIsland2 = this.add.image(
      this.config.width * 0.5,
      this.config.height * 0.2,
      "node-2"
    );
    this.NegIsland1 = this.add.image(
      this.config.width * 0.8,
      this.config.height * 0.3,
      "node-1"
    );
    this.island1 = this.add.image(
      this.config.width * 0.1,
      this.config.height * 0.1,
      "node0"
    );
    this.island2 = this.add.image(
      this.config.width * 0.1,
      this.config.height * 0.55,
      "node1"
    );
    this.island3 = this.add.image(
      this.config.width * 0.4,
      this.config.height * 0.55,
      "node2"
    );
    this.island4 = this.add.image(
      this.config.width * 0.5,
      this.config.height * 0.9,
      "node3"
    );

    this.island5 = this.add.image(
      this.config.width * 0.6,
      this.config.height * 0.5,
      "node5"
    );

    this.island7 = this.add.image(
      this.config.width * 0.8,
      this.config.height * 0.7,
      "node7"
    );
    this.scaleObject(this.NegIsland7, per);
    this.scaleObject(this.NegIsland5, per);
    this.scaleObject(this.NegIsland2, per);
    this.scaleObject(this.NegIsland1, per);
    this.scaleObject(this.island1, per);
    this.scaleObject(this.island2, per);
    this.scaleObject(this.island3, per);
    this.scaleObject(this.island4, per);
    this.scaleObject(this.island5, per);
    this.scaleObject(this.island7, per);
  }

  scaleObject(obj, wPer) {
    obj.displayWidth = this.game.config.width / wPer;
    let hPer = (innerHeight / innerWidth) * wPer;
    obj.displayHeight = this.game.config.height / hPer;
  }
}
export default BaseScene;
