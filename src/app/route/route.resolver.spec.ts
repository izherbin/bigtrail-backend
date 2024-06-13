import { Test, TestingModule } from '@nestjs/testing'
import { RouteResolver } from './route.resolver'
import { RouteService } from './route.service'

describe('RouteResolver', () => {
  let resolver: RouteResolver

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RouteResolver, RouteService]
    }).compile()

    resolver = module.get<RouteResolver>(RouteResolver)
  })

  it('should be defined', () => {
    expect(resolver).toBeDefined()
  })
})
