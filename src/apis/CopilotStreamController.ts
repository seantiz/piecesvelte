import * as Pieces from '@pieces.app/pieces-os-client';
import { selectedModel } from './modelsController';
import { selectedModelStore } from '../stores/selectedModel';


export default class CopilotStreamController {


    public static instance: CopilotStreamController;
  
    public ws: WebSocket | null = null; // the qgpt websocket

    public totalMessage: string = '';
  
    public setMessage: undefined | ((message: string) => void); // the current answer element to be updated from socket events
  
    // this is resolved when the socket is ready.
    public connectionPromise: Promise<void> = new Promise<void>((res) => res);
  
    public constructor() {

    }
  
   
    public closeSocket() {
      this.ws?.close();
    }
  
    /**
     * This is the entry point for all chat messages into this socket.
     * @param param0 The inputted user query, and the function to update the message
     */
    public async askQGPT({
                           query,
                           setMessage,
                         }: {
      query: string;
      setMessage: (message: string) => void;
    }): Promise<void> {
      // need to connect the socket if it's not established.
      if (!this.ws) {
       await this.connect();
      }

      let modelId: string | undefined;

      selectedModelStore.subscribe((value) => {
        modelId = selectedModel.get(value);
      });


      // @TODO add conversation id
      const input: Pieces.QGPTStreamInput = {
        question: {
          model: modelId as string,
          query,
          relevant: {iterable: []} //@TODO hook up /relevance here for context
        },
      };


      this.handleMessages({ input, setMessage });
    }
  
    // send a message via askQGPT.
    public async sendMessage(userInput: string, setMessage: (message: string) => void) {
      await CopilotStreamController.getInstance().askQGPT({
        query: userInput,
        setMessage
      });
    }
    
  
    /**
     * Connects the websocket, handles all message callbacks, error handling, and rendering.
     */
    public connect() {
      this.ws = new WebSocket(`ws://localhost:1000/qgpt/stream`);

      // in the case that websocket is closed or errored we do some cleanup here
      const refreshSockets = async (event?: CloseEvent | Event) => {
        if (event instanceof CloseEvent) {
          console.log('WebSocket closed with code:', event.code, 'reason:', event.reason);
        } else if (event) {
          console.error('WebSocket error:', event);
        }
        console.log('Websocket closed. Event:', event);
        this.ws?.addEventListener('message', function (event) {
          console.log('Message from server ', event.data);
        });
        this.totalMessage = '';
        this.setMessage?.('Websocket closed')
        await this.connectionPromise;
        this.ws = null;
        this.connect();
      };
  
      const unsubscribe = selectedModelStore.subscribe(() => {});
      // on error or close, cleanup the total message
      this.ws.onerror = refreshSockets;
      this.ws.onclose = refreshSockets;
      this.ws.onclose = unsubscribe;
  
      // await this to ensure that the websocket connection has been fully established
      this.connectionPromise = new Promise((res) => {
        if (!this.ws)
          throw new Error(
            'There is no websocket in Copilot Stream Controller (race condition)'
          );
        this.ws.onopen = () => res();
      });
    }
  
    /**
     *
     * @param param0 the input into the websocket, and the function to update the ui.
     */
    public async handleMessages({
      input,
      setMessage
  }: {
      input: Pieces.QGPTStreamInput;
      setMessage: (message: string) => void;
  }) {
      if (!this.ws) this.connect();
      await this.connectionPromise;
      this.setMessage = setMessage;
  
      let totalMessage = '';
  
      this.ws!.onmessage = (msg) => {
          const json = JSON.parse(msg.data);
          const result = Pieces.QGPTStreamOutputFromJSON(json); // strongly type the incoming message
          const answer: Pieces.QGPTQuestionAnswer | undefined = result.question?.answers.iterable[0];
  
          // add to the total message
          if (answer?.text) {
              totalMessage += answer.text;
              // send the updated total message back to the component
              this.setMessage?.(totalMessage);
          }
  
          // the message is complete, or we do nothing
          if (result.status === 'COMPLETED') {
              // cleanup
              totalMessage = '';
              return;
          } else if (result.status === 'FAILED' || result.status === 'UNKNOWN') {
              this.setMessage?.('Message failed')
              totalMessage = '';
              return;
          }
      };
  
      try {
          this.ws!.send(JSON.stringify(input));
      } catch (err) {
          console.error('err', err);
          setMessage?.(JSON.stringify(err, undefined, 2));
      }
  }
  
    public static getInstance() {
      return (CopilotStreamController.instance ??= new CopilotStreamController());
    }
  
    
  };