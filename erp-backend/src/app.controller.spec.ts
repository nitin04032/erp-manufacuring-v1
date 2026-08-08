/// <reference types="jest" />
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let dataSource: { query: jest.Mock };

  beforeEach(async () => {
    dataSource = { query: jest.fn().mockResolvedValue([{ '?column?': 1 }]) };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService, { provide: DataSource, useValue: dataSource }],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('reports database: up when the DB responds', async () => {
      const result = await appController.getHealth();
      expect(result.status).toBe('ok');
      expect(result.checks.database).toBe('up');
      expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    });

    it('reports database: down (but still HTTP-200-shaped) when the DB throws', async () => {
      dataSource.query.mockRejectedValueOnce(new Error('connection refused'));
      const result = await appController.getHealth();
      expect(result.status).toBe('degraded');
      expect(result.checks.database).toBe('down');
    });
  });
});
