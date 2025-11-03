import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUrlDto } from './dto/create-url.dto';
import * as fs from 'fs/promises';
import { randomBytes } from 'crypto';
import * as path from 'path';

interface UrlData {
  [shortCode: string]: string;
}

@Injectable()
export class UrlService {
  private readonly dbPath = path.resolve(__dirname, '..', '..', 'urls.json');

  private async readDb(): Promise<UrlData> {
    try {
      const data = await fs.readFile(this.dbPath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {};
      }
      throw error;
    }
  }

  private async writeDb(data: UrlData): Promise<void> {
    await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
  }

  async create(createUrlDto: CreateUrlDto): Promise<string> {
    const { longUrl } = createUrlDto;
    const db = await this.readDb();

    let shortCode;
    do {
      shortCode = randomBytes(4).toString('hex');
    } while (db[shortCode]);

    db[shortCode] = longUrl;
    await this.writeDb(db);

    return shortCode;
  }

  async findOne(shortCode: string): Promise<string> {
    const db = await this.readDb();
    const longUrl = db[shortCode];
    if (!longUrl) {
      throw new NotFoundException('URL not found');
    }
    return longUrl;
  }
}
