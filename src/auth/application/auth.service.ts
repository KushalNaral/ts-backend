import type { AuthUnitOfWork } from "@/auth/application/auth-transaction-scope";
import { toPublicUser } from "@/auth/application/mapper/user.mapper";
import type { PasswordHasher } from "@/auth/domain/password-hasher";
import type { UserRepository } from "@/auth/repository/user.repository";
import type { LoginData, RegisterData } from "@/auth/schemas/auth.schemas";
import { EmailAlreadyExistsError } from "@/errors/auth-errors";
import type { TokenService } from "@/identity/domain/token-service";
import type { SessionService } from "@/identity/domain/session-service";
import { InvalidCredentialsError } from "@/errors/auth-errors";

export class AuthService {
    constructor(
        private readonly authUnitOfWork: AuthUnitOfWork,
        private readonly passwordHasher: PasswordHasher,
        private readonly tokenService: TokenService,
        private readonly sessionService: SessionService,
    ){}

    async register(input: RegisterData){

        const passwordHash = await this.passwordHasher.hashPassword(input.password);

        const user = await this.authUnitOfWork.transaction(async(tx) => {
            const existing = await tx.users.findByEmail(input.email);
            if(existing){
                throw new EmailAlreadyExistsError();
            }

           return await tx.users.create({
                name: input.name,
                email: input.email,
                passwordHash,
                role: 'customer',
                lastLoginAt: new Date(),
            });
        });

        return {
            user: toPublicUser(user)
        };
        
    }

    async login(input: LoginData){
        const user = await this.authUnitOfWork.transaction(async(tx) => {
            const existing = await tx.users.findByEmail(input.email);
            if(!existing){
                throw new InvalidCredentialsError();
            }

            const isValid = await this.passwordHasher.verifyPassword(input.password, existing.passwordHash);
            if(!isValid){
                throw new InvalidCredentialsError();
            }

            // Update last login
            await tx.users.update(existing.id, { name: existing.name, lastLoginAt: new Date() });

            return existing;
        });

        // Generate tokens
        const tokens = await this.tokenService.generateTokenPair(
            user.id,
            user.email,
            user.role
        );

        // Create session
        await this.sessionService.createSession(user.id, tokens.refreshToken);

        return {
            user: toPublicUser(user),
            ...tokens
        };
    }

    async logout(userId: string, refreshToken: string) {
        await this.sessionService.revokeSession(userId, refreshToken);
        return { success: true };
    }

    async refresh(userId: string, refreshToken: string) {
        // Validate refresh token
        const isValid = await this.sessionService.validateSession(userId, refreshToken);
        if (!isValid) {
            throw new Error('Invalid or expired refresh token');
        }

        // Get user
        const user = await this.authUnitOfWork.transaction(async(tx) => {
            return await tx.users.findById(userId);
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate new tokens
        const tokens = await this.tokenService.generateTokenPair(
            user.id,
            user.email,
            user.role
        );

        // Revoke old session and create new one
        await this.sessionService.revokeSession(userId, refreshToken);
        await this.sessionService.createSession(user.id, tokens.refreshToken);

        return {
            user: toPublicUser(user),
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresIn: tokens.expiresIn,
        };
    }

    async getUser(userId: string) {
        const user = await this.authUnitOfWork.transaction(async(tx) => {
            return await tx.users.findById(userId);
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            user: toPublicUser(user)
        };
    }

    async updateUser(userId: string, data: { name: string }) {
        const user = await this.authUnitOfWork.transaction(async(tx) => {
            return await tx.users.update(userId, { name: data.name });
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            user: toPublicUser(user)
        };
    }

    async deleteUser(userId: string) {
        await this.authUnitOfWork.transaction(async(tx) => {
            await tx.users.delete(userId);
        });

        return { success: true };
    }
}