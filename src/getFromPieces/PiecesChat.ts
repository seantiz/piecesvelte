import * as Pieces from '@pieces.app/pieces-os-client';
import type { QGPTStreamInput, Annotation } from '@pieces.app/pieces-os-client';
import { error } from '@sveltejs/kit';

export class PiecesChat {
	public static ws: WebSocket | null = null;
	public configuration: Pieces.Configuration;
	private client: Pieces.QGPTApi;
	private health: Pieces.WellKnownApi;
	private annotations: Pieces.AnnotationApi;
	// Accumulator function is the main worker
	private message: ((message: string) => void) | null = null;

	constructor() {
		this.configuration = new Pieces.Configuration({
			basePath: 'http://localhost:39300'
		});
		this.client = new Pieces.QGPTApi(this.configuration);
		this.health = new Pieces.WellKnownApi(this.configuration);
		this.annotations = new Pieces.AnnotationApi(this.configuration);
		PiecesChat.ws = null;
	}

	public async connect(retries = 0, max = 3) {
		if (PiecesChat.ws?.readyState === WebSocket.OPEN) {
			return;
		}

		const backoffDelay = retries * 1000;

		PiecesChat.ws = new WebSocket('ws://localhost:39300/qgpt/stream');

		PiecesChat.ws.onopen = () => {
			console.log('WebSocket state -> OPEN');
			retries = 0;
		};

		PiecesChat.ws.onmessage = (event) => {
			try {
				const data = JSON.parse(event.data);
				if (data?.question?.answers) {
					const newText = data.question.answers.iterable[0].text;
					if (this.message) this.message(newText);
				}
			} catch (error) {
				console.error('Error parsing message:', error);
			}
		};

		PiecesChat.ws.onerror = (error) => {
			console.log('Connection error:', error);

			if (retries < max) {
				setTimeout(() => {
					this.connect(retries + 1, max);
				}, backoffDelay);
			} else {
				console.log(
					`Max tries reached. Couldn't establish Websocket connection. Please wait a while before trying again.`
				);
			}
		};

		PiecesChat.ws.onclose = () => {
			console.log('WebSocket state -> CLOSED');
			PiecesChat.ws = null;
		};
	}

	public async checkConnection(): Promise<string> {
		return await this.health.getWellKnownHealth();
	}

	public async getVersion(): Promise<string> {
		return await this.health.getWellKnownVersion();
	}

	public closeStream() {
		PiecesChat.ws?.close();
	}

	public getClient(): Pieces.QGPTApi {
		return this.client;
	}

	public async askQGPT(
		message: Pieces.QGPTStreamInput,
		totalMessage: (message: string) => void
	): Promise<void> {
		this.message = totalMessage;

		if (!PiecesChat.ws || PiecesChat.ws.readyState !== WebSocket.OPEN) {
			await this.connect();
		}
		if (PiecesChat.ws?.readyState === WebSocket.OPEN) {
			PiecesChat.ws.send(JSON.stringify(message));
		} else {
			throw error(500, 'Websocket state not open');
		}
	}

	public async getAnnotations(annotationId: string): Promise<Annotation> {
		const annotationRef = await this.annotations.annotationSpecificAnnotationSnapshot({
			annotation: annotationId
		});
		return annotationRef;
	}
}

export const piecesChat = new PiecesChat();
export type { QGPTStreamInput };
