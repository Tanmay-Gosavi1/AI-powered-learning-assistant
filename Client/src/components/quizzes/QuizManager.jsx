import React, { useState, useEffect } from 'react';
import { Plus, Trash2 , X } from 'lucide-react';
import toast from 'react-hot-toast';

import quizService from '../../service/quizService';
import aiService from '../../service/aiService';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import Modal from '../common/Modal';
import QuizCard from './QuizCard';
import EmptyState from '../common/EmptyState';

const QuizManager = ({documentId}) => {

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const data = await quizService.getQuizzesForDocument(documentId);
      setQuizzes(data.data);

    } catch (error) {
      toast.error(error.message || 'Failed to fetch quizzes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setGenerating(true);
    try {
      await aiService.generateQuiz(documentId, {numQuestions});
      toast.success('Quiz generated successfully!');
      setIsGenerateModalOpen(false);
      fetchQuizzes();
    } catch (error) {
      toast.error(error.message || 'Failed to generate quiz.');
    } finally {
      setGenerating(false);
    }
  }

  const handleDeleteRequest = async (quiz) => {
    setSelectedQuiz(quiz)
    setIsDeleteModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!selectedQuiz) return;
    setDeleting(true);
    try {
      await quizService.deleteQuiz(selectedQuiz._id);
      toast.success('Quiz deleted successfully!');
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      setQuizzes((prev) => prev.filter((q) => q._id !== selectedQuiz._id));
    }
    catch (error) {
      toast.error(error.message || 'Failed to delete quiz.');
    }
    finally {
      setDeleting(false);
    }
  }

  const renderQuizContent = () =>{
    if(loading){
      return <Spinner />;
    }

    if(quizzes.length === 0){
      return (
        <EmptyState 
          title="No Quizzes Yet"
          description="Generate quizzes to test your knowledge."
        />
      )
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {quizzes.map((quiz) => (
          <QuizCard
            key={quiz._id}
            quiz={quiz}
            onDelete={() => handleDeleteRequest(quiz)}
          />
        ))}
      </div>  
    )
  }
  return (
    <div className='bg-white border border-neutral-200 rounded-lg p-4 sm:p-6 max-w-full overflow-hidden'>
      <div className='flex justify-end gap-2 mb-4 flex-wrap'>
        <Button onClick={()=>setIsGenerateModalOpen(true)}>
          <Plus size={16}/>
          Generate Quiz
        </Button>
      </div>

      {renderQuizContent()}

      {/* Generate Quiz Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate New Quiz"
      >
        <form onSubmit={handleGenerateQuiz} className='space-y-5'>
          <div className='space-y-2'>
            <label className='uppercase font-bold text-sm text-gray-700'>
              Number of Questions
            </label>
            <div className='flex items-center gap-2'>
              <div className='flex-1 flex p-3 border-2 border-gray-300 rounded-lg gap-2 bg-white focus-within:border-blue-900 transition-colors'>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10)
                    setNumQuestions(Number.isNaN(val) ? 1 : Math.max(1, val))
                  }}
                  min={1}
                  required
                  className='w-full outline-none placeholder:text-gray-400 font-semibold text-sm text-gray-700'
                  placeholder='e.g. 5'
                />
              </div>
            </div>
            <p className='text-xs text-slate-500'>We recommend 5–10 questions for a quick practice session.</p>
          </div>

          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type="button"
              onClick={() => setIsGenerateModalOpen(false)}
              disabled={generating}
              variant='secondary'
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={generating}
            >
              {generating ? 'Generating...' : 'Generate Quiz'}
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm' onClick={() => setIsDeleteModalOpen(false)}>
          <div className='relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/50 p-6' onClick={(e) => e.stopPropagation()}>
            <button 
              className='absolute cursor-pointer top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200' 
              onClick={() => setIsDeleteModalOpen(false)}
            >
              <X className='w-5 h-5' strokeWidth={2}/>
            </button>

            {/* Modal Header */}
            <div className='mb-6'>
              <div className='w-12 h-12 rounded-xl bg-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4'>
                <Trash2 className='w-6 h-6 text-red-600' strokeWidth={2}/>
              </div>
              <h2 className='text-xl font-semibold text-slate-900 tracking-tight'>Confirm Deletion</h2>
            </div>

            {/* Content */}
            <p className='text-slate-600 text-sm mb-6'>
              Are you sure you want to delete the document : <span className='font-semibold text-slate-900'>{selectedQuiz?.title}</span> ? This action cannot be undone.
            </p>

            {/* Action buttons */}
            <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={()=>setIsDeleteModalOpen(false)}
                  disabled={deleting}
                  className='flex-1 h-11 border-2 cursor-pointer border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                 >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className='flex-1 h-11 rounded-xl bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold hover:bg-red-600 transition-all shadow-lg shadow-red-500/25 duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer'
                >
                  {deleting ? (
                    <span className='flex justify-center items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin'/>
                      Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
              </div>

          </div>
      </div>}
    </div>
  )
}

export default QuizManager
