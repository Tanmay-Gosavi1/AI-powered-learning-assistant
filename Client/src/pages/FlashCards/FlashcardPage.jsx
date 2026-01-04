import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, ChevronLeft, ChevronRight, Trash2, Sparkles, Brain } from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../service/flashcardService";
import aiService from "../../service/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";


const FlashcardPage = () => {

  const { id: documentId } = useParams();
  const [flashcardSets , setFlashcardSets] = useState([]);
  const [selectedSet , setSelectedSet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isRegenModalOpen , setIsRegenModalOpen] = useState(false);
  const [wasCardViewed , setWasCardViewed] = useState(false);
  const flashcardRef = useRef(null);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      setLoading(true);
      try {
        const response = await flashcardService.getFlashcardsForDocument(documentId);
        const payload = response?.data;
        const sets = Array.isArray(payload) ? payload : (payload ? [payload] : []);
        setFlashcardSets(sets);
        // Auto-select first set if available
        if(sets.length > 0){
          setSelectedSet(sets[0]);
          setCurrentCardIndex(0);
          setWasCardViewed(false);
        } else {
          setSelectedSet(null);
        }
      } catch (error) {
        setFlashcardSets([]);
        setSelectedSet(null);
        toast.error("Failed to fetch flashcards.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if(documentId){
      fetchFlashcardSets();
    }
  }, [documentId]);

    const handleGenerateFlashcards = async (mode, count = 10) => {
      setGenerating(true);
      try{
          await aiService.generateFlashcards(documentId, {mode , count });
          toast.success(mode === 'append' ? 'Added more flashcards.' : 'Flashcards generated successfully.');
          // Refresh sets
          const response = await flashcardService.getFlashcardsForDocument(documentId);
          const payload = response?.data;
          const sets = Array.isArray(payload) ? payload : (payload ? [payload] : []);
          setFlashcardSets(sets);
          if(sets.length > 0){
            setSelectedSet(sets[0]);
            setCurrentCardIndex(0);
            setWasCardViewed(false);
          }
      }catch(error){
          toast.error('Failed to generate flashcards.');
          console.error(error);
      }finally{
          setGenerating(false);
      }
  }

    const handleNextCard = () => {
        if(wasCardViewed){
          handleReview(currentCardIndex)
        }
        if(flashcardRef.current){
          flashcardRef.current.resetFlip()
        }
        setWasCardViewed(false)
        if(selectedSet){
          setCurrentCardIndex((prevIndex) => (prevIndex + 1) % selectedSet.cards.length);
        }
    }

    const handlePrevCard = () => {
            if(wasCardViewed){
              handleReview(currentCardIndex)
            }
            if(flashcardRef.current){
              flashcardRef.current.resetFlip()
            }
            setWasCardViewed(false)
            if(selectedSet){
              setCurrentCardIndex((prevIndex) => (prevIndex - 1 + selectedSet.cards.length) % selectedSet.cards.length);
            }
    }
    
    const handleReview = async (index) => {
        const currentCard = selectedSet?.cards[index]
        if(!currentCard) return ;

        try {
            await flashcardService.reviewFlashcard(currentCard._id , index)
            // toast.success("Flashcard reviewed!");
        } catch (error) {
            toast.error("Failed to review flashcard.");
            console.error(error);
        }
    }

    const handleToggleStar = async (cardId) => {
      try {
          await flashcardService.toggleStarFlashcard(cardId);
          // Update selected set's cards
          setSelectedSet((prev) => {
            if(!prev) return prev;
            const updatedCards = prev.cards.map((card) =>
              card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
            );
            return { ...prev, cards: updatedCards };
          });
          // Keep flashcardSets in sync
          setFlashcardSets((prevSets) => {
            if(!Array.isArray(prevSets)) return prevSets;
            return prevSets.map((set) => {
              if(set._id !== (selectedSet?._id)) return set;
              const updatedCards = set.cards.map((card) =>
                card._id === cardId ? { ...card, isStarred: !card.isStarred } : card
              );
              return { ...set, cards: updatedCards };
            });
          });
          toast.success("Flashcard starred status updated!");
      } catch (error) {
          toast.error("Failed to update starred status.");
          console.error(error);
      }
    }

    const handleDeleteFlashcards = async () => {
      setDeleting(true);
      try {
        await flashcardService.deleteFlashcardSet(selectedSet?._id || documentId);
        toast.success("Flashcard set deleted successfully.");
        setIsDeleteModalOpen(false);
        // Refresh sets
        const response = await flashcardService.getFlashcardsForDocument(documentId);
        const payload = response?.data;
        const sets = Array.isArray(payload) ? payload : (payload ? [payload] : []);
        setFlashcardSets(sets);
        setSelectedSet(sets[0] || null);
        setCurrentCardIndex(0);
        setWasCardViewed(false);
      } catch (error) {
        toast.error("Failed to delete flashcard set.");
        console.error(error);
      } finally {
        setDeleting(false);
      }
    }  

    const renderFlashcardViewer = () => {
      const currentCard = selectedSet?.cards[currentCardIndex]
      return (
        <div>
          <button
            onClick={()=>{ setSelectedSet(null); setWasCardViewed(false);} }
            className='group cursor-pointer inline-flex items-center gap-2 mb-6 text-sm text-slate-600 hover:text-slate-800 font-medium transition-all duration-200'
          >
            <ArrowLeft className='w-4 h-4' strokeWidth={2}/>
            Back to Sets
          </button>

          <div className='flex flex-col items-center space-y-8'>
            <div className='w-full max-w-2xl'>
              <Flashcard 
                ref={flashcardRef}
                key={currentCard?._id}
                flashcard={currentCard}
                onToggleStar={handleToggleStar}
                onFlip={(isFlipped)=> setWasCardViewed(!!isFlipped)}
              />
            </div>

            <div className='flex items-center gap-6'>
              <button onClick={handlePrevCard}
                className='flex items-center group gap-2 px-5 h-11 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                disabled={selectedSet?.cards.length <= 1}
              >
                <ChevronLeft className='w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200' strokeWidth={2.5}/>
                Previous
              </button>

              <div className='px-4 py-2 bg-slate-100 border-2 border-slate-200/70 rounded-md'>
                <span className='text-sm font-semibold text-slate-700 whitespace-nowrap'>
                  {currentCardIndex + 1} <span className='text-slate-400 font-normal'>/</span> {selectedSet?.cards.length || 0}
                </span>
              </div>

              <button onClick={handleNextCard}
                disabled={selectedSet?.cards.length <= 1}
                className='flex items-center group gap-2 px-5 h-11 bg-slate-100 rounded-md hover:bg-slate-200 text-slate-700 text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next <ChevronRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' strokeWidth={2.5}/>
              </button>
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
            <h3 className='text-xl font-semibold text-slate-900 mb-2'>No Flashcards Yet</h3>
            <p className='text-center text-slate-600 mb-8 text-sm max-w-sm'>Generate flashcards from your document to start learning and reinforce your knowledge.</p>
            <button onClick={()=>handleGenerateFlashcards('overwrite')} disabled={generating} className='group inline-flex items-center gap-2 px-6 h-12 btn-primary cursor-pointer text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 active:scale-105'>
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
          <div className='flex items-center justify-between'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>Your Flashcard Sets</h3>
              <p className='text-sm text-slate-500 mt-1'>{sets.length} {sets.length === 1 ? 'set' : 'sets'} available</p>
            </div>
            <div className='flex items-center gap-2'>
              <button onClick={()=>setIsRegenModalOpen(true)} disabled={generating} className='group inline-flex items-center hover:scale-105 cursor-pointer gap-2 px-4 h-11 bg-yellow-400 text-blue-900 border border-blue-200 hover:bg-blue-50 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
                {generating ? (<><div className='w-4 h-4 border-2 border-slate-300/50 border-t-blue-900 rounded-full animate-spin'/>Regenerating...</>) : (<>Regenerate</>)}
              </button>
              <button onClick={()=>handleGenerateFlashcards('append',5)} disabled={generating} className='group inline-flex items-center hover:scale-105 cursor-pointer gap-2 px-4 h-11 btn-primary text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 disabled:opacity-50 disabled:cursor-not-allowed'>
                {generating ? (<><div className='w-4 h-4 border-2 border-slate-200/50 border-t-white rounded-full animate-spin'/>Adding...</>) : (<><Plus className='w-4 h-4' />Add 5 more</>)}
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
            {sets.map((set)=>(
              <div key={set._id} onClick={()=>{setSelectedSet(set); setCurrentCardIndex(0); setWasCardViewed(false);}} className='group relative card-base card-hover hover-glow p-6 cursor-pointer'>
                <button onClick={(e)=>{e.stopPropagation(); setIsDeleteModalOpen(true);}} className='absolute top-4 right-4 p-2 text-slate-400 cursor-pointer hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100'>
                  <Trash2 className='w-4 h-4' strokeWidth={2} />
                </button>
                <div className='space-y-4'>
                  <div className='inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-blue-100 to-blue-50'>
                    <Brain className='w-4 h-4 text-blue-900' strokeWidth={2} />
                  </div>
                  <div>
                    <h4 className='text-base mb-1 font-semibold text-slate-900'>Flashcard Set</h4>
                    {/* createdAt may not be included in payload; keep simple label */}
                    <p className='text-xs text-slate-500 font-medium uppercase tracking-wide'>Open to study</p>
                  </div>
                </div>
                <div className='flex items-center gap-2 pt-2 border-t border-slate-100'>
                  <div className='px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg'>
                    <span className='text-sm font-semibold text-blue-900'>{set.cards?.length ?? 0} {(set.cards?.length ?? 0) === 1 ? 'card' : 'cards'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

  return (
    <div className="">
      <div >
        <Link to={`/documents/${documentId}`}
          className='flex items-center gap-2 text-sm font-semibold py-2 hover:scale-105 w-fit cursor-pointer text-blue-800 hover:text-blue-900 transition-all duration-250'
        >
          <ArrowLeft className='w-3.5 h-3.5' strokeWidth={2.5} /> Back to Document
        </Link>
      </div>
      <PageHeader title="Flashcards">
        <div className='flex items-center gap-2'>
          <Button onClick={()=>setIsRegenModalOpen(true)} disabled={generating} className="bg-blue-200">
            {generating ? 'Regenerating...' : 'Regenerate'}
          </Button>
          <Button onClick={()=>handleGenerateFlashcards('append',5)} disabled={generating}>
            <Plus className='w-4 h-4' strokeWidth={2}/> Add 5 more
          </Button>
          {selectedSet && (
            <Button onClick={()=>setIsDeleteModalOpen(true)} disabled={deleting} variant="outline" className="hover:bg-red-100 hover:text-red-600 hover:border-red-500/50">
              <Trash2 className='w-4 h-4' strokeWidth={2}/> Delete Set
            </Button>
          )}
        </div>
      </PageHeader>

      <div className='card-base p-6 rounded-2xl'>
        {loading ? (
          <div className='flex justify-center items-center py-12'><Spinner /></div>
        ) : selectedSet ? renderFlashcardViewer() : renderSetList()}
      </div>

      {/* Delete Confirmation Modal */}
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

                    <button onClick={handleDeleteFlashcards} disabled={deleting} className='px-4 cursor-pointer hover:scale-105 h-10 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
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

{/*  Regenerate Flashcards Modal */}
      <Modal
        isOpen={isRegenModalOpen}
        onClose={()=>setIsRegenModalOpen(false)}
        title="Regenerate Flashcards"
      >
        <div className='space-y-6'>
          <p className='text-sm text-slate-600'>This will overwrite your current flashcards with a new set. Continue?</p>
          <div className='flex items-center justify-end gap-3 pt-2'>
            <button onClick={()=>setIsRegenModalOpen(false)} type='button' disabled={generating} className='px-4 cursor-pointer hover:scale-105 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
              Cancel
            </button>
            <button onClick={()=>{ setIsRegenModalOpen(false); handleGenerateFlashcards('overwrite'); }} disabled={generating} className='px-4 cursor-pointer hover:scale-105 h-10 btn-primary text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'>
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

    </div>
  )
}

export default FlashcardPage
