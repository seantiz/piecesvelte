import * as Pieces from '@pieces.app/pieces-os-client';
import CopilotStreamController from './CopilotStreamController';

export const selectedModel: Map<string, string> = new Map();

export default class ModelController {
public models: Promise<Pieces.Models>;
public settingsLabels: string = '';

// then get its value inside of the constructor.
public constructor() {

    // can access the model snapshot here and set it to the variable that was just created 
    this.models = new Pieces.ModelsApi().modelsSnapshot();
    this.models.then((models) => {
      this.initSockets(
      // then you can use filter to set the initial value for the models download.
        models.iterable.filter(
          (model) =>
            (model.foundation === Pieces.ModelFoundationEnum.Gpt35 || 
            model.foundation === Pieces.ModelFoundationEnum.Gpt4 ||
            model.foundation === Pieces.ModelFoundationEnum.Gemini 
        )
      ))
    });
  };

  private async initSockets(models: Pieces.Model[]) {
    const copilotStreamController = CopilotStreamController.getInstance();
    await copilotStreamController.connectionPromise;
    const ws = copilotStreamController.ws;
  
    if (ws) {
      models.forEach(model => {
       selectedModel.set(model.name, model.id);
      });
    } else {
      throw new Error('WebSocket is not initialized in CopilotStreamController');
    }
  }

}