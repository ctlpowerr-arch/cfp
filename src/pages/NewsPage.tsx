/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Calendar, 
  Megaphone, 
  X, 
  ChevronRight,
  Sparkles,
  Eye,
  ArrowRight,
  Tag,
  Clock,
  BookOpen,
  Heart,
  Share2,
  MapPin,
  Check,
  Flame,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { getStoredNews, updateNewsArticle, syncNewsWithBackend } from '@/data/newsData';
import { NewsArticle, NewsCategory } from '@/types';
import PublicNavbar from '@/components/PublicNavbar';
import PublicFooter from '@/components/PublicFooter';
import PageHeaderBanner from '@/components/PageHeaderBanner';
import BottomCallToActionBanner from '@/components/BottomCallToActionBanner';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

const CATEGORIES: { label: string; value: 'all' | NewsCategory }[] = [
  { label: 'Toutes les actualités', value: 'all' },
  { label: 'Événements', value: 'Événement' },
  { label: 'Diplômes & DQP', value: 'Diplômes & DQP' },
  { label: 'Inscriptions', value: 'Inscriptions' },
  { label: 'Vie du Centre', value: 'Vie du Centre' },
  { label: 'Partenariats', value: 'Partenariat' },
  { label: 'Masterclass', value: 'Masterclass' },
];

export default function NewsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<'all' | NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [likedArticles, setLikedArticles] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  const loadData = async () => {
    const local = getStoredNews();
    setArticles(local);
    const synced = await syncNewsWithBackend();
    if (synced && synced.length > 0) {
      setArticles(synced);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('cfpitmc_news_updated', loadData);
    return () => window.removeEventListener('cfpitmc_news_updated', loadData);
  }, []);

  useEffect(() => {
    const articleId = searchParams.get('id');
    if (articleId && articles.length > 0) {
      const match = articles.find(a => a.id === articleId);
      if (match) {
        setSelectedArticle(match);
      }
    }
  }, [searchParams, articles]);

  const handleOpenArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    setSearchParams({ id: article.id });
    
    // Increment view count
    const updated = { ...article, viewsCount: (article.viewsCount || 0) + 1 };
    updateNewsArticle(article.id, { viewsCount: updated.viewsCount });
    setArticles(prev => prev.map(a => a.id === article.id ? updated : a));
  };

  const handleCloseModal = () => {
    setSelectedArticle(null);
    setSearchParams({});
    setCopiedLink(false);
  };

  const handleToggleLike = (e: React.MouseEvent, article: NewsArticle) => {
    e.stopPropagation();
    const isLiked = likedArticles[article.id];
    const newCount = isLiked ? Math.max(0, (article.likesCount || 0) - 1) : (article.likesCount || 0) + 1;
    setLikedArticles(prev => ({ ...prev, [article.id]: !isLiked }));
    
    updateNewsArticle(article.id, { likesCount: newCount });
    setArticles(prev => prev.map(a => a.id === article.id ? { ...a, likesCount: newCount } : a));
    
    if (selectedArticle?.id === article.id) {
      setSelectedArticle(prev => prev ? { ...prev, likesCount: newCount } : null);
    }
    
    toast.success(isLiked ? "Avis d'intérêt retiré" : "Merci pour votre mention J'aime !");
  };

  const handleShareArticle = (article: NewsArticle) => {
    const url = `${window.location.origin}/actualites?id=${article.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success("Lien de l'article copié dans le presse-papier !");
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  const filteredArticles = articles.filter(article => {
    if (article.status !== 'published') return false;
    const matchesCat = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const pinnedArticle = articles.find(a => a.isPinned && a.status === 'published') || filteredArticles[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <PublicNavbar />

      {/* Grande Bannière Immersive Bleu Uni & Blanc */}
      <PageHeaderBanner
        title="Actualités & Communiqués"
        description="Restez informé en temps réel des calendriers d'examens DQP, des rentrées académiques, des remises de diplômes et des opportunités d'emploi du CFP-ITMC."
      />

      {/* Main Content - Pleine Largeur PC max-w-7xl */}
      <section className="py-16 lg:py-24 flex-1">
        <div className="container mx-auto px-6 sm:px-8 max-w-7xl space-y-12">
          
          {/* Controls Bar */}
          <div className="bg-white border-2 border-slate-200/90 rounded-3xl p-6 lg:p-8 space-y-6 shadow-xl shadow-slate-200/50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
              
              <div className="lg:col-span-8 relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un communiqué, un examen DQP, un concours, une date de rentrée..."
                  className="w-full h-12 pl-12 pr-10 bg-slate-50 rounded-2xl border border-slate-200 focus:outline-hidden focus:border-blue-600 focus:bg-white text-sm font-medium shadow-xs transition-all"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="lg:col-span-4 text-right hidden lg:block text-xs font-black text-slate-500">
                <span className="bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl border border-blue-100">
                  <strong>{filteredArticles.length}</strong> publications disponibles
                </span>
              </div>

            </div>

            <div className="flex flex-wrap gap-2.5 pt-2 border-t border-slate-100">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedCategory === cat.value
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Articles list - 3 Colonnes sur Écrans PC (max-w-7xl) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => handleOpenArticle(article)}
                className="bg-white border-2 border-slate-200/90 rounded-3xl overflow-hidden hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  {article.coverImage && (
                    <div className="h-56 w-full overflow-hidden bg-slate-900 relative">
                      <img 
                        src={getOptimizedImageUrl(article.coverImage, { width: 600, quality: 75 })} 
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="350"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] sm:text-xs font-black text-white bg-slate-950/90 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-wider border border-white/20 shadow-md">
                          {article.category}
                        </span>
                      </div>
                    </div>
                  )}
                  
                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          {article.viewsCount !== undefined && (
                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-slate-600 text-[11px]">
                              <Eye className="w-3 h-3 text-slate-400" />
                              {article.viewsCount}
                            </span>
                          )}
                          <button
                            onClick={(e) => handleToggleLike(e, article)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                              likedArticles[article.id]
                                ? 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600'
                            }`}
                            title="J'aime"
                          >
                            <Heart className={`w-3 h-3 ${likedArticles[article.id] ? 'fill-rose-500 text-rose-500' : ''}`} />
                            {article.likesCount || 0}
                          </button>
                        </div>
                      </div>

                      <h3 className="font-black text-slate-950 text-lg sm:text-xl leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {article.title}
                      </h3>

                      {article.isEvent && (article.eventDate || article.eventLocation) && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] font-medium text-amber-900 space-y-1">
                          {article.eventDate && (
                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                              <Flame className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>Événement : {article.eventDate}</span>
                            </div>
                          )}
                          {article.eventLocation && (
                            <div className="flex items-center gap-1.5 text-slate-600">
                              <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                              <span className="truncate">{article.eventLocation}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm text-blue-600 font-black group-hover:translate-x-1 transition-transform">
                      <span className="flex items-center gap-1">Lire le communiqué complet</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-24 bg-white rounded-3xl border-2 border-slate-200 text-slate-500 space-y-3">
              <Megaphone className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-base font-bold text-slate-800">Aucune actualité ne correspond à ces critères.</p>
              <Button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
              >
                Afficher toutes les publications
              </Button>
            </div>
          )}

        </div>
      </section>

      {/* Grande Bannière Finale Bleu Uni & Blanc en fond direct vers le Footer */}
      <BottomCallToActionBanner 
        title="Ne Manquez Aucune Rentrée au CFP-ITMC"
        description="Inscrivez-vous dès maintenant à la prochaine session de formation et rejoignez une communauté d'apprenants passionnés."
        primaryButtonText="Prendre Contact / S'Inscrire"
        primaryButtonLink="/contact"
        secondaryButtonText="Explorer les Formations"
        secondaryButtonLink="/formations"
      />

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-10 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={handleCloseModal}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {selectedArticle.coverImage && (
              <div className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 relative">
                <img 
                  src={getOptimizedImageUrl(selectedArticle.coverImage, { width: 900, quality: 80 })} 
                  alt={selectedArticle.title}
                  loading="lazy"
                  decoding="async"
                  width="900"
                  height="450"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                    {selectedArticle.category}
                  </span>
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">
                    Publié le {new Date(selectedArticle.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleToggleLike(e, selectedArticle)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      likedArticles[selectedArticle.id]
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${likedArticles[selectedArticle.id] ? 'fill-white' : ''}`} />
                    <span>J'aime ({selectedArticle.likesCount || 0})</span>
                  </button>

                  <button
                    onClick={() => handleShareArticle(selectedArticle)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer transition-all"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Lien Copié !" : "Partager"}</span>
                  </button>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 leading-tight">
                {selectedArticle.title}
              </h2>

              {selectedArticle.author && (
                <div className="flex items-center gap-3 pt-2">
                  <img
                    src={selectedArticle.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedArticle.author.name}`}
                    alt={selectedArticle.author.name}
                    className="w-10 h-10 rounded-full border-2 border-blue-500/30 object-cover"
                  />
                  <div>
                    <h5 className="text-xs font-black text-slate-900">{selectedArticle.author.name}</h5>
                    <p className="text-[11px] text-slate-500 font-bold">{selectedArticle.author.role}</p>
                  </div>
                </div>
              )}

              {selectedArticle.isEvent && (selectedArticle.eventDate || selectedArticle.eventLocation) && (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 space-y-2 mt-4">
                  <span className="text-xs font-black uppercase text-amber-800 block">📅 Informations sur l'Événement Officiel</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
                    {selectedArticle.eventDate && (
                      <div className="flex items-center gap-2 text-amber-900">
                        <Flame className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Date : {selectedArticle.eventDate}</span>
                      </div>
                    )}
                    {selectedArticle.eventLocation && (
                      <div className="flex items-center gap-2 text-amber-900">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Lieu : {selectedArticle.eventLocation}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6 font-normal">
              {selectedArticle.content}
            </div>

            {selectedArticle.gallery && selectedArticle.gallery.length > 0 && (
              <div className="space-y-2 border-t border-slate-100 pt-6">
                <span className="text-xs font-black uppercase text-slate-400 block">🖼️ Galerie Photos de l'Événement</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedArticle.gallery.map((img, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-900 shadow-sm border border-slate-200">
                      <img
                        src={getOptimizedImageUrl(img, { width: 400, quality: 75 })}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedArticle.tags && selectedArticle.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                {selectedArticle.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-lg font-medium flex items-center gap-1">
                    <Tag className="w-3 h-3 text-slate-400" />
                    {t}
                  </span>
                ))}
              </div>
            )}

            <div className="pt-4">
              <Button 
                onClick={handleCloseModal}
                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold h-11 rounded-xl"
              >
                Fermer l'article
              </Button>
            </div>
          </div>
        </div>
      )}

      <PublicFooter showWaveTransition={false} />
    </div>
  );
}
