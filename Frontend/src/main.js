const currentPath = window.location.pathname;

if (
  currentPath === "/" ||
  currentPath.endsWith("/index.html") ||
  currentPath.endsWith("/Frontend")
) {
  window.location.replace("/src/pages/auth/login.html");
}
