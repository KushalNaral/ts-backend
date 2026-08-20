import type { PasswordHasher } from "@/auth/domain/password-hasher";
import type { UserRepository } from "@/auth/repository/user.repository";
import type { LoginData, RegisterData } from "@/auth/schemas/auth.schemas";

export class AuthService {
    constructor(
        private readonly passwordManager: PasswordHasher,
        private readonly userRepository: UserRepository
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