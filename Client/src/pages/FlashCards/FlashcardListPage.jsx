import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ChevronRight, BookOpen, Sparkles, X, ChevronLeft, RotateCcw } from 'lucide-react';
import flashcardService from '../../service/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [studyModal, setStudyModal] = useState({ open: false, cards: [], docTitle: '' });
  const [currentStudyIndex, setCurrentStudyIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();
        const sets = Array.isArray(response?.data) ? response.data : [];
        setFlashcardSets(sets);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets.');
        console.error("Error fetching flashcard sets:", error);
      } finally {
        setLoading(false);
      } 
    };

    fetchFlashcardSets();
  }, []);

  // Group starred cards by document
  const starredByDocument = useMemo(() => {
    const grouped = {};
    flashcardSets.forEach(set => {
      const starredCards = set.cards?.filter(card => card.isStarred) || [];
      if (starredCards.length > 0) {
        const docId = set.documentId?._id;
        const docTitle = set.documentId?.title || 'Untitled Document';
        if (!grouped[docId]) {
          grouped[docId] = {
            docId,
            docTitle,
            cards: [],
            setId: set._id
          };
        }
        grouped[docId].cards.push(...starredCards.map(card => ({ ...card, setId: set._id })));
      }
    });
    return Object.values(grouped);
  }, [flashcardSets]);

  const totalStarredCount = starredByDocument.reduce((sum, doc) => sum + doc.cards.length, 0);

  const openStudyModal = (docGroup) => {
    setStudyModal({ open: true, cards: docGroup.cards, docTitle: docGroup.docTitle, docId: docGroup.docId });
    setCurrentStudyIndex(0);
    setIsFlipped(false);
  };

  const closeStudyModal = () => {
    setStudyModal({ open: false, cards: [], docTitle: '' });
    setCurrentStudyIndex(0);
    setIsFlipped(false);
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentStudyIndex((prev) => (prev + 1) % studyModal.cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentStudyIndex((prev) => (prev - 1 + studyModal.cards.length) % studyModal.cards.length);
  };

  const renderStarredSection = () => {
    if (starredByDocument.length === 0) return null;

    return (
      <div className="mb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
            <Star className="w-5 h-5 text-white" fill="currentColor" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Starred Flashcards</h2>
            <p className="text-xs text-slate-500 font-medium">{totalStarredCount} cards across {starredByDocument.length} {starredByDocument.length === 1 ? 'document' : 'documents'}</p>
          </div>
        </div>

        {/* Starred Cards Container */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-linear-to-br from-amber-50/80 via-orange-50/50 to-yellow-50/80 backdrop-blur-sm shadow-lg shadow-amber-100/50">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-amber-200/30 to-orange-200/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-linear-to-tr from-yellow-200/30 to-amber-200/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative p-4 space-y-2">
            {starredByDocument.map((docGroup) => (
              <div key={docGroup.docId} className="group">
                {/* Document Row */}
                <div
                  onClick={() => setExpandedDoc(expandedDoc === docGroup.docId ? null : docGroup.docId)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/70 hover:bg-white/90 border border-amber-200/40 hover:border-amber-300/60 cursor-pointer transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 border border-amber-200/50">
                      <BookOpen className="w-4 h-4 text-amber-700" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{docGroup.docTitle}</h3>
                      <p className="text-xs text-amber-600/80 font-medium">{docGroup.cards.length} starred {docGroup.cards.length === 1 ? 'card' : 'cards'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openStudyModal(docGroup);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-linear-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                      Quick Study
                    </button>
                    <ChevronRight 
                      className={`w-5 h-5 text-amber-500 transition-transform duration-300 ${expandedDoc === docGroup.docId ? 'rotate-90' : ''}`} 
                      strokeWidth={2} 
                    />
                  </div>
                </div>

                {/* Expanded Cards Preview */}
                {expandedDoc === docGroup.docId && (
                  <div className="mt-2 ml-4 pl-4 border-l-2 border-amber-200/60 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {docGroup.cards.slice(0, 5).map((card, idx) => (
                      <div 
                        key={card._id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/60 border border-amber-100/50 hover:bg-white/80 transition-colors duration-200"
                      >
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700 text-xs font-bold shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700 line-clamp-2">{card.question}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                            <span className="text-amber-600 font-medium">A:</span> {card.answer}
                          </p>
                        </div>
                        <Star className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" strokeWidth={2} />
                      </div>
                    ))}
                    {docGroup.cards.length > 5 && (
                      <button
                        onClick={() => navigate(`/documents/${docGroup.docId}/flashcards`)}
                        className="w-full py-2 text-xs font-semibold text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors duration-200 cursor-pointer"
                      >
                        +{docGroup.cards.length - 5} more cards • View All
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Quick Study Modal
  const renderStudyModal = () => {
    if (!studyModal.open || studyModal.cards.length === 0) return null;
    const currentCard = studyModal.cards[currentStudyIndex];

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeStudyModal}>
        <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300" onClick={(e)=> e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-linear-to-r from-amber-400 to-orange-500">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-white" fill="currentColor" strokeWidth={2} />
              <div>
                <h3 className="text-white font-bold text-sm">Quick Study</h3>
                <p className="text-white/80 text-xs">{studyModal.docTitle}</p>
              </div>
            </div>
            <button
              onClick={closeStudyModal}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors duration-200 cursor-pointer"
            >
              <X className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>

          {/* Card Counter */}
          <div className="flex items-center justify-center py-3 bg-amber-50 border-b border-amber-100">
            <span className="text-sm font-semibold text-amber-700">
              Card {currentStudyIndex + 1} of {studyModal.cards.length}
            </span>
          </div>

          {/* Flashcard */}
          <div className="p-6">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="relative w-full h-64 cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div
                className="relative w-full h-full transition-all duration-500 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front - Question */}
                <div
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Question</span>
                  <p className="text-center text-lg font-semibold text-slate-800 leading-relaxed">{currentCard.question}</p>
                  <div className="flex items-center gap-2 mt-6 text-slate-400 text-sm">
                    <RotateCcw className="w-4 h-4" strokeWidth={2} />
                    <span>Tap to flip</span>
                  </div>
                </div>

                {/* Back - Answer */}
                <div
                  className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 bg-linear-to-br from-amber-500 to-orange-600 border-2 border-amber-400 rounded-2xl"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <span className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4">Answer</span>
                  <p className="text-center text-lg font-semibold text-white leading-relaxed">{currentCard.answer}</p>
                  <div className="flex items-center gap-2 mt-6 text-white/70 text-sm">
                    <RotateCcw className="w-4 h-4" strokeWidth={2} />
                    <span>Tap to flip</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100">
            <button
              onClick={prevCard}
              disabled={studyModal.cards.length <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={2.5} />
              Previous
            </button>
            <button
              onClick={() => navigate(`/documents/${studyModal.docId}/flashcards`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r whitespace-nowrap from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-xs sm:text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" strokeWidth={2} />
              Study Full Set
            </button>
            <button
              onClick={nextCard}
              disabled={studyModal.cards.length <= 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return <Spinner />;
    }
    if (flashcardSets.length === 0) {
      return <EmptyState message="No flashcard Sets Found." 
                        description="You have not created any flashcard sets yet." 
             />;
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
        {flashcardSets.map((set) => (
          <FlashcardSetCard key={set._id} flashcardSet={set} />
        ))}
      </div>
    )

  };

  return (
    <div>
      <PageHeader title="All Flashcard Sets" />
      
      {/* Starred Flashcards Section */}
      {!loading && renderStarredSection()}
      
      {/* All Flashcard Sets */}
      <div className='card-base p-4 md:p-6 rounded-2xl'>
        {renderContent()}
      </div>

      {/* Quick Study Modal */}
      {renderStudyModal()}
    </div>
  );
}
export default FlashcardsListPage;
