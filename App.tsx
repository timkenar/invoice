import React, { useState, useMemo } from 'react';
import { InvoiceItem } from './types';

// Helper to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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
    
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="bg-gray-100 min-h-screen p-4 sm:p-8 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* --- Controls --- */}
                <div className="mb-8 p-4 bg-white rounded-lg shadow-lg print:hidden">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Invoice Controls</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload Logo</label>
                            <input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        </div>
                        <div>
                            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
                            <input type="number" id="taxRate" value={taxRate} onChange={e => setTaxRate(parseFloat(e.target.value) || 0)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" />
                        </div>
                    </div>
                     <div className="mt-6 text-center">
                        <button onClick={handlePrint} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                            Print / Download PDF
                        </button>
                    </div>
                </div>

                {/* --- Invoice --- */}
                <div id="invoice" className="bg-white rounded-lg shadow-lg p-8 sm:p-12">
                    {/* Header */}
                    <header className="flex justify-between items-start mb-12 border-b pb-8">
                        <div>
                            {logo ? <img src={logo} alt="Company Logo" className="w-32 h-auto" /> : <div className="w-32 h-16 bg-gray-200 flex items-center justify-center text-gray-500 rounded">Your Logo</div>}
                            <input
                                type="text"
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                placeholder="Your Company"
                                className="text-xl font-bold text-gray-800 mt-4 w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md"
                            />
                             <textarea
                                placeholder="Your Company Address"
                                value={companyAddress}
                                onChange={e => setCompanyAddress(e.target.value)}
                                className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md text-gray-600 resize-none"
                                rows={3}
                            ></textarea>
                        </div>
                        <div className="text-right">
                            <h1 className="text-4xl font-extrabold text-gray-800 uppercase">Invoice</h1>
                            <p className="text-gray-600 mt-2"># <input type="text" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} className="p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md w-40 text-right"/></p>
                        </div>
                    </header>

                    {/* Bill To and Dates */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div>
                            <h3 className="font-bold text-gray-700 mb-2">Bill To</h3>
                             <input type="text" placeholder="Client Name" value={billToName} onChange={e => setBillToName(e.target.value)} className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md mb-1 text-gray-800 font-semibold" />
                             <textarea placeholder="Client Address" value={billToAddress} onChange={e => setBillToAddress(e.target.value)} className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md text-gray-600 resize-none" rows={3}></textarea>
                        </div>
                        <div className="text-right">
                            <div className="mb-2">
                                <span className="font-bold text-gray-700">Date: </span>
                                <span className="text-gray-600">{today}</span>
                            </div>
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
                                                        <input type="text" value={item.description} onChange={e => handleItemChange(item.id, 'description', e.target.value)} className="w-full p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md"/>
                                                    </td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 text-center"><input type="number" value={item.quantity} onChange={e => handleItemChange(item.id, 'quantity', e.target.value)} className="w-16 p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md text-center"/></td>
                                                    <td className="px-3 py-4 text-sm text-gray-500 text-center"><input type="number" value={item.price} onChange={e => handleItemChange(item.id, 'price', e.target.value)} className="w-24 p-1 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md text-center"/></td>
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
                         <button onClick={handleAddItem} className="mt-4 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold py-2 px-4 rounded-lg text-sm print:hidden">
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
                    <footer className="border-t pt-8">
                        <h4 className="font-bold text-gray-700 mb-2">Notes</h4>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full p-2 border border-transparent hover:border-gray-300 focus:border-blue-500 rounded-md text-gray-600 resize-none" rows={3}></textarea>
                    </footer>
                </div>
            </div>
            <style>{`
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                #invoice {
                  box-shadow: none !important;
                  border: none !important;
                  margin: 0 !important;
                  max-width: 100% !important;
                  padding: 0 !important;
                }
                input, textarea {
                    border-color: transparent !important;
                    -webkit-appearance: none;
                    -moz-appearance: none;
                    appearance: none;
                    background-color: white !important;
                    color: inherit !important;
                    padding: 2px !important;
                    resize: none !important;
                    box-shadow: none !important;
                    outline: none !important;
                }
                input::placeholder, textarea::placeholder {
                    color: transparent !important;
                }
              }
            `}</style>
        </div>
    );
}

export default App;
