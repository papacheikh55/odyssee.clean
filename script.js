const menuToggle = document.getElementById('menuToggle');
  const links = document.querySelector('nav.links');
  menuToggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('is-open');
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuToggle.setAttribute('aria-label', isOpen ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      links.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Ouvrir le menu');
    });
  });

  const reserverBtn = document.getElementById('reserverBtn');
  const bookingWrap = document.getElementById('bookingWrap');
  const popupBackdrop = document.getElementById('popupBackdrop');
  const popupCloseBtn = document.getElementById('popupCloseBtn');

  function openBookingPopup() {
    bookingWrap.classList.add('popup-active');
    popupBackdrop.classList.add('active');
    document.body.classList.add('popup-open');
  }
  function closeBookingPopup() {
    bookingWrap.classList.remove('popup-active');
    popupBackdrop.classList.remove('active');
    document.body.classList.remove('popup-open');
  }
  if (reserverBtn && bookingWrap && popupBackdrop) {
    reserverBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openBookingPopup();
    });
    popupCloseBtn.addEventListener('click', closeBookingPopup);
    popupBackdrop.addEventListener('click', closeBookingPopup);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingWrap.classList.contains('popup-active')) closeBookingPopup();
    });
  }

  const heroScene = document.querySelector('.sofa-scene');
  const heroRing = document.querySelector('.mark-ring');
  if (heroScene && heroRing) {
    heroScene.addEventListener('mousemove', (e) => {
      const rect = heroScene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      heroScene.style.setProperty('--gx1', (px * 40) + 'px');
      heroScene.style.setProperty('--gy1', (py * 40) + 'px');
      heroScene.style.setProperty('--gx2', (px * -50) + 'px');
      heroScene.style.setProperty('--gy2', (py * -50) + 'px');
      heroRing.style.transform = `translate(${px * 10}px, ${py * 10}px)`;
    });
    heroScene.addEventListener('mouseleave', () => {
      heroScene.style.setProperty('--gx1', '0px');
      heroScene.style.setProperty('--gy1', '0px');
      heroScene.style.setProperty('--gx2', '0px');
      heroScene.style.setProperty('--gy2', '0px');
      heroRing.style.transform = 'translate(0px, 0px)';
    });
  }

  let sharedLocation = null;
  const geoBtn = document.getElementById('geoBtn');
  const geoStatus = document.getElementById('geoStatus');
  if (geoBtn) {
    geoBtn.addEventListener('click', () => {
      if (!navigator.geolocation) {
        geoStatus.textContent = "La géolocalisation n'est pas disponible sur cet appareil.";
        return;
      }
      geoStatus.textContent = 'Localisation en cours…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          sharedLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          geoBtn.classList.add('done');
          geoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12l6 6L20 6"/></svg> Position partagée';
          geoStatus.textContent = 'Elle sera jointe à votre message WhatsApp.';
        },
        () => {
          geoStatus.textContent = "Position non partagée (autorisation refusée).";
        }
      );
    });
  }

  const bookingForm = document.getElementById('bookingForm');
  const formLoadedAt = Date.now();
  const SN_PHONE_RE = /^(?:\+221|00221)?7[0-8]\d{7}$/;

  const bPhoneInput = document.getElementById('bPhone');
  if (bPhoneInput) {
    bPhoneInput.addEventListener('input', () => {
      bPhoneInput.setCustomValidity('');
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Anti-spam : honeypot rempli => bot, on ignore silencieusement
      const honeypot = document.getElementById('bWebsite');
      if (honeypot && honeypot.value.trim() !== '') {
        return;
      }

      // Anti-spam : soumission trop rapide après le chargement du formulaire => bot
      if (Date.now() - formLoadedAt < 2000) {
        return;
      }

      const phoneEl = document.getElementById('bPhone');
      const rawPhone = phoneEl.value.trim();
      const cleanedPhone = rawPhone.replace(/[\s.\-]/g, '');
      if (!cleanedPhone) { phoneEl.focus(); return; }
      if (!SN_PHONE_RE.test(cleanedPhone)) {
        phoneEl.focus();
        phoneEl.setCustomValidity('Veuillez saisir un numéro sénégalais valide (ex : 77 000 00 00).');
        phoneEl.reportValidity();
        return;
      }
      phoneEl.setCustomValidity('');

      const name = document.getElementById('bName').value.trim() || 'Non renseigné';
      const checkedServices = Array.from(document.querySelectorAll('input[name="bService"]:checked')).map(el => el.value);
      const service = checkedServices.length ? checkedServices.join(', ') : 'Non spécifié';
      const quartier = document.getElementById('bQuartier').value || 'Non renseigné';
      const address = document.getElementById('bAddress').value.trim();

      const adresse = `${quartier}${address ? ' (' + address + ')' : ''}`;

      let msg = 'Bonjour Odyssée Clean, voici une nouvelle demande de réservation :\n\n'
        + `*Prestation :* ${service}\n`
        + `*Nom :* ${name}\n`
        + `*Tél :* ${cleanedPhone}\n`
        + `*Adresse :* ${adresse}`;

      if (sharedLocation) {
        msg += `\n*Position GPS :* https://www.google.com/maps?q=${sharedLocation.lat},${sharedLocation.lng}`;
      }

      window.open('https://wa.me/221781628141?text=' + encodeURIComponent(msg), '_blank', 'noopener,noreferrer');

      // Vider le formulaire et réinitialiser l'état (géolocalisation, quartier...)
      bookingForm.reset();
      sharedLocation = null;
      if (geoBtn) {
        geoBtn.classList.remove('done');
        geoBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> Partager ma position actuelle';
      }
      if (geoStatus) geoStatus.textContent = '';

      // Afficher la confirmation à la place du formulaire
      bookingForm.style.display = 'none';
      const bookingSuccess = document.getElementById('bookingSuccess');
      if (bookingSuccess) bookingSuccess.classList.add('show');
    });

    const newRequestBtn = document.getElementById('newRequestBtn');
    if (newRequestBtn) {
      newRequestBtn.addEventListener('click', () => {
        const bookingSuccess = document.getElementById('bookingSuccess');
        if (bookingSuccess) bookingSuccess.classList.remove('show');
        bookingForm.style.display = '';
      });
    }
  }

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const q = item.querySelector('.faq-q');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      faqItems.forEach(i => { i.classList.remove('open'); i.querySelector('.faq-q').setAttribute('aria-expanded','false'); });
      if (!isOpen) { item.classList.add('open'); q.setAttribute('aria-expanded','true'); }
    });
  });

  function injectJsonLd(data) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Odyssée Clean",
    "alternateName": "Odyssée Clean Dakar Touba",
    "description": "Nettoyage professionnel de fauteuils, canapés, matelas et moquettes à domicile, à Dakar et à Touba.",
    "image": "https://odyssee-clean.netlify.app/logo.png",
    "telephone": "+221781628141",
    "email": "odysseeclean221@gmail.com",
    "priceRange": "5000-22000 XOF",
    "areaServed": [
      { "@type": "City", "name": "Dakar" },
      { "@type": "City", "name": "Touba" }
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Dakar",
      "addressCountry": "SN"
    },
    "sameAs": [
      "https://wa.me/221781628141",
      "https://www.tiktok.com/@odysseeclean221"
    ],
    "makesOffer": [
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nettoyage de fauteuils et canapés" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nettoyage de matelas" } },
      { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Nettoyage de moquettes et tapis" } }
    ]
  });

  injectJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Combien de temps faut-il pour sécher après le nettoyage ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Le séchage est rapide grâce à nos équipements professionnels : comptez généralement entre 2 et 4 heures avant de pouvoir réutiliser le fauteuil, le matelas ou la moquette." }
      },
      {
        "@type": "Question",
        "name": "Les produits utilisés sont-ils sans danger pour les enfants et animaux ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Oui. Nous utilisons des produits professionnels adaptés à un usage domestique, sans danger une fois le séchage terminé." }
      },
      {
        "@type": "Question",
        "name": "Faut-il démonter les meubles avant votre venue ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Non, aucune préparation n'est nécessaire. Notre équipe intervient directement sur place avec tout le matériel requis." }
      },
      {
        "@type": "Question",
        "name": "Comment se passe le paiement ?",
        "acceptedAnswer": { "@type": "Answer", "text": "Le paiement se fait directement après l'intervention, une fois le résultat validé avec vous." }
      }
    ]
  });