import * as Pieces from '@pieces.app/pieces-os-client';
import { piecesChat, PiecesChat } from './PiecesChat';

export class AssetsController {
    private configuration: Pieces.Configuration;
    private assets: Pieces.AssetsApi;
    public selectedAsset = $state('');

    constructor(piecesChat: PiecesChat) {
        this.configuration = piecesChat.configuration;
        this.assets = new Pieces.AssetsApi(this.configuration);
    }

    public async getAssetIds(): Promise<string[]> {
        try {
            const assets = await this.assets.assetsIdentifiersSnapshot({
                pseudo: false
            });
            if (!assets?.iterable) {
                console.warn('No assets found or assets.iterable is undefined');
                return [];
            }
            return assets.iterable.map(asset => asset.id);
        } catch (error) {
            console.error('Error fetching asset IDs:', error);
            throw error;
        }
    }

    public async getAllAssets(transferables: boolean = true): Promise<Pieces.Assets> {
        try {
            const assets = await this.assets.assetsSnapshot({
                transferables,
                suggested: false,
                pseudo: false
            });
            return assets;
        } catch (error) {
            console.error('Error fetching assets:', error);
            throw error;
        }
    }

    public async getSpecificAsset(assetId: string, transferables: boolean = true): Promise<Pieces.Asset> {
        try {
            const asset = await this.assets.assetsSpecificAssetSnapshot({
                asset: assetId,
                transferables
            });
            return asset;
        } catch (error) {
            console.error('Error fetching specific asset:', error);
            throw error;
        }
    }

    public async deleteAsset(assetId: string): Promise<string> {
        try {
            const deletedAssetId = await this.assets.assetsDeleteAsset({
                asset: assetId
            });
            return deletedAssetId;
        } catch (error) {
            console.error('Error deleting asset:', error);
            throw error;
        }
    }

    public setSelectedAsset(assetId: string) {
        this.selectedAsset = assetId;
    }

    public getSelectedAsset() {
        return this.selectedAsset;
    }
}

export const assetsController = new AssetsController(piecesChat);
