import { AppError } from "@/errors/app-error";

export class InvalidCredentialsError extends AppError {
    readonly code = "INVALID_CREDENTIALS_ERROR";

    constructor() {
        super("Invalid email or password");
    }
}

export class EmailAlreadyExistsError extends AppError {
    readonly code = "EMAIL_EXISTS_ERROR";

    constructor() {
        super("An account with this email address already exists");
    }
}

export class AccountDisabledError extends AppError {
    readonly code = "ACCOUNT_DISABLED_ERROR";

    constructor() {
        super("This account has been disabled");
    }
}

export class AccountSuspendedError extends AppError {
    readonly code = "ACCOUNT_SUSPENDED_ERROR";

    constructor() {
        super("This account has been suspeneded");
    }
}