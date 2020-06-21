// import * as yup from 'yup';
// import {
//   ConvectorModel,
//   Default,
//   ReadOnly,
//   Required,
//   Validate
// } from '@worldsibu/convector-core-model';

// export class Product extends ConvectorModel<Product> {
//   @ReadOnly()
//   @Required()
//   public readonly type = 'io.worldsibu.product';

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
  Default,
  ReadOnly,
  Required,
  Validate
} from '@worldsibu/convector-core-model';

export class Attribute extends ConvectorModel<Attribute>{
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.attribute';

  @Required()
  public content: any;

  @Required()
  @ReadOnly()
  @Validate(yup.number())
  public issuedDate: number;

  public expiresDate: Date;

  @Default(false)
  @Validate(yup.boolean())
  public expired: boolean;

  @Required()
  @Validate(yup.string())
  public certifierID: string;
}

export class Product extends ConvectorModel<Product> {
  @ReadOnly()
  @Required()
  public readonly type = 'io.worldsibu.product';

  @Required()
  @Validate(yup.string())
  public name: string;

  @Validate(yup.array(Attribute.schema()))
  public attributes: Array<Attribute>;
}