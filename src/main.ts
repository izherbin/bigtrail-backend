import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'log', 'fatal', 'error', 'warn']
  })
  await app.listen(8800)
}
bootstrap()
