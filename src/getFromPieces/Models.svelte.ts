import * as Pieces from '@pieces.app/pieces-os-client';
import { piecesChat, PiecesChat } from './PiecesChat';

export class ModelsController {
	private configuration: Pieces.Configuration;
	private modelsApi: Pieces.ModelsApi;
	private modelApi: Pieces.ModelApi;
	public selectedModel = $state('');

	constructor(piecesChat: PiecesChat) {
		this.configuration = piecesChat.configuration;
		this.modelsApi = new Pieces.ModelsApi(this.configuration);
		this.modelApi = new Pieces.ModelApi(this.configuration);
	}

	public async fallbackToModel(models?: Array<{ id: string }>) {
		try {
			const availableModels = models || (await this.getModelsWithSchemas());

			// Fallback to GPT 4-o Mini
			const fallback = availableModels.find(
				(model) => model.id === 'e1312912-74cb-4bf8-ade2-3d31c1fca10c'
			);

			if (fallback) {
				this.selectedModel = fallback.id;
			}
		} catch (error) {
			console.error('Error in fallbackToModel:', error);
		}
	}

	public setSelectedModel(modelId: string) {
		this.selectedModel = modelId;
	}

	public getSelectedModel() {
		return this.selectedModel;
	}

	public async getAvailableModels(): Promise<Pieces.Models> {
		try {
			const models = await this.modelsApi.modelsSnapshot();
			return models;
		} catch (error) {
			console.error('Error fetching models:', error);
			throw error;
		}
	}

	public async getModelSchema(modelId: string): Promise<Pieces.EmbeddedModelSchema | undefined> {
		try {
			const modelData = await this.modelApi.modelsSpecificModelSnapshot({ model: modelId });
			return modelData?.schema;
		} catch (error) {
			console.error(`Error fetching schema for model ${modelId}:`, error);
			throw error;
		}
	}

	public async getModelsWithSchemas(): Promise<
		Array<{
			id: string;
			name: string;
			schema: Pieces.EmbeddedModelSchema;
			version: string;
			type: Pieces.ModelTypeEnum;
			downloaded: boolean;
			loaded: boolean;
		}>
	> {
		try {
			const models = await this.modelsApi.modelsSnapshot();
			if (!models?.iterable) {
				console.warn('No models found or models.iterable is undefined');
				return [];
			}

			return models.iterable
				.filter((model) => {
					const name = model.name?.toLowerCase() || '';
					return name.includes('gemini') || name.includes('gpt') || name.includes('claude');
				})
				.filter((model) => model && model.id && model.name)
				.map((model) => ({
					id: model.id || '',
					name: this.formatModelName(model.name || ''),
					schema: model.schema || {
						migration: 0,
						semantic: 'UNKNOWN' as Pieces.EmbeddedModelSchemaSemanticVersionEnum
					},
					version: model.version || '',
					type: model.type || ('UNKNOWN' as Pieces.ModelTypeEnum),
					downloaded: model.downloaded || false,
					loaded: model.loaded || false
				}));
		} catch (error) {
			console.error('Error fetching models with schemas:', error);
			throw error;
		}
	}

	private formatModelName(name: string): string {
		return name
			.replace('Chat Model', '')
			.replace('(Gemini)', 'Google Gemini')
			.replace('(Claude)', 'Anthropic Claude')
			.replace('(GPT)', 'OpenAI GPT')
			.trim();
	}
}

export const modelsController = new ModelsController(piecesChat);
