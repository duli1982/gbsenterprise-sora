import request from 'supertest';
import app from '../src/index';

const insertMock = jest.fn().mockResolvedValue(undefined);
const queryMock = jest.fn();

jest.mock('../src/db/bigquery', () => ({
  dataset: () => ({ table: () => ({ insert: insertMock }) }),
  query: queryMock,
}));

jest.mock('../src/middleware/auth', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    req.user = { id: 'user1' };
    next();
  },
}));

describe('Analytics events', () => {
  beforeAll(() => {
    process.env.JWT_SECRET = 'test-secret';
  });

  beforeEach(() => {
    insertMock.mockClear();
    queryMock.mockClear();
  });

  it('streams events to BigQuery', async () => {
    const res = await request(app)
      .post('/analytics/events')
      .send({ eventType: 'view', moduleId: 'm1', metadata: { foo: 'bar' } });
    expect(res.status).toBe(201);
    expect(insertMock).toHaveBeenCalledTimes(1);
    const rows = insertMock.mock.calls[0][0];
    expect(rows[0]).toMatchObject({
      userId: 'user1',
      eventType: 'view',
      moduleId: 'm1',
    });
  });

  it('requires eventType', async () => {
    const res = await request(app).post('/analytics/events').send({});
    expect(res.status).toBe(400);
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('returns dashboard summary', async () => {
    queryMock.mockResolvedValue([[{ eventType: 'view', moduleId: 'm1', total: '1' }]]);
    const res = await request(app).get('/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ eventType: 'view', moduleId: 'm1', total: '1' }]);
  });
});
