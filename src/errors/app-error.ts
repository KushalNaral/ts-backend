export abstract class AppError extends Error {
    abstract readonly code: string;

    protected constructor(
        message: string
    ) {
        super(message);
        this.name = this.constructor.name;

    }
}

// so we are creating an abstraction on errors with just codes
// this was realized as applicaiton level errors should be mapped towards their respective stages
// we extend this class and then realize the errors based on the codes
// but the codes dont represent the statuses as well, like status 422, EmailAlreadyExistsError
// this concern should not be with the error class but rather than the api service
// similarly, errors are not mapped into trpc due to the reason that the auth service can be later changeed to another infra like grapql, rest etc
// basically we are loosening the coupling
// basic flow
// AppError
// │
// ├── AuthError
// │   ├── InvalidCredentialsError
// │   ├── EmailAlreadyExistsError
// │   ├── AccountDisabledError
// │   └── AccountSuspendedError
// │
// ├── AuthorizationError
// │   └── ForbiddenError
// │
// └── ResourceError
//     ├── NotFoundError
//     └── ConflictError