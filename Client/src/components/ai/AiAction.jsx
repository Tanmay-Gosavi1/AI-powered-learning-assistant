import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";
import aiService from "../../service/aiService";
import toast from "react-hot-toast";
import MarkdownRenderer from "../common/MarkdownRenderer";
import Modal from "../common/Modal";
import insightService from "../../service/insightService";

const AiAction = () => {
    const { id: documentId } = useParams();
    const [loadingAction, setLoadingAction] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState("");
    const [modalTitle, setModalTitle] = useState("");
    const [concept, setConcept] = useState("");
    const [generatedItems, setGeneratedItems] = useState([]); // {id, type: 'summary'|'explain', title, content}
    const [editingId, setEditingId] = useState(null);
    const [editingTitle, setEditingTitle] = useState("");

    // Load persisted insights on mount
    React.useEffect(() => {
        const loadInsights = async () => {
            try {
                const res = await insightService.getInsightsByDocument(documentId);
                setGeneratedItems(res.data || []);
            } catch (err) {
                console.error(err);
            }
        };
        loadInsights();
    }, [documentId]);

    const handleGenerateSummary = async () => {
        setLoadingAction("summary");
        try {
            const response = await aiService.generateSummary(documentId);
            const summary = response?.data?.summary || response?.data?.data?.summary;
            const title = "Generated Summary";
            setModalTitle(title);
            setModalContent(summary || "");
            setIsModalOpen(true);
            if (summary) {
                try {
                    const saved = await insightService.createInsight({ documentId, type: 'summary', title, content: summary });
                    setGeneratedItems(prev => [saved.data, ...prev]);
                } catch (err) {
                    console.error(err);
                }
            }
        } catch (error) {
            toast.error("Failed to generate summary.");
            console.error(error);
        } finally {
            setLoadingAction(null);
        }
    };

    const handleExplainConcept = async (e) => {
        e.preventDefault();
        if(!concept.trim()) {
            toast.error("Please enter a concept to explain.");
            return;
        }
        setLoadingAction("explain");
        try{
            const response = await aiService.explainConcept(documentId, concept.trim());
            const explanation = response?.data?.explanation || response?.data?.data?.explanation;
            const title = `Explanation of "${concept.trim()}"`;
            setModalTitle(title);
            setModalContent(explanation || "");
            setIsModalOpen(true);
            setConcept("");
            if (explanation) {
                try {
                    const saved = await insightService.createInsight({ documentId, type: 'explain', title, content: explanation });
                    setGeneratedItems(prev => [saved.data, ...prev]);
                } catch (err) {
                    console.error(err);
                }
            }
        }catch(error){
            toast.error("Failed to explain concept.");
            console.error(error);
        }finally{
            setLoadingAction(null);
        }
    }


  return (
    <>
        <div className="bg-white-80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow shadow-slate-200/60 overflow-hidden max-w-full">
        {/* Header */}
            <div className="px-4 sm:px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
                <div className="flex items-center gap-3 ">
                    <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-900 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-900/25">
                        <Sparkles className="text-white w-5 h-5" strokeWidth={2}/>
                    </div>
                    <div className="">
                        <h3 className="text-lg font-semibold text-slate-900">
                            AI Assistant
                        </h3>
                        <p className="text-xs text-slate-500">
                            Powered by advanced AI
                        </p>
                    </div>
                </div>
            </div>

            <div  className="p-4 sm:p-6 space-y-6">
                {/* /Generate Summary */}
                <div className="group p-4 sm:p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-700" strokeWidth={2}/>
                                </div>
                                <h4 className="font-semibold text-slate-900">
                                    Generate Summary
                                </h4>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">Get a concise summary of the document.</p>
                        </div>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={loadingAction === "summary"}
                            className={`w-full sm:w-auto shrink-0 h-10 px-5 bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 cursor-pointer font-semibold text-white rounded-xl transition-all duration-300 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed hover:scale-105 shadow-md shadow-blue-500/25`}
                        >
                            {loadingAction === "summary" ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                    Loading...
                                </span> 
                            ) : ("Summarize")}
                        </button>
                    </div>
                </div>

                {/* Explain Concept */}
                <div className="group p-4 sm:p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-lg transition-all duration-300">
                    <form onSubmit={handleExplainConcept}>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                                <Lightbulb className="w-4 h-4 text-amber-600" strokeWidth={2}/>
                            </div>
                            <h4 className="font-semibold text-slate-900">
                                Explain a Concept
                            </h4>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">Enter a topic or concept from the document to get an detailed explanation.</p>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                            <input 
                                type="text" 
                                value={concept}
                                onChange={e => setConcept(e.target.value)}
                                placeholder="e.g., React hooks"
                                className="flex-1 h-11 px-4 border-2 border-slate-200/60 rounded-xl bg-slate-100/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-amber-200/40 focus:border-amber-400/50"
                                disabled={loadingAction === "explain"}
                            />
                            <button className="w-full sm:w-auto shrink-0 h-11 px-5 btn-primary text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md shadow-primary-25 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 cursor-pointer" type="submit">
                                {loadingAction==='explain' ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                        Loading...
                                    </span>
                                ) : ("Explain")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Generated Items List */}
            {generatedItems.length > 0 && (
                <div className="p-4 sm:p-6 pt-0">
                    <div className="group p-4 sm:p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 transition-all duration-300 hover:shadow-lg  hover:bg-white">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-blue-900" />
                            </div>
                            <h4 className="font-semibold text-slate-900">History</h4>
                        </div>
                        <div className="space-y-2 ">
                            {generatedItems.map(item => {
                                const key = item._id || item.id;
                                const isEditing = editingId === key;
                                return (
                                    <div
                                        key={key}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            if (isEditing) return; // do not open modal while editing
                                            setModalTitle(item.title);
                                            setModalContent(item.content);
                                            setIsModalOpen(true);
                                        }}
                                        className="w-full cursor-pointer text-left flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200/60 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'summary' ? 'bg-linear-to-br from-blue-100 to-cyan-100' : 'bg-linear-to-br from-amber-100 to-orange-100'}`}>
                                                {item.type === 'summary' ? (
                                                    <BookOpen className="w-4 h-4 text-blue-700" />
                                                ) : (
                                                    <Lightbulb className="w-4 h-4 text-amber-600" />
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <input
                                                    value={editingTitle}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => setEditingTitle(e.target.value)}
                                                    className="text-sm font-medium text-slate-800 bg-white border border-slate-300 rounded px-2 py-1"
                                                />
                                            ) : (
                                                <span className="text-sm font-medium text-slate-800">{item.title}</span>
                                            )}
                                        </div>
                                        {isEditing ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    className="text-xs text-blue-900 font-semibold transition-all hover:bg-blue-100 px-2 py-1 rounded duration-200 cursor-pointer"
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        try {
                                                            const res = await insightService.updateInsightTitle(key, editingTitle.trim());
                                                            setGeneratedItems(prev => prev.map(it => (it._id || it.id) === key ? res.data : it));
                                                            setEditingId(null);
                                                            setEditingTitle("");
                                                        } catch (err) {
                                                            console.error(err);
                                                        }
                                                    }}
                                                >Save</button>
                                                <button
                                                    className="text-xs text-slate-500 transition-all hover:bg-red-200/30 px-2 py-1 rounded duration-200 cursor-pointer"
                                                    onClick={(e) => { e.stopPropagation(); setEditingId(null); setEditingTitle(""); }}
                                                >Cancel</button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-blue-600 font-semibold transition-all hover:bg-blue-200/30 px-2 py-1 rounded duration-200">View</span>
                                                <button
                                                    className="text-xs cursor-pointer hover:font-semibold transition-all hover:bg-slate-200/50 px-2 py-1 rounded duration-200 text-slate-500"
                                                    onClick={(e) => { e.stopPropagation(); setEditingId(key); setEditingTitle(item.title); }}
                                                >Edit</button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Modal */}

        <Modal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            title={modalTitle}
        >
            <div className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-slate">
                <MarkdownRenderer content={modalContent} />
            </div>
        </Modal>
    </>
  )
}

export default AiAction