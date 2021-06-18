"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const MRE = __importStar(require("@microsoft/mixed-reality-extension-sdk"));
//import openingDoor from "./openingDoor";
const request_1 = __importDefault(require("request"));
const lettersForRow = 15;
class Board {
    constructor(context, assets, centerPosition, centerRotation = { x: 0, y: 0, z: 0, w: 1 }) {
        this.groupName = "PARTICIPANT";
        this.noGroupName = "NOT-PARTICIPANT";
        this.labelSpawnPlace = { x: 0, y: 1, z: -1 };
        this.neededNumberOfLabels = 5;
        this.context = context;
        this.assets = assets;
        this.centerPosition = centerPosition;
        this.centerRotation = centerRotation;
        this.totalOnBoard1 = 0;
        this.totalOnBoard2 = 0;
        this.participants = [];
        this.participantsWithStar = [];
        this.participantMask = new MRE.GroupMask(context, [this.groupName]);
        this.notParticipandMask = new MRE.GroupMask(context, [this.noGroupName]);
        this.createIt();
    }
    async createIt() {
        this.localSpace = MRE.Actor.Create(this.context, {
            actor: {
                transform: {
                    app: {
                        position: this.centerPosition,
                        rotation: this.centerRotation,
                    }
                }
            }
        });
        const greenMaterial = this.assets.createMaterial("red", {
            color: { r: 0.1, g: 0.1, b: 0.1, a: 1 },
        });
        //const boardPrefab = await this.assets.loadGltf("wordboard_mdl_01.gltf", "mesh");
        const boardPrefab = await this.assets.loadGltf("board.glb", "mesh");
        const blackBoard = MRE.Actor.CreateFromPrefab(this.context, {
            firstPrefabFrom: boardPrefab,
            //addCollider: true,
            actor: {
                parentId: this.localSpace.id,
                transform: {
                    local: {
                        position: { x: 2, y: 0, z: 0 },
                        scale: { x: 1.25, y: 1.25, z: 1.25 }
                    }
                },
                appearance: {
                    materialId: greenMaterial.id,
                },
            }
        });
        MRE.Actor.Create(this.context, {
            actor: {
                parentId: blackBoard.id,
                collider: {
                    geometry: {
                        shape: MRE.ColliderType.Box,
                        size: { x: 3.4, y: 2, z: 0.001 },
                        center: { x: 0, y: 0, z: 0 }
                    },
                    layer: MRE.CollisionLayer.Navigation
                }
            }
        });
        //this.createLabel2("angry", this.labelSpawnPlace);
        //this.createLabel2("mad", this.labelSpawnPlace);
        //this.createLabel2("good", this.labelSpawnPlace);
        //this.createLabel2("polite", this.labelSpawnPlace);
        //this.createLabel2("funny", this.labelSpawnPlace);
        //this.createLabel2("up\nmiddle\ndown", this.labelSpawnPlace);
        this.spawnLabel({ x: 5.2, y: 0.85, z: 0 });
        this.startAssignmentButton({ x: 5.2, y: 1.35, z: 0 });
        //this.door = new openingDoor(this.context, this.assets, { x: 5.828, y: 0, z: -6.24 });
        //this.door.openDoor();
        if (this.context.sessionId.startsWith('@')) {
            if (this.context.sessionId[2] === '@' || this.context.sessionId[3] === '@') {
                let arrOfSession = this.context.sessionId.split('@');
                this.neededNumberOfLabels = parseInt(arrOfSession[1]);
            }
        }
    }
    createLabel2(name, position, height = 0.1) {
        const label = MRE.Actor.CreatePrimitive(this.assets, {
            definition: {
                shape: MRE.PrimitiveShape.Box,
                dimensions: { x: 0.8, y: 0.4, z: 0.06 }
            },
            addCollider: true,
            actor: {
                name: "Label2",
                parentId: this.localSpace.id,
                transform: {
                    local: {
                        position: position,
                        rotation: { x: .707, y: 0, z: 0, w: .707 }
                    }
                },
                grabbable: true,
                rigidBody: {
                    useGravity: true,
                }
            }
        });
        label.subscribe("transform");
        label.onGrab("begin", () => {
            if (label.tag === "counted1") {
                this.totalOnBoard1--;
                label.tag = "";
            }
        });
        label.onGrab("end", (user) => {
            if (label.transform.app.position.y < 3.36 && label.transform.app.position.y > 0.86 &&
                label.transform.app.position.x > -0.07 && label.transform.app.position.x < 3.9 &&
                label.transform.app.position.z > -0.8 && label.transform.app.position.z < 0.55 &&
                this.participants.includes(user.id)) {
                label.enableRigidBody({ isKinematic: true });
                MRE.Animation.AnimateTo(this.context, label, {
                    destination: {
                        transform: {
                            local: {
                                position: { z: -0.07 },
                                rotation: this.centerRotation
                            }
                        }
                    },
                    duration: 0.1,
                });
                label.tag = "counted1";
                this.totalOnBoard1++;
                if (this.totalOnBoard1 >= this.neededNumberOfLabels) {
                    this.sendToServer(this.participants);
                }
            }
            else {
                label.enableRigidBody({ isKinematic: false });
            }
            //console.log(this.totalOnBoard1,this.totalOnBoard2);
        });
        label.subscribe("transform");
        label.collider.layer = MRE.CollisionLayer.Default;
        MRE.Actor.Create(this.context, {
            actor: {
                parentId: label.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.04,
                        }
                    }
                },
                text: {
                    contents: name,
                    color: { r: 0, g: 0, b: 0 },
                    height: height,
                    anchor: MRE.TextAnchorLocation.MiddleCenter
                }
            }
        });
    }
    spawnLabel(position) {
        this.buttonPlus = MRE.Actor.CreatePrimitive(this.assets, {
            definition: {
                shape: MRE.PrimitiveShape.Box,
                dimensions: { x: 0.8, y: 0.4, z: 0.06 }
            },
            addCollider: true,
            actor: {
                name: "Label",
                parentId: this.localSpace.id,
                transform: {
                    local: {
                        position: position,
                        rotation: { x: 0, y: 0, z: 0, w: 1 }
                    }
                },
            }
        });
        this.buttonPlus.collider.layer = MRE.CollisionLayer.Navigation;
        MRE.Actor.Create(this.context, {
            actor: {
                parentId: this.buttonPlus.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.04,
                        }
                    }
                },
                text: {
                    contents: "+",
                    color: { r: .2, g: 0.2, b: 0.2 },
                    height: 0.3,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    pixelsPerLine: 2
                }
            }
        });
        const addButton = this.buttonPlus.setBehavior(MRE.ButtonBehavior);
        addButton.onClick((user) => {
            //console.log(this.context.rpcChannels);
            this.addButtonPrompt(user);
        });
    }
    userJoined(user) {
        //console.log(user.id);
        if (!this.spaceID) {
            this.spaceID = user.properties['altspacevr-space-id'];
        }
        if (this.buttonPlus) {
            const addButton = this.buttonPlus.setBehavior(MRE.ButtonBehavior);
            addButton.onClick((user2) => {
                this.addButtonPrompt(user2);
            });
        }
        user.groups.clear();
        user.groups.add(this.noGroupName);
        if (this.buttonStart) {
            const startButton = this.buttonStart.setBehavior(MRE.ButtonBehavior);
            startButton.onClick((user2) => {
                this.startAssignmentAction(user2);
            });
        }
    }
    addButtonPrompt(user) {
        user.prompt("Enter your word", true)
            .then((value) => {
            if (value.submitted) {
                if (value.text.length < lettersForRow) { //I need to check if the input will fit into the label
                    this.createLabel2(value.text, this.labelSpawnPlace);
                }
                else {
                    user.prompt("Please enter some shorter word.", false);
                }
            }
            else {
                user.prompt('You need to press "OK" to add label.', false);
            }
        });
    }
    addButton() {
        const addButton = this.buttonPlus.setBehavior(MRE.ButtonBehavior);
        addButton.onClick((user) => {
            user.prompt("Please enter your word.", true)
                .then((value) => {
                if (value.submitted) {
                    if (value.text.length < lettersForRow) { //I need to check if the input will fit into the label
                        this.createLabel2(value.text, this.labelSpawnPlace);
                    }
                    else {
                        user.prompt("Please enter some shorter word.", false);
                    }
                }
                else {
                    user.prompt('You need to press "OK" to add label.', false);
                }
            });
        });
    }
    startAssignmentButton(position) {
        this.buttonStart = MRE.Actor.CreatePrimitive(this.assets, {
            definition: {
                shape: MRE.PrimitiveShape.Box,
                dimensions: { x: 1, y: 0.4, z: 0.02 }
            },
            addCollider: true,
            actor: {
                name: "start",
                transform: { app: { position: position } },
            }
        });
        this.buttonStart.collider.layer = MRE.CollisionLayer.Navigation;
        MRE.Actor.Create(this.context, {
            actor: {
                parentId: this.buttonStart.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.04,
                        }
                    }
                },
                text: {
                    contents: "Start",
                    color: { r: .2, g: 0.2, b: 0.2 },
                    height: 0.2,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    pixelsPerLine: 2
                },
                appearance: {
                    enabled: this.notParticipandMask
                }
            }
        });
        MRE.Actor.Create(this.context, {
            actor: {
                parentId: this.buttonStart.id,
                transform: {
                    local: {
                        position: {
                            x: 0,
                            y: 0,
                            z: -0.04,
                        }
                    }
                },
                text: {
                    contents: "Started",
                    color: { r: .2, g: 0.2, b: 0.2 },
                    height: 0.2,
                    anchor: MRE.TextAnchorLocation.MiddleCenter,
                    pixelsPerLine: 2
                },
                appearance: {
                    enabled: this.participantMask
                }
            }
        });
        const startButton = this.buttonStart.setBehavior(MRE.ButtonBehavior);
        startButton.onClick((user) => {
            this.startAssignmentAction(user);
        });
    }
    startAssignmentAction(user) {
        user.groups.clear();
        this.participants.push(user.id);
        user.groups.add(this.groupName);
    }
    sendToServer(users) {
        //TODO
        //console.log(users);
        if (!this.spaceID) {
            try {
                this.spaceID = this.context.users[0].properties['altspacevr-space-id'];
            }
            catch (_a) {
                return;
            }
        }
        users.map((user) => {
            if (this.participantsWithStar.includes(user)) {
                return;
            }
            //console.log("send to server");
            const userUser = this.context.user(user);
            //console.log(userUser.context,userUser.internal,userUser.properties);
            request_1.default.post('https://storstrom-server.herokuapp.com/add', {
                json: {
                    sessionId: this.spaceID,
                    userName: userUser.name,
                    userIp: userUser.properties['remoteAddress']
                }
            }, (err, res, body) => {
                if (err) {
                    //console.log(err);
                    return;
                }
                //console.log(res.body);
            });
            this.participantsWithStar.push(user);
        });
    }
}
exports.default = Board;
//# sourceMappingURL=interactiveBoard.js.map