/* ===== ASTER SHREE GARDENS - Mobile Navigation ===== */

(function () {
    'use strict';

   function initMobileNav() {
         const nav = document.querySelector('nav');
         const navUl = document.querySelector('nav ul');
         if (!nav || !navUl) return;

      // Create hamburger button
      const hamburger = document.createElement('button');
         hamburger.className = 'hamburger';
         hamburger.setAttribute('aria-label', 'Toggle navigation menu');
         hamburger.setAttribute('aria-expanded', 'false');
         hamburger.innerHTML =
                 '<span class="ham-line"></span>' +
                 '<span class="ham-line"></span>' +
                 '<span class="ham-line"></span>';

      // Create a separate backdrop overlay div (NOT a pseudo-element)
      const overlay = document.createElement('div');
         overlay.className = 'nav-overlay';
         overlay.style.cssText =
                 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.45);' +
                 'z-index:98;opacity:0;transition:opacity 0.25s ease;';
         document.body.appendChild(overlay);

      // Insert hamburger before nav ul
      nav.insertBefore(hamburger, navUl);

      // Add nav-menu class to ul for targeting
      navUl.classList.add('nav-menu');

      function openMenu() {
              navUl.classList.add('nav-open');
              hamburger.classList.add('ham-active');
              hamburger.setAttribute('aria-expanded', 'true');
              document.body.style.overflow = 'hidden';
              // Show overlay with fade
           overlay.style.display = 'block';
              requestAnimationFrame(function () {
                        overlay.style.opacity = '1';
              });
      }

      function closeMenu() {
              navUl.classList.remove('nav-open');
              hamburger.classList.remove('ham-active');
              hamburger.setAttribute('aria-expanded', 'false');
              document.body.style.overflow = '';
              // Hide overlay with fade
           overlay.style.opacity = '0';
              setTimeout(function () {
                        overlay.style.display = 'none';
              }, 250);
      }

      // Toggle on hamburger click
      hamburger.addEventListener('click', function (e) {
              e.stopPropagation();
              if (navUl.classList.contains('nav-open')) {
                        closeMenu();
              } else {
                        openMenu();
              }
      });

      // Close when a nav link is clicked
      navUl.addEventListener('click', function (e) {
              if (e.target.tagName === 'A') {
                        closeMenu();
              }
      });

      // Close when overlay is clicked
      overlay.addEventListener('click', closeMenu);

      // Close on Escape key
      document.addEventListener('keydown', function (e) {
              if (e.key === 'Escape' && navUl.classList.contains('nav-open')) {
                        closeMenu();
              }
      });

      // Close menu on window resize to desktop
      window.addEventListener('resize', function () {
              if (window.innerWidth > 768) {
                        closeMenu();
              }
      });
   }

   // Run when DOM is ready
   if (document.readyState === 'loading') {
         document.addEventListener('DOMContentLoaded', initMobileNav);
   } else {
         initMobileNav();
   }
})();
