import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Eye, 
  Sparkles, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Globe, 
  RefreshCw, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  User, 
  ArrowUpRight, 
  Image as ImageIcon,
  MoreVertical,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Megaphone,
  Award,
  GraduationCap,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ModernSelect } from '@/components/ui/select';
import { 
  getStoredNews, 
  saveStoredNews, 
  createNewsArticle, 
  updateNewsArticle, 
  deleteNewsArticle, 
  resetNewsToDefault,
  syncNewsWithBackend,
  PRESET_COVER_IMAGES 
} from '@/data/newsData';
import { NewsArticle, NewsCategory } from '@/types';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

const CATEGORIES: NewsCategory[] = [
  'Événement',
  'Vie du Centre',
  'Diplômes & DQP',
  'Inscriptions',
  'Partenariat',
  'Masterclass',
  'Innovation'
];

export default function NewsAdminPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal states
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewArticle, setPreviewArticle] = useState<NewsArticle | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    category: NewsCategory;
    coverImage: string;
    authorName: string;
    authorRole: string;
    authorAvatar: string;
    isEvent: boolean;
    eventDate: string;
    eventLocation: string;
    isPinned: boolean;
    status: 'published' | 'draft' | 'archived';
    tagsString: string;
    readTime: string;
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'Événement',
    coverImage: PRESET_COVER_IMAGES[0].url,
    authorName: 'Administration CFP-ITMC',
    authorRole: 'Direction de la Communication',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminITMC',
    isEvent: false,
    eventDate: '',
    eventLocation: '',
    isPinned: false,
    status: 'published',
    tagsString: 'CFP-ITMC, Formation, Douala',
    readTime: '3 min de lecture'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadArticles = async () => {
    setArticles(getStoredNews());
    const synced = await syncNewsWithBackend();
    if (synced && synced.length > 0) {
      setArticles(synced);
    }
  };

  useEffect(() => {
    loadArticles();
    window.addEventListener('cfpitmc_news_updated', loadArticles);
    return () => window.removeEventListener('cfpitmc_news_updated', loadArticles);
  }, []);

  // Stats calculation
  const totalCount = articles.length;
  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const eventsCount = articles.filter(a => a.isEvent).length;
  const totalViews = articles.reduce((acc, curr) => acc + (curr.viewsCount || 0), 0);

  // Filtered list
  const filteredArticles = articles.filter(a => {
    const matchesSearch = 
      searchQuery.trim() === '' ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCat = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Open Editor for new article
  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: `### Présentation & Contexte\n\nDécrivez ici les détails principaux de cette actualité ou de cet événement pour la communauté du CFP-ITMC.\n\n### Points Clés & Retombées\n\n- Point important 1\n- Point important 2\n- Information sur les inscriptions ou la participation\n\n> « Le CFP-ITMC œuvre chaque jour pour l'excellence professionnelle de la jeunesse camerounaise. »`,
      category: 'Vie du Centre',
      coverImage: PRESET_COVER_IMAGES[0].url,
      authorName: 'Administration CFP-ITMC',
      authorRole: 'Direction de la Communication',
      authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminITMC',
      isEvent: false,
      eventDate: '',
      eventLocation: 'Campus CFP-ITMC Douala Logpom',
      isPinned: false,
      status: 'published',
      tagsString: 'CFP-ITMC, Formation, Douala',
      readTime: '3 min de lecture'
    });
    setIsEditorOpen(true);
  };

  // Open Editor for existing article
  const handleOpenEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt,
      content: article.content,
      category: article.category,
      coverImage: article.coverImage,
      authorName: article.author.name,
      authorRole: article.author.role,
      authorAvatar: article.author.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminITMC',
      isEvent: article.isEvent || false,
      eventDate: article.eventDate || '',
      eventLocation: article.eventLocation || '',
      isPinned: article.isPinned || false,
      status: article.status,
      tagsString: article.tags.join(', '),
      readTime: article.readTime || '3 min de lecture'
    });
    setIsEditorOpen(true);
  };

  // Auto-generate slug when title changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    setFormData(prev => ({
      ...prev,
      title: val,
      slug: !editingArticle ? generatedSlug : prev.slug
    }));
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Veuillez saisir un titre pour l\'article.');
      return;
    }

    const tagsArray = formData.tagsString
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    if (editingArticle) {
      // Update
      updateNewsArticle(editingArticle.id, {
        title: formData.title,
        slug: formData.slug || `article-${Date.now()}`,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        coverImage: formData.coverImage,
        author: {
          name: formData.authorName,
          role: formData.authorRole,
          avatar: formData.authorAvatar
        },
        isEvent: formData.isEvent,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        isPinned: formData.isPinned,
        status: formData.status,
        tags: tagsArray,
        readTime: formData.readTime
      });
      showToast('Actualité mise à jour avec succès !');
    } else {
      // Create
      createNewsArticle({
        title: formData.title,
        slug: formData.slug || `article-${Date.now()}`,
        excerpt: formData.excerpt,
        content: formData.content,
        category: formData.category,
        coverImage: formData.coverImage,
        author: {
          name: formData.authorName,
          role: formData.authorRole,
          avatar: formData.authorAvatar
        },
        publishedAt: formattedDate,
        date: now.toISOString(),
        isEvent: formData.isEvent,
        eventDate: formData.eventDate,
        eventLocation: formData.eventLocation,
        isPinned: formData.isPinned,
        status: formData.status,
        tags: tagsArray,
        readTime: formData.readTime
      });
      showToast('Nouvelle actualité publiée avec succès !');
    }

    setIsEditorOpen(false);
    loadArticles();
  };

  const handleTogglePin = (article: NewsArticle) => {
    updateNewsArticle(article.id, { isPinned: !article.isPinned });
    showToast(article.isPinned ? 'Article retiré de la une' : 'Article mis à la une !');
    loadArticles();
  };

  const handleToggleStatus = (article: NewsArticle) => {
    const nextStatus = article.status === 'published' ? 'draft' : 'published';
    updateNewsArticle(article.id, { status: nextStatus });
    showToast(nextStatus === 'published' ? 'Article mis en ligne' : 'Article passé en brouillon');
    loadArticles();
  };

  const handleDelete = (id: string) => {
    deleteNewsArticle(id);
    setDeleteConfirmId(null);
    showToast('Actualité supprimée définitivement.');
    loadArticles();
  };

  const handleResetDefaults = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les actualités aux valeurs par défaut ?')) {
      resetNewsToDefault();
      loadArticles();
      showToast('Actualités réinitialisées par défaut !');
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner / Header */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Contrôle Total Super Admin</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight">
            Gestion des Actualités &amp; Événements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Pilotez l'ensemble des publications du CFP-ITMC : communiqués MINEFOP, examens DQP, inscriptions, masterclasses et partenariats d'entreprises.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link to="/actualites" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" className="rounded-2xl text-xs font-bold h-11 px-4 border-slate-200 hover:bg-slate-50 gap-2">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Voir la page publique</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Button>
          </Link>

          <Button 
            onClick={handleOpenCreate}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-black h-11 px-5 gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Nouvelle Actualité / Événement</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Articles</span>
            <FileText className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900 dark:text-white">{totalCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Publications créées</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Publiés en Ligne</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-display font-black text-emerald-600">{publishedCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Visibles par le public</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Brouillons</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-display font-black text-amber-600">{draftCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">En attente de révision</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Événements</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-display font-black text-purple-600">{eventsCount}</p>
          <span className="text-[10px] text-slate-400 font-medium">Agendas & Cérémonies</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lectures Totales</span>
            <Eye className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-display font-black text-slate-900 dark:text-white">{totalViews}</p>
          <span className="text-[10px] text-slate-400 font-medium">Vues cumulées</span>
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Rechercher par titre, tag ou auteur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium focus:ring-2 ring-blue-500/20 outline-none"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
          
          {/* Category Filter */}
          <ModernSelect
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </ModernSelect>

          {/* Status Filter */}
          <ModernSelect
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Tous les statuts</option>
            <option value="published">Publiés uniquement</option>
            <option value="draft">Brouillons uniquement</option>
          </ModernSelect>

          {/* Reset button */}
          <Button 
            onClick={handleResetDefaults}
            variant="ghost" 
            size="icon" 
            className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-600"
            title="Réinitialiser les articles par défaut"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

      </div>

      {/* Main Articles Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {filteredArticles.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucun article trouvé</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Modifiez vos critères de recherche ou cliquez sur le bouton ci-dessous pour ajouter une nouvelle publication.
            </p>
            <Button onClick={handleOpenCreate} className="bg-blue-600 text-white rounded-xl text-xs font-bold h-9">
              Créer une actualité
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-4 px-6">Article / Titre</th>
                  <th className="py-4 px-4">Catégorie</th>
                  <th className="py-4 px-4">Type & Date</th>
                  <th className="py-4 px-4">Statut</th>
                  <th className="py-4 px-4 text-center">À la une</th>
                  <th className="py-4 px-4">Vues</th>
                  <th className="py-4 px-6 text-right">Actions Super Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors group">
                    
                    {/* Article & Image */}
                    <td className="py-4 px-6 max-w-sm">
                      <div className="flex items-center gap-3.5">
                        <img 
                          src={article.coverImage} 
                          alt={article.title}
                          className="w-14 h-12 rounded-xl object-cover shrink-0 bg-slate-100 border border-slate-200/60"
                        />
                        <div className="space-y-1 min-w-0">
                          <p className="font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-2">
                            {article.title}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-lg border border-blue-200/50">
                        {article.category}
                      </span>
                    </td>

                    {/* Type & Date */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                          {article.isEvent ? (
                            <span className="text-amber-600 font-extrabold flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Événement
                            </span>
                          ) : (
                            <span className="text-slate-500 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Actualité
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {article.isEvent && article.eventDate ? article.eventDate : article.publishedAt}
                        </p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(article)}
                        className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-transform active:scale-95",
                          article.status === 'published'
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}
                        title="Cliquez pour changer le statut"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", article.status === 'published' ? "bg-emerald-500" : "bg-slate-400")} />
                        {article.status === 'published' ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>

                    {/* Pinned (À la une) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button 
                        onClick={() => handleTogglePin(article)}
                        className={cn(
                          "p-2 rounded-xl transition-all cursor-pointer",
                          article.isPinned 
                            ? "bg-amber-100 text-amber-700 hover:bg-amber-200" 
                            : "text-slate-300 hover:text-slate-600 hover:bg-slate-100"
                        )}
                        title={article.isPinned ? "Retirer de la une" : "Mettre à la une"}
                      >
                        <Sparkles className={cn("w-4 h-4", article.isPinned && "fill-amber-500 text-amber-500")} />
                      </button>
                    </td>

                    {/* Views */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{article.viewsCount || 0}</span>
                      </div>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          onClick={() => { setPreviewArticle(article); setIsPreviewOpen(true); }}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Aperçu rapide"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        <Button 
                          onClick={() => handleOpenEdit(article)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                          title="Modifier l'article"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>

                        <Button 
                          onClick={() => setDeleteConfirmId(article.id)}
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Modal / Drawer for Creating / Editing Article */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col border border-slate-200 dark:border-slate-800"
            >
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                    {editingArticle ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {editingArticle ? "Modifier la publication" : "Publier une nouvelle actualité / événement"}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">Contrôle éditorial Super Admin CFP-ITMC</p>
                  </div>
                </div>

                <Button 
                  onClick={() => setIsEditorOpen(false)}
                  variant="ghost" 
                  size="icon" 
                  className="rounded-xl"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveForm} className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                
                {/* Title & Slug */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Titre de l'Actualité ou de l'Événement <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="Ex: Cérémonie de remise des diplômes DQP Session 2026..."
                      value={formData.title}
                      onChange={handleTitleChange}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">
                      Identifiant d'URL (Slug SEO)
                    </label>
                    <input 
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-500 outline-none"
                    />
                  </div>
                </div>

                {/* Category & Status & Type Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Catégorie
                    </label>
                    <ModernSelect
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as NewsCategory }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </ModernSelect>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Statut de publication
                    </label>
                    <ModernSelect
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none cursor-pointer"
                    >
                      <option value="published">Publié (En ligne)</option>
                      <option value="draft">Brouillon (Caché)</option>
                    </ModernSelect>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Temps de lecture
                    </label>
                    <input 
                      type="text"
                      value={formData.readTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, readTime: e.target.value }))}
                      placeholder="Ex: 3 min de lecture"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 dark:text-white outline-none"
                    />
                  </div>

                </div>

                {/* Event Toggle & Event Details */}
                <div className="p-4 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300">
                        Cette publication est-elle un Événement avec date & lieu ?
                      </span>
                    </div>
                    <input 
                      type="checkbox"
                      checked={formData.isEvent}
                      onChange={(e) => setFormData(prev => ({ ...prev, isEvent: e.target.checked }))}
                      className="w-5 h-5 rounded text-amber-600 cursor-pointer"
                    />
                  </div>

                  {formData.isEvent && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-amber-200/60 dark:border-amber-800/40">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                          Date & Heure de l'Événement
                        </label>
                        <input 
                          type="text"
                          placeholder="Ex: 24 Septembre 2026 - 10h00"
                          value={formData.eventDate}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 dark:text-amber-300 mb-1">
                          Lieu / Salle
                        </label>
                        <input 
                          type="text"
                          placeholder="Ex: Amphithéâtre Principal, Campus CFP-ITMC Douala"
                          value={formData.eventLocation}
                          onChange={(e) => setFormData(prev => ({ ...prev, eventLocation: e.target.value }))}
                          className="w-full bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Excerpt / Accroche */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Résumé Court / Accroche (Affiché sur les cartes)
                  </label>
                  <textarea 
                    rows={2}
                    placeholder="Bref résumé accrocheur en 2 à 3 phrases..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20"
                  />
                </div>

                {/* Cover Image & Presets */}
                <div className="space-y-2.5">
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Image de Couverture (URL ou choix rapide)
                  </label>
                  
                  <div className="flex gap-2">
                    <input 
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={formData.coverImage}
                      onChange={(e) => setFormData(prev => ({ ...prev, coverImage: e.target.value }))}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white outline-none"
                    />
                    {formData.coverImage && (
                      <img 
                        src={formData.coverImage} 
                        alt="Preview" 
                        className="w-10 h-9 rounded-lg object-cover border border-slate-200 shrink-0" 
                      />
                    )}
                  </div>

                  {/* Preset Buttons */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold self-center mr-1">Presets recommandés :</span>
                    {PRESET_COVER_IMAGES.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormData(prev => ({ ...prev, coverImage: preset.url }))}
                        className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer",
                          formData.coverImage === preset.url
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200"
                        )}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detailed Content */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Corps Détaillé de l'Article
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Prend en charge les titres (### Titre), listes (- élément) et citations (&gt; citation)
                    </span>
                  </div>
                  <textarea 
                    rows={8}
                    required
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-xs font-mono text-slate-900 dark:text-white outline-none focus:ring-2 ring-blue-500/20 leading-relaxed"
                  />
                </div>

                {/* Author & Tags Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Signataire / Direction Auteur
                    </label>
                    <input 
                      type="text"
                      value={formData.authorName}
                      onChange={(e) => setFormData(prev => ({ ...prev, authorName: e.target.value }))}
                      placeholder="Ex: Direction Pédagogique CFP-ITMC"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                      Mots-clés / Tags (séparés par des virgules)
                    </label>
                    <input 
                      type="text"
                      value={formData.tagsString}
                      onChange={(e) => setFormData(prev => ({ ...prev, tagsString: e.target.value }))}
                      placeholder="Ex: DQP, MINEFOP, Rentrée, Examen"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                    />
                  </div>
                </div>

                {/* Highlight Checkbox */}
                <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <input 
                    type="checkbox"
                    id="isPinnedCheck"
                    checked={formData.isPinned}
                    onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                    className="w-5 h-5 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isPinnedCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Mettre cet article <span className="text-amber-600 font-black">À la une</span> (Bannière vedette en haut du site public)
                  </label>
                </div>

                {/* Submit button inside form for Enter key support */}
                <button type="submit" className="hidden" />
              </form>

              {/* Modal Footer */}
              <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                <Button 
                  onClick={() => setIsEditorOpen(false)}
                  variant="outline" 
                  className="rounded-xl text-xs font-bold h-10 px-4"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveForm}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black h-10 px-6 gap-2 shadow-lg shadow-blue-500/20"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingArticle ? "Enregistrer les modifications" : "Publier l'actualité"}</span>
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && previewArticle && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[88vh] flex flex-col border border-slate-200 dark:border-slate-800"
            >
              <div className="relative h-60 bg-slate-900 shrink-0">
                <img src={previewArticle.coverImage} alt={previewArticle.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <Button 
                  onClick={() => setIsPreviewOpen(false)}
                  variant="ghost" 
                  className="absolute top-4 right-4 bg-white/80 text-slate-900 rounded-full w-9 h-9 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="absolute bottom-4 left-6 right-6 text-white">
                  <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider">
                    {previewArticle.category}
                  </span>
                  <h2 className="text-xl font-display font-black mt-1 leading-snug">{previewArticle.title}</h2>
                </div>
              </div>

              <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1 custom-scrollbar text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white italic bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border-l-4 border-blue-600">
                  {previewArticle.excerpt}
                </p>
                <div className="whitespace-pre-line">
                  {previewArticle.content}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                <Button onClick={() => setIsPreviewOpen(false)} className="bg-slate-900 text-white rounded-xl text-xs font-bold">
                  Fermer l'aperçu
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl p-6 text-center space-y-4 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Confirmer la suppression ?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Cette actualité sera définitivement retirée du portail et de la base de données.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Button 
                  onClick={() => setDeleteConfirmId(null)}
                  variant="outline" 
                  className="rounded-xl text-xs font-bold h-10 px-4"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold h-10 px-5"
                >
                  Supprimer
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
