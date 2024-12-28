import * as Pieces from '@pieces.app/pieces-os-client'
import type { QGPTStreamInput } from '@pieces.app/pieces-os-client'

export class PiecesChat {
  public static ws: WebSocket | null = null
  public static instance: PiecesChat | null
  public configuration: Pieces.Configuration
  private client: Pieces.QGPTApi
  private modelsApi: Pieces.ModelsApi
  // Each response will iterate into the message string
  private message: ((message: string) => void) | null = null

  constructor() {
    this.configuration = new Pieces.Configuration({
        basePath: 'http://localhost:39300'
      })
    this.client = new Pieces.QGPTApi(this.configuration)
    this.modelsApi = new Pieces.ModelsApi(this.configuration)
    PiecesChat.ws = null
  }

  public async connect(retries = 0, max = 3) {
    let response = ''
    if (PiecesChat.ws?.readyState === WebSocket.OPEN) {
      return
    }

    console.log('Attempting WebSocket connection...')
    PiecesChat.ws = new WebSocket('ws://localhost:39300/qgpt/stream')

    PiecesChat.ws.onopen = () => {
      console.log('WebSocket state -> OPEN')
    }

    PiecesChat.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data?.question?.answers) {
          const newText = data.question.answers.iterable[0].text
          if (this.message) this.message(newText)
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    PiecesChat.ws.onerror = (error) => {
      console.log('WebSocket state:', PiecesChat.ws?.readyState)
      console.log('Connection error:', error)
    }

    PiecesChat.ws.onclose = () => {
      console.log('WebSocket state -> CLOSED')
      PiecesChat.ws = null
    }
  }

  public closeStream() {
    PiecesChat.ws?.close()
  }

  public static getInstance(): PiecesChat {
    if (!PiecesChat.instance) {
      PiecesChat.instance = new PiecesChat()
    }
    return PiecesChat.instance
  }

  public getClient(): Pieces.QGPTApi {
    return this.client
  }

  public async askQGPT(
    message: Pieces.QGPTStreamInput,
    totalMessage: (message: string) => void
  ): Promise<void> {
    this.message = totalMessage

    if (!PiecesChat.ws || PiecesChat.ws.readyState !== WebSocket.OPEN) {
      await this.connect()
    }
    if (PiecesChat.ws?.readyState === WebSocket.OPEN) {
        console.log('Sending message with model:', message.question?.model);
      PiecesChat.ws.send(JSON.stringify(message))
    } else {
      throw new Error('WebSocket not ready')
    }
  }
}

export const piecesChat = new PiecesChat()
export type { QGPTStreamInput }
