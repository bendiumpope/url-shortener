import { Test, TestingModule } from '@nestjs/testing';
import { UrlController } from './url.controller';
import { UrlService } from './url.service';
import { NotFoundException } from '@nestjs/common';
import type { Response } from 'express';

describe('UrlController', () => {
  let controller: UrlController;
  let service: UrlService;

  const mockUrlService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  const mockResponse = {
    redirect: jest.fn(),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UrlController],
      providers: [
        {
          provide: UrlService,
          useValue: mockUrlService,
        },
      ],
    }).compile();

    controller = module.get<UrlController>(UrlController);
    service = module.get<UrlService>(UrlService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call urlService.create and return the result', async () => {
      const createUrlDto = { longUrl: 'https://example.com' };
      const expectedResult = 'shortCode';
      mockUrlService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUrlDto);

      expect(service.create).toHaveBeenCalledWith(createUrlDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should call res.redirect with the long URL', async () => {
      const shortCode = 'shortCode';
      const longUrl = 'https://example.com';
      mockUrlService.findOne.mockResolvedValue(longUrl);

      await controller.findOne(shortCode, mockResponse);

      expect(service.findOne).toHaveBeenCalledWith(shortCode);
      expect(mockResponse.redirect).toHaveBeenCalledWith(longUrl);
    });

    it('should propagate NotFoundException from the service', async () => {
      const shortCode = 'notfound';
      mockUrlService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(shortCode, mockResponse)).rejects.toThrow(NotFoundException);
      expect(mockResponse.redirect).not.toHaveBeenCalled();
    });
  });
});
