export class IrpaUndoStack {
  id: string;
  // perform: IrpaUndoScriptPerform;
  // revert: IrpaUndoScriptRevert;
  timestamp: number;
  // parent: string;

  constructor() {

    this.id = 'ID-IRPA-UNDO-STACK-PLACEHOLDER-ID';
    // this.perform = perform;
    // this.revert = revert;
    this.timestamp = new Date().getTime();
    // this.parent = parent;
    console.log('IrpaUndoStack');
  }
}