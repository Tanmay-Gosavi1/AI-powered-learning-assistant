import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

import flashcardService from "../../service/flashcardService";
import aiService from "../../service/aiService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import EmptyState from "../../components/common/EmptyState";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Flashcard from "../../components/flashcards/Flashcard";
const FlashcardPage = () => {

  const { id: documentId } = useParams();
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getFlashcardsForDocument(
        documentId
      );
      setFlashcardSets(response.data[0]);
      setFlashcards(response.data[0]?.cards || []);
    } catch (error) {
      toast.error("Failed to fetch flashcards.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFlashcards();
  }, [documentId]);

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

  return (
    <div>FlashcardPage</div>
  )
}

export default FlashcardPage
