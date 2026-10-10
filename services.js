// ===========================
// ETCHNOTE — services : réglages, assistant IA (Gemini), sauvegarde Google Drive
// Aucune clé n'est stockée dans le code : tout est saisi par l'utilisateur
// et gardé uniquement dans le navigateur de son appareil (localStorage).
// ===========================

// ===========================
// RÉGLAGES (localStorage)
// ===========================

const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash-lite';
const BACKUP_FILE_NAME = 'Etchnote - sauvegarde.json';

class SettingsService {
    static KEY = 'etchnote_settings';

    static getAll() {
        try {
            const raw = localStorage.getItem(this.KEY);
            const data = raw ? JSON.parse(raw) : {};
            return data && typeof data === 'object' ? data : {};
        } catch (e) {
            return {};
        }
    }

    static get(name, fallback = '') {
        const value = this.getAll()[name];
        return value == null || value === '' ? fallback : value;
    }

    static set(name, value) {
        try {
            const data = this.getAll();
            if (value == null || value === '') delete data[name];
            else data[name] = value;
            localStorage.setItem(this.KEY, JSON.stringify(data));
            return true;
        } catch (e) {
            return false;
        }
    }
}

// ===========================
// GEMINI (API REST, appelée depuis le navigateur avec la clé de l'utilisateur)
// ===========================

class GeminiError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'GeminiError';
        this.code = code || 'unknown';
    }
}

class GeminiService {
    static ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/';

    static SYSTEM = [
        'Tu es un tuteur qui aide une personne à apprendre puis à mémoriser.',
        'Réponds toujours en français, de façon exacte et concise.',
        "N'invente ni chiffres, ni sources, ni citations ; si un point est incertain, dis-le en quelques mots.",
        "N'utilise pas de Markdown (pas de **, pas de #, pas de tableaux).",
        'Réponds uniquement par un objet JSON valide, sans texte autour.'
    ].join(' ');

    static hasKey() {
        return !!SettingsService.get('geminiKey');
    }

    /** Appel générique : renvoie le texte de la réponse. */
    static async generate(prompt, { temperature = 0.7, timeoutMs = 45000 } = {}) {
        const key = SettingsService.get('geminiKey');
        if (!key) throw new GeminiError('Aucune clé Gemini enregistrée.', 'nokey');
        const model = SettingsService.get('geminiModel', DEFAULT_GEMINI_MODEL).replace(/^models\//, '');

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        let response;
        try {
            response = await fetch(`${this.ENDPOINT}${encodeURIComponent(model)}:generateContent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
                signal: controller.signal,
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: this.SYSTEM }] },
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature, responseMimeType: 'application/json' }
                })
            });
        } catch (err) {
            if (err && err.name === 'AbortError') throw new GeminiError("Gemini met trop de temps à répondre. Réessayez.", 'timeout');
            throw new GeminiError('Connexion impossible. Vérifiez votre réseau.', 'network');
        } finally {
            clearTimeout(timer);
        }

        if (!response.ok) {
            let detail = '';
            try { detail = (await response.json()).error.message || ''; } catch (e) { /* corps non JSON */ }
            throw new GeminiError(this.explainHttp(response.status, detail), 'http' + response.status);
        }

        const data = await response.json();
        const cand = data && data.candidates && data.candidates[0];
        const parts = cand && cand.content && cand.content.parts;
        const text = Array.isArray(parts) ? parts.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text).join('') : '';
        if (!text.trim()) {
            const why = (data && data.promptFeedback && data.promptFeedback.blockReason) || (cand && cand.finishReason) || '';
            throw new GeminiError(`Gemini n'a pas renvoyé de réponse${why ? ' (' + why + ')' : ''}. Reformulez le sujet.`, 'empty');
        }
        return text;
    }

    static explainHttp(status, detail) {
        if (status === 400 && /api key/i.test(detail)) return "La clé Gemini est refusée. Vérifiez-la dans les réglages.";
        if (status === 400) return 'Requête refusée par Gemini. Reformulez le sujet.';
        if (status === 401 || status === 403) return "Accès refusé : la clé Gemini est invalide ou n'a pas les droits nécessaires.";
        if (status === 404) return "Modèle introuvable. Vérifiez le nom du modèle dans les réglages.";
        if (status === 429) return "Quota gratuit atteint. Patientez un peu (quelques minutes, ou demain pour le quota journalier).";
        if (status >= 500) return "Gemini est momentanément indisponible. Réessayez dans un instant.";
        return `Erreur Gemini (${status}).`;
    }

    /** Extrait un objet JSON d'un texte (tolère les clôtures ```json). */
    static parseJson(text) {
        let t = String(text).trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        try { return JSON.parse(t); } catch (e) { /* on cherche l'objet */ }
        const a = t.indexOf('{');
        const b = t.lastIndexOf('}');
        if (a !== -1 && b > a) {
            try { return JSON.parse(t.slice(a, b + 1)); } catch (e) { /* abandon */ }
        }
        throw new GeminiError("La réponse de Gemini est illisible. Réessayez.", 'parse');
    }

    static clean(text) {
        return String(text == null ? '' : text)
            .replace(/\*\*/g, '')
            .replace(/^#{1,6}\s*/gm, '')
            .replace(/\r\n/g, '\n')
            .trim();
    }

    /** Contexte commun : niveau, objectif et notes déjà prises. */
    static context({ topic, level, goal, existing, focus }) {
        const lines = [`Sujet : ${topic}`, `Niveau de l'apprenant : ${level || 'débutant'}`];
        if (goal) lines.push(`Objectif de l'apprenant : ${goal}`);
        if (focus) {
            const body = String(focus.contenu || '').replace(/\s+/g, ' ').slice(0, 800);
            lines.push(`Note à approfondir (l'apprenant la connaît déjà, va plus loin) : ${focus.titre}${body ? ' : ' + body : ''}`);
        }
        if (existing && existing.length) {
            lines.push(focus ? "Autres notes du même thème (à ne pas répéter) :" : "Notes déjà prises sur ce thème (à ne pas répéter, mais à prolonger) :");
            existing.slice(0, 25).forEach(n => {
                const extract = String(n.contenu || '').replace(/\s+/g, ' ').slice(0, 160);
                lines.push(`- ${n.titre}${extract ? ' : ' + extract : ''}`);
            });
        }
        return lines.join('\n');
    }

    /** 5 pistes d'apprentissage pour orienter l'utilisateur. */
    static async suggestAngles(ctx, alreadyShown = []) {
        const prompt = [
            this.context(ctx),
            '',
            (ctx.existing && ctx.existing.length) || ctx.focus
                ? "Propose 5 pistes distinctes pour approfondir ce sujet, en prolongeant ce que l'apprenant sait déjà."
                : 'Propose 5 pistes distinctes et progressives pour apprendre ce sujet, de la plus fondamentale à la plus avancée.',
            alreadyShown.length ? `Pistes déjà proposées, à ne pas répéter : ${alreadyShown.join(' ; ')}` : '',
            'Format exact : {"pistes":[{"titre":"8 mots maximum","description":"une phrase de 20 mots maximum"}]}'
        ].filter(Boolean).join('\n');

        const data = this.parseJson(await this.generate(prompt, { temperature: 0.8 }));
        const list = Array.isArray(data.pistes) ? data.pistes : [];
        const angles = list
            .filter(p => p && typeof p.titre === 'string' && p.titre.trim())
            .slice(0, 6)
            .map(p => ({ titre: this.clean(p.titre).slice(0, 80), description: this.clean(p.description || '').slice(0, 200) }));
        if (!angles.length) throw new GeminiError("Gemini n'a proposé aucune piste exploitable. Réessayez.", 'parse');
        return angles;
    }

    /** Fiche de mémorisation sur une piste choisie. */
    static async makeLesson(ctx, angle) {
        const prompt = [
            this.context(ctx),
            `Piste choisie : ${angle.titre}${angle.description ? ' — ' + angle.description : ''}`,
            '',
            'Rédige une fiche de mémorisation sur cette piste.',
            'Contraintes : 120 à 200 mots, texte brut. Structure : une phrase d\'introduction ; 3 à 5 points clés, chacun sur une ligne commençant par "• " ; une ligne "Exemple : …" ; une ligne "À retenir : …" (une seule phrase).',
            'Ajoute ensuite 3 questions courtes de rappel actif, sans leur réponse.',
            'Format exact : {"titre":"60 caractères maximum","contenu":"la fiche, avec \\n pour les retours à la ligne","questions":["…","…","…"]}'
        ].join('\n');

        const data = this.parseJson(await this.generate(prompt, { temperature: 0.6 }));
        const contenu = this.clean(data.contenu);
        if (!contenu) throw new GeminiError("La fiche reçue est vide. Réessayez.", 'parse');
        const questions = (Array.isArray(data.questions) ? data.questions : [])
            .map(q => this.clean(q)).filter(Boolean).slice(0, 5);
        return {
            titre: this.clean(data.titre || angle.titre).slice(0, 80) || angle.titre,
            contenu,
            questions
        };
    }

    /** Texte final de la note (fiche + questions de test). */
    static noteText(lesson) {
        let text = lesson.contenu;
        if (lesson.questions && lesson.questions.length) {
            text += '\n\nPour te tester :\n' + lesson.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
        }
        return text;
    }
}

// ===========================
// GOOGLE DRIVE (sauvegarde)
// Autorisation « drive.file » : l'application ne voit que le fichier qu'elle a créé.
// ===========================

class DriveError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'DriveError';
        this.code = code || 'unknown';
    }
}

class DriveService {
    static SCOPE = 'https://www.googleapis.com/auth/drive.file';
    static GIS_URL = 'https://accounts.google.com/gsi/client';
    static token = null;
    static tokenExpiry = 0;
    static gisPromise = null;

    /** À appeler à l'avance (ouverture des réglages) : le jeton doit être demandé sans délai après le clic. */
    static preload() {
        if (window.google && window.google.accounts && window.google.accounts.oauth2) return Promise.resolve();
        if (!this.gisPromise) {
            this.gisPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = this.GIS_URL;
                script.async = true;
                script.onload = () => resolve();
                script.onerror = () => { this.gisPromise = null; reject(new DriveError('Impossible de charger la connexion Google. Vérifiez votre réseau.', 'network')); };
                document.head.appendChild(script);
            });
        }
        return this.gisPromise;
    }

    static isReady() {
        return !!(window.google && window.google.accounts && window.google.accounts.oauth2);
    }

    /** Jeton d'accès (à appeler directement depuis un clic). */
    static getToken() {
        if (this.token && Date.now() < this.tokenExpiry - 30000) return Promise.resolve(this.token);
        const clientId = SettingsService.get('googleClientId');
        if (!clientId) return Promise.reject(new DriveError("Renseignez d'abord l'identifiant client Google dans les réglages.", 'noclient'));
        if (!this.isReady()) {
            this.preload().catch(() => {});
            return Promise.reject(new DriveError('La connexion Google se charge, réessayez dans quelques secondes.', 'loading'));
        }
        return new Promise((resolve, reject) => {
            let client;
            try {
                client = window.google.accounts.oauth2.initTokenClient({
                    client_id: clientId,
                    scope: this.SCOPE,
                    callback: (resp) => {
                        if (!resp || resp.error || !resp.access_token) {
                            reject(new DriveError('Connexion Google refusée ou annulée.', 'auth'));
                            return;
                        }
                        const granted = window.google.accounts.oauth2.hasGrantedAllScopes
                            ? window.google.accounts.oauth2.hasGrantedAllScopes(resp, this.SCOPE) : true;
                        if (!granted) { reject(new DriveError("L'accès à Google Drive n'a pas été accordé.", 'scope')); return; }
                        this.token = resp.access_token;
                        this.tokenExpiry = Date.now() + (Number(resp.expires_in) || 3600) * 1000;
                        resolve(this.token);
                    },
                    error_callback: () => reject(new DriveError('Fenêtre de connexion Google fermée ou bloquée.', 'auth'))
                });
                client.requestAccessToken();
            } catch (err) {
                reject(new DriveError('Connexion Google impossible.', 'auth'));
            }
        });
    }

    static async api(token, url, options = {}) {
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) }
            });
        } catch (err) {
            throw new DriveError('Connexion à Google Drive impossible. Vérifiez votre réseau.', 'network');
        }
        if (response.status === 401) { this.token = null; throw new DriveError('Session Google expirée. Recommencez.', 'expired'); }
        if (response.status === 403) throw new DriveError("Accès refusé par Google Drive (API Drive non activée, ou utilisateur non autorisé dans l'écran de consentement).", 'forbidden');
        if (!response.ok) throw new DriveError(`Erreur Google Drive (${response.status}).`, 'http' + response.status);
        return response;
    }

    static async findBackup(token) {
        const q = encodeURIComponent(`name = '${BACKUP_FILE_NAME}' and trashed = false`);
        const url = `https://www.googleapis.com/drive/v3/files?q=${q}&orderBy=modifiedTime%20desc&pageSize=1&fields=files(id,name,modifiedTime)`;
        const data = await (await this.api(token, url)).json();
        return data.files && data.files[0] ? data.files[0] : null;
    }

    /** Crée ou met à jour le fichier de sauvegarde. */
    static async saveBackup(token, payload) {
        const body = JSON.stringify(payload);
        const existing = await this.findBackup(token);
        if (existing) {
            const url = `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=media&fields=id,modifiedTime`;
            return (await this.api(token, url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body })).json();
        }
        const boundary = 'etchnote' + Math.random().toString(36).slice(2);
        const metadata = JSON.stringify({ name: BACKUP_FILE_NAME, mimeType: 'application/json' });
        const multipart = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n` +
            `--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`;
        const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime';
        return (await this.api(token, url, { method: 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body: multipart })).json();
    }

    static async loadBackup(token) {
        const file = await this.findBackup(token);
        if (!file) throw new DriveError("Aucune sauvegarde Etchnote trouvée dans ce compte Google Drive.", 'nofile');
        const response = await this.api(token, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}?alt=media`);
        try { return { data: await response.json(), modifiedTime: file.modifiedTime }; }
        catch (e) { throw new DriveError('Le fichier de sauvegarde est illisible.', 'parse'); }
    }
}

// ===========================
// FORMAT DE SAUVEGARDE (commun à Drive et au fichier .json)
// ===========================

class BackupFormat {
    static build(dump) {
        return { app: 'etchnote', version: 1, exportedAt: new Date().toISOString(), ...dump };
    }

    /** Vérifie la structure ; renvoie les données propres ou lève une erreur. */
    static validate(data) {
        if (!data || typeof data !== 'object' || data.app !== 'etchnote') throw new Error("Ce fichier n'est pas une sauvegarde Etchnote.");
        const arr = (v) => Array.isArray(v) ? v : [];
        const out = {
            categories: arr(data.categories),
            notes: arr(data.notes),
            quick_note: arr(data.quick_note),
            links: arr(data.links)
        };
        const hasId = (x) => x && typeof x === 'object' && x.id != null;
        if (![...out.categories, ...out.notes, ...out.links, ...out.quick_note].every(hasId)) {
            throw new Error('Sauvegarde corrompue (éléments sans identifiant).');
        }
        if (!out.notes.every(n => typeof n.titre === 'string' && typeof n.contenu === 'string' && n.dateProchaineRevision)) {
            throw new Error('Sauvegarde corrompue (notes incomplètes).');
        }
        return out;
    }
}
