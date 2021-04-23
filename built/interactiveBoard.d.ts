import * as MRE from '@microsoft/mixed-reality-extension-sdk';
export default class Board {
    private context;
    private assets;
    private centerPosition;
    private centerRotation;
    private localSpace;
    private readonly groupName;
    private readonly noGroupName;
    private participantMask;
    private notParticipandMask;
    private labelSpawnPlace;
    private totalOnBoard1;
    private totalOnBoard2;
    private buttonPlus;
    private buttonStart;
    private participants;
    constructor(context: MRE.Context, assets: MRE.AssetContainer, centerPosition: MRE.Vector3Like, centerRotation?: MRE.QuaternionLike);
    private createIt;
    createLabel2(name: string, position: MRE.Vector3Like, height?: number): void;
    spawnLabel(position: MRE.Vector3Like): void;
    userJoined(user: MRE.User): void;
    private addButtonPrompt;
    addButton(): void;
    private startAssignmentButton;
    private startAssignmentAction;
}
//# sourceMappingURL=interactiveBoard.d.ts.map