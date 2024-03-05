import * as Pieces from '@pieces.app/pieces-os-client';
import CopilotStreamController from './CopilotStreamController';

export default class ModelController {
public models: Promise<Pieces.Models>;

// then get its value inside of the constructor.
private constructor() {

    // can access the model snapshot here and set it to the variable that was just created 
    this.models = new Pieces.ModelsApi().modelsSnapshot();
    this.models.then((models) => {
      this.initSockets(
      // then you can use filter to set the initial value for the models download.
        models.iterable.filter(
          (el) =>
            (el.foundation === Pieces.ModelFoundationEnum.Llama27B || el.foundation === Pieces.ModelFoundationEnum.Mistral7B) &&
            el.unique !== 'llama-2-7b-chat.ggmlv3.q4_K_M'
        )
      );
    });
  };

  private initSockets(models: Pieces.Model[]) {
    const copilotStreamController = CopilotStreamController.getInstance();
    const ws = copilotStreamController.ws;
  
    if (ws) {
      models.forEach(model => {
        ws.send(JSON.stringify(model));
      });
    } else {
      throw new Error('WebSocket is not initialized in CopilotStreamController');
    }
  }
}