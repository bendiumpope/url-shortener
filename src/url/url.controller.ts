import { Controller, Get, Post, Body, Param, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import type { Response } from 'express';

@Controller()
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @Post('url')
  create(@Body() createUrlDto: CreateUrlDto) {
    return this.urlService.create(createUrlDto);
  }

  @Get(':shortCode')
  async findOne(@Param('shortCode') shortCode: string, @Res() res: Response) {
    const longUrl = await this.urlService.findOne(shortCode);
    res.redirect(longUrl);
  }
}
