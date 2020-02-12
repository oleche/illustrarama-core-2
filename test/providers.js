const sinon = require('sinon');
const Controller = require('../controller/providers');
const Providers = require('../model/providers');

describe('Providers Controller', () => {
  const req = {
    body: {
      _id: '5e43f483be2b9f12cc21538c',
      name: 'Creative Bloq',
      url: 'https://www.creativebloq.com/',
      description: '',
      tag: 'creativebloq',
      country: 'United Kingdom',
      logo: 'United Kingdom',
      createdAt: '2020-02-12T12:50:12.004Z',
      updatedAt: '2020-02-12T12:50:12.004Z',
      __v: 0,
    },
    query: [],
  };
  const error = new Error({ error: 'blah blah' });
  let res = {};
  let expectedResult;

  describe('index (get all)', () => {
    beforeEach(() => {
      res = {
        json: sinon.spy(),
        status: sinon.stub().returns({ end: sinon.spy() }),
        setHeader: (a, b) => true,
        locals: {
          providers: Providers,
        },
      };
      expectedResult = [{}, {}, {}];
    });
    it('should return array of vehicles or empty array', sinon.test(function () {
      const query = {};
      query.skip = 0;
      query.limit = 20;
      this.stub(Providers, 'find').returns(
        {
          sort: this.stub().returns({
            exec: this.stub().yields(null, expectedResult),
          }),
        },
      );
      Controller.findAll(req, res);
      sinon.assert.calledWith(Providers.find, {}, {}, query);
      sinon.assert.calledWith(res.json, sinon.match.array);
    }));
    it('should return status 500 on server error', sinon.test(function () {
      this.stub(Providers, 'find').returns(
        {
          sort: this.stub().returns({
            exec: this.stub().yields(error),
          }),
        },
      );
      Controller.findAll(req, res);
      sinon.assert.calledWith(Providers.find, {});
      sinon.assert.calledWith(res.status, 500);
    }));
  });
});
