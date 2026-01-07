import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import documentService from "../../service/docService";
import Spinner from "../../components/common/Spinner";
import toast from "react-hot-toast";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Tab from "../../components/common/Tab";
import ChatInterface from "../../components/chat/ChatInterface";
import AiAction from "../../components/ai/AiAction";
import Flashcard from "../../components/flashcards/Flashcard";
import FlashcardManager from "../../components/flashcards/FlashcardManager";
import QuizManager from "../../components/quizzes/QuizManager";

const DocumentDetailPage = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Content");

  useEffect(() => {
    const fetchDocumentDetails = async () => {
      try {
        const data = await documentService.getDocumentById(id);
        setDocument(data);
      } catch (error) {
        toast.error("Failed to fetch document details.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentDetails();
  }, [id]);

  if (loading) return <Spinner />;

  const getPdfUrl = () => {
    if(!document?.data?.filePath) return null;
    const filePath = document.data.filePath;

    // If it's already a full URL (including Cloudinary URLs), return as-is
    if (
      filePath.startsWith("http://") ||
      filePath.startsWith("https://")
    ) {
      return filePath;
    }

    // Fallback for local development (if any old documents exist)
    const baseUrl = import.meta.env.VITE_API_URL; 
    return `${baseUrl}${filePath.startsWith("/") ? "" : "/"}${filePath}`;
  };

const renderContent = () => {
  if (loading) {
    return <Spinner />;
  }

  if (!document || !document.data || !document.data.filePath) {
    return <div className="text-center p-8">PDF not available.</div>;
  }

  const pdfUrl = getPdfUrl();
  
  // Use Mozilla's PDF.js viewer - gives us full control and no unwanted popout buttons
  const viewerUrl = pdfUrl.includes('cloudinary.com') 
    ? `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(pdfUrl)}`
    : pdfUrl;

  return (
    <div className="bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
      <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-300 ">
        <span className="text-sm font-medium text-gray-700">Document Viewer</span>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          <ExternalLink size={16} />
          Download PDF
        </a>
      </div>
      <div className="bg-gray-10 p-1">
        <iframe
          src={viewerUrl}
          className="w-full h-[70vh] bg-white rounded border border-gray-300"
          title="PDF Viewer"
          frameBorder="0"
          allow="fullscreen"
          style={{
            colorScheme : "light"
          }}
        />
      </div>
    </div>
  )}

  const renderChat = () => {
    return <ChatInterface />
  }

  const renderAIActions = () => {
    return <AiAction />
  }

  const renderFlashcardsTabs = () => {
    return <FlashcardManager documentId={id} />
  }

  const renderQuizzesTabs = () => {
    return <QuizManager documentId={id} />
  }

  const tabs = [
    {name : "Content" , label : "Content", content: renderContent()},
    {name : "Chat" , label : "Chat", content: renderChat()},
    {name : "AI Actions" , label : "AI Actions", content: renderAIActions()},
    {name : "Flashcards" , label : `Flashcards`, content: renderFlashcardsTabs()},
    {name : "Quizzes" , label : `Quizzes`, content: renderQuizzesTabs()},
  ]

  if(!document) {
    return <div className="text-center p-8">Document not found.</div>
  }
 
  return (
    <div>
      <div className="mb-4">
        <Link to="/documents" className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
          <ArrowLeft size={16} />
          Back to Documents
        </Link>
      </div>
      <PageHeader title={document.data.title} />
      <Tab tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}
export default DocumentDetailPage