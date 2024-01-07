import { Test, TestingModule } from '@nestjs/testing';
import { MinioClientResolver } from './minio-client.resolver';

describe('MinioClientResolver', () => {
  let resolver: MinioClientResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MinioClientResolver],
    }).compile();

    resolver = module.get<MinioClientResolver>(MinioClientResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
