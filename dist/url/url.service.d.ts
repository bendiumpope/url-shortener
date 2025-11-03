import { CreateUrlDto } from './dto/create-url.dto';
export declare class UrlService {
    private readonly dbPath;
    private readDb;
    private writeDb;
    create(createUrlDto: CreateUrlDto): Promise<string>;
    findOne(shortCode: string): Promise<string>;
}
