const should = require('should');
const helper = require('node-red-node-test-helper');
const marketingMailchimp = require('../nodes/marketingMailchimp');
const Context = require('@node-red/runtime/lib/nodes/context');
const sinon = require('sinon');
const Support = require('../nodes/support');

helper.init(require.resolve('node-red'));

describe('marketingMailchimp Node', () => {
  beforeEach((done) => {
    helper.startServer(done);
  });

  function initContext(done) {
    Context.init({
      contextStorage: {
        memory0: {
          module: 'memory',
        },
        memory1: {
          module: 'memory',
        },
      },
    });
    Context.load().then(function () {
      done();
    });
  }

  afterEach((done) => {
    helper
      .unload()
      .then(function () {
        return Context.clean({ allNodes: {} });
      })
      .then(function () {
        return Context.close();
      })
      .then(function () {
        helper.stopServer(done);
      });

    // Restore the default sandbox here
    sinon.restore();

    // helper.unload();
    // helper.stopServer(done);
  });

  it('should be loaded', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'marketingMailchimp',
        name: 'marketingMailchimp',
        wires: [['n2']],
        z: 'flow',
        rules: [{ t: 'set', p: 'payload', to: '#:(memory1)::flowValue', tot: 'flow' }],
      },
    ];

    helper.load(marketingMailchimp, flow, () => {
      initContext(function () {
        const n1 = helper.getNode('n1');
        try {
          n1.should.have.property('name', 'marketingMailchimp');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should have correct request with data', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'marketingMailchimp',
        name: 'marketingMailchimp',
        wires: [['n2']],
        z: 'flow',
        bodyPost: 'data',
        rules: [{ t: 'set', p: 'payload', to: '#:(memory1)::flowValue', tot: 'flow' }],
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(marketingMailchimp, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      sinon.stub(Support, 'sendRequest').resolves('ok');

      n1.receive({ data: { cardCode: '00000001', cardName: '0000001' } });

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('_msgid');
          msg.should.have.property('payload', 'ok');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should have request without data', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'marketingMailchimp',
        name: 'marketingMailchimp',
        wires: [['n2']],
        z: 'flow',
        bodyPost: 'data',
        rules: [{ t: 'set', p: 'payload', to: '#:(memory1)::flowValue', tot: 'flow' }],
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(marketingMailchimp, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      sinon.stub(Support, 'sendRequest').resolves('ok');
      n1.receive({});

      n2.on('input', (msg) => {
        try {
          msg.should.have.property('_msgid');
          msg.should.have.property('payload', 'ok');
          done();
        } catch (err) {
          done(err);
        }
      });
    });
  });

  it('should handle the error', (done) => {
    const flow = [
      {
        id: 'n1',
        type: 'marketingMailchimp',
        name: 'marketingMailchimp',
        wires: [['n2']],
        z: 'flow',
        bodyPost: 'data',
        rules: [{ t: 'set', p: 'payload', to: '#:(memory1)::flowValue', tot: 'flow' }],
      },
      { id: 'n2', type: 'helper' },
    ];
    helper.load(marketingMailchimp, flow, () => {
      const n2 = helper.getNode('n2');
      const n1 = helper.getNode('n1');

      const expected = new Error('Custom error');

      sinon.stub(Support, 'sendRequest').rejects(expected);

      n1.receive({ data: { cardCode: '00000001', cardName: '0000001' } });

      n1.on('call:error', (error) => {
        should.deepEqual(error.args[0], expected);
        done();
      });
    });
  });
});
