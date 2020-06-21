// // tslint:disable:no-unused-expression
// import { join } from 'path';
// import { expect } from 'chai';
// import * as uuid from 'uuid/v4';
// import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
// import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';
// import 'mocha';

// import { Product, ProductController } from '../src';

// describe('Product', () => {
//   let adapter: MockControllerAdapter;
//   let productCtrl: ConvectorControllerClient<ProductController>;
  
//   before(async () => {
//     // Mocks the blockchain execution environment
//     adapter = new MockControllerAdapter();
//     productCtrl = ClientFactory(ProductController, adapter);

//     await adapter.init([
//       {
//         version: '*',
//         controller: 'ProductController',
//         name: join(__dirname, '..')
//       }
//     ]);

//     adapter.addUser('Test');
//   });
  
//   it('should create a default model', async () => {
//     const modelSample = new Product({
//       id: uuid(),
//       name: 'Test',
//       created: Date.now(),
//       modified: Date.now()
//     });

//     await productCtrl.$withUser('Test').create(modelSample);
  
//     const justSavedModel = await adapter.getById<Product>(modelSample.id);
  
//     expect(justSavedModel.id).to.exist;
//   });
// });
// tslint:disable:no-unused-expression
import { join } from 'path';
import { MockControllerAdapter } from '@worldsibu/convector-adapter-mock';
import { ClientFactory, ConvectorControllerClient } from '@worldsibu/convector-core';

import * as chai from 'chai';
import { expect } from 'chai';
import 'mocha';
import * as chaiAsPromised from 'chai-as-promised';
import { Sc_participantsController, Sc_participants } from 'sc_participants-cc';

import { Product, ProductController, Attribute } from '../src';

describe('Product', () => {
  chai.use(chaiAsPromised);
  // A fake certificate to emulate multiple wallets
  const fakeSecondParticipantCert = '-----BEGIN CERTIFICATE-----' +
    'MIICjzCCAjWgAwIBAgIUITsRsw5SIJ+33SKwM4j1Dl4cDXQwCgYIKoZIzj0EAwIw' +
    'czELMAkGA1UEBhMCVVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFjAUBgNVBAcTDVNh' +
    'biBGcmFuY2lzY28xGTAXBgNVBAoTEG9yZzEuZXhhbXBsZS5jb20xHDAaBgNVBAMT' +
    'E2NhLm9yZzEuZXhhbXBsZS5jb20wHhcNMTgwODEzMDEyOTAwWhcNMTkwODEzMDEz' +
    'NDAwWjBCMTAwDQYDVQQLEwZjbGllbnQwCwYDVQQLEwRvcmcxMBIGA1UECxMLZGVw' +
    'YXJ0bWVudDExDjAMBgNVBAMTBXVzZXIzMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcD' +
    'QgAEcrfc0HHq5LG1UbyPSRLNjIQKqYoNY7/zPFC3UTJi3TTaIEqgVL6DF/8JIKuj' +
    'IT/lwkuemafacXj8pdPw3Zyqs6OB1zCB1DAOBgNVHQ8BAf8EBAMCB4AwDAYDVR0T' +
    'AQH/BAIwADAdBgNVHQ4EFgQUHFUlW/XJC7VcJe5pLFkz+xlMNpowKwYDVR0jBCQw' +
    'IoAgQ3hSDt2ktmSXZrQ6AY0EK2UHhXMx8Yq6O7XiA+X6vS4waAYIKgMEBQYHCAEE' +
    'XHsiYXR0cnMiOnsiaGYuQWZmaWxpYXRpb24iOiJvcmcxLmRlcGFydG1lbnQxIiwi' +
    'aGYuRW5yb2xsbWVudElEIjoidXNlcjMiLCJoZi5UeXBlIjoiY2xpZW50In19MAoG' +
    'CCqGSM49BAMCA0gAMEUCIQCNsmDjOXF/NvciSZebfk2hfSr/v5CqRD7pIHCq3lIR' +
    'lwIgPC/qGM1yeVinfN0z7M68l8rWn4M4CVR2DtKMpk3G9k9=' +
    '-----END CERTIFICATE-----';
  // By default, MockControllerAdapter will use this fingerprint as the `this.sender`
  const mockIdentity = 'B6:0B:37:7C:DF:D2:7A:08:0B:98:BF:52:A4:2C:DC:4E:CC:70:91:E1';

  let adapter: MockControllerAdapter;
  let productCtrl: ConvectorControllerClient<ProductController>;
  let sc_participantCtrl: ConvectorControllerClient<Sc_participantsController>;
  let productId = '123-123-123'
  before(async () => {
    // Mocks the blockchain execution environment
    adapter = new MockControllerAdapter();
    await adapter.init([
      {
        version: '*',
        controller: 'ProductController',
        name: join(__dirname, '..')
      },
      {
        version: '*',
        controller: 'Sc_participantsController',
        name: join(__dirname, '../../sc_participants-cc')
      }
    ]);
    adapter.stub['fingerprint'] = mockIdentity;
    productCtrl = ClientFactory(ProductController, adapter);
    sc_participantCtrl = ClientFactory(Sc_participantsController, adapter);
  });

  it('should try to create a product but no Halal Certification Body identity has been registered', async () => {
    const productSample = new Product({
      id: productId,
      name: 'Hersheys Chocolate'
    });

    await expect(productCtrl.create(productSample)).to.be.eventually
      .rejectedWith(Error);
  });

  it('should create the Halal Certification Body identity', async () => {
    await sc_participantCtrl.register('hcb', 'Halal Certification Body');

    const justSavedModel = await adapter.getById<Sc_participants>('hcb');

    expect(justSavedModel.id).to.exist;
  });

  it('should create a product', async () => {
    const productSample = new Product({
      id: productId, //Globaly declared hard coded value: '123-123-123'
      name: 'Hersheys Chocolate'
    });

    await productCtrl.create(productSample);

    const justSavedModel = await adapter.getById<Product>(productSample.id);

    expect(justSavedModel.name).to.exist;
  });

  it('should add a begin-date attribute through the hcb identity', async () => {
    let attributeId = 'begin-date';
    let attribute = new Attribute(attributeId);
    attribute.certifierID = 'hcb';
    attribute.content = Date.now().toString();
    attribute.issuedDate = Date.now();

    await productCtrl.addAttribute(productId, attribute);

    const justSavedModel = await adapter.getById<Product>(productId);
    expect(justSavedModel.id).to.exist;

    const resultingAttr = justSavedModel.attributes.find(attr => attr.id === attributeId);

    expect(resultingAttr).to.exist;
    expect(resultingAttr.id).to.eq(attribute.id);
  });

  it('should create a suppply chain participant for the BRC-Roasting', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;

    await sc_participantCtrl.register('brc', 'BRC - The Cocoa beans Roasting Company');

    const justSavedModel = await adapter.getById<Sc_participants>('brc');

    expect(justSavedModel.id).to.exist;
  });

  it('should try to create a product but the BRC-Roasting cannot', async () => {
    const productSample = new Product({
      id: productId + '1111',
      name: 'BRC - Chocolates'
    });

    await expect(productCtrl.create(productSample)).to.be.eventually
      .rejectedWith(Error);
  });

  it('should add a cocoa-beans-roasting attribute through the BRC-Roasting identity', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;

    let attributeId = 'cocoa-beans-roasting';
    let attribute = new Attribute(attributeId);
    attribute.certifierID = 'brc';
    attribute.content = {
      quantity: '150Kg',
      cleaning: 'Done on site',
      packaging: '3 packages of 50Kg each'
    };
    attribute.issuedDate = Date.now();

    await productCtrl.addAttribute(productId, attribute);

    const product = await adapter.getById<Product>(productId);
    expect(product.id).to.exist;

    const resultingAttr = product.attributes.find(attr => attr.id === attributeId);
    expect(resultingAttr).to.exist;
    expect(resultingAttr.id).to.eq(attribute.id);
  });

  it('should try to change the begin-date atttribuute of HCB, with the BRC-Roasting identity', async () => {
    // Fake another certificate for tests
    (adapter.stub as any).usercert = fakeSecondParticipantCert;
    const product = await adapter.getById<Product>(productId);
    let attribute = product.attributes.find(attr => attr.id === 'begin-date');

    attribute.certifierID = 'brc';
    attribute.content = Date.now().toString();
    attribute.expired = true;
    await expect(productCtrl.addAttribute(productId, attribute)).to.be.eventually.rejectedWith(Error);
  });

  it('should log the manufacturing history of the given product', async () => {
    
    const product = await productCtrl.getProductTrail(productId);

    await expect(product).to.exist;
  });
});