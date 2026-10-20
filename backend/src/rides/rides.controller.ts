import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RidesService } from './rides.service.js';

@Controller('rides')
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Get()
  findAll() {
    return this.ridesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ridesService.findOne(id);
  }
}
