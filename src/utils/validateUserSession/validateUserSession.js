import { User } from "../../classes";

export default async function validateUserSession() {
  const userController = new User();
  const response = await userController.validadeSession();

  return response.status === 200;
}