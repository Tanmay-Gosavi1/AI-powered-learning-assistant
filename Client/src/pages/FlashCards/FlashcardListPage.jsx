import React, { useState, useEffect } from 'react';
import flashcardService from '../../service/flashcardService';
import PageHeader from '../../components/common/PageHeader';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import FlashcardSetCard from '../../components/flashcards/FlashcardSetCard';
import toast from 'react-hot-toast';

const FlashcardsListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        const response = await flashcardService.getAllFlashcardSets();

        console.log("fetchFlashcardSets___", response.data);

        setFlashcardSets(response.data);
      } catch (error) {
        toast.error('Failed to fetch flashcard sets.');
        console.error("Error fetching flashcard sets:", error);
      } finally {
        setLoading(false);
      } 
    };

    fetchFlashcardSets();
  }, []);
  

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
          <FlashcardSetCard key={set.id} flashcardSet={set} />
        ))}
      </div>
    )

  };
  return (
    <div>
      <PageHeader title="All Flashcard Sets" />
      {renderContent()}
    </div>
  );
}
export default FlashcardsListPage;