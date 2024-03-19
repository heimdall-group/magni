import { IrpaUndoActionPayload } from "./types";

export class IrpaUndoManager {

  public actions: {[key: string]: IrpaUndoActionPayload} = {};
  public undos: {name: string, payload: any, count: number}[] = [];
  public redos: {name: string, payload: any, count: number}[] = [];
  private count: number;
  public debug: boolean;


  constructor(debug: boolean = false) {
    this.count = 0;
    this.debug = debug;

    if (debug) {
      this.#logger('info', 'Initialized');
      this.#logger('info', 'Debug mode enabled');
    }

  }
 
  #logger(type: 'info' | 'warn' | 'error', message: string) {
    if (this.debug) {
      console[type](`[Irpa-Undo-Manager]: ${message}`);
    }
  }

  getActions() {
    return this.actions;
  }

  use(name: string, payload: IrpaUndoActionPayload) {
    this.#logger('info', `Registering: ${name}`);
    this.actions[name] = payload;
  }

  remove(name: string) {
    this.#logger('warn', `Removing: ${name}`);
    delete this.actions[name];
  }

  clear(type: 'stacks' | 'actions' | 'all') {
    this.#logger('warn', `Clearing: ${type}`);
    switch(type) {
      case 'stacks':
        this.undos = [];
        this.redos = [];
        break;
      case 'actions':
        this.actions = {};
        break;
      case 'all':
        this.undos = [];
        this.redos = [];
        this.actions = {};
        break;
    }
  }

  log(name: string, payload: any) {
    this.count++;
    this.undos.push({name, payload, count: this.count});
    return this.actions[name].perform(payload);
  }

  redo() {
    const action = this.redos.pop();
    if (action) {
      if (this.actions[action.name] === undefined) {
        console.error(`[Irpa-Undo-Manager]: Action not found: ${action.name}`);
        return false;
      }
      this.undos.push(action);
      return this.actions[action.name].perform(action.payload);
    } else {
      console.error(`[Irpa-Undo-Manager]: No more actions to redo`);
      return false
    }
  }

  undo() {
    const action = this.undos.pop();
    if (action) {
      if (this.actions[action.name] === undefined) {
        console.error(`[Irpa-Undo-Manager]: Action not found: ${action.name}`);
        return false;
      }
      this.redos.push(action);
      return this.actions[action.name].revert(action.payload);
    } else {
      console.error(`[Irpa-Undo-Manager]: No more actions to undo`);
      return false
    }
  }
}