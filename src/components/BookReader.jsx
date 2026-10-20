import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Check, 
  Copy, 
  Layers, 
  CheckCircle2, 
  Sun, 
  Moon,
  BookOpen,
  Menu,
  X,
  Video,
  Sparkles,
  ArrowRight,
  List
} from 'lucide-react';
import { BOOKS_DATA } from '../data/booksData';
import { storageService } from '../services/storageService';
import './BookReader.css';

function PromptCodeBlock({ rawCode }) {
  const [copied, setCopied] = useState(false);

  // Extract language if specified on the first line (e.g., text, python)
  const firstNewline = rawCode.indexOf('\n');
  let langLabel = 'Prompt à copier';
  let code = rawCode;
  if (firstNewline !== -1 && rawCode.slice(0, firstNewline).trim().match(/^[a-zA-Z0-9_-]+$/)) {
    const detectedLang = rawCode.slice(0, firstNewline).trim().toLowerCase();
    if (detectedLang === 'text' || detectedLang === 'cinematic_prompt' || detectedLang === 'prompt') {
      langLabel = 'Exemplaire de Prompt Vidéo (Format 9:16)';
    } else if (detectedLang === 'cadrage' || detectedLang === 'consigne') {
      langLabel = 'Message de Cadrage pour Google Gemini';
    } else {
      langLabel = detectedLang;
    }
    code = rawCode.slice(firstNewline + 1);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="art-code-block">
      <div className="art-code-header">
        <span className="art-code-lang">
          <Sparkles size={14} className="art-code-sparkle-icon" />
          {langLabel}
        </span>
        <button 
          type="button" 
          className="art-copy-code-btn" 
          onClick={handleCopy}
          title="Copier le texte"
        >
          {copied ? (
            <>
              <Check size={13} className="copy-icon-success" />
              <span>Copié !</span>
            </>
          ) : (
            <>
              <Copy size={13} className="copy-icon-double-square" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

export function BookReader({ 
  book, 
  isUnlocked, 
  activeCode,
  onOpenCheckout, 
  onOpenUnlockModal,
  onSelectBook,
  onBack,
  onClose
}) {
  const [currentPageIndex, setCurrentPageIndex] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`mrben_reader_page_${book?.id}`);
      return saved !== null ? Math.max(0, parseInt(saved, 10)) : 0;
    } catch {
      return 0;
    }
  });
  const [themeMode, setThemeMode] = useState('paper'); // 'paper' (blanc sobre doux) | 'dark' (anthracite sobre)
  // Sur mobile, le sommaire est fermé par défaut pour afficher directement la leçon
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 860;
    }
    return false;
  });
  const [currentPrice, setCurrentPrice] = useState(() => storageService.getFormationPrice(book?.id) || book?.price || 2500);
  const mainStageRef = useRef(null);

  useEffect(() => {
    setCurrentPrice(storageService.getFormationPrice(book?.id) || book?.price || 2500);
    const handlePriceChange = () => {
      setCurrentPrice(storageService.getFormationPrice(book?.id) || book?.price || 2500);
    };
    window.addEventListener('mrben_price_changed', handlePriceChange);
    window.addEventListener('storage', handlePriceChange);
    return () => {
      window.removeEventListener('mrben_price_changed', handlePriceChange);
      window.removeEventListener('storage', handlePriceChange);
    };
  }, [book?.id, book?.price]);

  // Fermer le sommaire sur mobile avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSidebarOpen && window.innerWidth <= 860) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

  // Aplatir toutes les pages du livre avec référence à leur chapitre
  const allPages = React.useMemo(() => {
    const list = [];
    if (!book || !book.chapters) return list;
    book.chapters.forEach(chap => {
      if (!chap.pages) return;
      chap.pages.forEach(pg => {
        list.push({
          ...pg,
          chapterTitle: chap.title,
          chapterNumber: chap.chapterNumber,
          isChapterLocked: !isUnlocked && (chap.locked || (book.freePreviewPages ? pg.pageNumber > book.freePreviewPages : false))
        });
      });
    });
    return list;
  }, [book, isUnlocked]);

  // Restaure la dernière page lue pour ce livre spécifique ou 0
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(`mrben_reader_page_${book?.id}`);
      if (saved !== null) {
        const parsed = parseInt(saved, 10);
        setCurrentPageIndex(isNaN(parsed) ? 0 : parsed);
      } else {
        setCurrentPageIndex(0);
      }
    } catch {
      setCurrentPageIndex(0);
    }
  }, [book?.id]);

  // Sauvegarde en continu la position de lecture pour ne pas perdre la page à l'actualisation
  useEffect(() => {
    if (book?.id) {
      try {
        sessionStorage.setItem(`mrben_reader_page_${book.id}`, currentPageIndex.toString());
      } catch {}
    }
  }, [book?.id, currentPageIndex]);

  useEffect(() => {
    if (mainStageRef.current) {
      mainStageRef.current.scrollTop = 0;
    }
  }, [currentPageIndex]);

  const currentPage = allPages[currentPageIndex] || allPages[0] || null;
  const totalPages = allPages.length || 0;
  const isPageLocked = currentPage ? currentPage.isChapterLocked : false;

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const handleSelectLesson = (pageIndex) => {
    if (pageIndex !== -1) {
      setCurrentPageIndex(pageIndex);
      // Sur mobile, refermer le tiroir pour laisser place à la lecture
      if (typeof window !== 'undefined' && window.innerWidth <= 860) {
        setIsSidebarOpen(false);
      }
    }
  };

  return (
    <div className={`book-reader-container theme-${themeMode}`}>
      
      {/* 1. Barre de navigation supérieure épurée et responsive */}
      <header className="reader-navbar">
        <div className="reader-nav-left">
          <button 
            type="button"
            className="reader-back-action" 
            onClick={onBack || onClose} 
            title="Quitter la formation"
            aria-label="Quitter la formation"
          >
            <ChevronLeft size={18} />
            <span className="reader-nav-label">Quitter</span>
          </button>
          
          <button 
            type="button"
            className={`reader-toggle-sidebar-btn ${isSidebarOpen ? 'active' : ''}`}
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Fermer le sommaire" : "Afficher le sommaire"}
            aria-label="Sommaire de la formation"
          >
            <List size={16} />
            <span className="reader-nav-label">Sommaire</span>
          </button>
        </div>

        <div className="reader-nav-center">
          <h2 className="reader-book-main-title">{book.title}</h2>
        </div>

        <div className="reader-nav-right">
          {/* Bascule Mode Papier (Blanc sobre) / Mode Nuit sobre */}
          <button 
            type="button" 
            className="reader-theme-toggle"
            onClick={() => setThemeMode(themeMode === 'paper' ? 'dark' : 'paper')}
            title={themeMode === 'paper' ? "Mode sombre" : "Mode papier"}
            aria-label="Changer de thème"
          >
            {themeMode === 'paper' ? <Moon size={15} /> : <Sun size={15} />}
            <span className="reader-nav-label">{themeMode === 'paper' ? 'Sombre' : 'Papier'}</span>
          </button>

          <span className="reader-progress-tag">
            {currentPage ? `${currentPage.pageNumber}/${totalPages}` : ''}
          </span>
        </div>
      </header>

      {/* Fond sombre transparent flouté sur mobile quand le sommaire est ouvert */}
      <div 
        className={`reader-sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* 2. Espace de travail : Sommaire + Page de lecture */}
      <div className="reader-workspace">
        
        {/* Volet latéral (Desktop) ou Tiroir Coulissant (Mobile) */}
        <aside className={`reader-curriculum-sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <div className="curriculum-sidebar-header">
            <div className="curriculum-header-left">
              <BookOpen size={16} />
              <span>Programme de la formation</span>
            </div>
            <button 
              type="button"
              className="curriculum-mobile-close-btn"
              onClick={() => setIsSidebarOpen(false)}
              title="Fermer le sommaire"
              aria-label="Fermer le sommaire"
            >
              <X size={18} />
            </button>
          </div>

          <div className="curriculum-chapters-list">
            {book.chapters.map((chap) => {
              const hasActivePage = chap.pages && chap.pages.some(p => p.pageNumber === currentPage?.pageNumber);
              return (
                <div key={chap.id} className={`curriculum-chapter-group ${hasActivePage ? 'active-chapter' : ''}`}>
                  <div className="chapter-group-header">
                    <span className="chapter-num-badge">{chap.chapterNumber}</span>
                    <span className="chapter-group-title">{chap.title}</span>
                  </div>

                  <div className="chapter-lessons-list">
                    {chap.pages && chap.pages.map((pg) => {
                      const isSelected = currentPage && currentPage.pageNumber === pg.pageNumber;
                      const isLocked = !isUnlocked && (chap.locked || (book.freePreviewPages ? pg.pageNumber > book.freePreviewPages : false));
                      const pageIndexInAll = allPages.findIndex(p => p.pageNumber === pg.pageNumber);

                      return (
                        <button
                          key={pg.pageNumber}
                          type="button"
                          className={`curriculum-lesson-row ${isSelected ? 'active-lesson' : ''} ${isLocked ? 'locked-lesson' : ''}`}
                          onClick={() => handleSelectLesson(pageIndexInAll)}
                        >
                          <span className="lesson-row-title">{pg.title}</span>
                          {isLocked && <Lock size={12} className="lesson-lock-icon" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Zone de lecture principale (Le Livre sobre) */}
        <main className="reader-main-stage" ref={mainStageRef}>
          <div className="reader-paper-page">
            
            {!currentPage ? (
              <div className="reader-empty-state">
                <BookOpen size={40} />
                <h3>Formation en cours de préparation</h3>
                <p>Le contenu officiel est en cours d'intégration avec Mr Ben.</p>
              </div>
            ) : isPageLocked ? (
              /* Écran de verrouillage paywall sobre */
              <div className="reader-locked-curtain">
                <div className="locked-icon-wrap">
                  <Lock size={32} />
                </div>
                <h3>Chapitre Réservé aux Membres</h3>
                <p>
                  Ce chapitre contient les leçons exclusives de Mr Ben. 
                  Débloquez votre accès complet pour continuer votre formation.
                </p>
                <div className="locked-actions-box">
                  <button 
                    type="button" 
                    className="btn-unlock-gold" 
                    onClick={() => onOpenCheckout({ ...book, price: currentPrice })}
                  >
                    Débloquer la formation ({currentPrice.toLocaleString()} {book.currency || 'FCFA'})
                  </button>
                  <button 
                    type="button" 
                    className="btn-unlock-code" 
                    onClick={onOpenUnlockModal}
                  >
                    J'ai un code d'accès
                  </button>
                </div>
              </div>
            ) : (
              /* Contenu textuel épuré, soigné et direct */
              <div className="reader-article-body">
                <header className="article-header">
                  <span className="article-chapter-breadcrumb">
                    {currentPage.chapterTitle}
                  </span>
                  <h1 className="article-main-title">{currentPage.title}</h1>
                </header>

                <div className="article-content">
                  {currentPage.content.split('\n\n').map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;
                    if (trimmed.startsWith('### ')) {
                      return <h2 key={pIdx} className="art-h2">{trimmed.replace('### ', '')}</h2>;
                    }
                    if (trimmed === '---') {
                      return <hr key={pIdx} className="art-hr-divider" />;
                    }
                    if (trimmed.startsWith('#### ')) {
                      return <h3 key={pIdx} className="art-h3">{trimmed.replace('#### ', '')}</h3>;
                    }
                    // Support markdown image ![alt](src)
                    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
                    if (imgMatch) {
                      return (
                        <figure key={pIdx} className="art-figure">
                          <img src={imgMatch[2]} alt={imgMatch[1]} className="art-img" />
                          {imgMatch[1] && <figcaption className="art-figcaption">{imgMatch[1]}</figcaption>}
                        </figure>
                      );
                    }
                    // Support code block ``` ... ```
                    if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
                      const codeLines = trimmed.slice(3, -3).trim();
                      return <PromptCodeBlock key={pIdx} rawCode={codeLines} />;
                    }
                    if (trimmed.startsWith('* ') || trimmed.includes('\n* ')) {
                      const lines = trimmed.split('\n');
                      const items = [];
                      lines.forEach(l => {
                        const lTrim = l.trim();
                        if (!lTrim) return;
                        if (lTrim.startsWith('* ')) {
                          items.push(lTrim.replace(/^\*\s*/, ''));
                        } else if (items.length > 0) {
                          items[items.length - 1] += '<br />' + lTrim;
                        } else {
                          items.push(lTrim);
                        }
                      });
                      return (
                        <ul key={pIdx} className="art-ul">
                          {items.map((item, iIdx) => {
                            const parsedHtml = item
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            return (
                              <li 
                                key={iIdx}
                                dangerouslySetInnerHTML={{ __html: parsedHtml }}
                              />
                            );
                          })}
                        </ul>
                      );
                    }
                    if (trimmed.match(/^\d+\.\s/)) {
                      const lines = trimmed.split('\n');
                      const items = [];
                      lines.forEach(l => {
                        const lTrim = l.trim();
                        if (!lTrim) return;
                        if (lTrim.match(/^\d+\.\s/)) {
                          items.push(lTrim.replace(/^\d+\.\s*/, ''));
                        } else if (items.length > 0) {
                          items[items.length - 1] += '<br />' + lTrim;
                        } else {
                          items.push(lTrim);
                        }
                      });
                      return (
                        <ol key={pIdx} className="art-ol">
                          {items.map((item, iIdx) => {
                            const parsedHtml = item
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/\*(.*?)\*/g, '<em>$1</em>');
                            return (
                              <li 
                                key={iIdx}
                                dangerouslySetInnerHTML={{ __html: parsedHtml }}
                              />
                            );
                          })}
                        </ol>
                      );
                    }
                    const parsedParagraph = trimmed
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br />');
                    return (
                      <p 
                        key={pIdx} 
                        className="art-p"
                        dangerouslySetInnerHTML={{ __html: parsedParagraph }}
                      />
                    );
                  })}
                </div>

                {/* Bouton épuré vers la formation complémentaire */}
                {currentPage.promoButton && (() => {
                  const target = BOOKS_DATA.find(b => b.id === currentPage.promoButton.bookId);
                  const isTargetUnlocked = target ? storageService.isBookUnlocked(target.id) : false;

                  return (
                    <div className="art-promo-btn-container">
                      <button 
                        type="button" 
                        className={`art-promo-inline-btn ${isTargetUnlocked ? 'btn-unlocked-yellow' : 'btn-locked-red'}`}
                        onClick={() => {
                          if (isTargetUnlocked && onSelectBook && target) {
                            onSelectBook(target);
                          } else if (onOpenCheckout) {
                            onOpenCheckout(target || book);
                          }
                        }}
                      >
                        {isTargetUnlocked ? (
                          <CheckCircle2 size={16} />
                        ) : currentPage.promoButton.bookId === 'livre-bd-storytelling' ? (
                          <BookOpen size={16} />
                        ) : (
                          <Video size={16} />
                        )}
                        <span>
                          {isTargetUnlocked 
                            ? "✓ Débloqué" 
                            : (currentPage.promoButton.text || "Découvrir la Formation")}
                        </span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  );
                })()}

                {/* Galerie de captures pratiques (si présente) */}
                {currentPage.practiceScreenshots && currentPage.practiceScreenshots.length > 0 && (
                  <div className="art-screenshots-gallery">
                    <span className="art-gallery-title">Captures & Exemples en situation réelle :</span>
                    <div className="art-gallery-grid">
                      {currentPage.practiceScreenshots.map((item, sIdx) => (
                        <figure key={sIdx} className="art-screenshot-card">
                          <img src={item.url} alt={item.caption || "Capture d'écran"} className="art-gallery-img" />
                          {item.caption && <figcaption className="art-screenshot-caption">{item.caption}</figcaption>}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {/* Encadré d'exemple sobre (si présent) */}
                {currentPage.exampleBox && (
                  <div className="art-example-card">
                    <span className="art-example-label">{currentPage.exampleBox.title}</span>
                    <p className="art-example-text">« {currentPage.exampleBox.text} »</p>
                  </div>
                )}

                {/* Checklist sobre (si présente) */}
                {currentPage.checklist && (
                  <div className="art-checklist-card">
                    <span className="art-checklist-title">À vérifier :</span>
                    <ul className="art-checklist-items">
                      {currentPage.checklist.map((item, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={15} className="art-check-icon" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Astuce sobre */}
                {currentPage.tip && (
                  <div className="art-tip-callout">
                    <div className="art-tip-content">
                      <strong>Conseil clé :</strong> {currentPage.tip}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pied de page et pagination */}
            <footer className="reader-page-bottom-nav">
              <button 
                type="button"
                className="nav-page-btn prev"
                onClick={handlePrevPage}
                disabled={currentPageIndex === 0}
                title="Page précédente"
              >
                <ChevronLeft size={16} />
                <span className="nav-btn-text-full">Page précédente</span>
                <span className="nav-btn-text-short">Précédent</span>
              </button>

              <button 
                type="button"
                className="nav-page-btn-sommaire"
                onClick={() => setIsSidebarOpen(true)}
                title="Consulter le sommaire complet"
              >
                <List size={14} />
                <span>Sommaire</span>
              </button>

              <button 
                type="button"
                className="nav-page-btn next"
                onClick={handleNextPage}
                disabled={currentPageIndex >= totalPages - 1}
                title="Page suivante"
              >
                <span className="nav-btn-text-full">Page suivante</span>
                <span className="nav-btn-text-short">Suivant</span>
                <ChevronRight size={16} />
              </button>
            </footer>

          </div>
        </main>
      </div>

    </div>
  );
}

export default BookReader;
