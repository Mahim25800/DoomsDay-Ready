import { Controller, Get, Module, ServiceUnavailableException } from '@nestjs/common';
import { CinemasController } from './cinemas/cinemas.controller';
import { CinemasService } from './cinemas/cinemas.service';
import { DatabaseService } from './database.service';
import { MoviesController } from './movies/movies.controller';
import { MoviesService } from './movies/movies.service';

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

@Module({
  controllers: [HealthController, MoviesController, CinemasController],
  providers: [DatabaseService, MoviesService, CinemasService],
})
export class AppModule {}
