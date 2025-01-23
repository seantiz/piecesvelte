import { json } from '@sveltejs/kit'
import { conversationsController } from '$getFromPieces/Conversations.svelte'
import type { RequestEvent } from './$types'

export const POST = async ({ request }: RequestEvent) => {
  try {
    const { conversationId, filename, title } = await request.json()

    if (!conversationId || !filename || !title) {
      return json({ success: false, message: 'Missing required data.' }, { status: 400 })
    }

    await conversationsController.exportConversation(conversationId, filename)

    return json({ success: true, message: 'Conversation exported successfully!' })
  } catch (error) {
    console.error('Error exporting conversation:', error)
    return json({ success: false, message: 'Error exporting conversation.' }, { status: 500 })
  }
}
