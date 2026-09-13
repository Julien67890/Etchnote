// ===========================
// DATABASE SERVICE (IndexedDB)
// ===========================

class DatabaseService {
    constructor() {
        this.db = null;
        this.dbName = 'EtchnoteDB';
        this.version = 1;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Store: categories
                if (!db.objectStoreNames.contains('categories')) {
                    const categoriesStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
                    categoriesStore.createIndex('nom', 'nom', { unique: false });
                }

                // Store: notes
                if (!db.objectStoreNames.contains('notes')) {
                    const notesStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    notesStore.createIndex('categorieId', 'categorieId', { unique: false });
                    notesStore.createIndex('dateProchaineRevision', 'dateProchaineRevision', { unique: false });
                }

                // Store: quick_note
                if (!db.objectStoreNames.contains('quick_note')) {
                    db.createObjectStore('quick_note', { keyPath: 'id' });
                }

                // Store: links
                if (!db.objectStoreNames.contains('links')) {
                    db.createObjectStore('links', { keyPath: 'id', autoIncrement: true });
                }
            };
        });
    }

    // Categories
    async addCategory(nom) {
        const transaction = this.db.transaction(['categories'], 'readwrite');
        const store = transaction.objectStore('categories');
        return store.add({ nom, dateCreation: new Date().toISOString() });
    }

    async getAllCategories() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getCategory(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readonly');
            const store = transaction.objectStore('categories');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateCategory(category) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.put(category);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteCategory(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['categories'], 'readwrite');
            const store = transaction.objectStore('categories');
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Notes
    async addNote(note) {
        const transaction = this.db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        return store.add({
            ...note,
            niveauRevision: 1,
            dateCreation: new Date().toISOString(),
            dateDerniereLecture: null,
            dateProchaineRevision: new Date(Date.now() + 24 * 1000).toISOString() // +24 sec (mode test)
        });
    }

    async getAllNotes() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getNotesByCategory(categorieId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const index = store.index('categorieId');
            const request = index.getAll(categorieId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getNote(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readonly');
            const store = transaction.objectStore('notes');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateNote(note) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            const request = store.put(note);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteNote(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['notes'], 'readwrite');
            const store = transaction.objectStore('notes');
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Quick Note
    async getQuickNote() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quick_note'], 'readonly');
            const store = transaction.objectStore('quick_note');
            const request = store.get(1);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveQuickNote(contenu) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['quick_note'], 'readwrite');
            const store = transaction.objectStore('quick_note');
            const request = store.put({
                id: 1,
                contenu,
                dateModification: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Links
    async addLink(link) {
        const transaction = this.db.transaction(['links'], 'readwrite');
        const store = transaction.objectStore('links');
        return store.add({
            ...link,
            dateCreation: new Date().toISOString()
        });
    }

    async getAllLinks() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['links'], 'readonly');
            const store = transaction.objectStore('links');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteLink(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['links'], 'readwrite');
            const store = transaction.objectStore('links');
            const request = store.delete(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// ===========================
// SPACED REPETITION SERVICE
// ===========================

class SpacedRepetitionService {
    // ⚠️ MODE TEST : heures → secondes, jours → minutes
    // (Remettre les vraies valeurs en production)
    static INTERVALS = {
        1: 24 * 1000,                  // 24 sec  (= 24h en prod)
        2: 48 * 1000,                  // 48 sec  (= 48h en prod)
        3: 7 * 60 * 1000,              // 7 min   (= 7 jours en prod)
        4: 15 * 60 * 1000,             // 15 min  (= 15 jours en prod)
        5: 30 * 60 * 1000,             // 30 min  (= 1 mois en prod)
        6: 60 * 60 * 1000,             // 60 min  (= 2 mois en prod)
        7: 120 * 60 * 1000,            // 120 min (= 4 mois en prod)
        8: 180 * 60 * 1000             // 180 min (= 6 mois en prod)
    };

    static markAsRead(note) {
        const now = new Date();
        // FIX : on utilise l'intervalle du niveau ACTUEL, puis on monte d'un niveau
        const currentInterval = this.INTERVALS[note.niveauRevision] || this.INTERVALS[8];
        const newLevel = Math.min(note.niveauRevision + 1, 8);

        return {
            ...note,
            niveauRevision: newLevel,
            dateDerniereLecture: now.toISOString(),
            dateProchaineRevision: new Date(now.getTime() + currentInterval).toISOString()
        };
    }

    static getNotesToRead(notes) {
        const now = new Date();
        return notes.filter(note => {
            const nextReview = new Date(note.dateProchaineRevision);
            return nextReview <= now;
        });
    }

    static getOverdueDays(note) {
        const now = new Date();
        const nextReview = new Date(note.dateProchaineRevision);
        const diff = now - nextReview;
        // En mode test, on affiche en secondes
        return Math.floor(diff / 1000);
    }

    static getLevelLabel(level) {
        // ⚠️ MODE TEST
        const labels = {
            1: '24 sec',
            2: '48 sec',
            3: '7 min',
            4: '15 min',
            5: '30 min',
            6: '60 min',
            7: '120 min',
            8: '180 min'
        };
        return labels[level] || '';
    }
}

// ===========================
// APP CONTROLLER
// ===========================

class AppController {
    constructor() {
        this.db = new DatabaseService();
        this.currentScreen = 'screenThemes';
        this.currentCategoryId = null;
        this.currentNoteId = null;
        this.quickNoteTimeout = null;
        this.longPressTimer = null;
        this.countdownInterval = null;
    }

    async init() {
        await this.db.init();
        this.setupEventListeners();
        this.setupPopupListeners();
        await this.loadQuickNote();
        await this.renderThemes();
        this.updateStats();
        // Vérifier les notes à lire au démarrage
        await this.checkNotesALire();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const screen = e.currentTarget.getAttribute('data-screen');
                this.navigateTo(screen);
            });
        });

        // FAB Button
        document.getElementById('fabBtn').addEventListener('click', () => {
            this.handleFabClick();
        });

        // Help Button
        document.getElementById('helpBtn').addEventListener('click', () => {
            this.openModal('modalHelp');
        });

        // Forms
        document.getElementById('formAddCategory').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addCategory();
        });

        document.getElementById('formEditCategory').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateCategory();
        });

        document.getElementById('deleteCategoryBtn').addEventListener('click', () => {
            this.deleteCategory();
        });

        document.getElementById('formAddNote').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addNote();
        });

        document.getElementById('formEditNote').addEventListener('submit', (e) => {
            e.preventDefault();
            this.updateNote();
        });

        document.getElementById('deleteNoteBtn').addEventListener('click', () => {
            this.deleteNoteFromModal();
        });

        document.getElementById('editNoteFromDetailBtn').addEventListener('click', () => {
            this.openEditNoteModalFromDetail();
        });

        document.getElementById('formAddLink').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addLink();
        });

        // Quick Note Auto-save
        document.getElementById('quickNoteText').addEventListener('input', () => {
            this.handleQuickNoteInput();
        });

        // Mark as Read Button
        document.getElementById('markAsReadBtn').addEventListener('click', () => {
            this.markNoteAsRead();
        });

        // Back Button
        document.getElementById('backFromNoteBtn').addEventListener('click', () => {
            if (this.currentCategoryId) {
                this.showCategoryNotes(this.currentCategoryId);
            } else {
                this.navigateTo('screenToRead');
            }
        });

        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.handleSearch(e.target.value.trim());
        });
    }

    setupPopupListeners() {
        document.getElementById('popupBtnLire').addEventListener('click', () => {
            document.getElementById('popupNotesALire').classList.remove('active');
            this.navigateTo('screenToRead');
        });
        document.getElementById('popupBtnPlusTard').addEventListener('click', () => {
            document.getElementById('popupNotesALire').classList.remove('active');
        });
    }

    async checkNotesALire() {
        const allNotes = await this.db.getAllNotes();
        const notesToRead = SpacedRepetitionService.getNotesToRead(allNotes);
        if (notesToRead.length > 0) {
            document.getElementById('popupCount').textContent = notesToRead.length;
            document.getElementById('popupNotesALire').classList.add('active');
        }
    }

    // Navigation
        // Stopper le countdown si on quitte la note
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Show target screen
        document.getElementById(screenId).classList.add('active');

        // Update nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-screen') === screenId) {
                item.classList.add('active');
            }
        });

        // Update header title
        const titles = {
            'screenThemes': 'Etchnote',
            'screenRandom': 'Aléatoire',
            'screenToRead': 'À lire',
            'screenQuick': 'Note Rapide',
            'screenLinks': 'Liens'
        };
        document.getElementById('headerTitle').textContent = titles[screenId] || 'Etchnote';

        // Masquer la barre de recherche sur Rapide et Liens
        const searchContainer = document.getElementById('searchContainer');
        const hideSearch = ['screenQuick', 'screenLinks'];
        searchContainer.classList.toggle('hidden', hideSearch.includes(screenId));

        // Load content
        this.currentScreen = screenId;
        this.loadScreenContent(screenId);

        // Show/hide FAB
        const fabBtn = document.getElementById('fabBtn');
        if (screenId === 'screenQuick' || screenId === 'screenRandom') {
            fabBtn.style.display = 'none';
        } else {
            fabBtn.style.display = 'flex';
        }
    }

    async loadScreenContent(screenId) {
        switch (screenId) {
            case 'screenThemes':
                await this.renderThemes();
                break;
            case 'screenRandom':
                await this.renderRandomNote();
                break;
            case 'screenToRead':
                await this.renderNotesToRead();
                break;
            case 'screenLinks':
                await this.renderLinks();
                break;
        }
    }

    handleFabClick() {
        switch (this.currentScreen) {
            case 'screenThemes':
                this.openModal('modalAddCategory');
                break;
            case 'screenToRead':
            case 'screenCategoryNotes':
                this.openAddNoteModal();
                break;
            case 'screenLinks':
                this.openModal('modalAddLink');
                break;
        }
    }

    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    // ===========================
    // THEMES / CATEGORIES
    // ===========================

    // ── SVG ICONS (style gravure cuivré) ──────────────────────────
    svgColumn() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 72" fill="none" width="46" height="66">
          <rect x="5" y="4" width="40" height="5" rx="1" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.06)"/>
          <path d="M9,9 Q25,14 41,9" stroke="#C8924A" stroke-width="1" fill="none"/>
          <line x1="9" y1="9" x2="41" y2="9" stroke="#C8924A" stroke-width="0.7"/>
          <line x1="13" y1="13" x2="37" y2="13" stroke="#C8924A" stroke-width="0.7"/>
          <line x1="13" y1="15" x2="37" y2="15" stroke="#C8924A" stroke-width="0.6"/>
          <rect x="13" y="15" width="24" height="46" stroke="#C8924A" stroke-width="1.2" fill="rgba(200,146,74,0.04)"/>
          <line x1="17" y1="15" x2="17" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="20" y1="15" x2="20" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="23" y1="15" x2="23" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="25" y1="15" x2="25" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="27" y1="15" x2="27" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="30" y1="15" x2="30" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <line x1="33" y1="15" x2="33" y2="61" stroke="#C8924A" stroke-width="0.55"/>
          <rect x="10" y="61" width="30" height="3" stroke="#C8924A" stroke-width="1.0" fill="rgba(200,146,74,0.06)"/>
          <rect x="5" y="64" width="40" height="4" rx="0.5" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.06)"/>
        </svg>`;
    }
    svgScroll() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 66" fill="none" width="46" height="60">
          <ellipse cx="26" cy="8" rx="19" ry="7" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.08)"/>
          <ellipse cx="26" cy="8" rx="13" ry="4" stroke="#C8924A" stroke-width="0.7" fill="rgba(200,146,74,0.05)"/>
          <rect x="7" y="8" width="38" height="50" fill="rgba(200,146,74,0.04)"/>
          <line x1="7" y1="8" x2="7" y2="58" stroke="#C8924A" stroke-width="1.1"/>
          <line x1="45" y1="8" x2="45" y2="58" stroke="#C8924A" stroke-width="1.1"/>
          <line x1="13" y1="18" x2="39" y2="18" stroke="#C8924A" stroke-width="0.8"/>
          <line x1="13" y1="24" x2="39" y2="24" stroke="#C8924A" stroke-width="0.8"/>
          <line x1="13" y1="30" x2="39" y2="30" stroke="#C8924A" stroke-width="0.8"/>
          <line x1="13" y1="36" x2="39" y2="36" stroke="#C8924A" stroke-width="0.8"/>
          <line x1="13" y1="42" x2="36" y2="42" stroke="#C8924A" stroke-width="0.8"/>
          <line x1="13" y1="48" x2="32" y2="48" stroke="#C8924A" stroke-width="0.8"/>
          <ellipse cx="26" cy="58" rx="19" ry="7" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.09)"/>
          <ellipse cx="26" cy="58" rx="13" ry="4" stroke="#C8924A" stroke-width="0.7" fill="rgba(200,146,74,0.05)"/>
        </svg>`;
    }
    svgGlobe() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 66" fill="none" width="48" height="60">
          <circle cx="27" cy="25" r="22" stroke="#C8924A" stroke-width="1.2" fill="rgba(200,146,74,0.04)"/>
          <ellipse cx="27" cy="25" rx="8" ry="22" stroke="#C8924A" stroke-width="0.85"/>
          <path d="M27,3 Q10,14 10,25 Q10,36 27,47" stroke="#C8924A" stroke-width="0.7" fill="none"/>
          <path d="M27,3 Q44,14 44,25 Q44,36 27,47" stroke="#C8924A" stroke-width="0.7" fill="none"/>
          <path d="M5,17 Q27,13 49,17" stroke="#C8924A" stroke-width="0.75" fill="none"/>
          <line x1="5" y1="25" x2="49" y2="25" stroke="#C8924A" stroke-width="0.75"/>
          <path d="M5,33 Q27,37 49,33" stroke="#C8924A" stroke-width="0.75" fill="none"/>
          <line x1="27" y1="3" x2="27" y2="47" stroke="#C8924A" stroke-width="0.75"/>
          <path d="M19,47 Q23,55 27,57" stroke="#C8924A" stroke-width="1.1" fill="none"/>
          <path d="M35,47 Q31,55 27,57" stroke="#C8924A" stroke-width="1.1" fill="none"/>
          <line x1="27" y1="57" x2="27" y2="62" stroke="#C8924A" stroke-width="1.2"/>
          <ellipse cx="27" cy="63" rx="9" ry="2.5" stroke="#C8924A" stroke-width="1.0" fill="rgba(200,146,74,0.07)"/>
        </svg>`;
    }
    svgSextant() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 54 66" fill="none" width="48" height="60">
          <path d="M8,60 L8,14 Q8,8 14,8 L50,60 Z" stroke="#C8924A" stroke-width="1.3" fill="rgba(200,146,74,0.04)"/>
          <path d="M14,56 Q14,18 46,56" stroke="#C8924A" stroke-width="0.9" fill="none"/>
          <line x1="8" y1="60" x2="34" y2="16" stroke="#C8924A" stroke-width="1.3" stroke-linecap="round"/>
          <rect x="8" y="8" width="26" height="9" rx="3" stroke="#C8924A" stroke-width="1.0" fill="rgba(200,146,74,0.07)"/>
          <line x1="15" y1="54" x2="18" y2="50" stroke="#C8924A" stroke-width="0.85"/>
          <line x1="22" y1="42" x2="26" y2="39" stroke="#C8924A" stroke-width="0.85"/>
          <line x1="31" y1="30" x2="35" y2="28" stroke="#C8924A" stroke-width="0.85"/>
          <line x1="42" y1="56" x2="46" y2="52" stroke="#C8924A" stroke-width="0.85"/>
          <rect x="5" y="58" width="6" height="9" rx="2" stroke="#C8924A" stroke-width="1.0" fill="rgba(200,146,74,0.07)"/>
        </svg>`;
    }
    svgFlask() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" fill="none" width="42" height="58">
          <path d="M18,4 L18,24 L6,54 Q4,60 10,62 L38,62 Q44,60 42,54 L30,24 L30,4 Z" stroke="#C8924A" stroke-width="1.2" fill="rgba(200,146,74,0.04)"/>
          <line x1="14" y1="4" x2="34" y2="4" stroke="#C8924A" stroke-width="1.2"/>
          <line x1="14" y1="8" x2="34" y2="8" stroke="#C8924A" stroke-width="0.7"/>
          <path d="M8,50 Q14,46 24,47 Q34,48 40,50 Q40,58 24,58 Q8,58 8,50 Z" stroke="#C8924A" stroke-width="0.8" fill="rgba(200,146,74,0.15)"/>
          <circle cx="16" cy="53" r="2" fill="rgba(200,146,74,0.4)"/>
          <circle cx="30" cy="56" r="1.5" fill="rgba(200,146,74,0.4)"/>
        </svg>`;
    }
    svgCompass() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 64" fill="none" width="44" height="58">
          <circle cx="25" cy="14" r="6" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.07)"/>
          <circle cx="25" cy="14" r="2" stroke="#C8924A" stroke-width="1.0" fill="rgba(200,146,74,0.2)"/>
          <line x1="21" y1="19" x2="10" y2="58" stroke="#C8924A" stroke-width="1.3" stroke-linecap="round"/>
          <line x1="29" y1="19" x2="40" y2="58" stroke="#C8924A" stroke-width="1.3" stroke-linecap="round"/>
          <path d="M8,58 Q25,54 42,58" stroke="#C8924A" stroke-width="1.1" fill="none"/>
          <line x1="14" y1="42" x2="36" y2="42" stroke="#C8924A" stroke-width="0.8"/>
        </svg>`;
    }
    svgNote() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 64" fill="none" width="44" height="58">
          <ellipse cx="14" cy="56" rx="10" ry="6" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.08)"/>
          <line x1="24" y1="56" x2="24" y2="8" stroke="#C8924A" stroke-width="1.3"/>
          <line x1="24" y1="8" x2="44" y2="14" stroke="#C8924A" stroke-width="1.1"/>
          <line x1="44" y1="14" x2="44" y2="36" stroke="#C8924A" stroke-width="1.1"/>
          <ellipse cx="34" cy="36" rx="10" ry="6" stroke="#C8924A" stroke-width="1.1" fill="rgba(200,146,74,0.08)"/>
          <line x1="28" y1="18" x2="44" y2="22" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="28" y1="26" x2="44" y2="30" stroke="#C8924A" stroke-width="0.75"/>
        </svg>`;
    }
    svgBook() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 58" fill="none" width="46" height="52">
          <path d="M26,6 C18,4 8,7 4,11 L6,50 C11,46 18,45 26,47 Z" stroke="#C8924A" stroke-width="1.2" fill="rgba(200,146,74,0.05)"/>
          <path d="M26,6 C34,4 44,7 48,11 L46,50 C41,46 34,45 26,47 Z" stroke="#C8924A" stroke-width="1.2" fill="rgba(200,146,74,0.05)"/>
          <path d="M26,6 Q27,26 26,47" stroke="#9A6820" stroke-width="2.0" stroke-linecap="round"/>
          <line x1="9" y1="18" x2="23" y2="16" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="9" y1="24" x2="23" y2="22" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="9" y1="30" x2="23" y2="28" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="9" y1="36" x2="23" y2="34" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="29" y1="16" x2="43" y2="18" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="29" y1="22" x2="43" y2="24" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="29" y1="28" x2="43" y2="30" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="29" y1="34" x2="43" y2="36" stroke="#C8924A" stroke-width="0.75"/>
        </svg>`;
    }
    svgQuill() {
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 62" fill="none" width="42" height="56">
          <path d="M24,56 C26,46 36,32 42,18 C46,8 40,3 34,3 C28,3 24,7 22,13" stroke="#C8924A" stroke-width="1.2" fill="none"/>
          <path d="M24,56 C22,48 14,36 8,22 C4,12 9,4 16,3 C22,2 26,6 24,13" stroke="#C8924A" stroke-width="1.2" fill="none"/>
          <path d="M24,56 C26,46 36,32 42,18 C46,8 40,3 34,3 C22,3 18,4 16,3 C9,4 4,12 8,22 C14,36 22,48 24,56 Z" fill="rgba(200,146,74,0.06)"/>
          <path d="M24,56 L22,28 L20,10" stroke="#9A6820" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="22" y1="16" x2="33" y2="11" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="23" x2="36" y2="18" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="30" x2="37" y2="26" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="37" x2="35" y2="34" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="44" x2="32" y2="42" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="16" x2="13" y2="12" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="23" x2="10" y2="19" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="30" x2="9" y2="27" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="37" x2="11" y2="35" stroke="#C8924A" stroke-width="0.75"/>
          <line x1="22" y1="44" x2="14" y2="43" stroke="#C8924A" stroke-width="0.75"/>
          <path d="M20,10 L18,6 Q21,4 24,6 L22,10 Z" stroke="#C8924A" stroke-width="0.9" fill="rgba(200,146,74,0.2)"/>
        </svg>`;
    }

    getThemeIconsSVG(nom) {
        const n = nom.toLowerCase();
        if (n.includes('histoire') || n.includes('hist') || n.includes('antiq') || n.includes('mediev'))
            return [this.svgColumn(), this.svgScroll()];
        if (n.includes('géo') || n.includes('geo') || n.includes('carte') || n.includes('voyage'))
            return [this.svgGlobe(), this.svgSextant()];
        if (n.includes('science') || n.includes('chim') || n.includes('phys') || n.includes('bio'))
            return [this.svgFlask(), this.svgCompass()];
        if (n.includes('math') || n.includes('algèb') || n.includes('calcul') || n.includes('géomét'))
            return [this.svgCompass(), this.svgBook()];
        if (n.includes('litt') || n.includes('poés') || n.includes('roman') || n.includes('écriture'))
            return [this.svgBook(), this.svgQuill()];
        if (n.includes('musique') || n.includes('music') || n.includes('chanson') || n.includes('harmonie'))
            return [this.svgNote(), this.svgBook()];
        if (n.includes('art') || n.includes('peint') || n.includes('dessin') || n.includes('sculpt'))
            return [this.svgBook(), this.svgScroll()];
        if (n.includes('philo') || n.includes('éthique') || n.includes('logique'))
            return [this.svgScroll(), this.svgBook()];
        if (n.includes('droit') || n.includes('loi') || n.includes('jurid'))
            return [this.svgScroll(), this.svgCompass()];
        if (n.includes('info') || n.includes('code') || n.includes('prog') || n.includes('algo'))
            return [this.svgBook(), this.svgCompass()];
        if (n.includes('langue') || n.includes('anglais') || n.includes('espag') || n.includes('chinois'))
            return [this.svgBook(), this.svgQuill()];
        return [this.svgBook(), this.svgQuill()];
    }

    async renderThemes() {
        const categories = await this.db.getAllCategories();
        const container = document.getElementById('themesList');

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📚</div>
                    <div class="empty-text">Aucun thème pour le moment</div>
                    <button class="btn btn-primary" onclick="app.openModal('modalAddCategory')">
                        ➕ Créer un thème
                    </button>
                </div>
            `;
            return;
        }

        // Récupérer le nombre de notes par catégorie
        const allNotes = await this.db.getAllNotes();

        container.innerHTML = categories.map(cat => {
            const [svg1, svg2] = this.getThemeIconsSVG(cat.nom);
            const noteCount = allNotes.filter(n => n.categorieId === cat.id).length;
            const noteLabel = noteCount === 0 ? 'Aucune note'
                : noteCount === 1 ? '1 Note'
                : `${noteCount} Notes`;
            return `
            <div class="tc-wrap"
                 data-category-id="${cat.id}"
                 onclick="app.showCategoryNotes(${cat.id})"
                 ontouchstart="app.startLongPress(${cat.id}, event)"
                 ontouchend="app.endLongPress()"
                 ontouchmove="app.cancelLongPress()"
                 onmousedown="app.startLongPress(${cat.id}, event)"
                 onmouseup="app.endLongPress()"
                 onmouseleave="app.cancelLongPress()">
                <div class="tc-inner">
                    <div class="tc-text">
                        <div class="tc-title">${this.escapeHtml(cat.nom)}</div>
                        <div class="tc-sub">${noteLabel}</div>
                    </div>
                    <div class="tc-icons">${svg1}${svg2}</div>
                </div>
            </div>`;
        }).join('');
        }).join('');
    }

    async addCategory() {
        const nom = document.getElementById('categoryName').value.trim();
        if (!nom) return;

        await this.db.addCategory(nom);
        this.closeModal('modalAddCategory');
        document.getElementById('formAddCategory').reset();
        await this.renderThemes();
        this.updateStats();
    }

    // ===========================
    // LONG PRESS FOR CATEGORY EDIT
    // ===========================

    startLongPress(categoryId, event) {
        this.longPressTimer = setTimeout(() => {
            this.openEditCategoryModal(categoryId);
            // Empêcher l'ouverture de la catégorie
            event.preventDefault();
            event.stopPropagation();
        }, 500); // 500ms pour déclencher l'appui long
    }

    endLongPress() {
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
    }

    cancelLongPress() {
        this.endLongPress();
    }

    async openEditCategoryModal(categoryId) {
        const category = await this.db.getCategory(categoryId);
        if (!category) return;

        document.getElementById('editCategoryId').value = categoryId;
        document.getElementById('editCategoryName').value = category.nom;
        this.openModal('modalEditCategory');
    }

    async updateCategory() {
        const id = parseInt(document.getElementById('editCategoryId').value);
        const nom = document.getElementById('editCategoryName').value.trim();
        if (!nom) return;

        const category = await this.db.getCategory(id);
        category.nom = nom;
        await this.db.updateCategory(category);

        this.closeModal('modalEditCategory');
        await this.renderThemes();
        this.updateStats();
    }

    async deleteCategory() {
        const id = parseInt(document.getElementById('editCategoryId').value);
        
        if (!confirm('⚠️ Supprimer ce thème ?\n\nToutes les notes de ce thème seront également supprimées.')) {
            return;
        }

        // Supprimer toutes les notes de cette catégorie
        const notes = await this.db.getNotesByCategory(id);
        for (const note of notes) {
            await this.db.deleteNote(note.id);
        }

        // Supprimer la catégorie
        await this.db.deleteCategory(id);

        this.closeModal('modalEditCategory');
        await this.renderThemes();
        this.updateStats();
    }

    async showCategoryNotes(categoryId) {
        this.currentCategoryId = categoryId;
        this.currentScreen = 'screenCategoryNotes'; // ← FIX: mettre à jour l'écran courant
        const category = await this.db.getCategory(categoryId);
        const notes = await this.db.getNotesByCategory(categoryId);

        // Switch to category notes screen
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('screenCategoryNotes').classList.add('active');
        document.getElementById('headerTitle').textContent = category.nom;

        const container = document.getElementById('categoryNotesList');

        if (notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <div class="empty-text">Aucune note dans ce thème</div>
                    <button class="btn btn-primary" onclick="app.openAddNoteModal()">
                        ➕ Ajouter une note
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="card note-card" 
                 data-note-id="${note.id}"
                 onclick="app.showNoteDetail(${note.id})"
                 ontouchstart="app.startNoteLongPress(${note.id}, event)"
                 ontouchend="app.endLongPress()"
                 ontouchmove="app.cancelLongPress()"
                 onmousedown="app.startNoteLongPress(${note.id}, event)"
                 onmouseup="app.endLongPress()"
                 onmouseleave="app.cancelLongPress()">
                <div class="card-title">${this.escapeHtml(note.titre)}</div>
                <div class="card-subtitle">${this.truncateText(note.contenu, 100)}</div>
                <span class="note-badge">Niveau ${note.niveauRevision} • ${SpacedRepetitionService.getLevelLabel(note.niveauRevision)}</span>
            </div>
        `).join('');
    }

    // ===========================
    // NOTES
    // ===========================

    async openAddNoteModal() {
        const categories = await this.db.getAllCategories();
        const select = document.getElementById('noteCategorySelect');
        
        select.innerHTML = '<option value="">Sélectionnez une catégorie</option>' +
            categories.map(cat => `<option value="${cat.id}" ${cat.id === this.currentCategoryId ? 'selected' : ''}>${this.escapeHtml(cat.nom)}</option>`).join('');
        
        this.openModal('modalAddNote');
    }

    async addNote() {
        const categorieId = parseInt(document.getElementById('noteCategorySelect').value);
        const titre = document.getElementById('noteTitle').value.trim();
        const contenu = document.getElementById('noteContent').value.trim();

        if (!categorieId || !titre || !contenu) return;

        await this.db.addNote({ categorieId, titre, contenu });
        this.closeModal('modalAddNote');
        document.getElementById('formAddNote').reset();

        if (this.currentCategoryId) {
            await this.showCategoryNotes(this.currentCategoryId);
        } else {
            await this.renderThemes();
        }
        this.updateStats();
    }

    // ===========================
    // NOTE EDITING
    // ===========================

    startNoteLongPress(noteId, event) {
        this.longPressTimer = setTimeout(() => {
            this.openEditNoteModal(noteId);
            // Empêcher l'ouverture de la note
            event.preventDefault();
            event.stopPropagation();
        }, 500); // 500ms pour déclencher l'appui long
    }

    async openEditNoteModal(noteId) {
        const note = await this.db.getNote(noteId);
        if (!note) return;

        const categories = await this.db.getAllCategories();
        const selectEdit = document.getElementById('editNoteCategorySelect');
        
        selectEdit.innerHTML = '<option value="">Sélectionnez une catégorie</option>' +
            categories.map(cat => `<option value="${cat.id}" ${cat.id === note.categorieId ? 'selected' : ''}>${this.escapeHtml(cat.nom)}</option>`).join('');

        document.getElementById('editNoteId').value = noteId;
        document.getElementById('editNoteTitle').value = note.titre;
        document.getElementById('editNoteContent').value = note.contenu;
        
        this.openModal('modalEditNote');
    }

    async openEditNoteModalFromDetail() {
        if (!this.currentNoteId) return;
        await this.openEditNoteModal(this.currentNoteId);
    }

    async updateNote() {
        const id = parseInt(document.getElementById('editNoteId').value);
        const categorieId = parseInt(document.getElementById('editNoteCategorySelect').value);
        const titre = document.getElementById('editNoteTitle').value.trim();
        const contenu = document.getElementById('editNoteContent').value.trim();

        if (!categorieId || !titre || !contenu) return;

        const note = await this.db.getNote(id);
        note.categorieId = categorieId;
        note.titre = titre;
        note.contenu = contenu;
        
        await this.db.updateNote(note);
        this.closeModal('modalEditNote');

        // Rafraîchir la vue appropriée
        if (this.currentScreen === 'screenNoteDetail') {
            await this.showNoteDetail(id);
        } else if (this.currentCategoryId) {
            await this.showCategoryNotes(this.currentCategoryId);
        } else if (this.currentScreen === 'screenToRead') {
            await this.renderNotesToRead();
        }
        this.updateStats();
    }

    async deleteNoteFromModal() {
        const id = parseInt(document.getElementById('editNoteId').value);
        
        if (!confirm('⚠️ Supprimer cette note ?')) {
            return;
        }

        await this.db.deleteNote(id);
        this.closeModal('modalEditNote');

        // Retourner à la vue appropriée
        if (this.currentCategoryId) {
            await this.showCategoryNotes(this.currentCategoryId);
        } else if (this.currentScreen === 'screenToRead') {
            await this.renderNotesToRead();
        } else {
            this.navigateTo('screenThemes');
        }
        this.updateStats();
    }

    async showNoteDetail(noteId) {
        this.currentNoteId = noteId;
        const note = await this.db.getNote(noteId);
        const category = await this.db.getCategory(note.categorieId);

        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById('screenNoteDetail').classList.add('active');

        document.getElementById('noteDetailTitle').textContent = note.titre;
        document.getElementById('noteDetailCategory').textContent = category.nom;
        document.getElementById('noteDetailContent').textContent = note.contenu;
        document.getElementById('headerTitle').textContent = 'Lecture';

        // Démarrer le compte à rebours
        this.startCountdown(note);
    }

    startCountdown(note) {
        // Nettoyer l'ancien timer si existant
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        const btn = document.getElementById('markAsReadBtn');
        const countdownContainer = document.getElementById('countdownContainer');
        const countdownTimer = document.getElementById('countdownTimer');
        const countdownLevel = document.getElementById('countdownLevel');

        const updateState = () => {
            const now = Date.now();
            const nextReview = new Date(note.dateProchaineRevision).getTime();
            const remaining = nextReview - now;

            if (remaining <= 0) {
                // Délai écoulé → bouton actif
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = '✓ Relu / Compris';
                countdownContainer.style.display = 'none';
                if (this.countdownInterval) {
                    clearInterval(this.countdownInterval);
                    this.countdownInterval = null;
                }
            } else {
                // Délai pas encore écoulé → bouton bloqué + compte à rebours
                btn.disabled = true;
                btn.style.opacity = '0.4';
                btn.style.cursor = 'not-allowed';
                btn.innerHTML = '🔒 Pas encore disponible';
                countdownContainer.style.display = 'block';
                countdownLevel.textContent = `Niveau ${note.niveauRevision} → ${SpacedRepetitionService.getLevelLabel(note.niveauRevision)}`;

                // Formater le temps restant
                const totalSec = Math.ceil(remaining / 1000);
                const h = Math.floor(totalSec / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;

                if (h > 0) {
                    countdownTimer.textContent = `${h}h ${String(m).padStart(2,'0')}m ${String(s).padStart(2,'0')}s`;
                } else if (m > 0) {
                    countdownTimer.textContent = `${m}m ${String(s).padStart(2,'0')}s`;
                } else {
                    countdownTimer.textContent = `${s}s`;
                }
            }
        };

        // Exécuter immédiatement puis toutes les secondes
        updateState();
        const remaining = new Date(note.dateProchaineRevision).getTime() - Date.now();
        if (remaining > 0) {
            this.countdownInterval = setInterval(updateState, 1000);
        }
    }

    async markNoteAsRead() {
        if (!this.currentNoteId) return;

        const note = await this.db.getNote(this.currentNoteId);

        // Vérification de sécurité côté JS
        const now = Date.now();
        const nextReview = new Date(note.dateProchaineRevision).getTime();
        if (nextReview > now) return; // Pas encore le moment

        // Stopper le countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        const updatedNote = SpacedRepetitionService.markAsRead(note);
        await this.db.updateNote(updatedNote);

        // Show success feedback
        const btn = document.getElementById('markAsReadBtn');
        btn.innerHTML = '✓ Enregistré !';
        btn.style.background = '#10B981';
        btn.style.opacity = '1';

        setTimeout(() => {
            btn.style.background = '';
            if (this.currentCategoryId) {
                this.showCategoryNotes(this.currentCategoryId);
            } else {
                this.navigateTo('screenToRead');
            }
        }, 1000);
    }

    // ===========================
    // NOTES TO READ
    // ===========================

    async renderNotesToRead() {
        const allNotes = await this.db.getAllNotes();
        const notesToRead = SpacedRepetitionService.getNotesToRead(allNotes);
        const container = document.getElementById('toReadList');

        if (notesToRead.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">✨</div>
                    <div class="empty-text">Aucune note à réviser pour le moment !</div>
                </div>
            `;
            return;
        }

        // Sort by overdue (most overdue first)
        notesToRead.sort((a, b) => {
            const daysA = SpacedRepetitionService.getOverdueDays(a);
            const daysB = SpacedRepetitionService.getOverdueDays(b);
            return daysB - daysA;
        });

        const notesHTML = await Promise.all(notesToRead.map(async note => {
            const category = await this.db.getCategory(note.categorieId);
            const overdueDays = SpacedRepetitionService.getOverdueDays(note);
            const isOverdue = overdueDays > 0;

            return `
                <div class="card note-card ${isOverdue ? 'note-overdue' : ''}" 
                     data-note-id="${note.id}"
                     onclick="app.showNoteDetail(${note.id})"
                     ontouchstart="app.startNoteLongPress(${note.id}, event)"
                     ontouchend="app.endLongPress()"
                     ontouchmove="app.cancelLongPress()"
                     onmousedown="app.startNoteLongPress(${note.id}, event)"
                     onmouseup="app.endLongPress()"
                     onmouseleave="app.cancelLongPress()">
                    <div class="card-title">${this.escapeHtml(note.titre)}</div>
                    <div class="card-subtitle">${this.escapeHtml(category.nom)}</div>
                    <span class="note-badge">
                        ${isOverdue ? `⚠️ En retard de ${overdueDays} sec` : '📖 À réviser'}
                    </span>
                </div>
            `;
        }));

        container.innerHTML = notesHTML.join('');
    }

    // ===========================
    // RANDOM NOTE
    // ===========================

    async renderRandomNote() {
        const allNotes = await this.db.getAllNotes();
        const container = document.getElementById('randomNoteContent');

        if (allNotes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎲</div>
                    <div class="empty-text">Aucune note disponible</div>
                </div>
            `;
            return;
        }

        const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
        const category = await this.db.getCategory(randomNote.categorieId);

        container.innerHTML = `
            <div class="card">
                <div class="card-title">${this.escapeHtml(randomNote.titre)}</div>
                <div class="card-subtitle">${this.escapeHtml(category.nom)}</div>
                <div class="note-content">${this.escapeHtml(randomNote.contenu)}</div>
                <button class="btn btn-primary" onclick="app.markRandomNoteAsRead(${randomNote.id})">
                    ✓ Relu / Compris
                </button>
                <button class="btn btn-secondary" style="margin-top: 8px;" onclick="app.renderRandomNote()">
                    🎲 Autre note
                </button>
            </div>
        `;
    }

    async markRandomNoteAsRead(noteId) {
        const note = await this.db.getNote(noteId);
        const updatedNote = SpacedRepetitionService.markAsRead(note);
        await this.db.updateNote(updatedNote);

        // Show next random note
        await this.renderRandomNote();
    }

    // ===========================
    // QUICK NOTE
    // ===========================

    async loadQuickNote() {
        const quickNote = await this.db.getQuickNote();
        if (quickNote) {
            document.getElementById('quickNoteText').value = quickNote.contenu || '';
        }
    }

    handleQuickNoteInput() {
        clearTimeout(this.quickNoteTimeout);
        
        const savedIndicator = document.getElementById('quickNoteSaved');
        savedIndicator.textContent = '💾 Sauvegarde...';
        savedIndicator.style.color = '#F59E0B';

        this.quickNoteTimeout = setTimeout(async () => {
            const contenu = document.getElementById('quickNoteText').value;
            await this.db.saveQuickNote(contenu);
            savedIndicator.textContent = '✓ Sauvegardé';
            savedIndicator.style.color = '#10B981';
        }, 1000);
    }

    // ===========================
    // LINKS
    // ===========================

    async renderLinks() {
        const links = await this.db.getAllLinks();
        const container = document.getElementById('linksList');

        if (links.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔗</div>
                    <div class="empty-text">Aucun lien enregistré</div>
                    <button class="btn btn-primary" onclick="app.openModal('modalAddLink')">
                        ➕ Ajouter un lien
                    </button>
                </div>
            `;
            return;
        }

        container.innerHTML = links.map(link => `
            <div class="card link-card">
                <div class="card-title">${this.escapeHtml(link.titre)}</div>
                <div class="link-url">${this.escapeHtml(link.url)}</div>
                ${link.note ? `<div class="card-subtitle" style="margin-top: 8px;">${this.escapeHtml(link.note)}</div>` : ''}
                <div style="display: flex; gap: 8px; margin-top: 12px;">
                    <button class="btn btn-primary" style="flex: 1;" onclick="window.open('${this.escapeHtml(link.url)}', '_blank')">
                        🌐 Ouvrir
                    </button>
                    <button class="btn btn-secondary" onclick="app.deleteLink(${link.id})">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    async addLink() {
        const titre = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const note = document.getElementById('linkNote').value.trim();

        if (!titre || !url) return;

        await this.db.addLink({ titre, url, note });
        this.closeModal('modalAddLink');
        document.getElementById('formAddLink').reset();
        await this.renderLinks();
    }

    async deleteLink(linkId) {
        if (confirm('Supprimer ce lien ?')) {
            await this.db.deleteLink(linkId);
            await this.renderLinks();
        }
    }

    // ===========================
    // SEARCH
    // ===========================

    async handleSearch(query) {
        if (!query) {
            // Si la recherche est vide, retourner à l'écran courant
            document.getElementById('screenSearch').classList.remove('active');
            document.getElementById(this.currentScreen).classList.add('active');
            document.getElementById('headerTitle').textContent = {
                'screenThemes': 'Etchnote',
                'screenRandom': 'Aléatoire',
                'screenToRead': 'À lire',
                'screenQuick': 'Note Rapide',
                'screenLinks': 'Liens'
            }[this.currentScreen] || 'Etchnote';
            return;
        }

        // Afficher l'écran de recherche
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById('screenSearch').classList.add('active');
        document.getElementById('headerTitle').textContent = `Recherche : "${query}"`;

        const allNotes = await this.db.getAllNotes();
        const allCategories = await this.db.getAllCategories();
        const q = query.toLowerCase();

        const results = allNotes.filter(note =>
            note.titre.toLowerCase().includes(q) ||
            note.contenu.toLowerCase().includes(q)
        );

        const container = document.getElementById('searchResultsList');

        if (results.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <div class="empty-text">Aucune note trouvée pour "${this.escapeHtml(query)}"</div>
                </div>
            `;
            return;
        }

        const catMap = {};
        allCategories.forEach(c => catMap[c.id] = c);

        container.innerHTML = results.map(note => {
            const cat = catMap[note.categorieId] || { nom: '?' };
            // Mettre en surbrillance le terme recherché
            const titleHighlighted = this.highlightText(note.titre, query);
            const snippet = note.contenu.length > 120 ? note.contenu.substring(0, 120) + '...' : note.contenu;
            const snippetHighlighted = this.highlightText(snippet, query);
            return `
                <div class="card note-card" onclick="app.showNoteDetail(${note.id})">
                    <div class="card-title">${titleHighlighted}</div>
                    <div class="card-subtitle">${this.escapeHtml(cat.nom)}</div>
                    <div style="font-size:13px; color: var(--text-medium); margin-top: 8px; line-height:1.5;">${snippetHighlighted}</div>
                    <span class="note-badge">Niveau ${note.niveauRevision} • ${SpacedRepetitionService.getLevelLabel(note.niveauRevision)}</span>
                </div>
            `;
        }).join('');
    }

    highlightText(text, query) {
        const escaped = this.escapeHtml(text);
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.replace(
            new RegExp(`(${escapedQuery})`, 'gi'),
            '<mark style="background: #FFE08A; border-radius: 3px; padding: 0 2px;">$1</mark>'
        );
    }

    // ===========================
    // STATS
    // ===========================

    async updateStats() {
        const categories = await this.db.getAllCategories();
        const notes = await this.db.getAllNotes();

        document.getElementById('statCategories').textContent = categories.length;
        document.getElementById('statNotes').textContent = notes.length;
    }

    // ===========================
    // UTILITIES
    // ===========================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return this.escapeHtml(text);
        return this.escapeHtml(text.substring(0, maxLength)) + '...';
    }
}

// ===========================
// GLOBAL FUNCTIONS
// ===========================

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// ===========================
// INITIALIZE APP
// ===========================

let app;

document.addEventListener('DOMContentLoaded', async () => {
    app = new AppController();
    await app.init();
});

// ===========================
// SERVICE WORKER REGISTRATION
// ===========================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').then(
            (registration) => {
                console.log('Service Worker enregistré avec succès:', registration.scope);
            },
            (err) => {
                console.log('Échec de l\'enregistrement du Service Worker:', err);
            }
        );
    });
}
