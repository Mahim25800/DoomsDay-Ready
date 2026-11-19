import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('health')
class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  check() {
    try {
      this.database.connection.prepare('SELECT 1').get();
    } catch {
      throw new ServiceUnavailableException('SQLite connection check failed');
    }

    return { status: 'ok', database: 'sqlite' };
  }
}

@Module({ controllers: [HealthController], providers: [DatabaseService] })
export class AppModule {}
