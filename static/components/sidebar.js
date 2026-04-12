// ===== 🧭 SIDEBAR COMPONENT =====

const SidebarComponent = {
    sidebar: document.getElementById('sidebar'),
    navLinks: document.querySelectorAll('.nav-link'),

    init() {
        this.setupNavigation();
    },

    setupNavigation() {
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.setActive(link);
            });
        });
    },

    setActive(link) {
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    SidebarComponent.init();
    window.SidebarComponent = SidebarComponent;
});
