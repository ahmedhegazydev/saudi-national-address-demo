import { AxiosError, AxiosHeaders } from 'axios';

import { NationalAddressError } from '../API';
import { MockNationalAddressRepository } from '../repositories/MockNationalAddressRepository';
import { NationalAddressService, toNationalAddressError } from '../services/NationalAddressService';

const httpError = (status?: number) =>
  new AxiosError(
    'boom',
    undefined,
    undefined,
    undefined,
    status === undefined
      ? undefined
      : { status, statusText: '', headers: {}, config: { headers: new AxiosHeaders() }, data: null },
  );

describe('toNationalAddressError', () => {
  it.each([
    [401, 'INVALID_KEY'],
    [403, 'QUOTA_EXCEEDED'],
    [429, 'RATE_LIMITED'],
    [503, 'SERVER'],
    [undefined, 'NETWORK'],
  ])('maps HTTP %p to %s', (status, code) => {
    expect(toNationalAddressError(httpError(status)).code).toBe(code);
  });
});

describe('NationalAddressService (mock repository)', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const resolve = async <T,>(promise: Promise<T>) => {
    await jest.runAllTimersAsync();
    return promise;
  };

  it('verifies the docs sample address', async () => {
    const service = new NationalAddressService(new MockNationalAddressRepository());
    const params = { buildingNumber: '8228', zipCode: '12643', additionalNumber: '2121' };
    await expect(resolve(service.verify(params, 'E'))).resolves.toBe(true);
    await expect(resolve(service.verify({ ...params, additionalNumber: '0000' }, 'E'))).resolves.toBe(false);
  });

  it('serves repeated searches from cache instead of spending quota', async () => {
    const repository = new MockNationalAddressRepository();
    const spy = jest.spyOn(repository, 'freeTextSearch');
    const service = new NationalAddressService(repository);
    await resolve(service.search('riyadh', 'E'));
    await resolve(service.search('  Riyadh ', 'E'));
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('blocks the 6th uncached call within a minute', async () => {
    const service = new NationalAddressService(new MockNationalAddressRepository());
    for (let i = 0; i < 5; i++) {
      await resolve(service.search(`query ${i}`, 'E'));
    }
    const sixth = service.search('query 6', 'E');
    await expect(sixth).rejects.toBeInstanceOf(NationalAddressError);
    await expect(sixth).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });
});
