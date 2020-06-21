// import * as yup from 'yup';
// import {
//   ConvectorModel,
//   Default,
//   ReadOnly,
//   Required,
//   Validate
// } from '@worldsibu/convector-core-model';

// export class Sc_participants extends ConvectorModel<Sc_participants> {
//   @ReadOnly()
//   @Required()
//   public readonly type = 'io.worldsibu.sc_participants';

//   @Required()
//   @Validate(yup.string())
//   public name: string;

//   @ReadOnly()
//   @Required()
//   @Validate(yup.number())
//   public created: number;

//   @Required()
//   @Validate(yup.number())
//   public modified: number;
// }
import * as yup from 'yup';
import {
  ConvectorModel,
  ReadOnly,
  Required,
  Validate,
  FlatConvectorModel
} from '@worldsibu/convector-core';

export class x509Identities extends ConvectorModel<x509Identities>{
  @ReadOnly()
  public readonly type = 'io.worldsibu.examples.x509identity';

  @Validate(yup.boolean())
  @Required()
  status: boolean;
  @Validate(yup.string())
  @Required()
  fingerprint: string;
}

export class Sc_participants extends ConvectorModel<Sc_participants> {
  @ReadOnly()
  public readonly type = 'io.worldsibu.examples.sc_participants';

  @ReadOnly()
  @Required()
  @Validate(yup.string())
  public name: string;

  @ReadOnly()
  @Validate(yup.string())
  public msp: string;

  @Validate(yup.array(x509Identities.schema()))
  public identities: Array<FlatConvectorModel<x509Identities>>;
}