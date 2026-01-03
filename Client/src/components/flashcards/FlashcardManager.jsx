import React , {useState , useEffect} from 'react'
import {Plus , ChevronLeft , ChevronRight , Trash2 , ArrowLeft , Sparkles , Brain} from 'lucide-react'
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

    const fetchFlashcardSets = async () => {
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
    }

    useEffect(() => {
        if(documentId){
            fetchFlashcardSets();
        }
    } , [documentId]);

    const handleGenerateFlashcards = async () => {
        setGenerating(true);
        try{
            await aiService.generateFlashcards(documentId);
            toast.success("Flashcards generated successfully.");
            fetchFlashcardSets();
        }catch(error){
            toast.error("Failed to generate flashcards.");
            console.error(error);
        }finally{
            setGenerating(false);
        }
    }

    const handleNextCard = () => {
        if(selectedSet){
            handleReview(currentCardIndex)
            setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
        }
    }

    const handlePrevCard = () => {
        if(selectedSet){
            handleReview(currentCardIndex)
            setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
        }
    }

    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[currentCardIndex]
        if(!currentCard) return ;

        try {
            await flashcardService.reviewFlashcard(currentCard._id , index)
            toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard.");
            console.error(error);
        }
    }

    const handleToggleStar = async (flashcardId) => {

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
    }

    const renderFlashcardViewer = () => {
        const currentCard = selectedSet?.cards[currentCardIndex];
        return (
            <div>
                <button
                    onClick={()=>setSelectedSet(null)}
                    className='group cursor-pointer inline-flex items-center gap-2 mb-6 text-sm text-slate-600 hover:text-slate-800 font-medium transition-all duration-200'
                >
                    <ArrowLeft className='w-4 h-4' strokeWidth={2}/>
                    Back to Sets
                </button>

                {/* Flashcard Display */}
                <div className='flex flex-col items-center space-y-8'>
                    <div className='w-full max-w-2xl'>
                        <Flashcard 
                            flashcard={currentCard}
                            onToggleStar={handleToggleStar}
                        />
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
                        onClick={handleGenerateFlashcards}
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
                <div className='flex items-center justify-between'>
                    <div>
                        <h3 className='text-lg font-semibold text-slate-900'>
                            Your Flashcard Sets
                        </h3>
                        <p className='text-sm text-slate-500 mt-1'>
                            {sets.length}{" "}
                            {sets.length === 1 ? "set" : "sets"} available
                        </p>
                    </div>
                    <button
                        onClick={handleGenerateFlashcards}
                        disabled={generating}
                        className='group inline-flex items-center gap-2 px-5 h-11 btn-primary text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 active:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                        {generating ? (
                            <>
                                <div className='w-4 h-4 border-2 border-slate-200/50 border-t-white rounded-full animate-spin'/>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Plus className='w-4 h-4' />
                                Generate New Set
                            </>
                        )}
                    </button>
                </div>

                {/* Flashcard Sets List */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {sets.map((set) => (
                        <div 
                            key={set._id}
                            onClick={() => handleSelectSet(set)}
                            className='group relative bg-white/80 backdrop-blur-xl border-2 border-slate-200 hover:border-primary-300 rounded-2xl shadow-md shadow-slate-200/60 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-primary-25'
                        >
                            <button 
                                onClick={(e)=>handleDeleteRequest(e,set)}
                                className='absolute top-4 right-4 p-2 text-slate-400 cursor-pointer hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'
                            >
                                <Trash2 className='w-4 h-4' strokeWidth={2} />
                            </button>

                            {/* Set Content */}
                            <div className='space-y-4'>
                                <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-100 to-blue-50'>
                                    <Brain className='w-4 h-4 text-blue-900' strokeWidth={2} />
                                </div>

                                <div>
                                    <h4 className='text-base mb-1 font-semibold text-slate-900'>Flashcard Set</h4>
                                    <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>
                                        Created {moment(set.createdAt).format("MMM D, YYYY")}
                                    </p>
                                </div>
                            </div>

                            <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
                                <div className='px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg'>
                                    <span className='text-sm font-semibold text-blue-900'>
                                        {set.cards?.length ?? 0}{" "}
                                        {(set.cards?.length ?? 0) === 1 ? "card" : "cards"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            
        )
    }
  return (
    <>
        <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/60 p-8'>
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
    </>
  )
}

export default FlashcardManager