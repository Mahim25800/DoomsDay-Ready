import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { parseMovieInput } from './movie-input';
import { MoviesService } from './movies.service';

function validateMovieId(id: number) {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new BadRequestException('Movie ID must be a positive integer.');
  }
}

@Controller('movies')
export class MoviesController {
  constructor(private readonly movies: MoviesService) {}

  @Get()
  list() {
    return this.movies.list();
  }

  @Get(':id/rewatch-order')
  rewatchOrder(@Param('id', ParseIntPipe) id: number) {
    validateMovieId(id);
    return this.movies.rewatchOrder(id);
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
    validateMovieId(id);
    return this.movies.update(id, parseMovieInput(body));
  }
}
