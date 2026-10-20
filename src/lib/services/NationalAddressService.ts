import axios from 'axios';

import {
  ApiEnvelope,
  Language,
  NationalAddressError,
  RawRegion,
  ReverseGeocodeResult,
  SearchResult,
  VerifyParams,
} from '../API';
import { CACHE_TTL_MS, CALLS_PER_MINUTE, IS_MOCK } from '../config';
import { parseReverseGeocode, parseSearch } from '../parsers';
import { RateLimiter, TtlCache } from '../quota';
import { MockNationalAddressRepository } from '../repositories/MockNationalAddressRepository';
import { NationalAddressRepository } from '../repositories/NationalAddressRepository';
import type { INationalAddressRepository } from '../repositories/interfaces/INationalAddressRepository';
import type { INationalAddressService } from './interfaces/INationalAddressService';

// About 11 m of precision. Taps this close together reuse one cached lookup.
const roundCoord = (value: number) => value.toFixed(4);

export const toNationalAddressError = (error: unknown): NationalAddressError => {
  if (error instanceof NationalAddressError) {
    return error;
  }
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (!error.response) return new NationalAddressError('NETWORK', error.message);
    if (status === 401) return new NationalAddressError('INVALID_KEY');
    if (status === 403) return new NationalAddressError('QUOTA_EXCEEDED');
    if (status === 429) return new NationalAddressError('RATE_LIMITED');
    if (status && status >= 500) return new NationalAddressError('SERVER', `HTTP ${status}`);
  }
  return new NationalAddressError('UNKNOWN', error instanceof Error ? error.message : String(error));
};

export class NationalAddressService implements INationalAddressService {
  private cache = new TtlCache<unknown>(CACHE_TTL_MS);
  private limiter = new RateLimiter(CALLS_PER_MINUTE, 60_000);

  constructor(private readonly repository: INationalAddressRepository) {}

  // Cache first, then the rate limiter, then the network. Error mapping is shared.
  private async run<T>(key: string, request: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key) as T | undefined;
    if (cached !== undefined) {
      return cached;
    }
    if (!this.limiter.tryAcquire()) {
      const seconds = Math.ceil(this.limiter.retryAfterMs() / 1000);
      throw new NationalAddressError('RATE_LIMITED', `retry in ${seconds}s`);
    }
    try {
      const result = await request();
      this.cache.set(key, result);
      return result;
    } catch (error) {
      throw toNationalAddressError(error);
    }
  }

  private ensureSuccess<T extends ApiEnvelope>(response: T): T {
    // The API reports "No results" as success=false in some versions. Treat it
    // as an empty result instead of an error.
    const noResults = /no result/i.test(response.statusdescription ?? '');
    if (response.success === false && !noResults) {
      throw new NationalAddressError('UNKNOWN', response.statusdescription ?? 'Request failed');
    }
    return response;
  }

  reverseGeocode(latitude: number, longitude: number, language: Language): Promise<ReverseGeocodeResult> {
    const key = `geocode:${language}:${roundCoord(latitude)},${roundCoord(longitude)}`;
    return this.run(key, async () => {
      const response = this.ensureSuccess(await this.repository.geocode(latitude, longitude, language));
      return parseReverseGeocode(response, { latitude, longitude });
    });
  }

  search(query: string, language: Language, page = 1): Promise<SearchResult> {
    const normalized = query.trim().replace(/\s+/g, ' ');
    return this.run(`search:${language}:${page}:${normalized.toLowerCase()}`, async () =>
      parseSearch(this.ensureSuccess(await this.repository.freeTextSearch(normalized, page, language))),
    );
  }

  verify(params: VerifyParams, language: Language): Promise<boolean> {
    const key = `verify:${params.buildingNumber}:${params.zipCode}:${params.additionalNumber}`;
    return this.run(key, async () =>
      Boolean(this.ensureSuccess(await this.repository.verify(params, language)).addressfound),
    );
  }

  regions(language: Language): Promise<RawRegion[]> {
    return this.run(`regions:${language}`, async () =>
      this.ensureSuccess(await this.repository.regions(language)).Regions ?? [],
    );
  }
}

export const nationalAddressService = new NationalAddressService(
  IS_MOCK ? new MockNationalAddressRepository() : new NationalAddressRepository(),
);
