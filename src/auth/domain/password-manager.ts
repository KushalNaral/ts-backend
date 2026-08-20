export interface PasswordHasher {
    hashPassword(password: string): Promise<string>,
    verifyPassword(password: string, passwordHash: string): Promise<boolean>
}

// so this is me practising domain based structuring
// the password hashing and verificaion might depend on the infra right?
// so how about we just create an abstractoin and implement it later with different forms?
// eg Argon2PasswordManager, Rsa256PasswordManager? something as such
// just an idea which can be expanded upon
// plus i can test properly with this i think
// kind of how interfaces are created in golang