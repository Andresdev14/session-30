const STORAGE_KEY = "usuario";

export function guardaUsuario(usuario) {
  if (!usuario) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
}

export function obtenerUsuario() {
  const storedUser = localStorage.getItem(STORAGE_KEY);
  return storedUser ? JSON.parse(storedUser) : null;
}

export function cerrarseccion() {
  localStorage.removeItem(STORAGE_KEY);
}
