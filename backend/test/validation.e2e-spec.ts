import {
  Body,
  Controller,
  INestApplication,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import request from 'supertest';
import { App } from 'supertest/types';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { TransformInterceptor } from '../src/common/interceptors/transform.interceptor';

class TestSampleDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  age: number;
}

@Controller('test-validation')
class TestValidationController {
  @Post()
  sample(@Body() dto: TestSampleDto) {
    return { received: dto };
  }
}

interface ErrorResponseBody {
  success: boolean;
  error: {
    code: string;
    message: string;
  };
}

describe('Global Validation (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestValidationController],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalInterceptors(new TransformInterceptor());

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('should accept valid payloads with whitelisted properties', async () => {
    const validPayload = { name: 'Kano Jigoro', age: 77 };

    const response = await request(app.getHttpServer())
      .post('/api/test-validation')
      .send(validPayload)
      .expect(201);

    expect(response.body).toEqual({
      success: true,
      data: {
        received: {
          name: 'Kano Jigoro',
          age: 77,
        },
      },
    });
  });

  it('should reject requests with non-whitelisted properties (forbidNonWhitelisted)', async () => {
    const payloadWithExtra = {
      name: 'Kano Jigoro',
      age: 77,
      maliciousProperty: 'hack',
    };

    const response = await request(app.getHttpServer())
      .post('/api/test-validation')
      .send(payloadWithExtra)
      .expect(400);

    const body = response.body as ErrorResponseBody;
    expect(body.success).toBe(false);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.message).toContain(
      'property maliciousProperty should not exist',
    );
  });

  it('should reject requests with invalid types (class-validator)', async () => {
    const payloadWithInvalidTypes = {
      name: '',
      age: 'not-a-number',
    };

    const response = await request(app.getHttpServer())
      .post('/api/test-validation')
      .send(payloadWithInvalidTypes)
      .expect(400);

    const body = response.body as ErrorResponseBody;
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.message).toContain('name should not be empty');
  });
});
