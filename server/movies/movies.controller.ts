import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { parseMovieInput } from './movie-input';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  list() {
    return this.movies.list();
  }

  @Post()
  create(@Body() body: unknown) {
    const { title, releaseYear, runtimeMinutes, watched = false, prerequisiteIds = [] } = parseMovieInput(body);
    if (title === undefined || releaseYear === undefined || runtimeMinutes === undefined) {
      throw new BadRequestException('Title, release year, and runtime are required.');
    }

    return this.movies.create({ title, releaseYear, runtimeMinutes, watched, prerequisiteIds });
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: unknown) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('Movie ID must be a positive integer.');
    }

    return this.movies.update(id, parseMovieInput(body));
  }
}
