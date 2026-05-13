// Created a custom error class

// Custom class inherits from JavaScript’s built-in Error class
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    // calling the constructor of JavaScript’s built-in Error class. Equivalent to: Error(message)
    super(message);
    this.statusCode = statusCode;
  }
}
