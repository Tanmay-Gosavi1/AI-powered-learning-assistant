import React, {useEffect , useState} from 'react'
import {Plus , Upload , Trash2 , FileText , X} from 'lucide-react'
import toast from 'react-hot-toast'
import documentService from '../../service/docService.js'
import Button from '../../components/common/Button.jsx'
import DocumentCard from '../../components/documents/DocumentCard.jsx'
import Spinner from '../../components/common/Spinner.jsx'

const DocumentListPage = () => {

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAllDocuments();
      setDocuments(data.data);
      console.log("Fetched documents: ", data.data);
    } catch (error) {
      toast.error("Failed to fetch documents.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("document", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");

      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);

      fetchDocuments();
    } catch (error) {
      toast.error("Failed to upload document.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  }

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;

    setDeleting(true);

    try{
      await documentService.deleteDocument(selectedDoc._id);
      toast.success("Document deleted successfully!");
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter(d => d._id !== selectedDoc._id));
    }
    catch(error){
      toast.error("Failed to delete document.");
      console.error(error);
    }
    finally{
      setDeleting(false);
    }
  }

  // Render content based on state
  const renderContent = () => {
    if (loading) {
      return <div className='flex items-center justify-center min-h-100'>
        <Spinner />
      </div>
    }

    if(documents.length === 0 ){
      return (
        <div className='flex items-center justify-center min-h-100'>
          <div className='text-center max-w-md'>
            <div className='inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-blue-100 to-blue-200 shadow-lg shadow-slate-200/50 mb-6'>
              <FileText 
                className='w-10 h-10 text-slate-400'
                strokeWidth={1.5}
              />
            </div>
            <h3 className='text-xl font-medium text-slate-900 tracking-tight mb-2'>
              No documents yet.
            </h3>
            <p className='text-sm text-slate-500 mb-6'>
              Get starting by uploading your PDF document to begin learning.
            </p>
            <button className='inline-flex items-center gap-2 px-6 py-3 btn-primary text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-25 cursor-pointer hover:scale-105 ' onClick={()=> setIsUploadModalOpen(true)}>
              <Plus className='w-4 h-4' strokeWidth={2.5}/>
              Upload Document
            </button>
          </div>
        </div>
      )
    }
    // Render document grid
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5'>
        {documents?.map((doc)=> (
          <DocumentCard 
            key={doc._id} 
            document={doc} 
            onDelete={() => handleDeleteRequest(doc)}
          />
        ))}
      </div>
    )

  }
  return (
    <div className='min-h-screen'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px , transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none'/>
      <div className='relative mx-auto max-w-7xl'>
        {/* Header */}
        <div className='flex items-center justify-between mb-10'>
          <div>
            <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>
              My Documents
            </h1>
            <p className='text-sm text-slate-600'>
              Manage and organize your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={()=> setIsUploadModalOpen(true)} >
              <Plus className='w-4 h-4' strokeWidth={2.5}/>
              Upload Document
            </Button>
          )}
        </div>
        {documents.length > 0 && (
          <div className='mb-6 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3'>
            <p className='text-sm font-medium text-blue-900'>Tip: Click a document to open it and use chat, generate flashcards, take quizzes, and track progress.</p>
          </div>
        )}
        {renderContent()}
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm' onClick={() => setIsUploadModalOpen(false)}>
          <div className='relative w-full max-w-lg bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/50 p-6' onClick={(e) => e.stopPropagation()}>
            <button 
              className='absolute cursor-pointer top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200' 
              onClick={() => setIsUploadModalOpen(false)}
            >
              <X className='w-5 h-5' strokeWidth={2}/>
            </button>

            {/* Modal Header */}
            <div className='mb-6'>
              <h2 className='text-xl font-semibold text-slate-900 tracking-tight'>Upload New Document</h2>
              <p className='text-sm text-slate-500 mt-1'>Add a new PDF to your library</p>
            </div>

            {/* Form */}
            <form onSubmit={handleUpload} className='space-y-5'>
              <div className='space-y-2'>
                <label className='block text-xs font-semibold uppercase text-slate-700 tracking-wide'>Document title</label>
                <input 
                  type="text"
                  value={uploadTitle}
                  onChange={(e)=>setUploadTitle(e.target.value)}
                  required
                  placeholder='e.g., React Interview prep'
                  className='w-full h-12 px-4 outline-none border-slate-200 rounded-xl bg-slate-100/50 text-slate-900 placeholder:text-slate-400 text-sm font-medium transition-all duration-200 border-2'
                />
              </div>

              {/* File Upload */}
              <div className='space-y-2'>
                <label className='block text-xs font-semibold uppercase text-slate-700 tracking-wide'>Upload PDF</label>
                <div className='relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-100/50 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-300'>
                    <input 
                      id='file-upload'
                      type='file'
                      accept='.pdf'
                      onChange={handleFileChange}
                      className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10'
                    />
                    <div className='flex flex-col items-center justify-center py-10 px-6'>
                      <div className='w-14 h-14 rounded-xl bg-linear-to-r from-blue-100 to-blue-200 flex items-center justify-center mb-6'>
                        <Upload className='w-7 h-7 text-blue-600' />
                      </div>
                      <p className='text-sm font-medium text-slate-700 mb-1'>
                        {uploadFile ? (
                          <span className='text-blue-900'>
                            {uploadFile.name}
                          </span>
                        ) : (
                          <>
                            <span className='text-blue-700'>
                              Click to upload
                            </span>{" "}or drag and drop
                          </>
                        )}
                      </p>
                      <p className='text-sm text-slate-500'>PDF up to 10 MB</p>
                    </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className='flex gap-3 pt-2'>
                <button
                  type='button'
                  onClick={()=>setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className='flex-1 h-11 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
                 >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={uploading}
                  className='flex-1 h-11 rounded-xl btn-primary text-white text-sm font-semibold transition-all shadow-lg shadow-primary-25 duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer'
                >
                  {uploading ? (
                    <span className='flex justify-center items-center gap-2'>
                      <div className='w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin'/>
                      Uploading...
                    </span>
                  ) : 'Upload'}
                </button>
              </div>
            </form>
          </div>
      </div>}

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
              Are you sure you want to delete the document : <span className='font-semibold text-slate-900'>{selectedDoc?.title}</span> ? This action cannot be undone.
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

export default DocumentListPage