import { expect, test } from 'vitest'
import { IrpaUndoManager } from '../src/index'

const manager = new IrpaUndoManager(true);

test('Actions:', () => {

  manager.use('test', {
    perform: (data) => {
      return {perform: data}
    },
    revert: (data) => {
      return {revert: data}
    }
  });

  expect(manager.log('test', { test: 'test' })).toStrictEqual({perform: { test: 'test' }});
  expect(manager.undo()).toStrictEqual({revert: { test: 'test' }});
  expect(manager.redo()).toStrictEqual({perform: { test: 'test' }});
  
  manager.remove('test');
  expect(manager.undo()).toBe(false);
  expect(manager.redo()).toBe(false);
});

