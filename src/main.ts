import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'log', 'fatal', 'error', 'warn'],
    cors: { origin: '*' }
  })
  const { default: graphqlUploadExpress } = await import(
    'graphql-upload/graphqlUploadExpress.mjs'
  )
  app.use(graphqlUploadExpress({ maxFileSize: 2 * 1000 * 1000 }))
  await app.listen(8800)
  console.log(`App running at ${await app.getUrl()}`)
}
bootstrap()
