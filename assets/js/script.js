// Ortak site betiği: tema, menü, kaydırma efektleri, atıf kopyalama
(function () {
    const root = document.documentElement;
    root.classList.add('js');

    // Kayıtlı tema tercihi, ilk boyamadan önce <head> içindeki küçük betikle uygulanır
    function currentTheme() {
        const t = root.getAttribute('data-theme');
        if (t) return t;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Yıl
        const year = document.getElementById('current-year');
        if (year) year.textContent = new Date().getFullYear();

        // Tema düğmesi
        const themeBtn = document.querySelector('.theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', function () {
                const next = currentTheme() === 'dark' ? 'light' : 'dark';
                root.setAttribute('data-theme', next);
                try { localStorage.setItem('theme', next); } catch (e) { /* yoksay */ }
            });
        }

        // Mobil menü
        const menuBtn = document.querySelector('.menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        if (menuBtn && navLinks) {
            menuBtn.addEventListener('click', function () {
                const open = navLinks.classList.toggle('open');
                menuBtn.setAttribute('aria-expanded', String(open));
            });
            navLinks.querySelectorAll('a').forEach(function (a) {
                a.addEventListener('click', function () {
                    navLinks.classList.remove('open');
                    menuBtn.setAttribute('aria-expanded', 'false');
                });
            });
            document.addEventListener('click', function (e) {
                if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                    navLinks.classList.remove('open');
                    menuBtn.setAttribute('aria-expanded', 'false');
                }
            });
        }

        // Kaydırınca üst menüye çizgi
        const header = document.querySelector('.site-header');
        function onScroll() {
            if (header) header.classList.toggle('scrolled', window.scrollY > 8);
        }
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        // Görünürken beliren öğeler
        const reveals = document.querySelectorAll('.reveal');
        if ('IntersectionObserver' in window) {
            const io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        io.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
            reveals.forEach(function (el) { io.observe(el); });
        } else {
            reveals.forEach(function (el) { el.classList.add('visible'); });
        }

        // Menüde aktif bölüm
        const sectionLinks = document.querySelectorAll('.nav-links a[href^="#"]');
        if (sectionLinks.length && 'IntersectionObserver' in window) {
            const byId = {};
            sectionLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
            const spy = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        sectionLinks.forEach(function (a) { a.classList.remove('active'); });
                        const link = byId[entry.target.id];
                        if (link) link.classList.add('active');
                    }
                });
            }, { rootMargin: '-45% 0px -50% 0px' });
            Object.keys(byId).forEach(function (id) {
                const s = document.getElementById(id);
                if (s) spy.observe(s);
            });
        }

        // Atıf kopyalama
        document.querySelectorAll('[data-cite]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const text = btn.getAttribute('data-cite');
                const label = btn.querySelector('span');
                const original = label ? label.textContent : '';
                function done() {
                    if (!label) return;
                    label.textContent = 'Kopyalandı';
                    btn.classList.add('copied');
                    setTimeout(function () {
                        label.textContent = original;
                        btn.classList.remove('copied');
                    }, 2000);
                }
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
                } else {
                    fallbackCopy(text);
                    done();
                }
            });
        });
    });

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) { /* yoksay */ }
        document.body.removeChild(ta);
    }
})();
