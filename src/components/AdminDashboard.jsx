import React, { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Video, 
  Award, 
  PlusCircle, 
  Lock, 
  Search, 
  Download,
  Copy,
  Check,
  ShieldAlert,
  Key,
  Trash2,
  Sparkles
} from 'lucide-react';
import { storageService } from '../services/storageService';
import './AdminDashboard.css';

export function AdminDashboard({ onClose }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState('');

  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalStudents: 0, countBD: 0, countVideo: 0, countDuo: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);

  // Gestion des codes d'accès sécurisés à usage unique
  const [adminCodes, setAdminCodes] = useState([]);
  const [selectedBookForCode, setSelectedBookForCode] = useState('livre-bd-storytelling');
  const [recipientNote, setRecipientNote] = useState('');
  const [generatedCodeSuccess, setGeneratedCodeSuccess] = useState(null);

  const refreshData = () => {
    setOrders(storageService.getAllOrders());
    setStats(storageService.getAdminStats());
    setAdminCodes(storageService.getAdminGeneratedCodes());
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (pinCode.trim() === 'ben2026') {
      setIsAuthenticated(true);
      setPinError('');
    } else {
      setPinError('Code d\'accès administrateur incorrect.');
    }
  };

  const handleCreateCode = (e) => {
    e.preventDefault();
    const created = storageService.createAdminAccessCode({
      itemId: selectedBookForCode,
      recipientName: recipientNote
    });
    setGeneratedCodeSuccess(created);
    setRecipientNote('');
    refreshData();
  };

  const handleDeleteCode = (codeId) => {
    storageService.deleteAdminCode(codeId);
    refreshData();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredOrders = orders.filter(o => 
    o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-overlay">
      <div className="admin-container">
        
        {/* Header Admin */}
        <div className="admin-top-header">
          <div className="admin-title-group">
            <span className="badge-tag">Espace Privé</span>
            <h2>Dashboard Administrateur — Mr Ben</h2>
          </div>
          <button className="admin-exit-btn" onClick={onClose}>
            Retour au Site ✕
          </button>
        </div>

        {!isAuthenticated ? (
          /* Écran de verrouillage / Authentification */
          <div className="admin-auth-card">
            <div className="admin-lock-icon">
              <Lock size={32} />
            </div>
            <h3>Accès Réservé à Mr Ben</h3>
            <p>Veuillez entrer le mot de passe administrateur pour consulter les ventes.</p>

            {pinError && <div className="admin-auth-error">{pinError}</div>}

            <form onSubmit={handleLogin} className="admin-auth-form">
              <input 
                type="password" 
                placeholder="Mot de passe (ex: ben2026)"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                autoFocus
              />
              <button type="submit" className="btn-primary">Connexion</button>
            </form>
            <span className="admin-hint">Mot de passe initial configuré : <code>ben2026</code></span>
          </div>
        ) : (
          /* Tableau de bord complet */
          <div className="admin-dashboard-body">
            
            {/* Statistiques Clés */}
            <div className="stats-row">
              <div className="stat-card gold-border">
                <div className="stat-icon-box gold"><DollarSign size={22} /></div>
                <div className="stat-details">
                  <span className="stat-number">{stats.totalRevenue.toLocaleString()} FCFA</span>
                  <span className="stat-label">Chiffre d'Affaires Total</span>
                </div>
              </div>

              <div className="stat-card cyan-border">
                <div className="stat-icon-box cyan"><Users size={22} /></div>
                <div className="stat-details">
                  <span className="stat-number">{stats.totalStudents}</span>
                  <span className="stat-label">Élèves & Acheteurs</span>
                </div>
              </div>

              <div className="stat-card purple-border">
                <div className="stat-icon-box purple"><BookOpen size={22} /></div>
                <div className="stat-details">
                  <span className="stat-number">{stats.countBD}</span>
                  <span className="stat-label">Ventes BD Storytelling</span>
                </div>
              </div>

              <div className="stat-card green-border">
                <div className="stat-icon-box green"><Video size={22} /></div>
                <div className="stat-details">
                  <span className="stat-number">{stats.countVideo}</span>
                  <span className="stat-label">Ventes Vidéos IA</span>
                </div>
              </div>
            </div>

            {/* Générateur de Codes d'Accès Sécurisés à Usage Unique */}
            <div className="manual-code-section">
              <div className="section-header">
                <Key size={18} className="sec-icon" />
                <div>
                  <h4>Générateur de Codes d'Accès Sécurisés (Usage Unique • Par Formation)</h4>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>
                    Chaque code généré ne fonctionne que pour un seul compte élève et débloque exclusivement la formation choisie.
                  </p>
                </div>
              </div>

              {generatedCodeSuccess && (
                <div className="code-created-banner">
                  <div className="code-created-info">
                    <Check size={18} className="success-icon" />
                    <div>
                      <span>Nouveau code pour <strong>{generatedCodeSuccess.itemTitle}</strong> :</span>
                      <strong className="code-display">{generatedCodeSuccess.code}</strong>
                      <span className="code-recipient-tag">Bénéficiaire : {generatedCodeSuccess.recipientName}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-copy-generated"
                    onClick={() => handleCopy(generatedCodeSuccess.code)}
                  >
                    {copiedCode === generatedCodeSuccess.code ? (
                      <>
                        <Check size={14} />
                        <span>Copié !</span>
                      </>
                    ) : (
                      <>
                        <Copy size={14} />
                        <span>Copier le Code</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <form onSubmit={handleCreateCode} className="manual-code-form">
                <div className="code-form-field">
                  <label className="code-form-label">
                    <span className="step-num">1</span> Formation à débloquer :
                  </label>
                  <select 
                    value={selectedBookForCode}
                    onChange={(e) => setSelectedBookForCode(e.target.value)}
                    className="code-select-book"
                  >
                    <option value="livre-bd-storytelling">📕 Livre 1 : BD & Storytelling</option>
                    <option value="livre-videos-ia">🎬 Livre 2 : Vidéos Virales avec l'IA</option>
                  </select>
                </div>

                <div className="code-form-field">
                  <label className="code-form-label">
                    <span className="step-num">2</span> Bénéficiaire (Optionnel) :
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: Ami WhatsApp Samuel, Cadeau..."
                    value={recipientNote}
                    onChange={(e) => setRecipientNote(e.target.value)}
                    className="code-input-note"
                  />
                </div>

                <div className="code-form-field submit-field">
                  <button type="submit" className="btn-generate-code-gold">
                    <Key size={18} />
                    <span>Générer un Code Sécurisé</span>
                    <Sparkles size={16} />
                  </button>
                </div>
              </form>

              {/* Tableau des codes générés et leur statut d'utilisation */}
              {adminCodes.length > 0 && (
                <div className="admin-codes-list-wrap">
                  <h5 className="admin-codes-subtitle">Codes d'Accès Générés ({adminCodes.length})</h5>
                  <div className="admin-codes-grid">
                    {adminCodes.map((c) => (
                      <div key={c.id} className={`admin-code-item-card ${c.status === 'UTILISÉ' ? 'used' : 'available'}`}>
                        <div className="code-item-top">
                          <code className="code-string">{c.code}</code>
                          <span className={`status-pill ${c.status === 'UTILISÉ' ? 'used' : 'available'}`}>
                            {c.status === 'UTILISÉ' ? '🔴 Utilisé' : '🟢 Disponible'}
                          </span>
                        </div>

                        <div className="code-item-meta">
                          <span className="code-book-name">{c.itemTitle}</span>
                          <span className="code-recipient">Pour : {c.recipientName}</span>
                          {c.status === 'UTILISÉ' && (
                            <span className="code-used-by">
                              Activé par : <strong>{c.usedBy}</strong> {c.usedAt ? `le ${c.usedAt}` : ''}
                            </span>
                          )}
                          <span className="code-date">Créé le {c.createdAt}</span>
                        </div>

                        <div className="code-item-actions">
                          <button 
                            type="button" 
                            className="btn-code-action copy"
                            onClick={() => handleCopy(c.code)}
                            title="Copier le code"
                          >
                            {copiedCode === c.code ? <Check size={13} /> : <Copy size={13} />}
                            <span>{copiedCode === c.code ? 'Copié' : 'Copier'}</span>
                          </button>
                          {c.status === 'DISPONIBLE' && (
                            <button 
                              type="button" 
                              className="btn-code-action delete"
                              onClick={() => handleDeleteCode(c.id)}
                              title="Supprimer ce code inutilisé"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Liste complète des Commandes & Élèves */}
            <div className="orders-table-card">
              <div className="orders-table-header">
                <h4>Historique des Élèves ({filteredOrders.length})</h4>
                <div className="search-bar">
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="Rechercher par nom, email ou code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Élève</th>
                      <th>Email (Gmail)</th>
                      <th>Livre / Formation</th>
                      <th>Montant</th>
                      <th>Code d'Accès</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id}>
                        <td className="date-col">{ord.date}</td>
                        <td className="name-col">{ord.clientName}</td>
                        <td className="email-col">{ord.clientEmail}</td>
                        <td><span className="book-pill">{ord.itemTitle}</span></td>
                        <td className="amount-col">{ord.amount ? `${ord.amount.toLocaleString()} FCFA` : 'Offert'}</td>
                        <td className="code-col">
                          <code>{ord.code}</code>
                        </td>
                        <td>
                          <button 
                            className="btn-copy-sm"
                            onClick={() => handleCopy(ord.code)}
                            title="Copier le code pour lui envoyer"
                          >
                            {copiedCode === ord.code ? <Check size={14} /> : <Copy size={14} />}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan="7" className="empty-table">Aucun élève trouvé pour cette recherche.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
