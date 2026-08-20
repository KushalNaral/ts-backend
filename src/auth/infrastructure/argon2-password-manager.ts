import type { PasswordHasher } from "@/auth/domain/password-hasher";
import * as argon2 from "argon2";


export class Argon2PasswordManager implements PasswordHasher {
    async hashPassword(password: string): Promise<string> {
        try {
            const hash = await argon2.hash(password)
            return hash;
        } catch {
            throw new Error("error while hashing the password: argon2")
        }
    }
    async verifyPassword(password: string, passwordHash: string): Promise<boolean> {
         try {
            const isValid = argon2.verify(passwordHash, password)
            return isValid;
        } catch {
            throw new Error("error while verifying the password: argon2")
        }
    }
    
}