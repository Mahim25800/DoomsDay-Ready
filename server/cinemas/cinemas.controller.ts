import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { CinemasService } from './cinemas.service';

@Controller('cinemas')
export class CinemasController {
  constructor(private readonly cinemas: CinemasService) {}

  @Get()
  list() {
    return this.cinemas.list();
  }

  @Get(':id/booking')
  bookingQuote(@Param('id', ParseIntPipe) id: number, @Query('groupSize') groupSize: unknown) {
    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new BadRequestException('Cinema ID must be a positive integer.');
    }
    if (typeof groupSize !== 'string' || !/^\d+$/.test(groupSize)) {
      throw new BadRequestException('Group size must be an integer from 1 to 10000.');
    }
    const seats = Number(groupSize);
    if (seats < 1 || seats > 10_000) {
      throw new BadRequestException('Group size must be an integer from 1 to 10000.');
    }

    return this.cinemas.bookingQuote(id, seats);
  }

  @Post()
  create(@Body() body: unknown) {
    if (body === null || typeof body !== 'object' || Array.isArray(body)) {
      throw new BadRequestException('Send a cinema as a JSON object.');
    }

    const { name, bundleSizes } = body as Record<string, unknown>;
    if (typeof name !== 'string' || !name.trim()) {
      throw new BadRequestException('Name must be a non-empty string.');
    }
    if (!Array.isArray(bundleSizes) || bundleSizes.length < 1 || bundleSizes.length > 10) {
      throw new BadRequestException('Provide between 1 and 10 bundle sizes.');
    }
    if (!bundleSizes.every(size => typeof size === 'number' && Number.isInteger(size) && size >= 1 && size <= 500)) {
      throw new BadRequestException('Each bundle size must be an integer from 1 to 500.');
    }
    if (new Set(bundleSizes).size !== bundleSizes.length) {
      throw new BadRequestException('Bundle sizes must be distinct.');
    }

    return this.cinemas.create(name.trim(), bundleSizes);
  }
}
