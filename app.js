// ===========================
// ETCHNOTE — application de notes avec répétition espacée
// Les images sont désormais des fichiers (assets/) et non plus intégrées en base64.
// ===========================

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
        return new Promise((resolve, reject) => {
            const request = store.add({ nom, dateCreation: new Date().toISOString() });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
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
        return new Promise((resolve, reject) => {
            const request = store.add({
                ...note,
                niveauRevision: 1,
                dateCreation: new Date().toISOString(),
                dateDerniereLecture: null,
                dateProchaineRevision: new Date(Date.now() + SpacedRepetitionService.INTERVALS[1]).toISOString() // +24 h
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
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

    // Sauvegarde / restauration complète
    async exportAll() {
        const getAll = (name) => new Promise((resolve, reject) => {
            const request = this.db.transaction([name], 'readonly').objectStore(name).getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        const [categories, notes, quick_note, links] = await Promise.all(
            ['categories', 'notes', 'quick_note', 'links'].map(getAll)
        );
        return { categories, notes, quick_note, links };
    }

    /** Remplace tout le contenu local (une seule transaction : tout ou rien). */
    async importAll(data) {
        return new Promise((resolve, reject) => {
            const names = ['categories', 'notes', 'quick_note', 'links'];
            const transaction = this.db.transaction(names, 'readwrite');
            names.forEach(name => {
                const store = transaction.objectStore(name);
                store.clear();
                (data[name] || []).forEach(item => store.put(item));
            });
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
            transaction.onabort = () => reject(transaction.error || new Error('Restauration annulée'));
        });
    }
}

// ===========================
// SPACED REPETITION SERVICE
// ===========================

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

class SpacedRepetitionService {
    static INTERVALS = {
        1: 24 * HOUR,                  // 24 h
        2: 48 * HOUR,                  // 48 h
        3: 7 * DAY,                    // 7 jours
        4: 15 * DAY,                   // 15 jours
        5: 30 * DAY,                   // 1 mois
        6: 60 * DAY,                   // 2 mois
        7: 120 * DAY,                  // 4 mois
        8: 180 * DAY                   // 6 mois
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
        return Math.floor(diff / DAY);
    }

    static getLevelLabel(level) {
        const labels = {
            1: '24 h',
            2: '48 h',
            3: '7 jours',
            4: '15 jours',
            5: '1 mois',
            6: '2 mois',
            7: '4 mois',
            8: '6 mois'
        };
        return labels[level] || '';
    }
}

// ===========================
// APP CONTROLLER
// ===========================

// Écrans accessibles depuis la barre du bas
const TAB_SCREENS = ['screenHome', 'screenNotes', 'screenThemes', 'screenToRead', 'screenQuick'];
// Onglet mis en évidence pour les écrans secondaires
const PARENT_TAB = { screenRandom: 'screenHome', screenLinks: 'screenHome', screenLearn: 'screenHome', screenCategoryNotes: 'screenThemes' };
const SCREEN_TITLES = {
    screenHome: 'Etchnote',
    screenNotes: 'Mes notes',
    screenThemes: 'Thèmes',
    screenToRead: 'Révisions',
    screenQuick: 'Tableau blanc',
    screenRandom: 'Note au hasard',
    screenLinks: 'Mes liens',
    screenLearn: 'Apprendre',
    screenSearch: 'Recherche',
    screenNoteDetail: 'Lecture'
};
// Écrans où la recherche est pertinente
const SEARCH_SCREENS = ['screenHome', 'screenNotes', 'screenThemes', 'screenToRead', 'screenCategoryNotes', 'screenSearch'];
// Bouton flottant « + » : action selon l'écran (absent = masqué)
const FAB_ACTIONS = {
    screenHome: 'note',
    screenNotes: 'note',
    screenThemes: 'category',
    screenCategoryNotes: 'note',
    screenLinks: 'link'
};
const FAB_LABELS = { note: 'Nouvelle note', category: 'Nouveau thème', link: 'Nouveau lien' };

const MARK_READ_HTML = '<svg class="ico"><use href="#i-check"/></svg>Relu / Compris';
const MARK_LOCKED_HTML = '<svg class="ico"><use href="#i-lock"/></svg>Pas encore disponible';
const MARK_DONE_HTML = '<svg class="ico"><use href="#i-check"/></svg>Enregistré !';

class AppController {
    constructor() {
        this.db = new DatabaseService();
        this.currentScreen = 'screenHome';
        this.currentCategoryId = null;
        this.currentNoteId = null;
        this.originScreen = null;      // écran d'où l'on a ouvert une note
        this.preSearchScreen = null;   // écran quitté pour la recherche
        this.searchSeq = 0;
        this.notesFilter = 'all';
        this.reviewTab = 'today';
        this.quickNoteTimeout = null;
        this.longPressTimer = null;
        this.longPressFired = false;
        this.countdownInterval = null;
        this.lastFocus = null;
        this.modalOpenedAt = 0;
        this.toastTimer = null;
        this._confirmDone = null;
        this.learn = null;             // état de l'assistant IA
        this.backupBusy = false;
    }

    async init() {
        this.setupEventListeners();
        this.setupPopupListeners();
        try {
            await this.db.init();
            await this.loadQuickNote();
            await this.renderHome();
            this.updateFab();
            await this.checkNotesALire();
        } catch (err) {
            console.error('Erreur au démarrage :', err);
            document.getElementById('homeReview').innerHTML = `
                <div class="card"><div class="empty-state">
                    <div class="empty-text">Impossible d'ouvrir vos notes</div>
                    <p class="empty-sub">Le stockage local du navigateur est indisponible (navigation privée ou stockage bloqué ?). Rechargez la page ou changez de mode de navigation.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Recharger</button>
                </div></div>`;
        }
    }

    // ===========================
    // ÉCOUTEURS
    // ===========================

    setupEventListeners() {
        const $ = (id) => document.getElementById(id);

        // Navigation du bas
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.navigateTo(e.currentTarget.getAttribute('data-screen'));
            });
        });

        $('headerBack').addEventListener('click', () => this.goBack());
        $('fabBtn').addEventListener('click', () => this.handleFabClick());
        $('helpBtn').addEventListener('click', () => this.openModal('modalHelp'));
        $('homeSeeAll').addEventListener('click', () => this.navigateTo('screenNotes'));
        $('shortcutRandom').addEventListener('click', () => this.navigateTo('screenRandom'));
        $('shortcutLinks').addEventListener('click', () => this.navigateTo('screenLinks'));
        $('shortcutLearn').addEventListener('click', () => this.openLearn());
        $('statCategoriesBtn').addEventListener('click', () => this.navigateTo('screenThemes'));
        $('statNotesBtn').addEventListener('click', () => this.navigateTo('screenNotes'));
        $('settingsBtn').addEventListener('click', () => this.openSettings());

        // Réglages : enregistrement immédiat
        $('setGeminiKey').addEventListener('input', (e) => SettingsService.set('geminiKey', e.target.value.trim()));
        $('setGeminiModel').addEventListener('input', (e) => SettingsService.set('geminiModel', e.target.value.trim()));
        $('setGoogleClientId').addEventListener('input', (e) => {
            const v = e.target.value.trim();
            SettingsService.set('googleClientId', v);
            if (v) DriveService.preload().catch(() => {});
        });
        $('testGeminiBtn').addEventListener('click', () => this.testGemini());
        $('driveSaveBtn').addEventListener('click', () => this.driveSave());
        $('driveRestoreBtn').addEventListener('click', () => this.driveRestore());
        $('exportBtn').addEventListener('click', () => this.exportFile());
        $('importBtn').addEventListener('click', () => $('importFile').click());
        $('importFile').addEventListener('change', (e) => this.importFile(e.target));
        $('copyOriginBtn').addEventListener('click', () => this.copyOrigin());

        // Filtres « Mes notes » et onglets « Révisions »
        document.querySelectorAll('.seg-btn[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.notesFilter = btn.getAttribute('data-filter');
                this.renderNotes();
            });
        });
        document.querySelectorAll('.seg-btn[data-rtab]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.reviewTab = btn.getAttribute('data-rtab');
                this.renderNotesToRead();
            });
        });

        // Formulaires
        $('formAddCategory').addEventListener('submit', (e) => { e.preventDefault(); this.addCategory(); });
        $('formEditCategory').addEventListener('submit', (e) => { e.preventDefault(); this.updateCategory(); });
        $('deleteCategoryBtn').addEventListener('click', () => this.deleteCategory());
        $('formAddNote').addEventListener('submit', (e) => { e.preventDefault(); this.addNote(); });
        $('formEditNote').addEventListener('submit', (e) => { e.preventDefault(); this.updateNote(); });
        $('deleteNoteBtn').addEventListener('click', () => this.deleteNoteFromModal());
        $('formAddLink').addEventListener('submit', (e) => { e.preventDefault(); this.addLink(); });

        // Détail d'une note
        $('editNoteFromDetailBtn').addEventListener('click', () => this.openEditNoteModalFromDetail());
        $('deleteNoteFromDetailBtn').addEventListener('click', () => this.deleteNoteFromDetail());
        $('markAsReadBtn').addEventListener('click', () => this.markNoteAsRead());
        $('backFromNoteBtn').addEventListener('click', () => this.goBack());

        // Tableau blanc : sauvegarde automatique
        $('quickNoteText').addEventListener('input', () => this.handleQuickNoteInput());

        // Recherche
        $('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value.trim()));

        // Modales : clic sur le fond (ignoré juste après l'ouverture, ex. appui long)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && Date.now() - this.modalOpenedAt > 450) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Clavier : Échap ferme la fenêtre ouverte ; Tab reste dans la fenêtre
        document.addEventListener('keydown', (e) => {
            const open = [...document.querySelectorAll('.modal.active')];
            if (e.key === 'Escape') {
                if (open.length) {
                    this.closeModal(open[open.length - 1].id);
                } else if ($('popupNotesALire').classList.contains('active')) {
                    $('popupNotesALire').classList.remove('active');
                }
            } else if (e.key === 'Tab' && open.length) {
                const box = open[open.length - 1];
                const focusables = [...box.querySelectorAll('button:not([disabled]),input:not([type=hidden]):not([disabled]),select,textarea,a[href]')]
                    .filter(el => el.offsetParent !== null);
                if (!focusables.length) return;
                const first = focusables[0];
                const last = focusables[focusables.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
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

    // ===========================
    // NAVIGATION
    // ===========================

    tabFor(screenId) {
        if (screenId === 'screenNoteDetail') return this.tabFor(this.originScreen || 'screenNotes');
        if (screenId === 'screenSearch') return this.tabFor(this.preSearchScreen || 'screenHome');
        if (TAB_SCREENS.includes(screenId)) return screenId;
        return PARENT_TAB[screenId] || 'screenHome';
    }

    stopCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }
    }

    /** Affiche un écran : titre, retour, recherche, onglet actif, bouton flottant. */
    setScreen(screenId, title) {
        this.stopCountdown();
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
        this.currentScreen = screenId;

        const isSub = !TAB_SCREENS.includes(screenId);
        document.getElementById('headerTitle').textContent = title || SCREEN_TITLES[screenId] || 'Etchnote';
        document.getElementById('headerBack').hidden = !isSub;
        document.getElementById('headerLogo').hidden = isSub;
        document.getElementById('searchContainer').classList.toggle('hidden', !SEARCH_SCREENS.includes(screenId));

        const tab = this.tabFor(screenId);
        document.querySelectorAll('.nav-item').forEach(item => {
            const active = item.getAttribute('data-screen') === tab;
            item.classList.toggle('active', active);
            if (active) item.setAttribute('aria-current', 'page');
            else item.removeAttribute('aria-current');
        });

        this.updateFab();
        window.scrollTo(0, 0);
    }

    navigateTo(screenId) {
        this.currentCategoryId = null;
        const search = document.getElementById('searchInput');
        if (search.value) search.value = '';
        this.setScreen(screenId);
        this.loadScreenContent(screenId);
    }

    async loadScreenContent(screenId) {
        try {
            switch (screenId) {
                case 'screenHome': await this.renderHome(); break;
                case 'screenNotes': await this.renderNotes(); break;
                case 'screenThemes': await this.renderThemes(); break;
                case 'screenToRead': await this.renderNotesToRead(); break;
                case 'screenRandom': await this.renderRandomNote(); break;
                case 'screenLinks': await this.renderLinks(); break;
                case 'screenLearn': await this.renderLearn(); break;
            }
        } catch (err) {
            console.error('Erreur de chargement :', err);
            this.toast('Une erreur est survenue lors du chargement.', true);
        }
    }

    async refreshCurrentScreen() {
        switch (this.currentScreen) {
            case 'screenCategoryNotes': return this.currentCategoryId ? this.showCategoryNotes(this.currentCategoryId) : this.navigateTo('screenThemes');
            case 'screenNoteDetail': return this.currentNoteId ? this.showNoteDetail(this.currentNoteId) : null;
            case 'screenSearch': return this.handleSearch(document.getElementById('searchInput').value.trim());
            default: return this.loadScreenContent(this.currentScreen);
        }
    }

    goBack() {
        switch (this.currentScreen) {
            case 'screenNoteDetail': return this.returnFromDetail();
            case 'screenCategoryNotes': return this.navigateTo('screenThemes');
            case 'screenSearch': return this.leaveSearch();
            default: return this.navigateTo('screenHome');
        }
    }

    async returnFromDetail() {
        const origin = this.originScreen || 'screenNotes';
        if (origin === 'screenCategoryNotes' && this.currentCategoryId) {
            return this.showCategoryNotes(this.currentCategoryId);
        }
        if (origin === 'screenSearch') {
            const q = document.getElementById('searchInput').value.trim();
            if (q) return this.handleSearch(q);
            return this.leaveSearch();
        }
        return this.navigateTo(origin === 'screenCategoryNotes' ? 'screenThemes' : origin);
    }

    leaveSearch() {
        document.getElementById('searchInput').value = '';
        const target = this.preSearchScreen || 'screenHome';
        if (target === 'screenCategoryNotes' && this.currentCategoryId) {
            return this.showCategoryNotes(this.currentCategoryId);
        }
        return this.navigateTo(target === 'screenCategoryNotes' ? 'screenThemes' : target);
    }

    updateFab() {
        const action = FAB_ACTIONS[this.currentScreen];
        const fab = document.getElementById('fabBtn');
        fab.hidden = !action;
        document.body.classList.toggle('has-fab', !!action);
        if (action) fab.setAttribute('aria-label', FAB_LABELS[action]);
    }

    handleFabClick() {
        switch (FAB_ACTIONS[this.currentScreen]) {
            case 'note': this.openAddNoteModal(); break;
            case 'category': this.openModal('modalAddCategory'); break;
            case 'link': this.openModal('modalAddLink'); break;
        }
    }

    // ===========================
    // FENÊTRES, TOAST, CONFIRMATION
    // ===========================

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        this.lastFocus = document.activeElement;
        this.modalOpenedAt = Date.now();
        modal.classList.add('active');
        this.syncBodyLock();
        const first = modal.querySelector('input:not([type=hidden]),select,textarea');
        const target = modalId === 'modalConfirm' ? document.getElementById('confirmCancel')
            : (first || modal.querySelector('button'));
        setTimeout(() => target && target.focus({ preventScroll: true }), 60);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.classList.remove('active');
        if (modalId === 'modalConfirm' && this._confirmDone) {
            const done = this._confirmDone;
            this._confirmDone = null;
            done(false);
        }
        this.syncBodyLock();
        if (!document.querySelector('.modal.active') && this.lastFocus && document.contains(this.lastFocus)) {
            this.lastFocus.focus({ preventScroll: true });
        }
    }

    syncBodyLock() {
        document.body.style.overflow = document.querySelector('.modal.active') ? 'hidden' : '';
    }

    toast(message, isError = false) {
        const el = document.getElementById('toast');
        el.textContent = message;
        el.classList.toggle('err', isError);
        el.classList.add('show');
        clearTimeout(this.toastTimer);
        this.toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
    }

    confirmDialog(title, message, okLabel = 'Supprimer') {
        return new Promise(resolve => {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmText').textContent = message;
            const ok = document.getElementById('confirmOk');
            const cancel = document.getElementById('confirmCancel');
            ok.textContent = okLabel;
            const finish = (value) => {
                this._confirmDone = null;
                this.closeModal('modalConfirm');
                resolve(value);
            };
            this._confirmDone = finish;
            ok.onclick = () => finish(true);
            cancel.onclick = () => finish(false);
            this.openModal('modalConfirm');
        });
    }

    // ===========================
    // OUTILS D'AFFICHAGE
    // ===========================

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }

    escapeAttr(text) {
        return this.escapeHtml(text).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    truncateText(text, maxLength) {
        const t = text == null ? '' : String(text);
        if (t.length <= maxLength) return this.escapeHtml(t);
        return this.escapeHtml(t.substring(0, maxLength)) + '…';
    }

    safeUrl(url) {
        try {
            const u = new URL(url);
            return (u.protocol === 'http:' || u.protocol === 'https:') ? u.href : '';
        } catch (e) {
            return '';
        }
    }

    mapById(list) {
        const map = {};
        list.forEach(item => { map[item.id] = item; });
        return map;
    }

    catOf(map, note) {
        return map[note.categorieId] || { id: null, nom: 'Sans thème' };
    }

    timeAgo(iso) {
        const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
        if (s < 45) return "À l'instant";
        const m = Math.floor(s / 60);
        if (m < 60) return `Il y a ${m} min`;
        const h = Math.floor(m / 60);
        if (h < 24) return `Il y a ${h} h`;
        const j = Math.floor(h / 24);
        if (j < 7) return `Il y a ${j} jour${j > 1 ? 's' : ''}`;
        if (j < 30) return `Il y a ${Math.floor(j / 7)} sem.`;
        if (j < 365) return `Il y a ${Math.floor(j / 30)} mois`;
        const y = Math.floor(j / 365);
        return `Il y a ${y} an${y > 1 ? 's' : ''}`;
    }

    timeUntil(iso) {
        const ms = new Date(iso).getTime() - Date.now();
        if (ms <= 0) return 'Maintenant';
        const s = Math.ceil(ms / 1000);
        if (s < 60) return `Dans ${s} s`;
        const m = Math.ceil(s / 60);
        if (m < 60) return `Dans ${m} min`;
        const h = Math.ceil(m / 60);
        if (h < 48) return `Dans ${h} h`;
        return `Dans ${Math.ceil(h / 24)} jours`;
    }

    formatDuration(totalSec) {
        if (totalSec < 60) return `${totalSec} s`;
        const m = Math.floor(totalSec / 60);
        if (m < 60) return `${m} min`;
        const h = Math.floor(m / 60);
        if (h < 48) return `${h} h`;
        return `${Math.floor(h / 24)} j`;
    }

    formatDate(iso) {
        return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    }

    ringHTML(pct, label, size = 84) {
        const stroke = 7;
        const r = (size - stroke) / 2;
        const c = 2 * Math.PI * r;
        const offset = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
        return `
            <div class="ring" style="width:${size}px;height:${size}px">
                <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" aria-hidden="true">
                    <circle class="track" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}"/>
                    <circle class="bar" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"/>
                </svg>
                <div class="ring-label" role="img" aria-label="${pct} % ${label}">
                    <span style="font-size:${Math.round(size * 0.27)}px">${pct}%</span><small>${label}</small>
                </div>
            </div>`;
    }

    // Icône gravée (SVG) d'un thème, choisie selon son nom, sinon de façon stable
    themeThumb(nom) {
        const n = (nom || '').toLowerCase();
        const rules = [
            [/hist|antiq|rome|grec|moyen/, 'svgColumn'],
            [/g[ée]o|carte|monde|voyage|pays/, 'svgGlobe'],
            [/astro|espace|[ée]toile|ciel|cosmos|plan[èe]te/, 'svgSextant'],
            [/scien|chim|phys|bio|sant[ée]|m[ée]d/, 'svgFlask'],
            [/math|logiq|calcul|algo|info|code/, 'svgCompass'],
            [/liv|lectur|litt[ée]r|roman|po[ée]s/, 'svgBook'],
            [/[ée]cri|plume|r[ée]dac|journal/, 'svgQuill'],
            [/droit|loi|r[èe]gle|juridi/, 'svgScroll']
        ];
        let fn = null;
        for (const [re, f] of rules) { if (re.test(n)) { fn = f; break; } }
        if (!fn) {
            const defaults = ['svgBook', 'svgNote', 'svgCompass', 'svgScroll', 'svgQuill'];
            let h = 0;
            for (const ch of n) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
            fn = defaults[h % defaults.length];
        }
        return this[fn]().replace(/ width="\d+" height="\d+"/, '');
    }

    chipClass(nom) {
        let h = 0;
        for (const ch of (nom || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
        return 't' + ((h % 5) + 1);
    }

    chipHTML(nom) {
        return `<span class="chip ${this.chipClass(nom)}">${this.escapeHtml(nom)}</span>`;
    }

    emptyHTML(icon, title, sub, buttonHtml = '') {
        return `
            <div class="empty-state" style="grid-column:1/-1">
                <img src="assets/icons/${icon}.png" alt="" width="72" height="72">
                <div class="empty-text">${title}</div>
                ${sub ? `<p class="empty-sub">${sub}</p>` : ''}
                ${buttonHtml}
            </div>`;
    }

    noteItemHTML(note, cat, opts = {}) {
        const id = note.id;
        const title = opts.query ? this.highlightText(note.titre, opts.query) : this.escapeHtml(note.titre);
        const meta = opts.meta != null ? opts.meta : this.timeAgo(note.dateCreation);
        const warn = opts.warn ? `<span class="chip warn">${opts.warn}</span>` : '';
        const snippet = opts.snippet ? `<span class="item-snippet">${opts.snippet}</span>` : '';
        return `
            <article class="item${opts.overdue ? ' overdue' : ''}">
                <button class="item-main" type="button"
                        onclick="app.openNote(${id})"
                        ontouchstart="app.startNoteLongPress(${id}, event)"
                        ontouchend="app.endLongPress()"
                        ontouchmove="app.cancelLongPress()"
                        onmousedown="app.startNoteLongPress(${id}, event)"
                        onmouseup="app.endLongPress()"
                        onmouseleave="app.cancelLongPress()">
                    <span class="item-thumb" aria-hidden="true">${this.themeThumb(cat.nom)}</span>
                    <span class="item-text">
                        <span class="item-title">${title}</span>
                        <span class="item-meta">${this.chipHTML(cat.nom)}${warn}<span>${meta}</span></span>
                        ${snippet}
                    </span>
                    <svg class="ico item-chev" aria-hidden="true"><use href="#i-chev"/></svg>
                </button>
                <button class="item-more" type="button" aria-label="Modifier la note ${this.escapeAttr(note.titre)}" onclick="app.openEditNoteModal(${id})"><svg class="ico" aria-hidden="true"><use href="#i-more"/></svg></button>
            </article>`;
    }

    // ===========================
    // ACCUEIL
    // ===========================

    async renderHome() {
        const [notes, cats] = await Promise.all([this.db.getAllNotes(), this.db.getAllCategories()]);
        const catMap = this.mapById(cats);
        const due = SpacedRepetitionService.getNotesToRead(notes);
        const total = notes.length;
        const pct = total ? Math.round(((total - due.length) / total) * 100) : 0;

        const review = document.getElementById('homeReview');
        if (total === 0) {
            review.innerHTML = `
                <section class="card">
                    ${this.emptyHTML('inkwell', 'Bienvenue sur Etchnote',
                        'Créez un thème puis votre première note pour commencer à cultiver votre mémoire.',
                        '<button class="btn btn-primary" onclick="app.openAddNoteModal()">Créer ma première note</button>')}
                </section>`;
        } else {
            const n = due.length;
            review.innerHTML = `
                <section class="card hero" aria-labelledby="heroTitle">
                    <div class="hero-top"><svg class="ico" aria-hidden="true"><use href="#i-calendar"/></svg><h2 id="heroTitle">Révisions aujourd'hui</h2></div>
                    <div class="hero-body">
                        <div class="hero-count">${n} note${n > 1 ? 's' : ''}
                            <small>${n ? 'Prenez quelques minutes pour renforcer vos connaissances.' : 'Tout est à jour. Revenez un peu plus tard !'}</small>
                        </div>
                        ${this.ringHTML(pct, 'à jour')}
                    </div>
                    ${n ? `<button class="btn btn-primary" onclick="app.navigateTo('screenToRead')">Commencer <svg class="ico" aria-hidden="true"><use href="#i-arrow"/></svg></button>` : ''}
                </section>`;
        }

        const recent = [...notes].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation)).slice(0, 3);
        document.getElementById('homeRecent').innerHTML = recent.length
            ? recent.map(note => this.noteItemHTML(note, this.catOf(catMap, note))).join('')
            : '<p class="empty-sub" style="text-align:center;margin:0">Vos notes récentes apparaîtront ici.</p>';

        this.updateStats(notes, cats);
    }

    async updateStats(notes, cats) {
        if (!notes) notes = await this.db.getAllNotes();
        if (!cats) cats = await this.db.getAllCategories();
        document.getElementById('statCategories').textContent = cats.length;
        document.getElementById('statNotes').textContent = notes.length;
    }

    // ===========================
    // MES NOTES
    // ===========================

    async renderNotes() {
        const [notes, cats] = await Promise.all([this.db.getAllNotes(), this.db.getAllCategories()]);
        const catMap = this.mapById(cats);
        const filter = this.notesFilter;

        document.querySelectorAll('.seg-btn[data-filter]').forEach(btn => {
            btn.setAttribute('aria-selected', String(btn.getAttribute('data-filter') === filter));
        });

        let list = [...notes].sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
        if (filter === 'recent') {
            const limit = Date.now() - 7 * 24 * 3600 * 1000;
            list = list.filter(n => new Date(n.dateCreation).getTime() >= limit);
        } else if (filter === 'due') {
            list = SpacedRepetitionService.getNotesToRead(list);
        }

        const container = document.getElementById('notesList');
        if (list.length === 0) {
            const msg = {
                all: ['books', 'Aucune note pour le moment', 'Appuyez sur « + » pour écrire votre première note.'],
                recent: ['scroll', 'Aucune note récente', 'Les notes créées durant les 7 derniers jours apparaissent ici.'],
                due: ['scroll', 'Rien à réviser', 'Toutes vos notes sont à jour. Bravo !']
            }[filter];
            container.innerHTML = this.emptyHTML(msg[0], msg[1], msg[2]);
            return;
        }
        container.innerHTML = list.map(note => this.noteItemHTML(note, this.catOf(catMap, note))).join('');
    }

    openNote(id) {
        if (this.longPressFired) { this.longPressFired = false; return; }
        this.showNoteDetail(id);
    }

    // ===========================
    // THÈMES
    // ===========================

    // ── Icônes SVG gravées (trait cuivré) ──────────────────────────
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

    async renderThemes() {
        const [categories, allNotes] = await Promise.all([this.db.getAllCategories(), this.db.getAllNotes()]);
        const container = document.getElementById('themesList');

        if (categories.length === 0) {
            container.innerHTML = this.emptyHTML('books', 'Aucun thème pour le moment',
                'Les thèmes servent à ranger vos notes par sujet.',
                '<button class="btn btn-primary" onclick="app.openModal(\'modalAddCategory\')">Créer un thème</button>');
            return;
        }

        container.innerHTML = categories.map(cat => {
            const count = allNotes.filter(n => n.categorieId === cat.id).length;
            const label = count === 0 ? 'Aucune note' : count === 1 ? '1 note' : `${count} notes`;
            return `
                <article class="item">
                    <button class="item-main" type="button"
                            onclick="app.openTheme(${cat.id})"
                            ontouchstart="app.startLongPress(${cat.id}, event)"
                            ontouchend="app.endLongPress()"
                            ontouchmove="app.cancelLongPress()"
                            onmousedown="app.startLongPress(${cat.id}, event)"
                            onmouseup="app.endLongPress()"
                            onmouseleave="app.cancelLongPress()">
                        <span class="item-thumb" aria-hidden="true">${this.themeThumb(cat.nom)}</span>
                        <span class="item-text">
                            <span class="item-title">${this.escapeHtml(cat.nom)}</span>
                            <span class="item-meta">${label}</span>
                        </span>
                        <svg class="ico item-chev" aria-hidden="true"><use href="#i-chev"/></svg>
                    </button>
                    <button class="item-more" type="button" aria-label="Modifier le thème ${this.escapeAttr(cat.nom)}" onclick="app.openEditCategoryModal(${cat.id})"><svg class="ico" aria-hidden="true"><use href="#i-more"/></svg></button>
                </article>`;
        }).join('');
    }

    openTheme(id) {
        if (this.longPressFired) { this.longPressFired = false; return; }
        this.showCategoryNotes(id);
    }

    async addCategory() {
        const nom = document.getElementById('categoryName').value.trim();
        if (!nom) return;

        try {
            await this.db.addCategory(nom);
            this.closeModal('modalAddCategory');
            document.getElementById('formAddCategory').reset();
            this.toast('Thème créé');
            await this.refreshCurrentScreen();
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast("Impossible de créer le thème.", true);
        }
    }

    // ===========================
    // ASSISTANT IA : apprendre un sujet avec Gemini
    // ===========================

    freshLearn(extra = {}) {
        return Object.assign({
            step: 'start',       // start → angles → lesson → saved
            mode: 'new',         // new : nouveau thème · deepen : approfondir l'existant
            target: 'theme',     // en mode deepen : theme (un thème entier) ou note (une note précise)
            topic: '', catId: null, catName: null, noteId: null, focus: null, catLabel: '',
            level: SettingsService.get('level', 'débutant'),
            goal: '', existing: [],
            angles: [], shown: [], angle: null,
            draft: { titre: '', contenu: '' },
            savedNote: null,
            busy: false, busyText: '', error: ''
        }, extra);
    }

    openLearn(opts = {}) {
        this.learn = this.freshLearn(opts);
        this.navigateTo('screenLearn');
    }

    /** Lance une étape asynchrone avec écran d'attente ; ignore le résultat si l'utilisateur est parti. */
    async learnRun(text, task) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.busy = true; L.busyText = text; L.error = '';
        await this.renderLearn();
        try {
            await task(L);
        } catch (err) {
            if (this.learn !== L) return;
            console.error(err);
            L.error = (err && err.message) || "Une erreur est survenue.";
        }
        if (this.learn !== L) return;
        L.busy = false;
        if (this.currentScreen === 'screenLearn') await this.renderLearn();
    }

    learnBack(step) {
        if (!this.learn || this.learn.busy) return;
        this.learn.step = step;
        this.learn.error = '';
        this.renderLearn();
    }

    learnMode(mode) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.mode = mode; L.error = '';
        this.renderLearn();
    }

    learnPickCat(id) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.catId = id; L.error = '';
        this.renderLearn();
    }

    learnTarget(target) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.target = target; L.error = '';
        this.renderLearn();
    }

    learnPickNote(id) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.noteId = id; L.error = '';
        this.renderLearn();
    }

    learnLevel(level) {
        const L = this.learn;
        if (!L || L.busy) return;
        L.level = level;
        SettingsService.set('level', level);
        this.renderLearn();
    }

    async learnStart() {
        const L = this.learn;
        if (!L || L.busy) return;
        if (!GeminiService.hasKey()) { this.openSettings(); return; }

        if (L.mode === 'new') {
            L.topic = (L.topic || '').trim();
            if (!L.topic) { L.error = 'Indiquez ce que vous voulez apprendre.'; return this.renderLearn(); }
            L.existing = [];
            L.focus = null;
            L.catName = null;
        } else if (L.target === 'note') {
            const note = L.noteId ? await this.db.getNote(L.noteId) : null;
            if (!note) { L.error = 'Choisissez la note à approfondir.'; return this.renderLearn(); }
            const cat = await this.db.getCategory(note.categorieId);
            if (!cat) { L.error = 'Le thème de cette note est introuvable.'; return this.renderLearn(); }
            L.topic = note.titre;
            L.focus = note;
            L.catId = cat.id;
            L.catLabel = cat.nom;
            L.existing = (await this.db.getNotesByCategory(cat.id)).filter(n => n.id !== note.id);
        } else {
            const cat = L.catId ? await this.db.getCategory(L.catId) : null;
            if (!cat) { L.error = 'Choisissez un thème à approfondir.'; return this.renderLearn(); }
            L.topic = cat.nom;
            L.focus = null;
            L.catLabel = cat.nom;
            L.existing = await this.db.getNotesByCategory(cat.id);
        }
        L.shown = [];
        return this.learnLoadAngles(false);
    }

    learnLoadAngles(more) {
        return this.learnRun('Gemini cherche des pistes…', async (L) => {
            const angles = await GeminiService.suggestAngles(
                { topic: L.topic, level: L.level, goal: L.goal, existing: L.existing, focus: L.focus },
                more ? L.shown : []
            );
            if (this.learn !== L) return;
            L.angles = angles;
            L.shown = [...L.shown, ...angles.map(a => a.titre)];
            L.step = 'angles';
        });
    }

    learnPickAngle(index) {
        const L = this.learn;
        if (!L || L.busy || !L.angles[index]) return;
        L.angle = L.angles[index];
        return this.learnLoadLesson();
    }

    learnOwnAngle() {
        const L = this.learn;
        if (!L || L.busy) return;
        const input = document.getElementById('learnOwnAngle');
        const value = input ? input.value.trim() : '';
        if (!value) { L.error = 'Écrivez votre piste, ou choisissez-en une dans la liste.'; return this.renderLearn(); }
        L.angle = { titre: value.slice(0, 120), description: '' };
        return this.learnLoadLesson();
    }

    learnLoadLesson() {
        return this.learnRun('Gemini rédige la fiche…', async (L) => {
            const lesson = await GeminiService.makeLesson(
                { topic: L.topic, level: L.level, goal: L.goal, existing: L.existing, focus: L.focus }, L.angle
            );
            if (this.learn !== L) return;
            L.draft = { titre: lesson.titre, contenu: GeminiService.noteText(lesson) };
            L.step = 'lesson';
        });
    }

    async learnSave() {
        const L = this.learn;
        if (!L || L.busy) return;
        const titre = (L.draft.titre || '').trim();
        const contenu = (L.draft.contenu || '').trim();
        if (!titre || !contenu) { L.error = 'Le titre et le contenu ne peuvent pas être vides.'; return this.renderLearn(); }

        let catId = L.catId;
        let catName = L.topic;
        try {
            if (L.mode === 'new') {
                catName = (L.catName != null ? L.catName : L.topic).trim().slice(0, 60);
                if (!catName) { L.error = 'Donnez un nom au thème.'; return this.renderLearn(); }
                const cats = await this.db.getAllCategories();
                const found = cats.find(c => c.nom.trim().toLowerCase() === catName.toLowerCase());
                catId = found ? found.id : await this.db.addCategory(catName);
                if (found) catName = found.nom;
            } else {
                const cat = await this.db.getCategory(catId);
                catName = cat ? cat.nom : catName;
            }
            const noteId = await this.db.addNote({ categorieId: catId, titre, contenu });
            L.savedNote = { id: noteId, titre, catName };
            L.mode = 'deepen';
            L.target = 'theme';
            L.focus = null;
            L.topic = catName;
            L.catLabel = catName;
            L.catId = catId;
            L.step = 'saved';
            L.error = '';
            await this.updateStats();
        } catch (err) {
            console.error(err);
            L.error = "Impossible d'enregistrer la note.";
        }
        if (this.learn === L) await this.renderLearn();
    }

    async learnMore() {
        const L = this.learn;
        if (!L || L.busy) return;
        L.existing = await this.db.getNotesByCategory(L.catId);
        L.focus = null;
        L.shown = [];
        L.angle = null;
        return this.learnLoadAngles(false);
    }

    async renderLearn() {
        if (!this.learn) this.learn = this.freshLearn();
        const L = this.learn;
        const box = document.getElementById('learnContent');
        const e = (t) => this.escapeHtml(t);
        const a = (t) => this.escapeAttr(t);

        const keyNotice = GeminiService.hasKey() ? '' :
            `<div class="notice err" role="alert">Ajoutez votre clé Gemini gratuite pour utiliser l'assistant. <button type="button" class="link-btn" onclick="app.openSettings()">Ouvrir les réglages</button></div>`;
        const errorNotice = L.error ? `<div class="notice err" role="alert">${e(L.error)}</div>` : '';

        if (L.busy) {
            box.innerHTML = `<div class="busy" role="status"><span class="spinner" aria-hidden="true"></span>${e(L.busyText)}</div>`;
            return;
        }

        let html = '';
        if (L.step === 'start') {
            const [cats, notes] = await Promise.all([this.db.getAllCategories(), this.db.getAllNotes()]);
            if (this.learn !== L || L.busy) return;
            const counts = {};
            notes.forEach(n => { counts[n.categorieId] = (counts[n.categorieId] || 0) + 1; });
            const levels = ['débutant', 'intermédiaire', 'avancé'];

            const catName = {};
            cats.forEach(c => { catName[c.id] = c.nom; });
            const sortedNotes = [...notes].sort((x, y) => new Date(y.dateCreation) - new Date(x.dateCreation));

            let target;
            if (L.mode === 'new') {
                target = `<div class="form-group"><label class="form-label" for="learnTopic">Que voulez-vous apprendre ?</label>
                    <input type="text" class="form-input" id="learnTopic" maxlength="120" value="${a(L.topic)}" placeholder="Ex : dimensionner un onduleur, le subjonctif…" autocomplete="off" oninput="app.learn.topic=this.value"></div>`;
            } else if (!cats.length) {
                target = `<p class="notice">Vous n'avez pas encore de thème. Passez sur « Nouveau thème » pour en créer un.</p>`;
            } else {
                const sub = `<div class="seg fit" role="tablist" aria-label="Approfondir quoi ?">
                        <button type="button" class="seg-btn" role="tab" aria-selected="${L.target === 'theme'}" onclick="app.learnTarget('theme')">Un thème</button>
                        <button type="button" class="seg-btn" role="tab" aria-selected="${L.target === 'note'}" onclick="app.learnTarget('note')">Une note</button>
                    </div>`;
                if (L.target === 'note') {
                    target = sub + (sortedNotes.length
                        ? `<div class="form-group"><span class="form-label" id="lblNote">Note à approfondir</span>
                            <div class="pick-list scroll" role="group" aria-labelledby="lblNote">${sortedNotes.map(n => `
                                <button type="button" class="pick ${n.id === L.noteId ? 'sel' : ''}" aria-pressed="${n.id === L.noteId}" onclick="app.learnPickNote(${Number(n.id)})">
                                    <strong>${e(n.titre)}</strong><span>${e(catName[n.categorieId] || 'Sans thème')}</span></button>`).join('')}
                            </div>${L.noteId ? '<p class="form-hint">Le contenu de cette note et les titres des autres notes du thème sont envoyés à Gemini.</p>' : ''}</div>`
                        : `<p class="notice">Vous n'avez pas encore de note. Choisissez « Un thème » ou « Nouveau thème ».</p>`);
                } else {
                    target = sub + `<div class="form-group"><span class="form-label" id="lblCat">Thème à approfondir</span>
                        <div class="pick-list" role="group" aria-labelledby="lblCat">${cats.map(c => `
                            <button type="button" class="pick ${c.id === L.catId ? 'sel' : ''}" aria-pressed="${c.id === L.catId}" onclick="app.learnPickCat(${Number(c.id)})">
                                <strong>${e(c.nom)}</strong><span>${counts[c.id] || 0} note${(counts[c.id] || 0) > 1 ? 's' : ''}</span></button>`).join('')}
                        </div>${L.catId ? '<p class="form-hint">Les titres et extraits des notes de ce thème sont envoyés à Gemini pour éviter les répétitions.</p>' : ''}</div>`;
                }
            }

            html = `
                <h2 class="learn-title">Apprendre avec l'IA</h2>
                <p class="learn-sub">Choisissez un thème, l'assistant propose des pistes, puis rédige une fiche à mémoriser.</p>
                ${keyNotice}${errorNotice}
                <form id="formLearn" onsubmit="event.preventDefault();app.learnStart()">
                    <div class="seg fit" role="tablist" aria-label="Type de demande">
                        <button type="button" class="seg-btn" role="tab" aria-selected="${L.mode === 'new'}" onclick="app.learnMode('new')">Nouveau thème</button>
                        <button type="button" class="seg-btn" role="tab" aria-selected="${L.mode === 'deepen'}" onclick="app.learnMode('deepen')">Approfondir</button>
                    </div>
                    ${target}
                    <div class="form-group"><span class="form-label" id="lblLevel">Votre niveau</span>
                        <div class="seg fit" role="tablist" aria-labelledby="lblLevel">${levels.map(l => `
                            <button type="button" class="seg-btn" role="tab" aria-selected="${L.level === l}" onclick="app.learnLevel('${l}')">${l.charAt(0).toUpperCase() + l.slice(1)}</button>`).join('')}
                        </div></div>
                    <div class="form-group"><label class="form-label" for="learnGoal">Votre objectif <span class="opt">(facultatif)</span></label>
                        <input type="text" class="form-input" id="learnGoal" maxlength="140" value="${a(L.goal)}" placeholder="Ex : pour mon travail sur chantier, pour un examen…" autocomplete="off" oninput="app.learn.goal=this.value"></div>
                    <button type="submit" class="btn btn-primary"><svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg>Proposer des pistes</button>
                </form>`;
        } else if (L.step === 'angles') {
            html = `
                <h2 class="learn-title">Par où commencer ?</h2>
                <p class="learn-sub">${L.focus ? 'Note' : 'Thème'} : <strong>${e(L.topic)}</strong>${L.focus ? ' (thème ' + e(L.catLabel) + ')' : ''} · niveau ${e(L.level)}</p>
                ${errorNotice}
                <div class="pick-list">${L.angles.map((an, i) => `
                    <button type="button" class="pick" onclick="app.learnPickAngle(${i})"><strong>${e(an.titre)}</strong>${an.description ? `<span>${e(an.description)}</span>` : ''}</button>`).join('')}
                </div>
                <form class="stack" style="margin-top:var(--sp-4)" onsubmit="event.preventDefault();app.learnOwnAngle()">
                    <div class="form-group" style="margin-bottom:0"><label class="form-label" for="learnOwnAngle">Ou précisez votre propre piste</label>
                        <input type="text" class="form-input" id="learnOwnAngle" maxlength="120" placeholder="Ex : les erreurs fréquentes" autocomplete="off"></div>
                    <button type="submit" class="btn btn-secondary">Utiliser cette piste</button>
                    <div class="action-row">
                        <button type="button" class="btn btn-secondary" onclick="app.learnLoadAngles(true)">Autres pistes</button>
                        <button type="button" class="btn btn-ghost" onclick="app.learnBack('start')">Modifier</button>
                    </div>
                </form>`;
        } else if (L.step === 'lesson') {
            const dest = L.mode === 'new'
                ? `<div class="form-group"><label class="form-label" for="learnCatName">Thème</label>
                    <input type="text" class="form-input" id="learnCatName" maxlength="60" value="${a(L.catName != null ? L.catName : L.topic)}" autocomplete="off" oninput="app.learn.catName=this.value">
                    <p class="form-hint">Le thème est créé s'il n'existe pas encore.</p></div>`
                : `<p class="learn-sub">Thème : <strong>${e(L.catLabel || L.topic)}</strong>${L.focus ? ' · la fiche prolonge la note « ' + e(L.topic) + ' »' : ''}</p>`;
            html = `
                <h2 class="learn-title">Votre fiche</h2>
                <p class="notice">Généré par IA : relisez et vérifiez avant de mémoriser. Vous pouvez tout modifier.</p>
                ${errorNotice}
                <div class="form-group"><label class="form-label" for="learnNoteTitle">Titre</label>
                    <input type="text" class="form-input" id="learnNoteTitle" maxlength="80" value="${a(L.draft.titre)}" autocomplete="off" oninput="app.learn.draft.titre=this.value"></div>
                <div class="form-group"><label class="form-label" for="learnNoteBody">Contenu</label>
                    <textarea class="form-textarea lesson" id="learnNoteBody" oninput="app.learn.draft.contenu=this.value">${e(L.draft.contenu)}</textarea></div>
                ${dest}
                <div class="stack">
                    <button type="button" class="btn btn-primary" onclick="app.learnSave()"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Enregistrer en note</button>
                    <div class="action-row">
                        <button type="button" class="btn btn-secondary" onclick="app.learnLoadLesson()">Régénérer</button>
                        <button type="button" class="btn btn-secondary" onclick="app.learnBack('angles')">Autre piste</button>
                    </div>
                </div>`;
        } else if (L.step === 'saved') {
            const s = L.savedNote;
            html = `
                <div class="empty-state">
                    <div class="empty-text">Note enregistrée</div>
                    <p class="empty-sub">« ${e(s.titre)} » est dans le thème « ${e(s.catName)} ». Première révision dans 24 h.</p>
                </div>
                <div class="stack">
                    <button type="button" class="btn btn-primary" onclick="app.learnMore()"><svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg>Approfondir ce thème</button>
                    <div class="action-row">
                        <button type="button" class="btn btn-secondary" onclick="app.showNoteDetail(${Number(s.id)})">Lire la note</button>
                        <button type="button" class="btn btn-ghost" onclick="app.navigateTo('screenHome')">Terminer</button>
                    </div>
                </div>`;
        }
        box.innerHTML = html;
    }

    // ===========================
    // RÉGLAGES, SAUVEGARDE
    // ===========================

    openSettings() {
        document.getElementById('setGeminiKey').value = SettingsService.get('geminiKey');
        const model = document.getElementById('setGeminiModel');
        model.value = SettingsService.get('geminiModel');
        model.placeholder = DEFAULT_GEMINI_MODEL;
        document.getElementById('setGoogleClientId').value = SettingsService.get('googleClientId');
        this.updateBackupStatus();
        document.getElementById('originValue').textContent = location.origin;
        document.getElementById('setupDetails').open = !SettingsService.get('googleClientId');
        this.openModal('modalSettings');
        if (SettingsService.get('googleClientId')) DriveService.preload().catch(() => {});
    }

    async copyOrigin() {
        try {
            await navigator.clipboard.writeText(location.origin);
            this.toast('Adresse copiée');
        } catch (err) {
            this.toast("Copie impossible : sélectionnez l'adresse à la main.", true);
        }
    }

    updateBackupStatus(text) {
        const el = document.getElementById('backupStatus');
        if (text) { el.textContent = text; return; }
        const last = SettingsService.get('lastBackup');
        el.textContent = last
            ? 'Dernière sauvegarde Drive : ' + new Date(last).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
            : 'Aucune sauvegarde Drive pour le moment.';
    }

    setBackupBusy(busy, text) {
        this.backupBusy = busy;
        ['driveSaveBtn', 'driveRestoreBtn', 'exportBtn', 'importBtn', 'testGeminiBtn'].forEach(id => {
            document.getElementById(id).disabled = busy;
        });
        this.updateBackupStatus(busy ? text : undefined);
    }

    async testGemini() {
        if (this.backupBusy) return;
        if (!GeminiService.hasKey()) { this.toast('Saisissez d\'abord la clé Gemini.', true); return; }
        this.setBackupBusy(true, 'Test de la clé…');
        try {
            await GeminiService.generate('Réponds exactement par {"ok":true}', { temperature: 0, timeoutMs: 20000 });
            this.toast('Clé Gemini valide');
        } catch (err) {
            this.toast(err.message, true);
        } finally {
            this.setBackupBusy(false);
        }
    }

    async driveSave() {
        if (this.backupBusy) return;
        // Le jeton doit être demandé directement depuis le clic (sinon la fenêtre Google est bloquée)
        const tokenPromise = DriveService.getToken();
        this.setBackupBusy(true, 'Connexion à Google…');
        try {
            const token = await tokenPromise;
            this.updateBackupStatus('Envoi de la sauvegarde…');
            const dump = await this.db.exportAll();
            const result = await DriveService.saveBackup(token, BackupFormat.build(dump));
            SettingsService.set('lastBackup', (result && result.modifiedTime) || new Date().toISOString());
            this.toast('Sauvegarde envoyée sur Google Drive');
        } catch (err) {
            this.toast((err && err.message) || 'Sauvegarde impossible.', true);
        } finally {
            this.setBackupBusy(false);
        }
    }

    async driveRestore() {
        if (this.backupBusy) return;
        const tokenPromise = DriveService.getToken();
        this.setBackupBusy(true, 'Connexion à Google…');
        try {
            const token = await tokenPromise;
            this.updateBackupStatus('Lecture de la sauvegarde…');
            const { data, modifiedTime } = await DriveService.loadBackup(token);
            this.setBackupBusy(false);
            await this.restoreFromData(data, modifiedTime);
        } catch (err) {
            this.toast((err && err.message) || 'Restauration impossible.', true);
        } finally {
            this.setBackupBusy(false);
        }
    }

    /** Valide, demande confirmation, puis remplace les données locales. */
    async restoreFromData(raw, dateIso) {
        let data;
        try { data = BackupFormat.validate(raw); }
        catch (err) { this.toast(err.message, true); return; }

        const when = dateIso || raw.exportedAt;
        const label = when ? ' du ' + new Date(when).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }) : '';
        const ok = await this.confirmDialog(
            'Restaurer cette sauvegarde ?',
            `Sauvegarde${label} : ${data.categories.length} thème(s), ${data.notes.length} note(s). Les données actuelles de cet appareil seront remplacées.`,
            'Restaurer'
        );
        if (!ok) return;
        try {
            await this.db.importAll(data);
        } catch (err) {
            console.error(err);
            this.toast('Restauration impossible : rien n\'a été modifié.', true);
            return;
        }
        this.learn = null;
        this.closeModal('modalSettings');
        await this.loadQuickNote();
        this.navigateTo('screenHome');
        this.toast('Sauvegarde restaurée');
    }

    exportFile() {
        this.db.exportAll().then(dump => {
            const blob = new Blob([JSON.stringify(BackupFormat.build(dump), null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `etchnote-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
            this.toast('Fichier exporté');
        }).catch(err => {
            console.error(err);
            this.toast("Export impossible.", true);
        });
    }

    async importFile(input) {
        const file = input.files && input.files[0];
        input.value = '';
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) { this.toast('Fichier trop volumineux.', true); return; }
        let raw;
        try { raw = JSON.parse(await file.text()); }
        catch (err) { this.toast("Ce fichier n'est pas une sauvegarde valide.", true); return; }
        await this.restoreFromData(raw);
    }

    // ===========================
    // APPUI LONG (édition)
    // ===========================

    startLongPress(categoryId, event) {
        this.longPressFired = false;
        this.longPressTimer = setTimeout(() => {
            this.longPressFired = true;
            this.openEditCategoryModal(categoryId);
        }, 500);
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

    startNoteLongPress(noteId, event) {
        this.longPressFired = false;
        this.longPressTimer = setTimeout(() => {
            this.longPressFired = true;
            this.openEditNoteModal(noteId);
        }, 500);
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

        try {
            const category = await this.db.getCategory(id);
            category.nom = nom;
            await this.db.updateCategory(category);

            this.closeModal('modalEditCategory');
            this.toast('Thème modifié');
            await this.refreshCurrentScreen();
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast('Impossible de modifier le thème.', true);
        }
    }

    async deleteCategory() {
        const id = parseInt(document.getElementById('editCategoryId').value);
        const notes = await this.db.getNotesByCategory(id);
        const detail = notes.length
            ? `Les ${notes.length} note${notes.length > 1 ? 's' : ''} de ce thème seront également supprimée${notes.length > 1 ? 's' : ''}. Cette action est définitive.`
            : 'Cette action est définitive.';
        const ok = await this.confirmDialog('Supprimer ce thème ?', detail);
        if (!ok) return;

        try {
            for (const note of notes) {
                await this.db.deleteNote(note.id);
            }
            await this.db.deleteCategory(id);

            this.closeModal('modalEditCategory');
            this.toast('Thème supprimé');
            if (this.currentScreen === 'screenCategoryNotes' && this.currentCategoryId === id) {
                this.navigateTo('screenThemes');
            } else {
                await this.refreshCurrentScreen();
            }
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast('Impossible de supprimer le thème.', true);
        }
    }

    async showCategoryNotes(categoryId) {
        const category = await this.db.getCategory(categoryId);
        if (!category) { this.navigateTo('screenThemes'); return; }
        const notes = await this.db.getNotesByCategory(categoryId);

        this.currentCategoryId = categoryId;
        this.setScreen('screenCategoryNotes', category.nom);

        const container = document.getElementById('categoryNotesList');
        if (notes.length === 0) {
            container.innerHTML = this.emptyHTML('inkwell', 'Aucune note dans ce thème', '',
                '<button class="btn btn-primary" onclick="app.openAddNoteModal()">Ajouter une note</button>' +
                `<button class="btn btn-secondary" style="margin-top:12px" onclick="app.openLearn({ mode: 'deepen', catId: ${Number(categoryId)} })"><svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg>Apprendre avec l'IA</button>`);
            return;
        }

        notes.sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));
        container.innerHTML = `<button class="btn btn-secondary" style="grid-column:1/-1" onclick="app.openLearn({ mode: 'deepen', catId: ${Number(categoryId)} })"><svg class="ico" aria-hidden="true"><use href="#i-spark"/></svg>Approfondir avec l'IA</button>` +
            notes.map(note => this.noteItemHTML(note, category, {
                meta: `Niveau ${note.niveauRevision}`,
                snippet: this.truncateText(note.contenu, 100)
            })).join('');
    }

    // ===========================
    // NOTES : création, édition
    // ===========================

    async openAddNoteModal() {
        const categories = await this.db.getAllCategories();
        if (categories.length === 0) {
            this.toast("Créez d'abord un thème pour y ranger vos notes.");
            this.openModal('modalAddCategory');
            return;
        }
        const select = document.getElementById('noteCategorySelect');
        select.innerHTML = '<option value="">Sélectionnez un thème</option>' +
            categories.map(cat => `<option value="${cat.id}" ${cat.id === this.currentCategoryId ? 'selected' : ''}>${this.escapeHtml(cat.nom)}</option>`).join('');

        this.openModal('modalAddNote');
    }

    async addNote() {
        const categorieId = parseInt(document.getElementById('noteCategorySelect').value);
        const titre = document.getElementById('noteTitle').value.trim();
        const contenu = document.getElementById('noteContent').value.trim();

        if (!categorieId || !titre || !contenu) return;

        try {
            await this.db.addNote({ categorieId, titre, contenu });
            this.closeModal('modalAddNote');
            document.getElementById('formAddNote').reset();
            this.toast('Note enregistrée');
            await this.refreshCurrentScreen();
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast("Impossible d'enregistrer la note.", true);
        }
    }

    async openEditNoteModal(noteId) {
        const note = await this.db.getNote(noteId);
        if (!note) return;

        const categories = await this.db.getAllCategories();
        const selectEdit = document.getElementById('editNoteCategorySelect');
        selectEdit.innerHTML = '<option value="">Sélectionnez un thème</option>' +
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

        try {
            const note = await this.db.getNote(id);
            note.categorieId = categorieId;
            note.titre = titre;
            note.contenu = contenu;

            await this.db.updateNote(note);
            this.closeModal('modalEditNote');
            this.toast('Note modifiée');
            await this.refreshCurrentScreen();
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast('Impossible de modifier la note.', true);
        }
    }

    async deleteNoteFromModal() {
        const id = parseInt(document.getElementById('editNoteId').value);
        const ok = await this.confirmDialog('Supprimer cette note ?', 'Cette action est définitive.');
        if (!ok) return;

        try {
            await this.db.deleteNote(id);
            this.closeModal('modalEditNote');
            this.toast('Note supprimée');
            if (this.currentScreen === 'screenNoteDetail' && this.currentNoteId === id) {
                this.currentNoteId = null;
                await this.returnFromDetail();
            } else {
                await this.refreshCurrentScreen();
            }
            await this.updateStats();
        } catch (err) {
            console.error(err);
            this.toast('Impossible de supprimer la note.', true);
        }
    }

    async deleteNoteFromDetail() {
        if (!this.currentNoteId) return;
        document.getElementById('editNoteId').value = this.currentNoteId;
        await this.deleteNoteFromModal();
    }

    // ===========================
    // DÉTAIL D'UNE NOTE + RÉVISION
    // ===========================

    async showNoteDetail(noteId) {
        const note = await this.db.getNote(noteId);
        if (!note) {
            this.toast('Cette note est introuvable.', true);
            this.navigateTo('screenNotes');
            return;
        }
        const category = (await this.db.getCategory(note.categorieId)) || { nom: 'Sans thème' };

        if (this.currentScreen !== 'screenNoteDetail') this.originScreen = this.currentScreen;
        this.currentNoteId = noteId;
        this.setScreen('screenNoteDetail', 'Lecture');

        document.getElementById('noteDetailArt').innerHTML = this.themeThumb(category.nom);
        document.getElementById('noteDetailTitle').textContent = note.titre;
        const chip = document.getElementById('noteDetailCategory');
        chip.textContent = category.nom;
        chip.className = 'chip ' + this.chipClass(category.nom);
        document.getElementById('noteDetailDate').textContent = this.formatDate(note.dateCreation);
        document.getElementById('noteDetailLevel').textContent = `Niveau ${note.niveauRevision} · ${SpacedRepetitionService.getLevelLabel(note.niveauRevision)}`;
        document.getElementById('noteDetailContent').textContent = note.contenu;

        this.startCountdown(note);
    }

    startCountdown(note) {
        this.stopCountdown();

        const btn = document.getElementById('markAsReadBtn');
        const countdownContainer = document.getElementById('countdownContainer');
        const countdownTimer = document.getElementById('countdownTimer');
        const countdownLevel = document.getElementById('countdownLevel');
        btn.classList.remove('success');

        const updateState = () => {
            const remaining = new Date(note.dateProchaineRevision).getTime() - Date.now();

            if (remaining <= 0) {
                // Délai écoulé → bouton actif
                btn.disabled = false;
                btn.innerHTML = MARK_READ_HTML;
                countdownContainer.style.display = 'none';
                this.stopCountdown();
            } else {
                // Pas encore le moment → bouton bloqué + compte à rebours
                btn.disabled = true;
                btn.innerHTML = MARK_LOCKED_HTML;
                countdownContainer.style.display = 'block';
                countdownLevel.textContent = `Niveau ${note.niveauRevision} → ${SpacedRepetitionService.getLevelLabel(note.niveauRevision)}`;

                const totalSec = Math.ceil(remaining / 1000);
                const d = Math.floor(totalSec / 86400);
                const h = Math.floor((totalSec % 86400) / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;

                if (d > 0) {
                    countdownTimer.textContent = `${d}j ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
                } else if (h > 0) {
                    countdownTimer.textContent = `${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
                } else if (m > 0) {
                    countdownTimer.textContent = `${m}m ${String(s).padStart(2, '0')}s`;
                } else {
                    countdownTimer.textContent = `${s}s`;
                }
            }
        };

        updateState();
        if (new Date(note.dateProchaineRevision).getTime() - Date.now() > 0) {
            this.countdownInterval = setInterval(updateState, 1000);
        }
    }

    async markNoteAsRead() {
        if (!this.currentNoteId) return;
        const btn = document.getElementById('markAsReadBtn');
        if (btn.disabled) return;

        try {
            const note = await this.db.getNote(this.currentNoteId);

            // Vérification de sécurité côté JS
            if (new Date(note.dateProchaineRevision).getTime() > Date.now()) return;

            this.stopCountdown();
            btn.disabled = true;

            const updatedNote = SpacedRepetitionService.markAsRead(note);
            await this.db.updateNote(updatedNote);

            btn.innerHTML = MARK_DONE_HTML;
            btn.classList.add('success');

            setTimeout(() => {
                btn.classList.remove('success');
                if (this.currentScreen === 'screenNoteDetail') this.returnFromDetail();
            }, 900);
        } catch (err) {
            console.error(err);
            btn.disabled = false;
            this.toast("Impossible d'enregistrer la révision.", true);
        }
    }

    // ===========================
    // RÉVISIONS
    // ===========================

    async renderNotesToRead() {
        const [allNotes, cats] = await Promise.all([this.db.getAllNotes(), this.db.getAllCategories()]);
        const catMap = this.mapById(cats);
        const now = Date.now();

        const due = SpacedRepetitionService.getNotesToRead(allNotes);
        due.sort((a, b) => SpacedRepetitionService.getOverdueDays(b) - SpacedRepetitionService.getOverdueDays(a));
        const upcoming = allNotes
            .filter(n => new Date(n.dateProchaineRevision).getTime() > now)
            .sort((a, b) => new Date(a.dateProchaineRevision) - new Date(b.dateProchaineRevision));

        const tab = this.reviewTab;
        document.querySelectorAll('.seg-btn[data-rtab]').forEach(btn => {
            btn.setAttribute('aria-selected', String(btn.getAttribute('data-rtab') === tab));
        });
        document.getElementById('countToday').textContent = due.length;
        document.getElementById('countUpcoming').textContent = upcoming.length;

        const toReadList = document.getElementById('toReadList');
        const upcomingList = document.getElementById('upcomingList');
        const summary = document.getElementById('reviewSummary');
        toReadList.hidden = tab !== 'today';
        upcomingList.hidden = tab !== 'upcoming';

        const total = allNotes.length;
        const pct = total ? Math.round(((total - due.length) / total) * 100) : 0;

        if (tab === 'today') {
            const n = due.length;
            summary.innerHTML = n === 0 ? '' : `
                <section class="card hero" aria-labelledby="revTitle">
                    <h2 id="revTitle" style="font-size:22px">${n} note${n > 1 ? 's' : ''} à revoir</h2>
                    <p class="card-subtitle" style="margin-top:6px">Prenez quelques minutes pour renforcer vos connaissances.</p>
                    <button class="btn btn-primary" onclick="app.startReview()">Commencer la révision</button>
                </section>
                <div class="section-head"><h2>Notes à revoir</h2></div>`;

            if (n === 0) {
                toReadList.innerHTML = this.emptyHTML('scroll', 'Aucune note à réviser pour le moment !',
                    total ? 'Consultez l\'onglet « À venir » pour voir les prochaines révisions.' : 'Créez une note pour démarrer.');
                return;
            }
            toReadList.innerHTML = due.map(note => {
                const overdue = SpacedRepetitionService.getOverdueDays(note);
                const isOverdue = overdue > 0;
                return this.noteItemHTML(note, this.catOf(catMap, note), {
                    overdue: isOverdue,
                    warn: isOverdue ? `En retard de ${this.formatDuration(overdue)}` : '',
                    meta: isOverdue ? '' : 'À réviser'
                });
            }).join('');
        } else {
            summary.innerHTML = `
                <section class="card" aria-labelledby="progTitle">
                    <h2 id="progTitle" style="font-size:20px;margin-bottom:12px">Progression globale</h2>
                    <div class="hero-body" style="margin-top:0">
                        ${this.ringHTML(pct, 'à jour', 96)}
                        <div class="stats" style="margin:0;flex:1">
                            <div class="stat" style="flex-direction:column;gap:2px"><span class="stat-value">${total}</span><span class="stat-label">notes</span></div>
                            <div class="stat" style="flex-direction:column;gap:2px"><span class="stat-value">${due.length}</span><span class="stat-label">à réviser</span></div>
                        </div>
                    </div>
                </section>
                <div class="section-head"><h2>Prochaines révisions</h2></div>`;

            if (upcoming.length === 0) {
                upcomingList.innerHTML = this.emptyHTML('scroll', 'Aucune révision programmée',
                    'Les notes déjà à réviser sont dans l\'onglet « Aujourd\'hui ».');
                return;
            }
            upcomingList.innerHTML = upcoming.map(note => this.noteItemHTML(note, this.catOf(catMap, note), {
                meta: this.timeUntil(note.dateProchaineRevision)
            })).join('');
        }
    }

    async startReview() {
        const notes = await this.db.getAllNotes();
        const due = SpacedRepetitionService.getNotesToRead(notes);
        if (due.length === 0) { this.toast('Aucune note à réviser pour le moment.'); return; }
        due.sort((a, b) => SpacedRepetitionService.getOverdueDays(b) - SpacedRepetitionService.getOverdueDays(a));
        await this.showNoteDetail(due[0].id);
    }

    // ===========================
    // NOTE AU HASARD
    // ===========================

    async renderRandomNote() {
        const allNotes = await this.db.getAllNotes();
        const container = document.getElementById('randomNoteContent');

        if (allNotes.length === 0) {
            container.innerHTML = this.emptyHTML('d20', 'Aucune note disponible', 'Créez une note pour la retrouver ici au hasard.');
            return;
        }

        const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)];
        const category = (await this.db.getCategory(randomNote.categorieId)) || { nom: 'Sans thème' };

        container.innerHTML = `
            <article class="card">
                <div class="detail-art" aria-hidden="true">${this.themeThumb(category.nom)}</div>
                <h2 class="detail-title">${this.escapeHtml(randomNote.titre)}</h2>
                <div class="detail-meta">${this.chipHTML(category.nom)}</div>
                <div class="note-content">${this.escapeHtml(randomNote.contenu)}</div>
                <div class="detail-actions">
                    <button class="btn btn-primary" onclick="app.markRandomNoteAsRead(${randomNote.id})"><svg class="ico" aria-hidden="true"><use href="#i-check"/></svg>Relu / Compris</button>
                    <button class="btn btn-secondary" onclick="app.renderRandomNote()"><img src="assets/icons/d20.png" alt="" width="24" height="24">Autre note</button>
                </div>
            </article>`;
    }

    async markRandomNoteAsRead(noteId) {
        try {
            const note = await this.db.getNote(noteId);
            const updatedNote = SpacedRepetitionService.markAsRead(note);
            await this.db.updateNote(updatedNote);
            this.toast('Révision enregistrée');
            await this.renderRandomNote();
        } catch (err) {
            console.error(err);
            this.toast("Impossible d'enregistrer la révision.", true);
        }
    }

    // ===========================
    // TABLEAU BLANC (note rapide)
    // ===========================

    async loadQuickNote() {
        const quickNote = await this.db.getQuickNote();
        if (quickNote) {
            document.getElementById('quickNoteText').value = quickNote.contenu || '';
        }
    }

    handleQuickNoteInput() {
        clearTimeout(this.quickNoteTimeout);

        const indicator = document.getElementById('quickNoteSaved');
        indicator.textContent = 'Sauvegarde…';
        indicator.className = 'saved saving';

        this.quickNoteTimeout = setTimeout(async () => {
            try {
                await this.db.saveQuickNote(document.getElementById('quickNoteText').value);
                indicator.textContent = 'Sauvegardé';
                indicator.className = 'saved ok';
            } catch (err) {
                console.error(err);
                indicator.textContent = 'Échec de la sauvegarde';
                indicator.className = 'saved saving';
                this.toast('Sauvegarde impossible.', true);
            }
        }, 1000);
    }

    // ===========================
    // LIENS
    // ===========================

    async renderLinks() {
        const links = await this.db.getAllLinks();
        const container = document.getElementById('linksList');

        if (links.length === 0) {
            container.innerHTML = this.emptyHTML('link', 'Aucun lien enregistré', 'Gardez ici vos ressources web utiles.',
                '<button class="btn btn-primary" onclick="app.openModal(\'modalAddLink\')">Ajouter un lien</button>');
            return;
        }

        container.innerHTML = links.map(link => {
            const href = this.safeUrl(link.url);
            return `
                <article class="item link-item">
                    <div class="item-title">${this.escapeHtml(link.titre)}</div>
                    <div class="link-url">${this.escapeHtml(link.url)}</div>
                    ${link.note ? `<div class="item-snippet" style="-webkit-line-clamp:unset">${this.escapeHtml(link.note)}</div>` : ''}
                    <div class="action-row" style="margin-top:12px">
                        ${href
                            ? `<a class="btn btn-primary" href="${this.escapeAttr(href)}" target="_blank" rel="noopener noreferrer"><svg class="ico" aria-hidden="true"><use href="#i-external"/></svg>Ouvrir</a>`
                            : `<button class="btn btn-primary" disabled>Adresse invalide</button>`}
                        <button class="btn btn-secondary" style="flex:0 0 52px" aria-label="Supprimer le lien ${this.escapeAttr(link.titre)}" onclick="app.deleteLink(${link.id})"><svg class="ico" aria-hidden="true"><use href="#i-trash"/></svg></button>
                    </div>
                </article>`;
        }).join('');
    }

    async addLink() {
        const titre = document.getElementById('linkTitle').value.trim();
        const url = document.getElementById('linkUrl').value.trim();
        const note = document.getElementById('linkNote').value.trim();

        if (!titre || !url) return;
        if (!this.safeUrl(url)) {
            this.toast("L'adresse doit commencer par http:// ou https://", true);
            return;
        }

        try {
            await this.db.addLink({ titre, url, note });
            this.closeModal('modalAddLink');
            document.getElementById('formAddLink').reset();
            this.toast('Lien enregistré');
            await this.renderLinks();
        } catch (err) {
            console.error(err);
            this.toast("Impossible d'enregistrer le lien.", true);
        }
    }

    async deleteLink(linkId) {
        const ok = await this.confirmDialog('Supprimer ce lien ?', 'Cette action est définitive.');
        if (!ok) return;
        try {
            await this.db.deleteLink(linkId);
            this.toast('Lien supprimé');
            await this.renderLinks();
        } catch (err) {
            console.error(err);
            this.toast('Impossible de supprimer le lien.', true);
        }
    }

    // ===========================
    // RECHERCHE
    // ===========================

    async handleSearch(query) {
        const seq = ++this.searchSeq;

        if (!query) {
            if (this.currentScreen === 'screenSearch') this.leaveSearch();
            return;
        }

        if (this.currentScreen !== 'screenSearch' && this.currentScreen !== 'screenNoteDetail') {
            this.preSearchScreen = this.currentScreen;
        }

        const [allNotes, allCategories] = await Promise.all([this.db.getAllNotes(), this.db.getAllCategories()]);
        if (seq !== this.searchSeq) return; // une saisie plus récente a pris le relais

        this.setScreen('screenSearch', 'Recherche');

        const q = query.toLowerCase();
        const results = allNotes.filter(note =>
            note.titre.toLowerCase().includes(q) ||
            note.contenu.toLowerCase().includes(q)
        );

        const container = document.getElementById('searchResultsList');
        if (results.length === 0) {
            container.innerHTML = this.emptyHTML('inkwell', `Aucune note trouvée pour « ${this.escapeHtml(query)} »`, 'Essayez un autre mot-clé.');
            return;
        }

        const catMap = this.mapById(allCategories);
        container.innerHTML =
            `<p class="form-hint" style="grid-column:1/-1;margin:0 0 4px">${results.length} résultat${results.length > 1 ? 's' : ''}</p>` +
            results.map(note => {
                const snippet = note.contenu.length > 120 ? note.contenu.substring(0, 120) + '…' : note.contenu;
                return this.noteItemHTML(note, this.catOf(catMap, note), {
                    query,
                    meta: `Niveau ${note.niveauRevision}`,
                    snippet: this.highlightText(snippet, query)
                });
            }).join('');
    }

    highlightText(text, query) {
        const escaped = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return escaped.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark>$1</mark>');
    }
}

// ===========================
// GLOBAL FUNCTIONS
// ===========================

function closeModal(modalId) {
    if (typeof app !== 'undefined' && app) {
        app.closeModal(modalId);
    } else {
        document.getElementById(modalId).classList.remove('active');
    }
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
