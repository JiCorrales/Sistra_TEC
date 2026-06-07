import { mockUsers } from "../data/mockData";

const STORAGE_KEY = "sistratec_admin_users";

const readStoredUsers = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);
  return storedValue ? JSON.parse(storedValue) : null;
};

const persistUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

export const getAdminUsers = async () => {
  const storedUsers = readStoredUsers();
  return storedUsers || mockUsers;
};

export const updateAdminUserAccess = async (userId, accessData) => {
  const users = await getAdminUsers();
  const updatedUsers = users.map((user) =>
    user.id === userId ? { ...user, ...accessData, id: userId } : user
  );

  persistUsers(updatedUsers);
  return updatedUsers.find((user) => user.id === userId);
};

export const toggleAdminUserStatus = async (userId) => {
  const users = await getAdminUsers();
  const updatedUsers = users.map((user) => {
    if (user.id !== userId) return user;

    return {
      ...user,
      estado: user.estado === "Activo" ? "Inactivo" : "Activo",
    };
  });

  persistUsers(updatedUsers);
  return updatedUsers;
};
