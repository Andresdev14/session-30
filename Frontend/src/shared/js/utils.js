export function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

export function mostrarError(elemento, mensaje) {
  elemento.textContent = mensaje;
}

export function limpiarError(elemento) {
  elemento.textContent = '';
}