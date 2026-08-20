import type { AuthUnitOfWork } from "@/auth/application/auth-transaction-scope";
import type { PasswordHasher } from "@/auth/domain/password-hasher";
import type { UserRepository } from "@/auth/repository/user.repository";
import type { LoginData, RegisterData } from "@/auth/schemas/auth.schemas";

export class AuthService {
    constructor(
        private readonly authUnitOfWork: AuthUnitOfWork,
        private readonly passwordManager: PasswordHasher,
    ){}

    async register(input: RegisterData){
        
    }

    async login(input: LoginData){

    }

    async refresh(){

    }

    async logout(){

    }
}