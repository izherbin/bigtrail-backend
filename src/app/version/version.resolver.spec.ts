import { Test, TestingModule } from '@nestjs/testing';
import { VersionResolver } from './version.resolver';
import { VersionService } from './version.service';

describe('VersionResolver', () => {
  let resolver: VersionResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VersionResolver, VersionService],
    }).compile();

    resolver = module.get<VersionResolver>(VersionResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
