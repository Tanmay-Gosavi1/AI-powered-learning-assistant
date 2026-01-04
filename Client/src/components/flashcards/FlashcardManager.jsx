import React , {useState , useEffect, useRef, useCallback} from 'react'
import {Plus , ChevronLeft , ChevronRight , Trash2 , ArrowLeft , Sparkles , Brain, Star, Layers} from 'lucide-react'
import toast from 'react-hot-toast';
import moment from 'moment'
import flashcardService from '../../service/flashcardService';
import aiService from '../../service/aiService';
import Spinner from '../common/Spinner';
import Modal from '../common/Modal';
import Flashcard from './Flashcard';

const FlashcardManager = ({documentId}) => {

    const [flashcardSets , setFlashcardSets] = useState([]);
    const [loading , setLoading] = useState(false);
    const [selectedSet , setSelectedSet] = useState(null);
    const [generating , setGenerating] = useState(false);
    const [currentCardIndex , setCurrentCardIndex] = useState(0);
    const [isDeleteModalOpen , setIsDeleteModalOpen] = useState(false);
    const [deleting , setDeleting] = useState(false);
    const [setToDelete , setSetToDelete] = useState(null);
    const [isRegenModalOpen , setIsRegenModalOpen] = useState(false);
    const [wasCardViewed , setWasCardViewed] = useState(false);
    const flashcardRef = useRef(null);

    const fetchFlashcardSets = useCallback(async () => {
        setLoading(true);
        try {
            const response = await flashcardService.getFlashcardsForDocument(documentId);
            const payload = response?.data;
            const sets = Array.isArray(payload) ? payload : (payload ? [payload] : []);
            setFlashcardSets(sets);
        } catch (error) {
            // If no sets remain (404), clear local state so UI updates
            setFlashcardSets([]);
            setSelectedSet(null);
            console.error(error);
        } finally{
            setLoading(false);
        }
    }, [documentId])

    useEffect(() => {
        if(documentId){
            fetchFlashcardSets();
        }
    } , [documentId, fetchFlashcardSets]);

    const handleGenerateFlashcards = async (mode, count = 10) => {
        setGenerating(true);
        try{
            await aiService.generateFlashcards(documentId, {mode , count });
            toast.success(mode === 'append' ? 'Added more flashcards.' : 'Flashcards generated successfully.');
            fetchFlashcardSets();
        }catch(error){
            toast.error('Failed to generate flashcards.');
            console.error(error);
        }finally{
            setGenerating(false);
        }
    }

    const openRegenerateConfirm = () => setIsRegenModalOpen(true);
    const confirmRegenerate = async () => {
        setIsRegenModalOpen(false);
        await handleGenerateFlashcards('overwrite');
    }

    const handleNextCard = () => {
        if(selectedSet){
            // Only review if the card was actually viewed (flipped)
            if(wasCardViewed){
                handleReview(currentCardIndex)
            }
            // Reset flip state for next card
            if(flashcardRef.current){
                flashcardRef.current.resetFlip()
            }
            setWasCardViewed(false)
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
        }
    }

    const handlePrevCard = () => {
        if(selectedSet){
            // Only review if the card was actually viewed (flipped)
            if(wasCardViewed){
                handleReview(currentCardIndex)
            }
            // Reset flip state for next card
            if(flashcardRef.current){
                flashcardRef.current.resetFlip()
            }
            setWasCardViewed(false)
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
        }
    }

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[index]
        if(!currentCard) return ;

        try {
            await flashcardService.reviewFlashcard(currentCard._id , index)
            toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard.");
            console.error(error);
        }
    }

    const handleToggleStar = async (cardId) => {
        try {
            await flashcardService.toggleStarFlashcard(cardId);
            const updatedSets = flashcardSets.map((set) => {
            if (set._id === selectedSet._id) {
                const updatedCards = set.cards.map((card) =>
                card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
                );
                return { ...set, cards: updatedCards };
            }
            return set;
            });
            setFlashcardSets(updatedSets);
            setSelectedSet(updatedSets.find((set) => set._id === selectedSet._id));
            toast.success("Flashcard starred status updated!");
        } catch (error) {
            toast.error("Failed to update starred status.");
            console.error(error);
        }
    }

    const handleDeleteRequest = (e , set) => {
        e.stopPropagation();
        setSetToDelete(set);
        setIsDeleteModalOpen(true);
    }

    const handleConfirmDelete = async () => {
        if(!setToDelete) return;
        setDeleting(true);
        try {
            await flashcardService.deleteFlashcardSet(setToDelete._id);
            toast.success("Flashcard set deleted successfully.");
            setIsDeleteModalOpen(false);
            setSetToDelete(null);
            // Optimistically update UI
            setFlashcardSets(prev => (Array.isArray(prev) ? prev.filter(s => s._id !== setToDelete._id) : []));
            setSelectedSet(prev => (prev && prev._id === setToDelete._id ? null : prev));
            // Re-fetch to ensure server truth
            fetchFlashcardSets();
        } catch (error) {
            toast.error("Failed to delete flashcard set.");
            console.error(error);
        } finally {
            setDeleting(false);
        }
    }

    const handleSelectSet = (set) => {
        setSelectedSet(set);
        setCurrentCardIndex(0);
        setWasCardViewed(false);
    }

    const handleCardFlip = (isFlipped) => {
        // Mark card as viewed when user flips to see the answer
        if(isFlipped){
            setWasCardViewed(true)
        }
    }

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        return (
            <div>
                <button
                    onClick={()=>{
                        setSelectedSet(null)
                        setWasCardViewed(false)
                    }}
                    className='group cursor-pointer inline-flex items-center gap-2 mb-6 text-sm text-slate-600 hover:text-slate-800 font-medium transition-all duration-200'
                >
                    <ArrowLeft className='w-4 h-4' strokeWidth={2}/>
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className='flex flex-col items-center space-y-8'>
                    <div className='w-full max-w-2xl'>
                        <Flashcard 
                            ref={flashcardRef}
                            key={currentCard?._id}
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                            onFlip={handleCardFlip}
                        />
                    </div>

                    {/* Navigation Controls */}
                    <div className='flex items-center gap-6'>
                        <button onClick={handlePrevCard}
                            className='flex items-center group gap-2 px-5 h-11 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                            disabled={selectedSet.cards.length <= 1}
                        >   
                            <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200' strokeWidth={2.5}/>
                            Previous
                        </button>

                        <div className='px-4 py-2 bg-slate-100 border-2 border-slate-200/70 rounded-md'>
                            <span className='text-sm font-semibold text-slate-700 whitespace-nowrap'>
                                {currentCardIndex + 1}{" "}
                                <span className='text-slate-400 font-normal'>/</span>{" "}
                                {selectedSet.cards.length}
                            </span>
                        </div>
                        <button onClick={handleNextCard}
                            disabled={selectedSet.cards.length <= 1}
                            className='flex items-center group gap-2 px-5 h-11 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            Next <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5}/></button>
                    </div>
                </div>
            </div>
        )
    }

    const renderSetList = () => {
        if(loading){
            return (
                <div className='flex justify-center items-center py-20'>
                    <Spinner />
                </div>
            )
        }

        const sets = Array.isArray(flashcardSets) ? flashcardSets : (flashcardSets ? [flashcardSets] : []);
        if(sets.length === 0){
            return (
                <div className='flex flex-col items-center justify-center py-16 px-6'>
                    <div className='inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-br from-blue-100 to-blue-50'>
                        <Brain className='w-8 h-8 text-blue-900' strokeWidth={2} />
                    </div>
                    <h3 className='text-xl font-semibold text-slate-900 mb-2'>
                        No Flashcards Yet
                    </h3>
                    <p className='text-center text-slate-600 mb-8 text-sm max-w-sm'>
                        Generate flashcards from your document to start learning and reinforce your knowledge.
                    </p>
                    <button
                        onClick={() => handleGenerateFlashcards('overwrite')}
                        disabled={generating}
                        className='group inline-flex items-center gap-2 px-6 h-12 btn-primary cursor-pointer text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 active:scale-105'
                    >
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-slate-200/50 border-t-white rounded-full animate-spin'/>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className='w-4 h-4' strokeWidth={2} />
                                Generate Flashcards
                            </>
                        )}
                    </button>
                </div>
            )
        }

        return (
            <div className='space-y-6'>
                {/* Header */}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                    <div>
                        <h3 className='text-lg font-semibold text-slate-900'>
                            Your Flashcard Sets
                        </h3>
                        <p className='text-sm text-slate-500 mt-1'>
                            {sets.length}{" "}
                            {sets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <div className='flex items-center gap-2 flex-wrap'>
                        <button
                            onClick={openRegenerateConfirm}
                            disabled={generating}
                            className='group inline-flex items-center hover:scale-105 cursor-pointer gap-2 px-4 h-11 bg-white text-blue-900 border border-blue-200 hover:bg-blue-50 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {generating ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-slate-300/50 border-t-blue-900 rounded-full animate-spin'/>
                                    Regenerating...
                                </>
                            ) : (
                                <>
                                    Regenerate
                                </>
                            )}
                        </button>
                        <button
                            onClick={() => handleGenerateFlashcards('append', 5)}
                            disabled={generating}
                            className='group inline-flex items-center hover:scale-105 cursor-pointer gap-2 px-4 h-11 btn-primary text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {generating ? (
                                <>
                                    <div className='w-4 h-4 border-2 border-slate-200/50 border-t-white rounded-full animate-spin'/>
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className='w-4 h-4' />
                                    Add 5 more
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Flashcard Sets List */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {sets.map((set) => {
                        const starredCount = set.cards?.filter(c => c.isStarred).length || 0;
                        const totalCards = set.cards?.length || 0;
                        const reviewedCount = set.cards?.filter(c => c.lastReviewed || (c.reviewCount ?? 0) > 0).length || 0;
                        
                        return (
                        <div 
                            key={set._id}
                            onClick={() => handleSelectSet(set)}
                            className='group relative card-base card-hover hover-glow p-6 cursor-pointer overflow-hidden'
                        >
                            {/* Background decoration */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-linear-to-tr from-cyan-400/10 to-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                            
                            <button 
                                onClick={(e)=>handleDeleteRequest(e,set)}
                                className='absolute top-4 right-4 p-2 text-slate-400 cursor-pointer hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 z-10'
                            >
                                <Trash2 className='w-4 h-4' strokeWidth={2} />
                            </button>

                            {/* Set Content */}
                            <div className='relative space-y-4'>
                                <div className='flex items-start gap-3'>
                                    <div className='shrink-0 w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 group-hover:scale-105 transition-all duration-300'>
                                        <Brain className='w-6 h-6 text-white' strokeWidth={2} />
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <h4 className='text-base font-bold text-slate-800 group-hover:text-blue-900 transition-colors duration-300'>Flashcard Set</h4>
                                        <p className='text-xs text-blue-500/70 font-medium tracking-wide'>
                                            Created {moment(set.createdAt).fromNow()}
                                        </p>
                                    </div>
                                </div>

                                {/* Stats Row */}
                                <div className='flex items-center flex-wrap gap-2 pt-2'>
                                    <div className='flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-lg'>
                                        <Layers className='w-3.5 h-3.5 text-blue-600' strokeWidth={2.5} />
                                        <span className='text-sm font-semibold text-blue-700'>
                                            {totalCards} {totalCards === 1 ? 'Card' : 'Cards'}
                                        </span>
                                    </div>
                                    {starredCount > 0 && (
                                        <div className='flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-lg'>
                                            <Star className='w-3.5 h-3.5 text-amber-500' fill='currentColor' strokeWidth={2} />
                                            <span className='text-sm font-semibold text-amber-700'>
                                                {starredCount}
                                            </span>
                                        </div>
                                    )}
                                    {reviewedCount > 0 && (
                                        <div className='flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-lg'>
                                            <span className='text-sm font-semibold text-emerald-700'>
                                                {reviewedCount}/{totalCards} reviewed
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Study Action */}
                                <div className='pt-3 mt-2 border-t border-slate-100'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-xs text-slate-500 font-medium'>Click to study</span>
                                        <div className='flex items-center gap-1 text-blue-600 group-hover:text-blue-700 transition-colors duration-200'>
                                            <Sparkles className='w-3.5 h-3.5 group-hover:rotate-12 transition-transform duration-300' strokeWidth={2} />
                                            <span className='text-xs font-semibold'>Start Learning</span>
                                            <ChevronRight className='w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                </div>

            </div>

            
        )
    }
  return (
    <>
        <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/60 p-4 sm:p-8 max-w-full overflow-hidden'>
            {selectedSet ? renderFlashcardViewer() : renderSetList()}
        </div>

        <Modal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            title="Delete Flashcard Set"
        >
            <div className='space-y-6'>
                <p className='text-sm text-slate-600'>
                    Are you sure you want to delete this flashcard set? This action cannot be undone.
                </p>
                <div className='flex items-center justify-end gap-3 pt-2'>
                    <button onClick={() => setIsDeleteModalOpen(false)} type='button' disabled={deleting} className='px-4 cursor-pointer hover:scale-105 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        Cancel
                    </button>

                    <button onClick={handleConfirmDelete} disabled={deleting} className='px-4 cursor-pointer hover:scale-105 h-10 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {deleting ? (
                            <span className='flex items-center gap-2'>
                                <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2' />
                                Deleting...
                            </span>
                        ) : 'Delete Set'}
                    </button>
                </div>
            </div>
        </Modal>

        <Modal
            isOpen={isRegenModalOpen}
            onClose={() => setIsRegenModalOpen(false)}
            title="Regenerate Flashcards"
        >
            <div className='space-y-6'>
                <p className='text-sm text-slate-600'>
                    This will overwrite your current flashcards with a new set. Continue?
                </p>
                <div className='flex items-center justify-end gap-3 pt-2'>
                    <button onClick={() => setIsRegenModalOpen(false)} type='button' disabled={generating} className='px-4 cursor-pointer hover:scale-105 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        Cancel
                    </button>
                    <button onClick={confirmRegenerate} disabled={generating} className='px-4 cursor-pointer hover:scale-105 h-10 btn-primary text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                        {generating ? (
                            <span className='flex items-center gap-2'>
                                <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white inline-block mr-2' />
                                Regenerating...
                            </span>
                        ) : 'Regenerate'}
                    </button>
                </div>
            </div>
        </Modal>
    </>
  )
}

export default FlashcardManager