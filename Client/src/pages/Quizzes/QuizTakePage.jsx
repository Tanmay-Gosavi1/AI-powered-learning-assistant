import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import quizService from "../../service/quizService";
import PageHeader from "../../components/common/PageHeader";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";

const QuizTakePage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await quizService.getQuizById(quizId);
        setQuiz(response.data?.data || response.data);
      } catch (error) {
        toast.error("Failed to load quiz");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const backToDocument = () => {
    const docId = quiz?.documentId ;
    if (docId) return navigate(`/documents/${docId}`)
    return navigate('/dashboard')
  }

  const handleOptionChange = (questionId , optionIndex) =>{
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions?.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
  setSubmitting(true);

  try {
    const formattedAnswers = Object.keys(selectedAnswers).map((questionId) => {
      const questionIndex = quiz.questions.findIndex(
        (q) => q._id === questionId
      );

      const optionIndex = selectedAnswers[questionId];
      const selectedAnswer =
        quiz.questions[questionIndex].options[optionIndex];

      return {
        questionIndex,
        selectedAnswer,
      };
    });

    await quizService.submitQuiz(quizId, formattedAnswers);

    toast.success("Quiz submitted successfully!");
    navigate(`/quizzes/${quizId}/results`);
  } catch (error) {
    toast.error(error.message || "Failed to submit quiz.");
  } finally {
    setSubmitting(false);
  }
};


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner label="Loading quiz..." />
      </div>
    );

  if (!quiz || quiz.questions?.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-slate-700 text-lg font-semibold">
            Quiz not found or has no questions.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions?.[currentQuestionIndex];
  const answeredCount = Object.keys(selectedAnswers).length; 

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <button onClick={backToDocument}
          className='flex items-center gap-2 text-sm font-semibold py-2 cursor-pointer text-blue-800 hover:text-blue-900 hover:scale-105 transition-all duration-150'
        >
          <ChevronLeft className='w-3.5 h-3.5' strokeWidth={2.5} /> Back to Document
      </button>
      <PageHeader
        title={quiz.title || "Take Quiz"}
        subtitle={`${quiz.questions?.length} questions • ${answeredCount} answered`}
      />

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Question {currentQuestionIndex + 1} of {quiz.questions?.length}
          </span>
          <span className="font-medium">
            {Math.round((answeredCount / quiz.questions?.length) * 100)}% complete
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full btn-primary transition-all duration-500"
            style={{ width: `${(answeredCount / quiz.questions?.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 p-4 border-b border-slate-100">
          <div className="w-2 h-2 rounded-full bg-blue-600" />
          <span className="text-xs font-semibold text-slate-600">
            Question {currentQuestionIndex + 1}
          </span>
        </div>

        <div className="p-5 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight mb-4">
            {currentQuestion?.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion?.options.map((option, index) => {
              const isSelected = selectedAnswers[currentQuestion._id] === index;
              return (
                <label
                  key={index}
                  className={`group relative flex items-center gap-3 rounded-xl border p-3 sm:p-4 cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? "border-blue-600 bg-primary-soft shadow-primary-25"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion._id}`}
                    value={index}
                    checked={isSelected}
                    onChange={() => handleOptionChange(currentQuestion._id, index)}
                    className="sr-only"
                  />

                  {/* Custom radio */}
                  <span
                    className={`flex items-center justify-center w-5 h-5 rounded-full border transition-colors ${
                      isSelected ? "border-blue-600" : "border-slate-300"
                    }`}
                  >
                    <span
                      className={`w-2.5 h-2.5 rounded-full transition-opacity ${
                        isSelected ? "opacity-100 bg-blue-600" : "opacity-0"
                      }`}
                    />
                  </span>

                  {/* Option text */}
                  <span className="flex-1 text-sm sm:text-base text-slate-800">
                    {option}
                  </span>

                  {isSelected && (
                    <CheckCircle2 className="text-blue-600" strokeWidth={2.5} />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
            <ChevronLeft strokeWidth={2.5} />
            Previous
          </Button>

          {currentQuestionIndex === quiz.questions?.length - 1 ? (
            <Button onClick={handleSubmitQuiz} disabled={submitting} className="gap-2">
              {submitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <CheckCircle2 strokeWidth={2.5} />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} disabled={submitting}>
              Next
              <ChevronRight strokeWidth={2.5} />
            </Button>
          )}
        </div>

        {/* Question quick nav - sticky horizontal bar */}
        <div className="w-full">
          <div className="sticky bottom-0 z-10  backdrop-blur-sm border-t border-slate-200">
            <div className="px-3 py-2">
              <div className="flex items-center justify-center gap-2 flex-wrap md:flex-nowrap md:overflow-x-auto">
                {quiz.questions?.map((q, index) => {
                  const isAnsweredQuestion = Object.prototype.hasOwnProperty.call(
                    selectedAnswers,
                    q._id
                  );
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={q._id || index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      disabled={submitting}
                      className={`h-9 w-9 shrink-0 rounded-lg text-sm font-semibold transition-all duration-300 border ${
                        isCurrent
                          ? "btn-primary text-white border-transparent shadow-primary-25"
                          : isAnsweredQuestion
                          ? "border-green-300 bg-green-50 text-green-700 hover:bg-green-100"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      title={isAnsweredQuestion ? "Answered" : "Unanswered"}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizTakePage