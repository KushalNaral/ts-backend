import type { PasswordHasher } from "@/auth/domain/password-manager";
import type { UserRepository } from "@/auth/repository/user.repository";

export class AuthService {
    constructor(
        private readonly passwordManager: PasswordHasher,
        private readonly userRepository: UserRepository
    ){}

    async register(){
        
    }

    async login(){

    }

    async refresh(){

    }

    async logout(){

    }
}