import * as Pieces from '@pieces.app/pieces-os-client';
import type { Conversation } from '@pieces.app/pieces-os-client';
import { piecesChat, PiecesChat } from './PiecesChat';

export class ConversationsController {
    private configuration: Pieces.Configuration;
    private conversations: Pieces.ConversationsApi;
    private specificConversation: Pieces.ConversationApi
    public selectedConversation = $state('');

    constructor(piecesChat: PiecesChat) {
        this.configuration = piecesChat.configuration;
        this.conversations = new Pieces.ConversationsApi(this.configuration);
        this.specificConversation = new Pieces.ConversationApi(this.configuration)
    }

    public async getConversationIds(): Promise<string[]> {
        try {
            const conversations = await this.conversations.conversationsIdentifiersSnapshot();
            if (!conversations?.iterable) {
                console.warn('No conversations found or conversations.iterable is undefined');
                return [];
            }
            return conversations.iterable.map(conversation => conversation.id);
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
            return conversations.iterable;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    public async getConversationHistory(conversationId: string): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
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
                const message = allMessages.iterable.find(msg => msg.id === messageId);

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


    public async createConversation(transferables: boolean = true): Promise<Pieces.Conversation> {
        try {
            const conversation = await this.conversations.conversationsCreateSpecificConversation({
                transferables
            });
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
}

export const conversationsController = new ConversationsController(piecesChat);
export type { Conversation }
