import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../users/enums/user.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    create: jest.Mock;
    findOne: jest.Mock;
    updateLastLogin: jest.Mock;
    count: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn().mockImplementation((payload) => Promise.resolve({ id: 1, ...payload })),
      findOne: jest.fn(),
      updateLastLogin: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Regression test for the bootstrap fix: registration used to hardcode
  // UserRole.USER unconditionally, which meant nobody could ever become an
  // admin on a fresh install (promoting a user requires already being one).
  describe('register() first-user bootstrap', () => {
    const basePayload = {
      username: 'admin1',
      email: 'admin@example.com',
      password: 'password123',
      full_name: 'Admin One',
    };

    it('makes the first registered user SUPERADMIN when the DB has no users yet', async () => {
      usersService.count.mockResolvedValue(0);

      await service.register(basePayload);

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.SUPERADMIN, status: UserStatus.ACTIVE }),
      );
    });

    it('makes subsequent registrations a regular USER', async () => {
      usersService.count.mockResolvedValue(1);

      await service.register({ ...basePayload, username: 'user2', email: 'user2@example.com' });

      expect(usersService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.USER }),
      );
    });
  });
});
