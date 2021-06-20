import BaseScene from "./BaseScene";

class PlayScene extends BaseScene {
  constructor(config) {
    super("PlayScene", {
      ...config,
      hasSoundButton: true,
    });
    this.fontSize = 1;
    this.stepText = "Steps left: ";
    this.steps;
    this.stepsText;
    this.nodesArray = [];
    this.edgesArray = [];
    this.allValuesArray = [];
    this.graphics;
    this.currentTutorialStep = 0;
    this.bestScoreText;
    this.undoBtn;
    this.restartBtn;
    this.pointer;
  }

  init(data) {
    this.nodes = data.nodes;
    this.edges = data.edges;
    this.maximumStepAllowed = data.maximumStepAllowed;
    this.tutorialMode = data.tutorialMode;
    this.tutorialSteps = data.tutorialSteps;
    this.level = data.level;
    this.difficulty = data.difficulty;
  }

  create() {
    this.renewScene();
    this.createBG();
    this.addGraphics();
    this.setMaxSteps();
    this.displayBestScore();
    this.displayRestartButton();
    this.displayUndoButton();
    this.drawGraph();
    this.monitorValues();
    this.displayLevelInfo();
    if (this.tutorialMode === true) {
      this.createTutorialButton();
      this.turnOnTutorialMode();
    }
    super.create();
    this.createBackButton();
  }

  turnOnTutorialMode() {
    this.createPointer();
    this.setNodeValueTextVisible(false);
    this.setNodeInputState(false);
    this.setBestscoreTextVisible(false);
    this.setStepTextVisible(false);
    this.setUndoButtonVisible(false);
    this.setRestartButtonVisible(false);
    this.chageEdgeVisible(false);
  }

  createBackButton() {
    const backButton = this.add
      .image(innerWidth / 20, innerHeight / 20, "arrow")
      .setInteractive()
      .setOrigin(0, 0);
    this.scaleObject(backButton, 25);

    backButton.on("pointerup", () => {
      this.playButtonSound();
      this.scene.stop();
      if (this.tutorialMode === true) {
        this.scene.start("MenuScene");
      } else {
        this.scene.start("LevelsScene", { difficulty: this.difficulty });
      }
    });
  }

  renewScene() {
    this.nodesArray = [];
    this.edgesArray = [];
    this.allValuesArray = [];
    this.graphics;
    this.currentTutorialStep = 0;
  }

  createBG() {
    // const backGround = this.add
    //   .image(this.config.width / 2, this.config.height / 2, "blueSky")
    //   .setOrigin(0.5, 0.5)
    //   .setScale(2);
    let bgPic = "";
    if (this.difficulty === "easy") {
      bgPic = "sky-easy";
    } else if (this.difficulty === "normal") {
      bgPic = "sky-medium";
    } else if (this.difficulty === "hard") {
      bgPic = "sky-hard";
    } else {
      bgPic = "blueSky";
      //This was the problem
    }

    const backGround = this.add
      .image(this.config.width / 2, this.config.height / 2, bgPic)
      .setOrigin(0.5, 0.5);
    // .setScale(2);
    // backGround.x = backGround.displayWidth * 0.5;
  }

  addGraphics() {
    this.graphics = this.add.graphics({
      lineStyle: { width: 4, color: 0xffffff },
    });
  }

  getNodeImage(value) {
    if (value < -6) return "node-7";
    else if (value == -6) return "node-6";
    else if (value == -5) return "node-5";
    else if (value == -4) return "node-4";
    else if (value == -3) return "node-3";
    else if (value == -2) return "node-2";
    else if (value == -1) return "node-1";
    else if (value == 0) return "node0";
    else if (value == 1) return "node1";
    else if (value == 2) return "node2";
    else if (value == 3) return "node3";
    else if (value == 4) return "node4";
    else if (value == 5) return "node5";
    else if (value == 6) return "node6";
    else if (value > 6) return "node7";
  }

  updateNodeImages() {
    this.nodesArray.forEach((element) => {
      element.container.getAt(1).setTexture(this.getNodeImage(element.value));
    });
  }

  addNode(id, value, coordX, coordY) {
    let nodeBg = this.add.image(0, 0, "islandBg");
    this.scaleObject(nodeBg, 8);

    let nodeImage = this.add.image(0, 0, this.getNodeImage(value));
    this.scaleObject(nodeImage, 10);

    let valueBg = this.add.image(innerWidth / 20,
      -innerHeight / 20, "valueBg");
    this.scaleObject(valueBg, 40);

    let nodeValueText = this.createNodeValueText(value);

    let container = this.add.container(
      this.config.width * coordX,
      this.config.height * coordY,
      [nodeBg, nodeImage, valueBg, nodeValueText]
    );
    container.setSize(innerWidth / 10, innerHeight / 10);
    container.setDepth(1);

    var node = new Node(id, value, container);
    this.nodesArray.push(node);
  }

  createNodeValueText(value) {
    let nodeValueText = this.add.text(
      innerWidth / 20,
      -innerHeight / 20,
      value,
      {
        fontSize: '25px',
        fill: "#000",
        fontStyle: "bold",
        align: "center"
      }
    );
    nodeValueText.setOrigin(0.5);
    return nodeValueText;
  }

  setNodeValueTextVisible(state) {
    this.nodesArray.forEach((element) => {
      element.container.getAt(3).visible = state;
    });
    this.nodesArray.forEach((element) => {
      element.container.getAt(2).visible = state;
    });
  }

  updateStep(state) {
    if (state == "increase") {
      if (this.steps < this.maximumStepAllowed) this.steps++;
    } else {
      this.steps--;
    }
    this.stepsText.setText(this.stepText + this.steps);
  }

  setupNodeClick() {
    this.nodesArray.forEach((node) => {
      this.soundNode = this.sound.add("soundNode", { volume: 3.0 });
      node.container.setInteractive().on("pointerdown", () => {
        this.updateStep("decrease");
        node.decreaseNodeValue();
        node.updateNeighborNodeValue();
        this.updateValues();
        this.playSmokeAnimation(node.container.x, node.container.y, 'smoke');
        node.getNeighborNodes().forEach((neighborNode) => {
          this.playSmokeAnimation(neighborNode.container.x, neighborNode.container.y, 'smoke');
        });
        this.updateNodeImages();
        if (this.game.config.soundPlaying === true) {
          this.soundNode.play();
        }
        this.monitorValues();
        this.animateEdge(node.id, false);
        this.checkWinLoseCondition();
      });
    });
  }

  animateEdge(nodeId, undo){
    let node = this.getNodeFromId(nodeId);
    node.neighborNodes.forEach((neighbor) => {
      let currentEdge;
      this.edgesArray.forEach((edge) => {
        if((edge.nodeA.id === node.id && edge.nodeB.id === neighbor.id) || 
            (edge.nodeA.id === neighbor.id && edge.nodeB.id === node.id)){
              currentEdge = edge;
            }
      });

      let rocksArray = currentEdge.rocks;
      if((node.id === currentEdge.nodeA.id && !undo) || (node.id === currentEdge.nodeB.id && undo)){
        let i = 1;
        rocksArray.forEach((rock) => {
          this.time.delayedCall(100*(i-1),() => {rock.y += 10;},rock);
          this.time.delayedCall(100*i,() => {rock.y -= 10;},rock);
          i++;
        });
      } 
      else {
        let i = 1;
        for(let j = rocksArray.length-1; j > -1; j--){
          this.time.delayedCall(100*(i-1),() => {rocksArray[j].y += 10;},rocksArray[j]);
          this.time.delayedCall(100*i,() => {rocksArray[j].y -= 10;},rocksArray[j]);
          i++;
        }
      }
    });
  }

  playSmokeAnimation(x, y, animation) {
    const smoke = this.add.sprite(x, y, animation, 0);
    this.scaleObject(smoke, 2);
    smoke.depth = 100;
    this.anims.create({
      key: 'transform',
      frameRate: 15,
      frames: this.anims.generateFrameNames(animation, { start: 1, end: 5 })
    });
    smoke.play('transform');
    smoke.once('animationcomplete', () => {
      smoke.destroy()
    })
  }

  monitorValues() {
    let currrentValues = [];
    for (const node of this.nodesArray) {
      currrentValues.push({ id: node.id, value: node.value * 1 });
    }

    let currentValuesAndStep = {
      allValue: currrentValues,
      step: this.steps,
    };

    let currentObjIndex = this.allValuesArray.findIndex(
      (x) => x.step === this.steps
    );

    if (currentObjIndex !== -1) {
      this.allValuesArray.splice(currentObjIndex, 1, currentValuesAndStep);
    } else {
      this.allValuesArray.push(currentValuesAndStep);
    }
  }

  setNodeInputState(state) {
    this.nodesArray.forEach((node) => {
      node.container.input.enabled = state;
    });
  }

  setBestscoreTextVisible(state) {
    this.bestScoreText.visible = state;
  }

  setStepTextVisible(state) {
    this.stepsText.visible = state;
  }

  setUndoButtonVisible(state) {
    this.undoBtn.visible = state;
  }

  setRestartButtonVisible(state) {
    this.restartBtn.visible = state;
  }

  chageEdgeVisible(state) {
    this.edgesArray.forEach((element) => {
      element.rocks.forEach((e) => {
        e.visible = state;
      })

    });
  }

  addEdge(nodeIdA, nodeIdB) {
    let nodeA = this.getNodeFromId(nodeIdA);
    let nodeB = this.getNodeFromId(nodeIdB);

    let nodeBX = nodeB.container.x;
    let nodeBY = nodeB.container.y;
    let nodeAX = nodeA.container.x;
    let nodeAY = nodeA.container.y;

    let getXcoord;
    let getYcoord;
    let deltaX;
    let deltaY;
    let distanceBetweenX;
    let distanceBetweenY;
    let numberOfRocks;
    let prevRandom = 0;
    let rocks = [];

    if (nodeBX == nodeAX) {
      getXcoord = nodeAX;
      deltaX = 0;
      distanceBetweenY = nodeBY - nodeAY;
      numberOfRocks = Math.round(distanceBetweenY / (this.config.width * 0.04));
    } else if (nodeBX > nodeAX) {
      if (nodeBX - nodeAX < 200) {
        distanceBetweenY = nodeBY - nodeAY;
        numberOfRocks = Math.round(
          distanceBetweenY / (this.config.width * 0.04)
        );
        getXcoord = nodeAX + (nodeBX - nodeAX) / numberOfRocks;
        distanceBetweenX = nodeBX - nodeAX;
        deltaX = distanceBetweenX / numberOfRocks;
      } else {
        distanceBetweenX = nodeBX - nodeAX;
        numberOfRocks = Math.round(
          distanceBetweenX / (this.config.width * 0.04)
        );
        getXcoord = nodeAX + (nodeBX - nodeAX) / numberOfRocks;
        deltaX = distanceBetweenX / numberOfRocks;
      }
    } else {
      if (nodeAX - nodeBX < 200) {
        distanceBetweenY = nodeBY - nodeAY;
        numberOfRocks = Math.round(
          distanceBetweenY / (this.config.width * 0.04)
        );
        getXcoord = nodeAX - (nodeBX - nodeAX) / numberOfRocks;
        distanceBetweenX = nodeAX - nodeBX;
        deltaX = distanceBetweenX / numberOfRocks;
      } else {
        distanceBetweenX = nodeAX - nodeBX;
        numberOfRocks = Math.round(
          distanceBetweenX / (this.config.width * 0.04)
        );
        getXcoord = nodeAX - (nodeBX - nodeAX) / numberOfRocks;
        deltaX = distanceBetweenX / numberOfRocks;
      }
    }

    if (nodeBY == nodeAY) {
      getYcoord = nodeBY;
      deltaY = 0;
    } else {
      getYcoord = nodeAY + (nodeBY - nodeAY) / numberOfRocks;
      distanceBetweenY = nodeBY - nodeAY;
      deltaY = distanceBetweenY / numberOfRocks;
    }

    for (let i = 1; i < numberOfRocks - 1; i++) {
      let randomRock = Math.floor(Math.random() * (8 - 1) + 1);
      if (randomRock === prevRandom) {
        while (randomRock === prevRandom) {
          randomRock = Math.floor(Math.random() * (8 - 1) + 1);
        }
      }

      if (nodeBX < nodeAX && nodeBY > nodeAY) {
        if (i == 1) {
          getXcoord -= deltaX * 2;
          getYcoord += deltaY;
        } else {
          getXcoord -= deltaX;
          getYcoord += deltaY;
        }
      } else {
        if (i == 1) {
          getXcoord += deltaX * 0.4;
          getYcoord += deltaY * 0.5;
        } else {
          getXcoord += deltaX;
          getYcoord += deltaY;
        }
      }
      let rock = this.add.image(getXcoord, getYcoord, `rock-${randomRock}`);
      rocks.push(rock);
      prevRandom = randomRock;
    }
    
    let edge = new Edge(
      nodeA,
      nodeB,
      rocks
    );
    this.edgesArray.push(edge);
  }

  updateValues() {
    this.nodesArray.forEach((element) => {
      element.container.getAt(3).setText(element.value);
    });
  }

  getNodeFromId(nodeId) {
    let node;
    this.nodesArray.forEach((element) => {
      if (element.id === nodeId) {
        node = element;
      }
    });
    return node;
  }

  checkWinLoseCondition() {
    if (this.nodesArray.every((element) => element.isPositiveValue())) {
      const bestScoreText = localStorage.getItem("bestScore");
      const bestScore = bestScoreText && parseInt(bestScoreText, 10);
      if (!bestScore || this.steps > bestScore) {
        localStorage.setItem("bestScore", this.steps);
      }
      sessionStorage.setItem("currentScore", this.steps);
      this.scene.start("EndGameScene", {
        message: "Level Completed",
        level: this.level,
        difficulty: this.difficulty,
      });
    } else if (this.steps == 0) {
      this.scene.start("EndGameScene", {
        message: "You ran out of steps. Game over!!",
      });
    }
  }

  drawGraph() {
    this.drawNodes();
    this.setupNodeClick();
    this.drawEdges();
  }

  drawNodes() {
    for (var i = 0; i < this.nodes.length; i++) {
      this.addNode(
        this.nodes[i].id,
        this.nodes[i].value,
        this.nodes[i].x,
        this.nodes[i].y
      );
    }
  }

  drawEdges() {
    for (var i = 0; i < this.edges.length; i++) {
      this.addEdge(this.edges[i].nodeA, this.edges[i].nodeB);
    }
  }

  setMaxSteps() {
    this.steps = this.maximumStepAllowed;
    this.stepsText = this.add
      .text(innerWidth / 2, innerHeight / 12, this.stepText + this.steps, {
        fontSize: "30px",
        fontFamily: "Montserrat-Regular",
        fill: "#000",
        align: "center",
      })
      .setOrigin(0.5);
  }

  displayBestScore() {
    const bestScore = localStorage.getItem("bestScore");
    this.bestScoreText = this.add
      .text(innerWidth / 2, innerHeight / 8, `Best Score: ${0}`, {
        fill: "#3b3b3b",
        fontFamily: "Montserrat-Regular",
      })
      .setOrigin(0.5);

    if (bestScore) {
      this.bestScoreText.setText(`Best Score: ${bestScore}`);
    } else {
      this.bestScoreText.setText(`Best Score: ${0}`);
    }
  }

  displayRestartButton() {
    this.restartBtn = this.add
      .image(innerWidth * 0.8, this.defaultTopBtnHeight, "restart")
      .setOrigin(1, 0)
      .setInteractive();

    this.scaleObject(this.restartBtn, 30);

    this.restartBtn.on("pointerup", () => {
      this.playButtonSound();
      this.steps = this.maximumStepAllowed;
      this.stepsText.setText(this.stepText + this.steps);
      this.resetTheGame();
      this.animateEdgesOnReset();
    });
  }

  resetTheGame() {
    this.nodesArray.forEach((element) => {
      element.resetValue();
    });
    this.updateValues();
    this.updateNodeImages();
  }

  animateEdgesOnReset(){
    this.edgesArray.forEach((edge) => {
      let randomRocks = [...edge.rocks];
      randomRocks.sort(() => Math.random() - 0.5);
      let i = 1;
      randomRocks.forEach((rock) => {
        this.time.delayedCall(100*(i-1),() => {rock.y += 10;},rock);
        this.time.delayedCall(100*i,() => {rock.y -= 10;},rock);
        i++;
        });
    });
  }

  displayUndoButton() {
    this.undoBtn = this.add
      .image(innerWidth * 0.7, this.defaultTopBtnHeight, "undo")
      .setOrigin(0, 0)
      .setInteractive();

    this.scaleObject(this.undoBtn, 30);

    this.undoBtn.on("pointerup", () => {
      this.playButtonSound();
      if (this.steps < this.maximumStepAllowed)
        this.animateEdge(this.lastClickedNodeId(), true);
      this.updateStep("increase");
      if (this.steps <= this.maximumStepAllowed) {
        this.undoNodeValue();
        this.updateNodeImages();
        this.updateValues();
      }
    });
  }

  lastClickedNodeId(){
    let lastNode;
    var index = this.allValuesArray.findIndex((p) => p.step == this.steps);
    var index2 = this.allValuesArray.findIndex((p) => p.step == this.steps+1);
    for(let i = 0; i < this.allValuesArray[index].allValue.length; i++){
      if(this.allValuesArray[index].allValue[i].value < this.allValuesArray[index2].allValue[i].value){
        lastNode = this.allValuesArray[index].allValue[i].id;
      }
    }
    return lastNode;
  }

  undoNodeValue() {
    var index = this.allValuesArray.findIndex((p) => p.step == this.steps);
    this.allValuesArray[index].allValue.forEach((element) => {
      this.getNodeFromId(element.id).value = element.value;
    });
  }

  createTutorialButton() {
    const tutorialText = this.add.text(-150, -50, this.getHelpText(), {
      fontFamily: "Indie Flower, cursive",
      fill: '#000',
      fontSize: 20,
      fontStyle: 'bold',
      wordWrap: { width: 350, useAdvancedWrap: true },
    });

    const nextButton = this.add
      .image(250, 0, "next")
      .setInteractive()
      .on("pointerdown", () => {
        this.changeTutorialStep("next", tutorialText);
      });
    this.scaleObject(nextButton, 20);

    const prevButton = this.add
      .image(-250, 0, "previous")
      .setInteractive()
      .on("pointerdown", () => {
        this.changeTutorialStep("previous", tutorialText);
      });
    this.scaleObject(prevButton, 20);

    const borderImage = this.add.image(0, 0, "tutorial-border");
    this.scaleObject(borderImage, 4);

    const container = this.add.container(
      this.config.width * 0.2,
      this.config.height * 0.8,
      [nextButton, prevButton, tutorialText, borderImage]
    );
    container.setSize(innerWidth / 10, innerHeight / 10);
  }

  changeTutorialStep(action, tutorialText) {
    if (action == "next") {
      if (this.currentTutorialStep < this.tutorialSteps.length - 1)
        this.currentTutorialStep++;
    } else {
      if (this.currentTutorialStep > 0) this.currentTutorialStep--;
    }
    tutorialText.setText(this.getHelpText());
    this.updateTutorialScene();
  }

  getHelpText() {
    return this.tutorialSteps[this.currentTutorialStep].text;
  }

  updateTutorialScene() {
    //show islands
    if (this.currentTutorialStep == 0) {
      this.setNodeValueTextVisible(false);
      this.chageEdgeVisible(false);
    }
    //show island values
    else if (this.currentTutorialStep == 1) {
      this.setNodeValueTextVisible(true);
      this.chageEdgeVisible(false);
    }
    //show edges
    else if (this.currentTutorialStep == 2) {
      this.drawEdges();
      this.setNodeInputState(false);
      this.hidePointer();
    }
    //make nodes clickable
    else if (this.currentTutorialStep == 3) {
      this.setNodeInputState(true);
      this.movePointerTo(this.nodesArray[0].container,"node");
    }
    //make nodes clickable
    else if (this.currentTutorialStep == 4) {
      this.setStepTextVisible(false);
    }
    //show steps
    else if (this.currentTutorialStep == 5) {
      this.setStepTextVisible(true);
      this.setUndoButtonVisible(false);
      this.hidePointer();
    }
    //undo btn
    else if (this.currentTutorialStep == 6) {
      this.setUndoButtonVisible(true);
      this.setRestartButtonVisible(false);
      this.movePointerTo(this.undoBtn,"btn");
    }
    //restart btn
    else if (this.currentTutorialStep == 7) {
      this.setRestartButtonVisible(true);
      this.setBestscoreTextVisible(false);
      this.movePointerTo(this.restartBtn,"btn");
    }
    //win condition
    else if (this.currentTutorialStep == 8) {
      this.setBestscoreTextVisible(true);
      this.hidePointer();
    }
  }

  destroyNodeImage(image) {
    image.destroy();
    image = null;
  }

  displayLevelInfo() {
    const levelInfo = this.add
      .text(
        innerWidth / 2,
        innerHeight / 20,
        "Level " + this.level + " - " + this.difficulty,
        {
          //fontSize: "22px",
          fontFamily: "Montserrat-Regular",
          fill: "#000",
          align: "center",
        }
      )
      .setOrigin(0.5);
    if (this.tutorialMode === true) {
      levelInfo.setText("Tutorial");
    }
  }
  createPointer() {
    this.pointer = this.add.sprite(this.nodesArray[0].container.x, this.nodesArray[0].container.y, "pointer");
    this.pointer.setDepth = 1000;
    this.pointer.visible = false;
    this.scaleObject(this.pointer, 20);
  }

  hidePointer() {
    this.pointer.visible = false;
  }

  movePointerTo(obj, type) {
    let x, y;
    if (type === "node") {
      x = obj.x + obj.width * 1 / 3;
      y = obj.y + obj.height * 3 / 2;
    } else {
      x = obj.x + obj.width * 1 / 3;
      y = obj.y + obj.height;
    }
    this.playSmokeAnimation(x, y, 'smoke');
    this.pointer.setPosition(x, y);
    this.pointer.visible = true;
  }
}

export default PlayScene;

class Node {
  constructor(id, value, container) {
    this.id = id;
    this.value = value;
    this.container = container;
    this.neighborNodes = [];
    this.baseValue = value;
  }

  addNodeNeighbor(node) {
    if (this.neighborNodes.indexOf(node) == -1) this.neighborNodes.push(node);
  }

  decreaseNodeValue() {
    this.value = this.value - this.neighborNodes.length;
  }

  increaseNodeValueBy1() {
    this.value++;
  }

  getNeighborNodes() {
    return this.neighborNodes;
  }

  updateNeighborNodeValue() {
    this.neighborNodes.forEach((element) => {
      element.increaseNodeValueBy1();
    });
  }

  isPositiveValue() {
    if (this.value >= 0) return true;
    else return false;
  }

  isNegativeValue() {
    if (this.value < 0) return true;
    else return false;
  }

  resetValue() {
    this.value = this.baseValue;
  }
}

class Edge {
  constructor(nodeA, nodeB, rocks) {
    this.nodeA = nodeA;
    this.nodeB = nodeB;
    this.rocks = rocks;
    this.init();
  }

  init() {
    this.nodeA.addNodeNeighbor(this.nodeB);
    this.nodeB.addNodeNeighbor(this.nodeA);
  }
}
