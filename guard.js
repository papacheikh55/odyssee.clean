// Protection anti-clickjacking : si le site est chargé dans une iframe
// (autre que par lui-même), on force la navigation vers la page réelle.
// Complète la Content-Security-Policy, qui ne peut pas définir
// frame-ancestors via une balise <meta> (seul un en-tête HTTP le permet).
(function () {
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (e) {
    // Si l'accès à window.top est bloqué (cross-origin), on masque
    // simplement la page plutôt que de risquer une erreur silencieuse.
    document.documentElement.style.display = 'none';
  }
})();
