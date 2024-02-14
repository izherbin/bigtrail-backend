import { NestFactory } from '@nestjs/core'
import { AppModule } from './app/app.module'
import { urlencoded, json } from 'express'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose', 'log', 'fatal', 'error', 'warn'],
    cors: { origin: '*' }
  })
  app.use(json({ limit: '50mb' }))
  app.use(urlencoded({ extended: true, limit: '50mb' }))
  const { default: graphqlUploadExpress } = await import(
    'graphql-upload/graphqlUploadExpress.mjs'
  )
  app.use(graphqlUploadExpress({ maxFileSize: 2 * 1000 * 1000 }))
  await app.listen(8810)
  console.log(`App running at ${await app.getUrl()}`)
}
bootstrap()
