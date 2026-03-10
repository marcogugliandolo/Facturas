import React, { useState, useRef, useEffect } from 'react';
import { Download, Plus, Trash2, FileText, User, Lock, LogOut, Eye, Edit3 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientAddress1: string;
  clientPostalCode: string;
  clientCity: string;
  clientTaxId: string;
  companyName: string;
  companyAddress: string;
  items: InvoiceItem[];
  vatPercentage: number;
  paymentMethod: string;
  paymentAccount: string;
}

const initialData: InvoiceData = {
  invoiceNumber: '06',
  date: '18/02/2026',
  clientName: 'Ponsar Desarrollos, S.L.',
  clientAddress1: 'Cr. General San Cosme, 28',
  clientPostalCode: '27993',
  clientCity: 'Lugo',
  clientTaxId: 'B24842734',
  companyName: 'Yass&Moo S.L B44998524',
  companyAddress: 'Calle Quiroga 9-11 27002 Lugo',
  items: [
    {
      id: '1',
      description: 'Primer pago comisión venta solar Ona de Chave',
      quantity: 1,
      price: 12500,
    },
  ],
  vatPercentage: 21,
  paymentMethod: 'Transferencia bancaria',
  paymentAccount: '71 0182 2585 1002 0172 6165',
};

const Logo = ({ compact = false }: { compact?: boolean }) => (
  <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
    <div className={`bg-black text-white ${compact ? 'p-1.5 rounded-lg' : 'p-2.5 rounded-xl'} shadow-md`}>
      <FileText size={compact ? 18 : 22} strokeWidth={2} />
    </div>
    <span className={`${compact ? 'text-lg sm:text-xl' : 'text-2xl'} font-extrabold tracking-tight text-gray-900`}>
      Facturas Yass&Moo
    </span>
  </div>
);

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      if (username === 'ruben' && password === 'rubenseco') {
        onLogin();
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-6 selection:bg-gray-200">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-10">
          <Logo />
        </div>
        <div className="bg-white p-8 sm:p-10 rounded-[2rem] shadow-xl border border-gray-100 relative overflow-hidden">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center tracking-tight">Acceso</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">Introduce tus datos para entrar</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm text-center font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Usuario</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input 
                  type="text" 
                  required 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white outline-none transition-all text-sm font-medium" 
                  placeholder="Usuario" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent focus:bg-white outline-none transition-all text-sm font-medium" 
                  placeholder="••••••••" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-black hover:bg-gray-900 text-white font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex justify-center items-center mt-6 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState<InvoiceData>(initialData);
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const invoiceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    if (activeTab === 'form' && formRef.current) {
      formRef.current.scrollTop = 0;
    } else if (activeTab === 'preview' && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { clientWidth } = containerRef.current;
        const availableWidth = clientWidth - 32; // 16px padding on each side
        const newScale = Math.min(1, availableWidth / 794);
        setPreviewScale(newScale);
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    updateScale();

    return () => observer.disconnect();
  }, [activeTab]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => {
    setData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { id: crypto.randomUUID(), description: '', quantity: 1, price: 0 },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
  };

  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const calculateVAT = () => {
    return (calculateSubtotal() * data.vatPercentage) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const handleDownloadPDF = async () => {
    if (activeTab === 'form' && window.innerWidth < 1024) {
      setActiveTab('preview');
      // Wait for React to render the preview tab and animations to finish
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    if (!invoiceRef.current) return;

    const wrapper = document.getElementById('invoice-wrapper');
    const originalTransform = wrapper?.style.transform;
    const originalMargin = wrapper?.style.marginBottom;

    if (wrapper) {
      wrapper.style.transform = 'none';
      wrapper.style.marginBottom = '0px';
    }

    // Pequeña pausa para que el DOM se actualice antes de capturar
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      
      if (imgData === 'data:,') {
        throw new Error('Canvas is empty. The element might be hidden.');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Factura_${data.invoiceNumber}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      if (wrapper) {
        wrapper.style.transform = originalTransform || '';
        wrapper.style.marginBottom = originalMargin || '';
      }
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  const InputField = ({ label, name, value, type = "text", className = "" }: any) => (
    <div className={className}>
      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={handleInputChange}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all text-sm font-medium text-gray-900"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col pb-24 lg:pb-0">
      {/* Navbar */}
      <header className="bg-white px-6 py-3 flex justify-between items-center print:hidden z-20 sticky top-0 border-b border-gray-200">
        <Logo compact />
        <button 
          onClick={() => setIsLoggedIn(false)} 
          className="text-gray-500 hover:text-black flex items-center gap-2 text-sm font-bold transition-colors bg-gray-50 hover:bg-gray-100 px-4 py-2.5 rounded-xl"
        >
          <LogOut size={18} /> <span className="hidden sm:inline">Salir</span>
        </button>
      </header>

      {/* Mobile Tabs */}
      <div className="flex lg:hidden bg-white border-b border-gray-200 sticky top-[73px] z-20">
        <button 
          onClick={() => setActiveTab('form')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'form' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
        >
          <Edit3 size={18} /> Editar Datos
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'preview' ? 'text-black border-b-2 border-black' : 'text-gray-400'}`}
        >
          <Eye size={18} /> Vista Previa
        </button>
      </div>

      {/* Main Content */}
      <main className="flex flex-col lg:flex-row flex-grow h-[calc(100vh-73px)] overflow-hidden">
        
        {/* Form Section */}
        <div ref={formRef} className={`w-full lg:w-[400px] xl:w-[500px] bg-white border-r border-gray-200 overflow-y-auto print:hidden ${activeTab === 'form' ? 'block' : 'hidden lg:block'}`}>
          <div className="p-4 sm:p-6 space-y-6">
            
            {/* General Info */}
            <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div> Información General
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Nº Factura" name="invoiceNumber" value={data.invoiceNumber} />
                <InputField label="Fecha" name="date" value={data.date} />
              </div>
            </section>

            {/* Client Info */}
            <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div> Datos del Cliente
              </h3>
              <div className="space-y-4">
                <InputField label="Nombre / Razón Social" name="clientName" value={data.clientName} />
                <InputField label="Dirección" name="clientAddress1" value={data.clientAddress1} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="C.P." name="clientPostalCode" value={data.clientPostalCode} />
                  <InputField label="Ciudad" name="clientCity" value={data.clientCity} />
                </div>
                <InputField label="NIF / CIF" name="clientTaxId" value={data.clientTaxId} />
              </div>
            </section>

            {/* Company Info */}
            <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div> Datos de la Empresa
              </h3>
              <div className="space-y-4">
                <InputField label="Nombre y NIF" name="companyName" value={data.companyName} />
                <InputField label="Dirección" name="companyAddress" value={data.companyAddress} />
              </div>
            </section>

            {/* Items */}
            <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-black"></div> Conceptos
                </h3>
                <button
                  onClick={addItem}
                  className="bg-black text-white hover:bg-gray-800 px-3 py-1.5 rounded-lg flex items-center text-xs font-bold transition-colors"
                >
                  <Plus size={14} className="mr-1" /> Añadir
                </button>
              </div>
              <div className="space-y-4">
                {data.items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-white rounded-xl border border-gray-200 relative shadow-sm">
                    {data.items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="absolute -top-2 -right-2 bg-red-100 text-red-600 hover:bg-red-200 p-1.5 rounded-full transition-colors shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Detalle</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Cantidad</label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Precio (€)</label>
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Totals & Payment */}
            <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-black"></div> Totales y Pago
              </h3>
              <div className="space-y-4">
                <InputField label="IVA (%)" name="vatPercentage" type="number" value={data.vatPercentage} />
                <InputField label="Método de Pago" name="paymentMethod" value={data.paymentMethod} />
                <InputField label="Cuenta / Detalles" name="paymentAccount" value={data.paymentAccount} />
              </div>
            </section>

            {/* Desktop Actions */}
            <div className="hidden lg:flex pt-4">
              <button
                onClick={handleDownloadPDF}
                className="w-full bg-black hover:bg-gray-900 text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-md active:scale-[0.98]"
              >
                <Download size={18} className="mr-2" /> Descargar PDF
              </button>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div 
          ref={containerRef}
          className={`w-full lg:flex-1 bg-gray-200/60 overflow-y-auto overflow-x-auto p-4 sm:p-8 justify-center items-start print:p-0 print:bg-transparent print:block ${activeTab === 'preview' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div 
            id="invoice-wrapper"
            style={{ 
              transform: `scale(${previewScale})`, 
              transformOrigin: 'top center',
              marginBottom: `-${1123 * (1 - previewScale)}px`
            }}
            className="print:!transform-none print:!m-0 transition-transform duration-200 ease-out"
          >
            <div 
              ref={invoiceRef}
              className="bg-white shadow-2xl w-[794px] h-[1123px] shrink-0 flex flex-col print:shadow-none print:w-[210mm] print:h-[297mm] print:m-0"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {/* Top Beige Background */}
            <div className="bg-[#F4EFEA] w-full pt-20 pb-12 px-16 print:bg-[#F4EFEA] print:print-color-adjust-exact">
              <div className="w-max flex flex-col">
                <h1 className="text-[64px] font-medium tracking-wide text-black leading-none mb-3 border-b-[4px] border-black pb-2 text-center">FACTURA</h1>
                <div className="border-[2px] border-black px-4 py-2 font-bold text-xl text-center bg-transparent">
                  Nº: {data.invoiceNumber} <span className="ml-4">{data.date}</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow bg-white px-16 pt-16 flex flex-col justify-between">
              
              <div>
                {/* Client & Company Info */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-12 mb-16">
                  <div>
                    <h3 className="font-bold text-sm mb-2 text-black">DATOS DEL CLIENTE</h3>
                    <div className="text-sm leading-relaxed text-black">
                      <p>{data.clientName}</p>
                      <p>{data.clientAddress1}</p>
                      <p>{data.clientPostalCode}</p>
                      <p>{data.clientCity}</p>
                      <p>{data.clientTaxId}</p>
                    </div>
                  </div>
                  <div className="w-px bg-black h-32 mt-1"></div>
                  <div className="text-right">
                    <h3 className="font-bold text-sm mb-2 text-black">DATOS DE LA EMPRESA</h3>
                    <div className="text-sm leading-relaxed text-black">
                      <p>{data.companyName}</p>
                      <p>{data.companyAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-4">
                  <div className="border-[2px] border-black flex font-bold text-sm text-black py-2.5 px-4 mb-4">
                    <div className="w-[55%]">Detalle</div>
                    <div className="w-[15%] text-center">Cantidad</div>
                    <div className="w-[15%] text-center">Precio</div>
                    <div className="w-[15%] text-center">Total</div>
                  </div>
                  <div className="flex flex-col text-sm text-black">
                    {data.items.map((item) => (
                      <div key={item.id} className="flex px-4 py-2">
                        <div className="w-[55%]">{item.description}</div>
                        <div className="w-[15%] text-center">
                          {item.quantity < 10 ? `0${item.quantity}` : item.quantity}
                        </div>
                        <div className="w-[15%] text-center">
                          {item.price.toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}€
                        </div>
                        <div className="w-[15%] text-center">
                          {(item.quantity * item.price).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}€
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-b-[1.5px] border-black mt-24 mb-6"></div>

                {/* Totals */}
                <div className="flex justify-end mb-16">
                  <div className="w-[45%]">
                    <div className="flex text-sm text-black py-2 px-4">
                      <div className="w-1/3 font-bold">IVA</div>
                      <div className="w-1/3 text-center">{data.vatPercentage} %</div>
                      <div className="w-1/3 text-right">{calculateVAT().toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}€</div>
                    </div>
                    <div className="flex text-sm text-black py-2.5 px-4 border-[2px] border-black font-bold mt-2">
                      <div className="w-1/2">TOTAL</div>
                      <div className="w-1/2 text-right">{calculateTotal().toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}€</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mb-16">
                <div className="border-[2px] border-black p-6 w-[320px] bg-white">
                  <h3 className="font-bold text-sm mb-4 text-black">INFORMACIÓN DE PAGO</h3>
                  <div className="text-sm leading-relaxed text-black">
                    <p>{data.paymentMethod}</p>
                    <p>{data.paymentAccount}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Beige Background */}
            <div className="bg-[#F4EFEA] h-[100px] w-full shrink-0 print:bg-[#F4EFEA] print:print-color-adjust-exact"></div>
          </div>
        </div>
      </div>
    </main>

      {/* Mobile Fixed Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 flex z-40 pb-safe">
        <button
          onClick={handleDownloadPDF}
          className="w-full bg-black text-white py-3.5 rounded-xl font-bold flex items-center justify-center active:scale-95 transition-transform shadow-lg"
        >
          <Download size={18} className="mr-2" /> Descargar PDF
        </button>
      </div>
    </div>
  );
}
