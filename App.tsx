import React, { useState, useMemo } from 'react';
import { InvoiceItem } from './types';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const getDefaultDueDate = () => {
  const defaultDue = new Date();
  defaultDue.setDate(defaultDue.getDate() + 14);
  return defaultDue.toISOString().split('T')[0];
};

const formatDateForDisplay = (dateString: string) => {
  if (!dateString) return '—';
  const parsed = new Date(dateString);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

// Icon component defined outside the main component
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
    </svg>
);


function App() {
    const [logo, setLogo] = useState<string | null>(null);
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`);
    
    // State for company details
    const [companyName, setCompanyName] = useState('Kenar Tutors');
    const [companyAddress, setCompanyAddress] = useState('');

    const [billToName, setBillToName] = useState('');
    const [billToAddress, setBillToAddress] = useState('');
    
    const [items, setItems] = useState<InvoiceItem[]>([
        { id: 1, description: 'Resume Writing', quantity: 1, price: 0 },
    ]);
    const [notes, setNotes] = useState('Thank you for your business!');
    const [taxRate, setTaxRate] = useState(8.5); // Example tax rate
    const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(getDefaultDueDate);
    const [paymentTerms, setPaymentTerms] = useState('Net 14');
    const [reference, setReference] = useState('');

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setLogo(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleItemChange = (id: number, field: keyof Omit<InvoiceItem, 'id'>, value: string) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const numericValue = ['quantity', 'price'].includes(field) ? parseFloat(value) || 0 : value;
                return { ...item, [field]: numericValue };
            }
            return item;
        }));
    };

    const handleAddItem = () => {
        const newItem: InvoiceItem = {
            id: Date.now(),
            description: '',
            quantity: 1,
            price: 0,
        };
        setItems([...items, newItem]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const subtotal = useMemo(() => {
        return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    }, [items]);

    const taxAmount = useMemo(() => {
        return subtotal * (taxRate / 100);
    }, [subtotal, taxRate]);

    const total = useMemo(() => {
        return subtotal + taxAmount;
    }, [subtotal, taxAmount]);

    const handlePrint = () => {
        window.print();
    };
    const formattedIssueDate = formatDateForDisplay(issueDate);
    const formattedDueDate = formatDateForDisplay(dueDate);

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-invoice">
            <div className="max-w-4xl mx-auto">
                {/* --- Controls --- */}
                <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg print:hidden border border-gray-100">
                    <div className="flex flex-col gap-3 mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">Invoice Controls</h1>
                        <p className="text-sm text-gray-500">Update the brand, client, and payment details here. The preview below updates instantly and is optimized for printing.</p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <section className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/60">
                            <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Your business</h2>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Company Name</label>
                                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Company LLC" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Company Address</label>
                                <textarea value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none" rows={3} placeholder="123 Main St&#10;City, State ZIP"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Upload Logo</label>
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            </div>
                        </section>
                        <section className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/60">
                            <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Client</h2>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Client Name</label>
                                <input type="text" value={billToName} onChange={e => setBillToName(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Client Name" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Client Address</label>
                                <textarea value={billToAddress} onChange={e => setBillToAddress(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none" rows={3} placeholder="Client address"></textarea>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Reference / PO</label>
                                <input type="text" value={reference} onChange={e => setReference(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" placeholder="Optional" />
                            </div>
                        </section>
                        <section className="rounded-xl border border-gray-200 p-4 space-y-4 bg-gray-50/60">
                            <h2 className="text-sm font-semibold text-gray-600 tracking-wide uppercase">Invoice Details</h2>
                            <div className="space-y-2">
                                <label htmlFor="invoiceNumber" className="block text-xs font-medium text-gray-500 uppercase">Invoice Number</label>
                                <input id="invoiceNumber" type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                            <div className="flex gap-3">
                                <div className="space-y-2 w-1/2">
                                    <label htmlFor="issueDate" className="block text-xs font-medium text-gray-500 uppercase">Issue Date</label>
                                    <input id="issueDate" type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                                <div className="space-y-2 w-1/2">
                                    <label htmlFor="dueDate" className="block text-xs font-medium text-gray-500 uppercase">Due Date</label>
                                    <input id="dueDate" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-xs font-medium text-gray-500 uppercase">Payment Terms</label>
                                <select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500">
                                    <option>Due upon receipt</option>
                                    <option>Net 7</option>
                                    <option>Net 14</option>
                                    <option>Net 30</option>
                                    <option>Net 45</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="taxRate" className="block text-xs font-medium text-gray-500 uppercase">Tax Rate (%)</label>
                                <input type="number" id="taxRate" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className="w-full rounded-lg border border-gray-200 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
                            </div>
                        </section>
                    </div>
                    <div className="mt-6 space-y-3">
                        <label className="block text-xs font-semibold text-gray-600 uppercase">Footer Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-indigo-500 focus:ring-indigo-500 resize-none" rows={3} placeholder="Thank your client, add payment instructions, or mention late fees."></textarea>
                    </div>
                    <div className="mt-6 text-center">
                        <button onClick={handlePrint} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            Print / Download PDF
                        </button>
                    </div>
                </div>

                {/* --- Invoice --- */}
                <div id="invoice" className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border border-gray-100">
                    {/* Header */}
                    <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-10 border-b border-gray-100 pb-8">
                        <div>
                            {logo ? (
                                <img src={logo} alt="Company Logo" className="w-32 h-auto rounded-md object-contain" />
                            ) : (
                                <div className="w-32 h-16 bg-gray-100 flex items-center justify-center text-gray-500 rounded-md border border-dashed border-gray-300 text-xs uppercase tracking-wide">
                                    Your Logo
                                </div>
                            )}
                            <p className="text-2xl font-semibold text-gray-900 mt-6">{companyName || 'Company Name'}</p>
                            <p className="text-sm text-gray-500 whitespace-pre-line mt-2">{companyAddress || 'Add your mailing address'}</p>
                        </div>
                        <div className="text-left md:text-right">
                            <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-widest">Invoice</h1>
                            <p className="text-sm text-gray-500 mt-2">Invoice Number</p>
                            <p className="text-2xl font-bold text-gray-900 tracking-wide">{invoiceNumber}</p>
                            <div className="mt-4 grid gap-2 text-sm text-gray-600">
                                <div className="flex justify-between gap-6 md:justify-end">
                                    <span className="font-medium text-gray-500">Issue Date:</span>
                                    <span className="font-semibold text-gray-800">{formattedIssueDate}</span>
                                </div>
                                <div className="flex justify-between gap-6 md:justify-end">
                                    <span className="font-medium text-gray-500">Due Date:</span>
                                    <span className="font-semibold text-gray-800">{formattedDueDate}</span>
                                </div>
                                <div className="flex justify-between gap-6 md:justify-end">
                                    <span className="font-medium text-gray-500">Terms:</span>
                                    <span className="font-semibold text-gray-800">{paymentTerms}</span>
                                </div>
                                {reference && (
                                    <div className="flex justify-between gap-6 md:justify-end">
                                        <span className="font-medium text-gray-500">Reference:</span>
                                        <span className="font-semibold text-gray-800">{reference}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* Summary */}
                    <section className="grid gap-4 md:grid-cols-3 mb-10">
                        <div className="summary-tile">
                            <p className="summary-label">Balance Due</p>
                            <p className="summary-value">{formatCurrency(total)}</p>
                        </div>
                        <div className="summary-tile">
                            <p className="summary-label">Issued</p>
                            <p className="summary-value text-lg">{formattedIssueDate}</p>
                        </div>
                        <div className="summary-tile">
                            <p className="summary-label">Due</p>
                            <p className="summary-value text-lg">{formattedDueDate}</p>
                        </div>
                    </section>

                    {/* Bill To and Dates */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Bill To</p>
                            <p className="mt-3 text-xl font-semibold text-gray-900">{billToName || 'Client Name'}</p>
                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{billToAddress || 'Client billing address'}</p>
                        </div>
                        <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Remit Payment To</p>
                            <p className="mt-3 text-xl font-semibold text-gray-900">{companyName || 'Company Name'}</p>
                            <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{companyAddress || 'Company remittance address'}</p>
                        </div>
                    </section>

                    {/* Items Table */}
                    <section className="mb-12">
                        <div className="flow-root">
                            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                                    <table className="min-w-full divide-y divide-gray-300">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">Service</th>
                                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Qty</th>
                                                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Price</th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 text-right text-sm font-semibold text-gray-900">Amount</th>
                                                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0 print:hidden"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="w-full max-w-0 py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:w-auto sm:max-w-none sm:pl-0">
                                                        <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="line-item-input w-full" placeholder="Describe the service" />
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 text-center"><input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="line-item-input w-16 text-center" min="0" /></td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 text-center"><input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} className="line-item-input w-24 text-center" min="0" step="0.01" /></td>
                                                    <td className="py-4 pl-3 pr-4 text-sm text-gray-700 text-right sm:pr-0 font-medium">{formatCurrency(item.quantity * item.price)}</td>
                                                    <td className="py-4 pl-3 pr-4 text-sm text-right sm:pr-0 print:hidden">
                                                        <button onClick={() => handleRemoveItem(item.id)}><TrashIcon/></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                         <button onClick={handleAddItem} className="mt-4 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold py-2 px-4 rounded-lg text-sm print:hidden border border-indigo-100 transition-colors">
                            + Add Item
                        </button>
                    </section>

                    {/* Totals */}
                    <section className="flex justify-end mb-12">
                        <div className="w-full max-w-xs">
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium text-gray-800">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span className="text-gray-600">Tax ({taxRate}%)</span>
                                <span className="font-medium text-gray-800">{formatCurrency(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between py-4 bg-gray-50 -mx-4 px-4 rounded-lg mt-2">
                                <span className="font-bold text-lg text-gray-900">Total</span>
                                <span className="font-bold text-lg text-gray-900">{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <footer className="border-t border-gray-100 pt-8">
                        <h4 className="font-bold text-gray-800 mb-3 tracking-wide uppercase text-sm">Notes</h4>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed min-h-[3rem]">
                            {notes || 'Add any final thanks, payment timelines, or bank details in the controls above.'}
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
}

export default App;
