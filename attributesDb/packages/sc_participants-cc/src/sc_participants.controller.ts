// import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
// import {
//   Controller,
//   ConvectorController,
//   Invokable,
//   Param
// } from '@worldsibu/convector-core';

// import { Sc_participants } from './sc_participants.model';

// @Controller('sc_participants')
// export class Sc_participantsController extends ConvectorController<ChaincodeTx> {
//   @Invokable()
//   public async create(
//     @Param(Sc_participants)
//     sc_participants: Sc_participants
//   ) {
//     await sc_participants.save();
//   }
// }
import * as yup from 'yup';

import {
  Controller,
  ConvectorController,
  Invokable,
  Param,
  BaseStorage
} from '@worldsibu/convector-core';

import { Sc_participants } from './sc_participants.model';
import { ClientIdentity } from 'fabric-shim';

@Controller('sc_participants')
export class Sc_participantsController extends ConvectorController {
  get fullIdentity(): ClientIdentity {
    const stub = (BaseStorage.current as any).stubHelper;
    return new ClientIdentity(stub.getStub());
  };

  @Invokable()
  public async register(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    name: string,
  ) {
    // Retrieve to see if exists
    const existing = await Sc_participants.getOne(id);

    if (!existing || !existing.id) {
      let participant = new Sc_participants();
      participant.id = id;
      participant.name = name || id;
      participant.msp = this.fullIdentity.getMSPID();
      // Create a new identity
      participant.identities = [{
        fingerprint: this.sender,
        status: true
      }];
      await participant.save();
    } else {
      throw new Error('Identity exists already, please call changeIdentity fn for updates');
    }
  }
  @Invokable()
  public async changeIdentity(
    @Param(yup.string())
    id: string,
    @Param(yup.string())
    newIdentity: string
  ) {
    // Check permissions
    let isAdmin = this.fullIdentity.getAttributeValue('admin');
    let requesterMSP = this.fullIdentity.getMSPID();

    // Retrieve to see if exists
    const existing = await Sc_participants.getOne(id);
    if (!existing || !existing.id) {
      throw new Error('No identity exists with that ID');
    }

    if (existing.msp != requesterMSP) {
      throw new Error('Unathorized. MSPs do not match');
    }

    if (!isAdmin) {
      throw new Error('Unathorized. Requester identity is not an admin');
    }

    // Disable previous identities!
    existing.identities = existing.identities.map(identity => {
      identity.status = false;
      return identity;
    });

    // Set the enrolling identity 
    existing.identities.push({
      fingerprint: newIdentity,
      status: true
    });
    await existing.save();
  }
  @Invokable()
  public async get(
    @Param(yup.string())
    id: string
  ) {
    const existing = await Sc_participants.getOne(id);
    if (!existing || !existing.id) {
      throw new Error(`No identity exists with that ID ${id}`);
    }
    return existing;
  }
}