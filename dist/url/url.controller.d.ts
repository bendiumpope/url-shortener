import { UrlService } from './url.service';
import { CreateUrlDto } from './dto/create-url.dto';
import type { Response } from 'express';
export declare class UrlController {
    private readonly urlService;
    constructor(urlService: UrlService);
    create(createUrlDto: CreateUrlDto): Promise<string>;
    findOne(shortCode: string, res: Response): Promise<void>;
}
