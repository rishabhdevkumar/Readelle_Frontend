import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllBooks, createBook, updateBook, deleteBook } from '../../redux/slices/bookSlice';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../redux/slices/categorySlice';
import { getChaptersByBook, createChapter, updateChapter } from '../../redux/slices/chapterSlice';
import axiosInstance from '../../helpers/axiosInstance';
import { getAllUsers } from '../../redux/slices/authSlice';
import toast from 'react-hot-toast';
import AdminLayout from '../../layout/AdminLayout';
import {
  Book,
  Users,
  BookOpen,
  BookMarked,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  FolderPlus,
  FilePlus2,
  List,
  Layers,
  Tag,
  Search,
  AlertCircle,
} from 'lucide-react';


const getCategoryClass = (category = '') => {
  const cat = category.toUpperCase();
  const map = {
    THRILLER: 'bg-[#e6f4f2] text-[#1e5c54] border border-[#d1ebe7]',
    PHILOSOPHY: 'bg-[#fff6e6] text-[#a66200] border border-[#ffe9cc]',
    DESIGN: 'bg-[#e6f0fa] text-[#1d599c] border border-[#d1e5f5]',
    CLASSIC: 'bg-[#ffebeb] text-[#a62424] border border-[#ffd1d1]',
    SCIENCE: 'bg-[#eef9ee] text-[#2a6e2a] border border-[#cceacc]',
    HISTORY: 'bg-[#f5eeff] text-[#6530b0] border border-[#e0d1f7]',
    ROMANCE: 'bg-[#fff0f6] text-[#9c2366] border border-[#ffd6ea]',
    FANTASY: 'bg-[#f0f4ff] text-[#2a46a6] border border-[#ccd8f7]',
  };
  return map[cat] || 'bg-slate-50 text-slate-500 border border-slate-200';
};


const Modal = ({ onClose, children }) => (
  <div
    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
    style={{ animation: 'modalFadeIn 0.2s ease' }}
  >
    <div
      className="bg-white w-full max-w-lg rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden"
      style={{ animation: 'modalZoomIn 0.2s ease' }}
    >
      {children}
    </div>
  </div>
);

const ModalHeader = ({ icon: Icon, title, onClose }) => (
  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
    <div className="flex items-center gap-2">
      <Icon className="w-5 h-5 text-[#0a2f35]" />
      <h3 className="font-extrabold text-base text-[#0a2f35]">{title}</h3>
    </div>
    <button
      type="button"
      onClick={onClose}
      className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-400 hover:text-[#0a2f35] transition-all cursor-pointer"
    >
      <X className="w-4 h-4" />
    </button>
  </div>
);

const ModalFooter = ({ onCancel, submitLabel, isDestructive = false }) => (
  <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
    <button
      type="button"
      onClick={onCancel}
      className="px-4 py-2 border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 font-bold rounded-xl transition-all cursor-pointer text-xs"
    >
      Cancel
    </button>
    <button
      type="submit"
      className={`px-4 py-2 font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer text-xs ${isDestructive
        ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
        : 'bg-[#0a2f35] hover:bg-[#072226] text-white shadow-[#0a2f35]/15'
        }`}
    >
      <Check className="w-3.5 h-3.5" />
      {submitLabel}
    </button>
  </div>
);

const FormInput = ({ label, required, ...props }) => (
  <div>
    {label && (
      <label className="block text-slate-500 font-bold mb-1 text-xs">
        {label} {required && '*'}
      </label>
    )}
    <input
      required={required}
      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] font-semibold"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, required, children, ...props }) => (
  <div>
    {label && (
      <label className="block text-slate-500 font-bold mb-1 text-xs">
        {label} {required && '*'}
      </label>
    )}
    <select
      required={required}
      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3.5 py-2.5 outline-none focus:border-[#0a2f35] cursor-pointer font-semibold"
      {...props}
    >
      {children}
    </select>
  </div>
);


const ManageBooks = ({ activeNav, setActiveNav }) => {
  const dispatch = useDispatch();
  const reduxBooks = useSelector((state) => state.books.booksData) || [];

  const reduxCategories = useSelector((state) => state.categories.categoriesData) || [];
  const reduxChapters = useSelector((state) => state.chapter.chaptersData) || [];
  const usersData = useSelector((state) => state.auth.usersData) || [];

  const [selectedBookForChapters, setSelectedBookForChapters] = useState('');
  const [totalChaptersCount, setTotalChaptersCount] = useState(0);

  const [modal, setModal] = useState(null);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingChapter, setEditingChapter] = useState(null);
  const [editingBook, setEditingBook] = useState(null);

  const [categorySearch, setCategorySearch] = useState('');
  const [chapterSearch, setChapterSearch] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    category: '',
    language: 'English',
    description: '',
  });

  const [newCategoryName, setNewCategoryName] = useState('');

  const emptyChapter = {
    chapterSelectedCategory: '',
    selectedBookId: '',
    chapterName: '',
    chapterNumber: '1',
    context: 'Introduction context here...',
  };
  const [chapterData, setChapterData] = useState(emptyChapter);

  const [toastMessage, setToastMessage] = useState('');
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  useEffect(() => {
    dispatch(getAllBooks());
    dispatch(getAllCategories());
    dispatch(getAllUsers());
  }, [dispatch]);

  // Fetch chapters for all books via direct API calls (avoids overwriting Redux chaptersData)
  useEffect(() => {
    if (reduxBooks.length === 0) return;
    let cancelled = false;
    const fetchAllChapterCounts = async () => {
      try {
        const results = await Promise.all(
          reduxBooks.map((book) =>
            axiosInstance.get(`/chapters/book/${book._id || book.id}`)
              .then((res) => {
                const chapters = res?.data?.data || res?.data || [];
                return Array.isArray(chapters) ? chapters.length : 0;
              })
              .catch(() => 0)
          )
        );
        if (!cancelled) {
          setTotalChaptersCount(results.reduce((a, b) => a + b, 0));
        }
      } catch {
        if (!cancelled) setTotalChaptersCount(0);
      }
    };
    fetchAllChapterCounts();
    return () => { cancelled = true; };
  }, [reduxBooks.length]);

  // Listen to header global search
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const handleGlobalSearch = (e) => {
      setSearchTerm(e.detail || '');
    };
    window.addEventListener('globalSearch', handleGlobalSearch);
    return () => {
      window.removeEventListener('globalSearch', handleGlobalSearch);
    };
  }, []);

  const books = reduxBooks.map((b, index) => {
    const id = b._id || b.id || index;
    let stockStr = '';
    let stockDot = '';
    if (typeof b.stock === 'number' || !isNaN(b.stock)) {
      const s = parseInt(b.stock);
      if (s === 0) { stockStr = 'Out of Stock'; stockDot = 'bg-red-500'; }
      else if (s <= 2) { stockStr = `Low Stock (${s})`; stockDot = 'bg-orange-500'; }
      else { stockStr = `In Stock (${s})`; stockDot = 'bg-green-500'; }
    } else {
      stockStr = b.stock || 'Out of Stock';
      stockDot = b.stockDotClass || (
        stockStr.toLowerCase().includes('out') ? 'bg-red-500' :
          stockStr.toLowerCase().includes('low') ? 'bg-orange-500' : 'bg-green-500'
      );
    }
    const catId = (b.category && typeof b.category === 'object') ? b.category._id : b.category;
    const categoryObj = reduxCategories.find(c => c._id === catId || c.category_name === catId);
    const categoryName = categoryObj ? categoryObj.category_name : (b.category?.category_name || catId || 'Unknown');

    return {
      ...b,
      id,
      categoryName,
      categoryClass: getCategoryClass(categoryName),
      category: catId,
      stock: stockStr,
      stockDotClass: stockDot
    };
  });

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      return (
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [books, searchTerm]);

  const activeReadersCount = usersData.filter(u => (u.status || 'Active') === 'Active').length;

  const filteredBooksByCategory = chapterData.chapterSelectedCategory
    ? books.filter(b => b.category === chapterData.chapterSelectedCategory)
    : [];


  const handleAddBookSubmit = (e) => {
    e.preventDefault();
    dispatch(createBook({
      title: formData.title || 'Untitled Book',
      author: formData.author || 'Unknown Author',
      price: Number(formData.price) || 0,
      category: formData.category,
      language: formData.language,
      description: formData.description || 'No description provided.',
    }));
    setModal(null);
    setFormData({ title: '', author: '', price: '', category: reduxCategories[0]?._id || '', language: 'English', description: '' });
  };

  const handleEditBookSubmit = (e) => {
    e.preventDefault();
    dispatch(updateBook({
      id: editingBook._id,
      data: {
        title: editingBook.title,
        author: editingBook.author,
        price: Number(editingBook.price),
        category: editingBook.category,
        language: editingBook.language,
        description: editingBook.description,
      }
    }));
    setModal(null);
    setEditingBook(null);
  };

  const handleDeleteBook = (id) => {
    const name = books.find(b => b.id === id)?.title || 'Book';
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch(deleteBook(id));
    }
  };

  const handleAddCategorySubmit = (e) => {
    e.preventDefault();
    const formatted = newCategoryName.trim();
    if (!formatted) return;
    if (reduxCategories.some(c => c.category_name.toLowerCase() === formatted.toLowerCase())) {
      toast.error('Category already exists!');
      return;
    }
    dispatch(createCategory({ category_name: formatted }));
    setModal(null);
    setNewCategoryName('');
  };

  const openEditCategory = (cat) => {
    setEditingCategory({ ...cat });
    setModal('editCategory');
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    const trimmed = editingCategory.category_name.trim();
    if (!trimmed) return;
    const isDup = reduxCategories.some(c => c._id !== editingCategory._id && c.category_name.toLowerCase() === trimmed.toLowerCase());
    if (isDup) { toast.error('Category name already exists!'); return; }
    dispatch(updateCategory({ id: editingCategory._id, data: { category_name: trimmed } }));
    setModal('showCategories');
  };

  const handleDeleteCategory = (catId) => {
    const catObj = reduxCategories.find(c => c._id === catId);
    const name = catObj ? catObj.category_name : 'Category';
    if (window.confirm(`Are you sure you want to delete category "${name}"?`)) {
      dispatch(deleteCategory(catId));
    }
  };

  const handleAddChapterSubmit = (e) => {
    e.preventDefault();
    dispatch(createChapter({
      book: chapterData.selectedBookId,
      chapter_title: chapterData.chapterName,
      chapter_number: Number(chapterData.chapterNumber),
      context: chapterData.context,
    }));
    setModal(null);
    setChapterData(emptyChapter);
  };

  const openEditChapter = (chapter) => {
    setEditingChapter({ ...chapter });
    setModal('editChapter');
  };

  const handleUpdateChapter = (e) => {
    e.preventDefault();
    dispatch(updateChapter({
      chapterId: editingChapter._id,
      data: {
        chapter_title: editingChapter.chapter_title,
        chapter_number: Number(editingChapter.chapter_number),
        context: editingChapter.context,
      }
    }));
    setModal('showChapters');
  };

  const handleDeleteChapter = (id) => {
    toast.error("Removing chapters is not supported by the backend API.");
  };

  const filteredCategories = reduxCategories.filter(c =>
    c.category_name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredChapters = reduxChapters.filter(c =>
    c.chapter_title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
    (c.context && c.context.toLowerCase().includes(chapterSearch.toLowerCase()))
  );


  return (
    <AdminLayout activeNav={activeNav} setActiveNav={setActiveNav}>
      <div className="space-y-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 font-semibold mb-1">
              Dashboard / <span className="text-slate-600 font-bold">Manage Books</span>
            </div>
            <h1 className="text-2xl font-bold text-[#0a2f35] mb-1 font-sans tracking-tight">Manage Books</h1>
            <p className="text-slate-400 text-sm font-semibold">Review and curate the ePustakalay digital collection.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category buttons */}
            <button
              onClick={() => { setCategorySearch(''); setModal('showCategories'); }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Layers className="w-4 h-4 text-[#0a2f35]" /> All Categories
            </button>
            <button
              onClick={() => setModal('addCategory')}
              className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/15 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>

            {/* Chapter buttons */}
            <button
              onClick={() => { setChapterSearch(''); setModal('showChapters'); }}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <List className="w-4 h-4 text-[#0a2f35]" /> All Chapters
            </button>
            <button
              onClick={() => setModal('addChapter')}
              className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/15 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" /> Add Chapter
            </button>

            {/* Book button */}
            <button
              onClick={() => setModal('addBook')}
              className="bg-[#0a2f35] hover:bg-[#072226] text-white px-4 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 text-xs shadow-md shadow-[#0a2f35]/15 whitespace-nowrap cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" /> Add Book
            </button>
          </div>
        </div>

        {/* ── KPI Cards ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {[
            { label: 'Total Books', icon: Book, value: reduxBooks.length, sub: 'Dynamic catalog size', subClass: 'text-emerald-600' },
            { label: 'Total Categories', icon: Tag, value: reduxCategories.length, sub: 'Dynamic category count', subClass: 'text-emerald-600' },
            { label: 'Total Chapters', icon: BookMarked, value: totalChaptersCount, sub: 'Dynamic chapter count', subClass: 'text-emerald-600' },
            { label: 'Active Readers', icon: Users, value: activeReadersCount, sub: 'Live members online', subClass: 'text-emerald-600' },
          ].map(({ label, icon: Icon, value, sub, subClass }) => (
            <div key={label} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between h-[130px] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{label}</h3>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#0a2f35]/5 text-[#0a2f35] border border-[#0a2f35]/10">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-[#0a2f35] mt-1">{value}</div>
              <div className={`flex items-center gap-2 mt-auto text-xs font-bold ${subClass}`}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center justify-between p-5 border-b border-slate-100 gap-4">
            <div className="flex gap-3 w-full sm:w-auto">
              <select className="bg-slate-50 border border-slate-200 text-[#0a2f35] text-xs rounded-xl px-4 py-2 outline-none focus:border-[#0a2f35] cursor-pointer font-bold">
                <option>All Categories</option>
                {reduxCategories.map(cat => <option key={cat._id}>{cat.category_name}</option>)}
              </select>
              <select className="bg-slate-50 border border-slate-200 text-[#0a2f35] text-xs rounded-xl px-4 py-2 outline-none focus:border-[#0a2f35] cursor-pointer font-bold">
                <option>Stock Status</option>
              </select>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase">
              Showing <span className="text-slate-700">1–{filteredBooks.length}</span> of {filteredBooks.length} books
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                  <th className="px-6 py-4">Book Title</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm font-semibold">
                      <div className="flex flex-col items-center gap-2">
                        <AlertCircle className="w-8 h-8 opacity-30 text-slate-300" />
                        No books found matching search criteria.
                      </div>
                    </td>
                  </tr>
                ) : filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-slate-50/40 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <div className="w-10 h-14 bg-slate-50 rounded-lg flex items-center justify-center border border-slate-200 shadow-sm flex-shrink-0 text-[#0a2f35]">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0a2f35] text-base tracking-tight leading-tight">{book.title}</div>
                        <div className="text-slate-400 text-xs mt-0.5 font-medium">{book.author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">₹{book.price}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full tracking-wide ${book.categoryClass}`}>
                        {book.categoryName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => { setEditingBook({ ...book }); setModal('editBook'); }}
                          className="text-slate-400 hover:text-[#0a2f35] hover:bg-slate-50 transition-colors cursor-pointer p-2 rounded-xl border border-transparent hover:border-slate-200/40"
                          title="Edit Book"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBook(book._id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer p-2 rounded-xl border border-transparent hover:border-red-100/40"
                          title="Delete Book"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
            <button className="text-slate-400 hover:text-[#0a2f35] transition-colors flex items-center gap-1 cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map(n => (
                <button key={n} className={`w-8 h-8 flex items-center justify-center rounded-xl font-bold text-xs cursor-pointer transition-colors ${n === 1 ? 'bg-[#0a2f35] text-white shadow-sm' : 'text-slate-400 hover:bg-slate-50 hover:text-[#0a2f35]'}`}>
                  {n}
                </button>
              ))}
              <span className="text-slate-300 px-1 font-semibold">…</span>
              <button className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-[#0a2f35] transition-colors cursor-pointer">128</button>
            </div>
            <button className="text-slate-400 hover:text-[#0a2f35] transition-colors flex items-center gap-1 cursor-pointer">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {modal === 'addBook' && (
        <Modal onClose={() => setModal(null)}>
          <ModalHeader icon={Book} title="Add New Book" onClose={() => setModal(null)} />
          <form onSubmit={handleAddBookSubmit}>
            <div className="p-6 space-y-4 text-xs font-sans">
              <FormInput label="Book Title" name="title" required placeholder="e.g. The Silent Patient"
                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <FormInput label="Author Name" name="author" required placeholder="e.g. Alex Michaelides"
                value={formData.author} onChange={e => setFormData({ ...formData, author: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Price (₹)" name="price" required placeholder="e.g. 499"
                  value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                <FormSelect label="Language" required value={formData.language}
                  onChange={e => setFormData({ ...formData, language: e.target.value })}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </FormSelect>
              </div>
              <FormInput label="Description" name="description" required placeholder="Book description (at least 10 chars)"
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <FormSelect label="Category" required value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}>
                <option value="">— Select Category —</option>
                {reduxCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.category_name}</option>)}
              </FormSelect>
            </div>
            <ModalFooter onCancel={() => setModal(null)} submitLabel="Add Book" />
          </form>
        </Modal>
      )}

      {modal === 'editBook' && editingBook && (
        <Modal onClose={() => { setModal(null); setEditingBook(null); }}>
          <ModalHeader icon={Book} title="Edit Book" onClose={() => { setModal(null); setEditingBook(null); }} />
          <form onSubmit={handleEditBookSubmit}>
            <div className="p-6 space-y-4 text-xs font-sans">
              <FormInput label="Book Title" name="title" required placeholder="e.g. The Silent Patient"
                value={editingBook.title} onChange={e => setEditingBook({ ...editingBook, title: e.target.value })} />
              <FormInput label="Author Name" name="author" required placeholder="e.g. Alex Michaelides"
                value={editingBook.author} onChange={e => setEditingBook({ ...editingBook, author: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Price (₹)" name="price" required placeholder="e.g. 499"
                  value={editingBook.price} onChange={e => setEditingBook({ ...editingBook, price: e.target.value })} />
                <FormSelect label="Language" required value={editingBook.language || 'English'}
                  onChange={e => setEditingBook({ ...editingBook, language: e.target.value })}>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </FormSelect>
              </div>
              <FormInput label="Description" name="description" required placeholder="Book description (at least 10 chars)"
                value={editingBook.description || ''} onChange={e => setEditingBook({ ...editingBook, description: e.target.value })} />
              <FormSelect label="Category" required value={editingBook.category}
                onChange={e => setEditingBook({ ...editingBook, category: e.target.value })}>
                <option value="">— Select Category —</option>
                {reduxCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.category_name}</option>)}
              </FormSelect>
            </div>
            <ModalFooter onCancel={() => { setModal(null); setEditingBook(null); }} submitLabel="Update Book" />
          </form>
        </Modal>
      )}

      {modal === 'addCategory' && (
        <Modal onClose={() => setModal(null)}>
          <ModalHeader icon={FolderPlus} title="Add New Category" onClose={() => setModal(null)} />
          <form onSubmit={handleAddCategorySubmit}>
            <div className="p-6 space-y-4 text-xs font-sans">
              <FormInput label="Category Name" required placeholder="e.g. Science Fiction"
                value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
              <p className="text-[10px] text-slate-400 font-semibold">
                Existing: {reduxCategories.map(c => c.category_name).join(', ')}
              </p>
            </div>
            <ModalFooter onCancel={() => setModal(null)} submitLabel="Save Category" />
          </form>
        </Modal>
      )}

      {/* ── Show All Categories Modal ─────────────────────────── */}
      {modal === 'showCategories' && (
        <Modal onClose={() => setModal(null)}>
          <ModalHeader icon={Layers} title={`All Categories (${reduxCategories.length})`} onClose={() => setModal(null)} />
          <div className="p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories…"
                value={categorySearch}
                onChange={e => setCategorySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl outline-none focus:border-[#0a2f35] font-semibold"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
              {filteredCategories.length === 0 ? (
                <p className="text-center text-slate-400 text-xs py-6 font-semibold">No categories match your search.</p>
              ) : filteredCategories.map((cat) => {
                return (
                  <div key={cat._id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 group">
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getCategoryClass(cat.category_name)}`}>{cat.category_name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {books.filter(b => b.category === cat._id).length} books
                      </span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditCategory(cat)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0a2f35]/10 hover:text-[#0a2f35] text-slate-400 transition-all cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold">{reduxCategories.length} total categories</span>
              <button
                onClick={() => setModal('addCategory')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a2f35] text-white text-xs font-bold rounded-xl hover:bg-[#072226] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'editCategory' && editingCategory && (
        <Modal onClose={() => setModal('showCategories')}>
          <ModalHeader icon={Tag} title="Edit Category" onClose={() => setModal('showCategories')} />
          <form onSubmit={handleUpdateCategory}>
            <div className="p-6 space-y-4 text-xs font-sans">
              <FormInput
                label="Category Name"
                required
                value={editingCategory.category_name}
                onChange={e => setEditingCategory({ ...editingCategory, category_name: e.target.value })}
              />
              <p className="text-[10px] text-slate-400 font-semibold">
                Renaming will update the category label everywhere in the UI.
              </p>
            </div>
            <ModalFooter onCancel={() => setModal('showCategories')} submitLabel="Update Category" />
          </form>
        </Modal>
      )}

      {/* ── Add Chapter Modal ─────────────────────────────────── */}
      {modal === 'addChapter' && (
        <Modal onClose={() => setModal(null)}>
          <ModalHeader icon={FilePlus2} title="Add Chapter" onClose={() => setModal(null)} />
          <form onSubmit={handleAddChapterSubmit}>
            <div className="p-6 space-y-4 text-xs font-sans max-h-[70vh] overflow-y-auto">
              {/* Step 1 */}
              <div>
                <label className="block text-slate-500 font-bold mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a2f35] text-white text-[10px] font-black mr-1.5">1</span>
                  Select Category *
                </label>
                <FormSelect required value={chapterData.chapterSelectedCategory}
                  onChange={e => setChapterData({ ...chapterData, chapterSelectedCategory: e.target.value, selectedBookId: '' })}>
                  <option value="">— Choose a category —</option>
                  {reduxCategories.map(cat => <option key={cat._id} value={cat._id}>{cat.category_name}</option>)}
                </FormSelect>
              </div>

              {/* Step 2 */}
              <div className={chapterData.chapterSelectedCategory ? '' : 'opacity-40 pointer-events-none'}>
                <label className="block text-slate-500 font-bold mb-1">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a2f35] text-white text-[10px] font-black mr-1.5">2</span>
                  Select Book *
                </label>
                <FormSelect required value={chapterData.selectedBookId}
                  onChange={e => setChapterData({ ...chapterData, selectedBookId: e.target.value })}>
                  <option value="">— Choose a book —</option>
                  {filteredBooksByCategory.map(b => (
                    <option key={b._id} value={b._id}>{b.title} — {b.author}</option>
                  ))}
                </FormSelect>
                {chapterData.chapterSelectedCategory && filteredBooksByCategory.length === 0 && (
                  <p className="text-[10px] text-red-400 font-semibold mt-1">No books in this category.</p>
                )}
              </div>

              {/* Step 3 */}
              <div className={chapterData.selectedBookId ? '' : 'opacity-40 pointer-events-none'}>
                <label className="block text-slate-500 font-bold mb-2">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0a2f35] text-white text-[10px] font-black mr-1.5">3</span>
                  Chapter Details *
                </label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <FormInput label="Number" required type="number" min="1"
                    value={chapterData.chapterNumber}
                    onChange={e => setChapterData({ ...chapterData, chapterNumber: e.target.value })} />
                  <div className="col-span-2">
                    <FormInput label="Chapter Name" required placeholder="e.g. Introduction"
                      value={chapterData.chapterName}
                      onChange={e => setChapterData({ ...chapterData, chapterName: e.target.value })} />
                  </div>
                </div>
                <FormInput label="Context/Details" required placeholder="Chapter details/context (at least 5 characters)"
                  value={chapterData.context}
                  onChange={e => setChapterData({ ...chapterData, context: e.target.value })} />
              </div>
            </div>
            <ModalFooter onCancel={() => setModal(null)} submitLabel="Save Chapter" />
          </form>
        </Modal>
      )}

      {modal === 'showChapters' && (
        <Modal onClose={() => setModal(null)}>
          <ModalHeader icon={List} title={`All Chapters (${reduxChapters.length})`} onClose={() => setModal(null)} />
          <div className="p-6 space-y-4">
            {/* Book Selector */}
            <div>
              <label className="block text-slate-500 font-bold mb-1.5 text-xs">
                Select Book to View Chapters:
              </label>
              <FormSelect
                value={selectedBookForChapters}
                onChange={e => {
                  const bookId = e.target.value;
                  setSelectedBookForChapters(bookId);
                  if (bookId) {
                    dispatch(getChaptersByBook(bookId));
                  }
                }}
              >
                <option value="">— Choose a book —</option>
                {books.map(b => (
                  <option key={b._id} value={b._id}>{b.title} — {b.author}</option>
                ))}
              </FormSelect>
            </div>

            {selectedBookForChapters && (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search chapters by name or context…"
                    value={chapterSearch}
                    onChange={e => setChapterSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl outline-none focus:border-[#0a2f35] font-semibold"
                  />
                </div>

                {/* List */}
                <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {filteredChapters.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-6 font-semibold">No chapters found for this book.</p>
                  ) : filteredChapters.map(chapter => {
                    const bookObj = books.find(b => b._id === selectedBookForChapters);
                    return (
                      <div key={chapter._id} className="bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#0a2f35]/10 text-[#0a2f35] text-[10px] font-black flex-shrink-0">
                                {chapter.chapter_number}
                              </span>
                              <span className="font-bold text-slate-700 text-xs truncate">{chapter.chapter_title}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${getCategoryClass(bookObj?.categoryName || '')}`}>
                                {bookObj?.categoryName || ''}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1 ml-8 truncate">
                              📖 {bookObj?.title || 'Selected Book'} · {chapter.context || 'No context'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditChapter(chapter)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-[#0a2f35]/10 hover:text-[#0a2f35] text-slate-400 transition-all cursor-pointer"
                              title="Edit Chapter"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteChapter(chapter._id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-500 text-slate-400 transition-all cursor-pointer"
                              title="Delete Chapter"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Footer actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-semibold">{reduxChapters.length} total chapters</span>
              <button
                onClick={() => {
                  setChapterData({
                    ...emptyChapter,
                    selectedBookId: selectedBookForChapters,
                    chapterSelectedCategory: books.find(b => b._id === selectedBookForChapters)?.category || ''
                  });
                  setModal('addChapter');
                }}
                disabled={!selectedBookForChapters}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0a2f35] text-white text-xs font-bold rounded-xl hover:bg-[#072226] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" /> Add Chapter
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modal === 'editChapter' && editingChapter && (
        <Modal onClose={() => setModal('showChapters')}>
          <ModalHeader icon={FilePlus2} title="Edit Chapter" onClose={() => setModal('showChapters')} />
          <form onSubmit={handleUpdateChapter}>
            <div className="p-6 space-y-4 text-xs font-sans">
              {/* Book info (read-only banner) */}
              <div className="bg-[#0a2f35]/5 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-[#0a2f35]/10">
                <BookOpen className="w-4 h-4 text-[#0a2f35] flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Book</p>
                  <p className="text-xs font-bold text-[#0a2f35]">{books.find(b => b._id === selectedBookForChapters)?.title || 'Selected Book'}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <FormInput label="Chapter No." required type="number" min="1"
                  value={editingChapter.chapter_number}
                  onChange={e => setEditingChapter({ ...editingChapter, chapter_number: e.target.value })} />
                <div className="col-span-2">
                  <FormInput label="Chapter Name" required
                    value={editingChapter.chapter_title}
                    onChange={e => setEditingChapter({ ...editingChapter, chapter_title: e.target.value })} />
                </div>
              </div>

              <FormInput label="Context/Details" required
                value={editingChapter.context}
                onChange={e => setEditingChapter({ ...editingChapter, context: e.target.value })} />
            </div>
            <ModalFooter onCancel={() => setModal('showChapters')} submitLabel="Update Chapter" />
          </form>
        </Modal>
      )}

      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 bg-[#0a2f35] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-100 z-[120] text-xs font-bold flex items-center gap-3"
          style={{ animation: 'toastSlideIn 0.2s ease' }}
        >
          <span className="text-base">✅</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </AdminLayout>
  );
};

export default ManageBooks;
