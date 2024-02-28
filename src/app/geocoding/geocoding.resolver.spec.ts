import { Test, TestingModule } from '@nestjs/testing';
import { GeocodingResolver } from './geocoding.resolver';

describe('GeocodingResolver', () => {
  let resolver: GeocodingResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GeocodingResolver],
    }).compile();

    resolver = module.get<GeocodingResolver>(GeocodingResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
