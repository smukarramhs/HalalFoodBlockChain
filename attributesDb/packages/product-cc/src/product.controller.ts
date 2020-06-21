// import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
// import {
//   Controller,
//   ConvectorController,
//   Invokable,
//   Param
// } from '@worldsibu/convector-core';

// import { Product } from './product.model';

// @Controller('product')
// export class ProductController extends ConvectorController<ChaincodeTx> {
//   @Invokable()
//   public async create(
//     @Param(Product)
//     product: Product
//   ) {
//     await product.save();
//   }
// }
import * as yup from 'yup';
import { ChaincodeTx } from '@worldsibu/convector-platform-fabric';
import {
  Controller,
  ConvectorController,
  Invokable,
  Param
} from '@worldsibu/convector-core';
import { Sc_participants } from 'sc_participants-cc';

import { Product, Attribute } from './product.model';

@Controller('product')
export class ProductController extends ConvectorController<ChaincodeTx> {
  @Invokable()
  public async create(
    @Param(Product)
    product: Product
  ) {
    let exists = await Product.getOne(product.id);
    if (!!exists && exists.id) {
      throw new Error('There is a product registered with that Id already');
    }
    let hcb = await Sc_participants.getOne('hcb');

    if (!hcb || !hcb.identities) {
      throw new Error('No HCB identity has been registered yet');
    }
    const hcbActiveIdentity = hcb.identities.filter(identity => identity.status === true)[0];

    if (this.sender !== hcbActiveIdentity.fingerprint) {
      throw new Error(`Just the HCB - ID=hcb - can create product - requesting organization was ${this.sender}`);
    }

    await product.save();
  }
  @Invokable()
  public async addAttribute(
    @Param(yup.string())
    productId: string,
    @Param(Attribute.schema())
    attribute: Attribute
  ) {
    // Check if the "stated" participant as certifier of the attribute is actually the one making the request
    let participant = await Sc_participants.getOne(attribute.certifierID);

    if (!participant || !participant.identities) {
      throw new Error(`No supply chain participant found with id ${attribute.certifierID}`);
    }

    const participantActiveIdentity = participant.identities.filter(
      identity => identity.status === true)[0];

    if (this.sender !== participantActiveIdentity.fingerprint) {
      throw new Error(`Requester identity cannot sign with the current certificate ${this.sender}. This means that the user requesting the tx and the user set in the param certifierId do not match`);
    }

    let product = await Product.getOne(productId);

    if (!product || !product.id) {
      throw new Error(`No product found with id ${productId}`);
    }

    if (!product.attributes) {
      product.attributes = [];
    }

    let exists = product.attributes.find(attr => attr.id === attribute.id);

    if (!!exists) {
      let attributeOwner = await Sc_participants.getOne(exists.certifierID);
      let attributeOwnerActiveIdentity = attributeOwner.identities.filter(
        identity => identity.status === true)[0];

      // Already has one, let's see if the requester has permissions to update it
      if (this.sender !== attributeOwnerActiveIdentity.fingerprint) {
        throw new Error(`Product has an attribute for ${attribute.id} but it does not belong to the current identity so it cannot update it`);
      }
      // update as is the right attribute certifier
      exists = attribute;
    } else {
      product.attributes.push(attribute);
    }

    await product.save();
  }

  @Invokable()
  public async getProductTrail(
    @Param(yup.string())
    productId: string
  ) {
    let product = await Product.getOne(productId);

    if (!product || !product.id) {
      throw new Error(`No product found with id ${productId}`);
    }

    if (!product.attributes) {
      product.attributes = [];
    }

    console.log("Product Trail: ",JSON.stringify(product, null, '\t'));
    return JSON.stringify(product);
  }
}