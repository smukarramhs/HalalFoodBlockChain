// tslint:disable:no-unused-expression
import { join } from 'path';
import { expect } from 'chai';
import * as uuid from 'uuid/v4';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
import 'mocha';

import { Sc_participants, Sc_participantsController } from '../src';

describe('Sc_participants', () => {
  let adapter: MockControllerAdapter;
  let sc_participantsCtrl: ConvectorControllerClient<Sc_participantsController>;
  
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    sc_participantsCtrl = ClientFactory(Sc_participantsController, adapter);

    await adapter.init([
      {
        version: '*',
        controller: 'Sc_participantsController',
        name: join(__dirname, '..')
      }
    ]);

    adapter.addUser('Test');
  });
  
  // it('should create a default model', async () => {
  //   const modelSample = new Sc_participants({
  //     id: uuid(),
  //     name: 'Test',
  //     created: Date.now(),
  //     modified: Date.now()
  //   });

  //   await sc_participantsCtrl.$withUser('Test').create(modelSample);
  
  //   const justSavedModel = await adapter.getById<Sc_participants>(modelSample.id);
  
  //   expect(justSavedModel.id).to.exist;
  // });
});