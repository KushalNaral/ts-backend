import type { AuthUnitOfWork } from "@/auth/application/auth-transaction-scope";
import { toPublicUser } from "@/auth/application/mapper/user.mapper";
import type { PasswordHasher } from "@/auth/domain/password-hasher";
import type { UserRepository } from "@/auth/repository/user.repository";
import type { LoginData, RegisterData } from "@/auth/schemas/auth.schemas";
import { EmailAlreadyExistsError } from "@/errors/auth-errors";

export class AuthService {
    constructor(
        private readonly authUnitOfWork: AuthUnitOfWork,
        private readonly passwordHasher: PasswordHasher,
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

    }

    async refresh(){

    }

    async logout(){

    }
}