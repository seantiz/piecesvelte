import { conversationsController } from './Conversations.svelte';
import { piecesChat } from './PiecesChat';
import type { Annotation } from '@pieces.app/pieces-os-client';
import fs from 'fs';

export async function getSummaries(conversationId: string) {
	const conversationIds = await conversationsController.getConversationIds();

	for (conversationId of conversationIds) {
		const annotations = await getConversationAnnotations(conversationId);
		annotations.forEach((annot) => {
			fs.appendFileSync('conversation_summaries.txt', annot.text);
		});
	}
}

async function getConversationAnnotations(conversationId: string): Promise<Annotation[]> {
	try {
		const conversation =
			await conversationsController.specificConversation.conversationGetSpecificConversation({
				conversation: conversationId
			});

		const indices = conversation.annotations?.indices;
		if (!indices) {
			return [];
		}
		const annotationIds = Object.keys(indices);

		return Promise.all(
			annotationIds.map(async (annotationId) => {
				const annotationResponse = await piecesChat.getAnnotations(annotationId);
				console.log(annotationResponse);
				return annotationResponse;
			})
		);
	} catch (error) {
		throw error;
	}
}
