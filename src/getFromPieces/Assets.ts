import * as Pieces from '@pieces.app/pieces-os-client'

export default class Assets {
    public configuration: Pieces.Configuration;

    public constructor() {
        this.configuration = new Pieces.Configuration();
    }

    public getAssets(): Promise<Pieces.Assets> {
        const assetsApi = new Pieces.AssetsApi(this.configuration);
    
        const body: Pieces.AssetsSnapshotRequest = {
            transferables: true,
            suggested: true,
            pseudo: true,
        };

        return assetsApi.assetsSnapshot(body).then((assets) => {
            console.log('data returned:', assets);
            return assets;
        });
    }
}