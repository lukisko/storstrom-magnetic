import * as MRE from '@microsoft/mixed-reality-extension-sdk';
export default class Board {
    private context;
    private assets;
    private centerPosition;
    private centerRotation;
    private localSpace;
    private labelSpawnPlace;
    private totalOnBoard1;
    private totalOnBoard2;
    private buttonPlus;
    constructor(context: MRE.Context, assets: MRE.AssetContainer, centerPosition: MRE.Vector3Like, centerRotation?: MRE.QuaternionLike);
    private createIt;
    createLabel2(name: string, position: MRE.Vector3Like, height?: number): void;
    spawnLabel(position: MRE.Vector3Like): void;
    addButton(): void;
}
//# sourceMappingURL=interactiveBoard.d.ts.map