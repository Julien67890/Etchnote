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
        await this.loadQuickNote();
        await this.renderThemes();
        this.updateStats();
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

    navigateTo(screenId) {
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
            'screenThemes': 'Mes Thèmes',
            'screenRandom': 'Notes Aléatoires',
            'screenToRead': 'Notes à Lire',
            'screenQuick': 'Note Rapide',
            'screenLinks': 'Liens'
        };
        document.getElementById('headerTitle').textContent = titles[screenId] || 'Etchnote';

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

        container.innerHTML = categories.map(cat => `
            <div class="card theme-card" 
                 data-category-id="${cat.id}"
                 onclick="app.showCategoryNotes(${cat.id})"
                 ontouchstart="app.startLongPress(${cat.id}, event)"
                 ontouchend="app.endLongPress()"
                 ontouchmove="app.cancelLongPress()"
                 onmousedown="app.startLongPress(${cat.id}, event)"
                 onmouseup="app.endLongPress()"
                 onmouseleave="app.cancelLongPress()">
                <div class="card-title">${this.escapeHtml(cat.nom)}</div>
            </div>
        `).join('');
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
