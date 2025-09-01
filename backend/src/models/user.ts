import { User } from '../types/user';

const users = new Map<string, User>();

export function saveUser(user: User) {
  users.set(user.id, user);
}

export function getUser(id: string): User | undefined {
  return users.get(id);
}
