import { INestApplicationContext, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { IoAdapter } from '@nestjs/platform-socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import Redis from 'ioredis'
import { Server, ServerOptions } from 'socket.io'
import { AppModule } from './app.module'
class RedisIoAdapter extends IoAdapter {
  constructor(app: INestApplicationContext, private readonly redisAdapter: ReturnType<typeof createAdapter>) { super(app) }
  createIOServer(port: number, options?: ServerOptions) { const server = super.createIOServer(port, options) as Server; server.adapter(this.redisAdapter); return server }
}
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  if (process.env.REDIS_URL) {
    const pub = new Redis(process.env.REDIS_URL, { lazyConnect: true })
    const sub = pub.duplicate({ lazyConnect: true })
    await Promise.all([pub.connect(), sub.connect()])
    app.useWebSocketAdapter(new RedisIoAdapter(app, createAdapter(pub, sub)))
  }
  await app.listen(process.env.PORT || 3000, '0.0.0.0')
}
bootstrap()
