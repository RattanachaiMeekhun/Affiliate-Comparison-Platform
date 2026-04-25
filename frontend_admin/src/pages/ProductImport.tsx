import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import {
  FileUp,
  FileSpreadsheet,
  Trash2,
  Play,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Table as TableIcon,
  Filter,
  Check,
  X,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react';
import api from '../utils/axios';

interface ProductRow {
  name: string;
  [key: string]: any;
}

export const ProductImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ProductRow[]>([]);
  const [readyItems, setReadyItems] = useState<any[]>([]);
  const [mismatchItems, setMismatchItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ready' | 'mismatch'>('ready');
  const [columns, setColumns] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  // Fetch categories on mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories/?skip=0&limit=100');

        setCategories(response.data);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const validateAndFilterShopee = (jsonData: any[]) => {
    const essentialSpecs = [
      'itemid',
      'shopid',
      'title',
      'description',
      'price',
      'sale_price',
      'image_link',
      'product_link',
      'global_category3',
      'global_brand',
    ];

    const ready: any[] = [];
    const mismatch: any[] = [];

    jsonData.forEach((item) => {
      // 1. Filter fields immediately
      const filteredItem: any = {};
      essentialSpecs.forEach((key) => {
        filteredItem[key] = item[key];
      });

      // 2. Category Matching Logic
      const shopeeCat = String(
        item.global_category3 || item.global_category2 || item.global_category1 || ''
      ).toLowerCase();

      const match = categories.find(
        (c) =>
          c.name.toLowerCase() === shopeeCat ||
          shopeeCat.includes(c.name.toLowerCase()) ||
          c.name
            .toLowerCase()
            .includes(shopeeCat && shopeeCat.length > 3 ? shopeeCat : 'MATCH_NEVER')
      );

      if (match) {
        filteredItem.category_id = match.id;
        filteredItem.category_name = match.name;
        ready.push(filteredItem);
      } else {
        filteredItem.category_name = 'No Match';
        mismatch.push(filteredItem);
      }
    });

    setReadyItems(ready);
    setMismatchItems(mismatch);
    setActiveTab(ready.length > 0 ? 'ready' : 'mismatch');
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const selectedFile = acceptedFiles[0];
      if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
          const ab = e.target?.result;
          const wb = XLSX.read(ab, { type: 'array', codepage: 65001 });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const jsonData = XLSX.utils.sheet_to_json<ProductRow>(ws);

          if (jsonData.length > 0) {
            setData(jsonData);
            setColumns(Object.keys(jsonData[0]));

            // Check if it's likely a Shopee file
            const isShopee =
              jsonData[0].hasOwnProperty('itemid') ||
              jsonData[0].hasOwnProperty('global_category3');
            if (isShopee) {
              validateAndFilterShopee(jsonData);
            } else {
              // Reset tiered tables if standard file
              setReadyItems([]);
              setMismatchItems([]);
            }
            setError(null);
          } else {
            setError('The uploaded file appears to be empty.');
          }
        };
        reader.readAsArrayBuffer(selectedFile);
      }
    },
    [categories]
  );
  console.log({ readyItems });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
  });

  const removeFile = () => {
    setFile(null);
    setData([]);
    setReadyItems([]);
    setMismatchItems([]);
    setColumns([]);
    setError(null);
    setResult(null);
  };

  const handleImport = async () => {
    setError(null);
    setResult(null);
    setImporting(true);

    try {
      if (readyItems.length > 0) {
        // Shopee specific batch import
        const response = await api.post('/products/import-shopee', {
          products: readyItems,
        });
        setResult(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'An error occurred during import.');
    } finally {
      setImporting(false);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-base-content/60">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-base-content mb-2">Product Import</h1>
        <p className="text-base-content/60">
          Upload an Excel or CSV file to import products via AI processing.
        </p>
      </div>

      {!file ? (
        /* Dropzone */
        <div
          {...getRootProps()}
          className={`border-3 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center transition-all cursor-pointer bg-base-100/50 hover:bg-base-200/50 ${
            isDragActive ? 'border-primary ring-4 ring-primary/10' : 'border-base-300'
          }`}
        >
          <input {...getInputProps()} />
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <FileUp className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {isDragActive ? 'Drop the file here' : 'Select a file to upload'}
          </h2>
          <p className="text-base-content/50">Supports .xlsx, .xls, and .csv files</p>
        </div>
      ) : (
        /* File Selected View */
        <div className="space-y-6">
          <div className="card bg-base-100 shadow-xl border border-base-200">
            <div className="card-body flex-row items-center gap-6">
              <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center text-success">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold">{file.name}</h3>
                <p className="text-sm text-base-content/50">
                  {(file.size / 1024).toFixed(2)} KB • {data.length} products detected
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={removeFile}
                  className="btn btn-ghost text-error"
                  disabled={importing}
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Remove</span>
                </button>
                <button
                  onClick={handleImport}
                  className={`btn btn-primary rounded-xl px-8 ${importing ? 'loading' : ''}`}
                  disabled={importing || data.length === 0}
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Import</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="alert alert-error shadow-lg rounded-2xl">
              <AlertCircle />
              <span>{error}</span>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="alert alert-success shadow-lg rounded-2xl">
              <CheckCircle2 />
              <div>
                <h3 className="font-bold">Import Finished!</h3>
                <div className="text-xs">
                  Saved: {result.total_saved} | Errors: {result.total_errors}
                </div>
              </div>
            </div>
          )}

          {/* Preview & Validation Tabs */}
          <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-base-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-200/30">
              <div className="flex items-center gap-2 font-bold">
                <TableIcon className="w-5 h-5" />
                <span>Import Preview & Validation</span>
              </div>

              <div className="tabs tabs-boxed bg-base-100 p-1">
                <button
                  onClick={() => setActiveTab('ready')}
                  className={`tab tab-sm md:tab-md gap-2 rounded-lg ${activeTab === 'ready' ? 'tab-active' : ''}`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 ${activeTab === 'ready' ? 'text-white' : 'text-success'}`}
                  />
                  <span>
                    Ready <span className="opacity-50">({readyItems.length})</span>
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('mismatch')}
                  className={`tab tab-sm md:tab-md gap-2 rounded-lg ${activeTab === 'mismatch' ? 'tab-active' : ''}`}
                >
                  <AlertTriangle
                    className={`w-4 h-4 ${activeTab === 'mismatch' ? 'text-white' : 'text-warning'}`}
                  />
                  <span>
                    Mismatch <span className="opacity-50">({mismatchItems.length})</span>
                  </span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="bg-base-200/50">
                    <th className="w-16">Preview</th>
                    <th>Product</th>
                    <th>Category Mapping</th>
                    <th>Price (Sale)</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'ready' ? readyItems : mismatchItems).map((row, i) => (
                    <tr key={i} className="hover:bg-base-200/30 transition-colors">
                      <td>
                        <div className="avatar">
                          <div className="mask mask-squircle w-10 h-10">
                            <img src={row.image_link} alt="product" />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-col max-w-xs md:max-w-md">
                          <span className="font-bold truncate">{row.title}</span>
                          <span className="text-[10px] opacity-40 uppercase font-mono">
                            {row.itemid}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div
                          className={`badge badge-sm gap-1 py-3 px-3 uppercase text-[10px] tracking-wider font-bold ${activeTab === 'ready' ? 'badge-success text-white' : 'badge-ghost opacity-60'}`}
                        >
                          {activeTab === 'ready' ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <X className="w-3 h-3" />
                          )}
                          {row.category_name}
                        </div>
                        {activeTab === 'mismatch' && (
                          <div className="text-[10px] mt-1 opacity-40">
                            Original: {row.global_category3}
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="flex flex-col">
                          <span
                            className={`${row.sale_price ? 'line-through text-[10px] opacity-40' : 'font-bold'}`}
                          >
                            ฿{Number(row.price).toLocaleString()}
                          </span>
                          {row.sale_price && (
                            <span className="text-success font-bold">
                              ฿{Number(row.sale_price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-right">
                        <a
                          href={row.product_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {(activeTab === 'ready' ? readyItems : mismatchItems).length > 50 && (
              <div className="p-4 bg-base-200/10 text-center text-sm text-base-content/40 italic">
                And {(activeTab === 'ready' ? readyItems : mismatchItems).length - 50} more rows...
              </div>
            )}

            {activeTab === 'mismatch' && mismatchItems.length > 0 && (
              <div className="p-6 bg-warning/5 border-t border-warning/10 flex items-start gap-4">
                <AlertCircle className="text-warning w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-bold text-warning-content/80">
                    Why are these items in mismatch?
                  </p>
                  <p className="text-base-content/60">
                    These products have categories that don't match our existing database. They will{' '}
                    <span className="font-bold">not</span> be imported until we create the matching
                    category or update the mapping logic.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
