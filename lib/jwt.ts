import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

export async function verifyJwt(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { userId: string; role: Role };
}