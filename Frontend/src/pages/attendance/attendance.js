const infoBox = document.createElement('div');
infoBox.className = 'placeholder-message';
infoBox.textContent = 'Asistencia no disponible todavía. Vuelve al dashboard para continuar.';

document.addEventListener('DOMContentLoaded', () => {
  const pageShell = document.querySelector('.page-shell');
  if (pageShell) {
    pageShell.appendChild(infoBox);
  }
});
