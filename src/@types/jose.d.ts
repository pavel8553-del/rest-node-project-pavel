import "jose";

declare module "jose" {
  interface JWTPayload {
    _id: string;
    email: string;
    isBusiness: boolean;
    isAdmin: boolean;
  }
}
