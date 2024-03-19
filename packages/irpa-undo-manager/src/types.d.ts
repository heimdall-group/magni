interface IrpaUndoScriptPerform {
  payload: any;
  type: string;
}

interface IrpaUndoScriptRevert extends IrpaUndoScriptPerform {}

interface IrpaUndoActionPayload {
  perform: Function;
  revert: Function;
}

export {
  IrpaUndoScriptPerform,
  IrpaUndoScriptRevert,
  IrpaUndoActionPayload
}
