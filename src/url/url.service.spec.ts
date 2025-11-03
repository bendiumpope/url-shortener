import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { NotFoundException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as crypto from 'crypto';

jest.mock('fs/promises');
jest.mock('crypto');

const MOCK_DB_PATH = expect.any(String);

describe('UrlService', () => {
  let service: UrlService;
  const mockedFs = jest.mocked(fs);
  const mockedCrypto = jest.mocked(crypto);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UrlService],
    }).compile();

    service = module.get<UrlService>(UrlService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a short code for a new URL', async () => {
      const longUrl = 'https://example.com';
      const shortCode = 'a1b2c3d4';
      mockedFs.readFile.mockResolvedValueOnce('{}');
      (mockedCrypto.randomBytes as jest.Mock).mockReturnValueOnce(
        Buffer.from(shortCode, 'hex'),
      );
      
      const result = await service.create({ longUrl });

      expect(result).toBe(shortCode);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        MOCK_DB_PATH,
        JSON.stringify({ [shortCode]: longUrl }, null, 2),
      );
    });

    it('should handle a short code collision by generating a new one', async () => {
      const existingShortCode = 'aabbccdd';
      const newShortCode = '11223344';
      const longUrl = 'https://example.com';
      const db = { [existingShortCode]: 'https://existing.com' };

      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(db));
      (mockedCrypto.randomBytes as jest.Mock)
        .mockReturnValueOnce(Buffer.from(existingShortCode, 'hex'))
        .mockReturnValueOnce(Buffer.from(newShortCode, 'hex'));

      const result = await service.create({ longUrl });

      expect(result).toBe(newShortCode);
      expect(mockedCrypto.randomBytes).toHaveBeenCalledTimes(2);
      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        MOCK_DB_PATH,
        JSON.stringify({ ...db, [newShortCode]: longUrl }, null, 2),
      );
    });
  });

  describe('findOne', () => {
    it('should return the long URL for a valid short code', async () => {
      const shortCode = 'a1b2c3d4';
      const longUrl = 'https://example.com';
      const db = { [shortCode]: longUrl };
      mockedFs.readFile.mockResolvedValueOnce(JSON.stringify(db));

      const result = await service.findOne(shortCode);

      expect(result).toBe(longUrl);
    });

    it('should throw NotFoundException for a non-existent short code', async () => {
      const shortCode = 'notfound';
      mockedFs.readFile.mockResolvedValueOnce('{}');

      await expect(service.findOne(shortCode)).rejects.toThrow(NotFoundException);
    });

    it('should handle the db file not existing', async () => {
      const shortCode = 'anycode';
      mockedFs.readFile.mockRejectedValueOnce({ code: 'ENOENT' });
      
      await expect(service.findOne(shortCode)).rejects.toThrow(NotFoundException);
    });

    it('should throw an error for a malformed db file', async () => {
        mockedFs.readFile.mockResolvedValueOnce('not valid json');
  
        await expect(service.findOne('anycode')).rejects.toThrow();
    });
  });
});
