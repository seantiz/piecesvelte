import * as Pieces from '@pieces.app/pieces-os-client';
import type { Conversation } from '@pieces.app/pieces-os-client';
import { piecesChat, PiecesChat } from './PiecesChat';
import fs from 'fs';
import path from 'path';

export class ConversationsController {
	private configuration: Pieces.Configuration;
	private conversations: Pieces.ConversationsApi;
	public specificConversation: Pieces.ConversationApi;
	public selectedConversation = $state('');

	constructor(piecesChat: PiecesChat) {
		this.configuration = piecesChat.configuration;
		this.conversations = new Pieces.ConversationsApi(this.configuration);
		this.specificConversation = new Pieces.ConversationApi(this.configuration);
	}

	public async getConversationIds(): Promise<string[]> {
		try {
			const conversations = await this.conversations.conversationsIdentifiersSnapshot();
			if (!conversations?.iterable) {
				console.warn('No conversations found or conversations.iterable is undefined');
				return [];
			}
			return conversations.iterable.map((conversation) => conversation.id);
		} catch (error) {
			console.error('Error fetching conversation IDs:', error);
			throw error;
		}
	}

	public async getAllConversations(transferables: boolean = true): Promise<Pieces.Conversation[]> {
		try {
			const conversations = await this.conversations.conversationsSnapshot({
				transferables
			});
			if (!conversations?.iterable) {
				console.warn('No conversations found or conversations.iterable is undefined');
				return [];
			}

			// Sort conversations by creation time, newest first
			return conversations.iterable.sort((a, b) => {
				const aTime = a.created.value;
				const bTime = b.created.value;
				return bTime.getTime() - aTime.getTime();
			});
		} catch (error) {
			console.error('Error fetching conversations:', error);
			throw error;
		}
	}

	public async getConversationHistory(
		conversationId: string
	): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
		try {
			// We're retrieving the indices from conversations to run them against ConversationMessages for the message ids
			const conversation = await this.specificConversation.conversationGetSpecificConversation({
				conversation: conversationId,
				transferables: true
			});

			if (!conversation?.messages?.indices) {
				return [];
			}

			const allMessages = await this.specificConversation.conversationSpecificConversationMessages({
				conversation: conversationId
			});

			const indices = conversation.messages.indices;
			const messageIds = Object.keys(indices);

			const messages = messageIds.map((messageId, index) => {
				const message = allMessages.iterable.find((msg) => msg.id === messageId);

				return {
					role: (index % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
					content: message?.fragment?.string?.raw?.toString() || ''
				};
			});

			return messages;
		} catch (error) {
			console.error('Error fetching conversation history:', error);
			throw error;
		}
	}

	public async createConversation(): Promise<Pieces.Conversation> {
		try {
			const requestBody: Pieces.ConversationsCreateSpecificConversationRequest = {
				transferables: true,
				seededConversation: { type: 'COPILOT' }
			};

			const conversation =
				await this.conversations.conversationsCreateSpecificConversation(requestBody);
			return conversation;
		} catch (error) {
			console.error('Error creating conversation:', error);
			throw error;
		}
	}

	public async deleteConversation(conversationId: string): Promise<void> {
		try {
			await this.conversations.conversationsDeleteSpecificConversation({
				conversation: conversationId
			});
		} catch (error) {
			console.error('Error deleting conversation:', error);
			throw error;
		}
	}

	public setSelectedConversation(conversationId: string) {
		this.selectedConversation = conversationId;
	}

	public getSelectedConversation() {
		return this.selectedConversation;
	}

	public async exportConversation(conversationId: string, filename: string): Promise<void> {
		try {
			if (!conversationId) {
				console.warn('No conversation selected.');
				return;
			}

			let chatContent = '';
			const history = await this.getConversationHistory(conversationId);

			history.forEach((message) => {
				chatContent += `**${message.role.toUpperCase()}:**\n${message.content}\n\n`;
			});

			if (!filename.endsWith('.md')) {
				filename += '.md';
			}

			const exportedConvosDirectory = 'savedChats';
			if (!fs.existsSync(exportedConvosDirectory)) {
				fs.mkdirSync(exportedConvosDirectory);
			}

			const filepath = path.join(exportedConvosDirectory, filename);

			fs.writeFileSync(filepath, chatContent);
			console.log(`Conversation saved to ${filepath}`);
		} catch (error) {
			console.error('Error exporting the conversation:', error);
			throw error;
		}
	}
}

export const conversationsController = new ConversationsController(piecesChat);
export type { Conversation };
