const { useState } = React;

const PRICE_DATA = {
  'Sample Prep-Simple': { unit: 'per sample', internal: 65, nonprofit: 94, forprofit: 96 },
  'Sample Prep-Complex': { unit: 'per sample', internal: 96, nonprofit: 134, forprofit: 135 },
  'Sample Prep-Trypsin': { unit: 'per sample', internal: 56, nonprofit: 82, forprofit: 85 },
  'Sample Prep-Custom enzyme': { unit: 'per sample', internal: 80, nonprofit: 126, forprofit: 130 },
  'Sample Prep-TiO2': { unit: 'per sample', internal: 130, nonprofit: 170, forprofit: 200 },
  'Sample Prep-Desalt': { unit: 'per sample', internal: 56, nonprofit: 82, forprofit: 85 },
  'Sample Prep-NanoDrop': { unit: 'per sample', internal: 9, nonprofit: 16, forprofit: 16 },
  'Sample Prep-Offline LC': { unit: 'per sample', internal: 395, nonprofit: 530, forprofit: 550 },
  'Sample Prep-Isotopic Labeling': { unit: 'per set', internal: 2000, nonprofit: 3000, forprofit: 3100 },
  'HRMS-Exact Mass': { unit: 'per sample', internal: 210, nonprofit: 330, forprofit: 335 },
  'HRMS-Intact Protein Mass': { unit: 'per sample', internal: 390, nonprofit: 594, forprofit: 594 },
  'LCMSMS-Short gradient': { unit: 'per injection', internal: 104, nonprofit: 150, forprofit: 158 },
  'LCMSMS-Medium gradient': { unit: 'per injection', internal: 118, nonprofit: 171, forprofit: 175 },
  'LCMSMS-Long gradient': { unit: 'per injection', internal: 134, nonprofit: 200, forprofit: 200 },
  'Targeted-SM-Sample': { unit: 'per sample', internal: 75, nonprofit: 110, forprofit: 157 },
  'Targeted-SM-StdCurve': { unit: 'each', internal: 360, nonprofit: 560, forprofit: 557 },
  'Targeted-SM-Optimization': { unit: 'per set', internal: 1040, nonprofit: 1505, forprofit: 1580 },
  'Targeted-SM-Data analysis': { unit: 'per set', internal: 275, nonprofit: 388, forprofit: 388 },
  'DataAnalysis-Protein Quantitation': { unit: 'per set', internal: 965, nonprofit: 1391, forprofit: 1395 },
  'DataAnalysis-Protein ID': { unit: 'per sample', internal: 52, nonprofit: 75, forprofit: 75 },
  'DataAnalysis-Database Configuration': { unit: 'per database', internal: 95, nonprofit: 263, forprofit: 262 },
  'Consulting': { unit: 'per hour', internal: 318, nonprofit: 465, forprofit: 465 },
  'Open Access-Usage': { unit: 'per day', internal: 630, nonprofit: 910, forprofit: 950 }
};

function QuoteGenerator() {
  const [mode, setMode] = useState('auto'); // 'auto' or 'manual'
  const [clientName, setClientName] = useState('');
  const [priceType, setPriceType] = useState('internal');
  const [splitType, setSplitType] = useState('full');
  const [nidaPercent, setNidaPercent] = useState(90);
  
  // Auto mode fields
  const [sampleType, setSampleType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [stainType, setStainType] = useState('none');
  const [isFixed, setIsFixed] = useState('no');
  const [isDestained, setIsDestained] = useState('no');
  const [solutionType, setSolutionType] = useState('');
  const [gradientType, setGradientType] = useState('');
  const [PhosEnrich, setPhosEnrich] = useState('none');
  
  // Quote items
  const [items, setItems] = useState([]);
  const [showQuote, setShowQuote] = useState(false);

  const addItem = () => {
    setItems([...items, { service: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const generateAutoQuote = () => {
    if (!clientName.trim()) {
      alert('Please enter client name');
      return;
    }
    
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    const quoteItems = [];

    if (sampleType === 'gel') {
      let prepSimpleQty = 0;
      let needsFixation = 0;
      let needsDestaining = 0;

      if (isDestained === 'no') {
        if (stainType === 'silver' || stainType === 'coomassie') {
          needsDestaining = qty;
        }
      }

      if (isFixed === 'no') {
        if (stainType === 'silver' || stainType === 'none') {
          needsFixation = qty;
        }
      }
      
      const extraction = qty;
      const totalOps = needsFixation + needsDestaining + extraction;
      prepSimpleQty = Math.max(1, Math.ceil(totalOps / 4));
      
      quoteItems.push({ service: 'Sample Prep-Simple', quantity: prepSimpleQty });
      quoteItems.push({ service: 'Sample Prep-Trypsin', quantity: qty });
      quoteItems.push({ service: 'LCMSMS-Short gradient', quantity: qty });
      quoteItems.push({ service: 'DataAnalysis-Protein ID', quantity: qty });
      quoteItems.push({ service: 'Consulting', quantity: 0.25 });
    } else if (sampleType === 'solution') {
      if (solutionType === 'cell_pellet') {
        quoteItems.push({ service: 'Sample Prep-Complex', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Desalt', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Custom enzyme', quantity: qty });
      } else if (solutionType === 'ip_pulldown' || solutionType === 'cell_lysates') {
        quoteItems.push({ service: 'Sample Prep-Simple', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Desalt', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Custom enzyme', quantity: qty });
      } else if (solutionType === 'contaminants_strap') {
        quoteItems.push({ service: 'Sample Prep-Simple', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Desalt', quantity: qty });
        quoteItems.push({ service: 'Sample Prep-Trypsin', quantity: qty });
      }
      
      if (PhosEnrich === 'Yes') {
        quoteItems.push({ service: 'Sample Prep-TiO2', quantity: qty });
      }
      
      const gradientMultiplier = PhosEnrich === 'Yes' ? 2 : 1;
      if (gradientType === 'dda_lfq') {
        quoteItems.push({ service: 'LCMSMS-Long gradient', quantity: qty * gradientMultiplier });
      } else if (gradientType === 'dia') {
        quoteItems.push({ service: 'LCMSMS-Medium gradient', quantity: qty * gradientMultiplier });
      }

      if (gradientType !== '') {
        quoteItems.push({ service: 'DataAnalysis-Protein ID', quantity: qty * gradientMultiplier });
      }    
      
      quoteItems.push({ service: 'Sample Prep-NanoDrop', quantity: qty * 2 });
      quoteItems.push({ service: 'Consulting', quantity: 0.25 });
    }

    setItems(quoteItems);
    setShowQuote(true);
  };

  const generateManualQuote = () => {
    if (!clientName.trim()) {
      alert('Please enter client name');
      return;
    }
    if (items.length === 0 || items.some(item => !item.service)) {
      alert('Please add at least one service');
      return;
    }
    setShowQuote(true);
  };

  const calculateSubtotal = (item) => {
    if (!item.service) return 0;
    const priceKey = priceType === 'internal' ? 'internal' : 
                     priceType === 'nonprofit' ? 'nonprofit' : 'forprofit';
    const unitPrice = PRICE_DATA[item.service][priceKey];
    return unitPrice * (item.quantity || 0);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + calculateSubtotal(item), 0);
  };

  const calculateNidaTotal = () => {
    return calculateTotal() * (nidaPercent / 100);
  };

  const calculateCoaTotal = () => {
    return calculateTotal() * ((100 - nidaPercent) / 100);
  };

  const exportToExcel = () => {
    const priceKey = priceType === 'internal' ? 'internal' : 
                     priceType === 'nonprofit' ? 'nonprofit' : 'forprofit';
    
    const wsData = [
      [clientName],
      [],
    ];

    const coaPercent = 100 - nidaPercent;
    const headers = ['Service', 'Unit Cost', 'Quantity', 'Subtotal'];
    if (splitType === 'split') {
      headers.push(`${nidaPercent}% NIDA`, `${coaPercent}% COA`);
    }
    wsData.push(headers);

    items.forEach(item => {
      const unitPrice = PRICE_DATA[item.service][priceKey];
      const subtotal = calculateSubtotal(item);
      const row = [item.service, unitPrice, item.quantity, subtotal];
      if (splitType === 'split') {
        row.push(subtotal * (nidaPercent / 100), subtotal * (coaPercent / 100));
      }
      wsData.push(row);
    });

    const totalRow = ['', '', 'TOTAL', calculateTotal()];
    if (splitType === 'split') {
      totalRow.push(calculateNidaTotal(), calculateCoaTotal());
    }
    wsData.push(totalRow);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!cols'] = [{ wch: 35 }, { wch: 12 }, { wch: 10 }, { wch: 12 }];
    if (splitType === 'split') {
      ws['!cols'].push({ wch: 12 }, { wch: 12 });
    }

    const numCols = splitType === 'split' ? 6 : 4;
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: numCols - 1 } }];

    XLSX.utils.book_append_sheet(wb, ws, 'Quote');

    const date = new Date().toISOString().split('T')[0];
    const filename = `Quote_${clientName.replace(/\s+/g, '_')}_${date}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  const printQuote = () => {
    window.print();
  };

  const resetForm = () => {
    setClientName('');
    setSampleType('');
    setQuantity('');
    setStainType('none');
    setIsFixed('no');
    setIsDestained('no');
    setSolutionType('');
    setGradientType('');
    setPhosEnrich('none');
    setItems([]);
    setShowQuote(false);
  };

  const coaPercent = 100 - nidaPercent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-900">
          MS Service Quote Generator
        </h1>

        {!showQuote ? (
          <div className="space-y-6">
            {/* Mode Selection */}
            <div className="flex justify-center gap-4 mb-6">
              <button
                onClick={() => setMode('auto')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  mode === 'auto'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Auto Quote
              </button>
              <button
                onClick={() => setMode('manual')}
                className={`px-6 py-3 rounded-lg font-semibold transition ${
                  mode === 'manual'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Manual Quote
              </button>
            </div>

            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Client Name *</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Price Type *</label>
                <select
                  value={priceType}
                  onChange={(e) => setPriceType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="internal">Internal</option>
                  <option value="nonprofit">Non-Profit</option>
                  <option value="forprofit">For-Profit</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">Billing Type *</label>
                <select
                  value={splitType}
                  onChange={(e) => setSplitType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="full">Full Price</option>
                  <option value="split">Split (NIDA/COA)</option>
                </select>
              </div>
              {splitType === 'split' && (
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">NIDA Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={nidaPercent}
                    onChange={(e) => setNidaPercent(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* Auto Mode Fields */}
            {mode === 'auto' && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Sample Type *</label>
                    <select
                      value={sampleType}
                      onChange={(e) => setSampleType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Select sample type</option>
                      <option value="gel">Gel Band</option>
                      <option value="solution">Solution</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Quantity of Samples *</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      min="1"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter number of samples"
                    />
                  </div>
                </div>

                {sampleType === 'gel' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Stain Type</label>
                        <select
                          value={stainType}
                          onChange={(e) => setStainType(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="none">None</option>
                          <option value="silver">Silver Stain</option>
                          <option value="coomassie">Coomassie Stain</option>
                        </select>
                      </div>

                      {(stainType === 'silver' || stainType === 'coomassie') && (
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">Has the sample been destained?</label>
                          <select
                            value={isDestained}
                            onChange={(e) => setIsDestained(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="no">No</option>
                            <option value="yes">Yes</option>
                          </select>
                        </div>
                      )}
                    </div>

                    {(stainType === 'silver' || stainType === 'none') && (
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Has the sample been fixed?</label>
                        <select
                          value={isFixed}
                          onChange={(e) => setIsFixed(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="no">No</option>
                          <option value="yes">Yes</option>
                        </select>
                      </div>
                    )}
                  </>
                )}

                {sampleType === 'solution' && (
                  <>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Solution Sample Type *</label>
                        <select
                          value={solutionType}
                          onChange={(e) => setSolutionType(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select solution type</option>
                          <option value="cell_pellet">Cell Pellet (requires sonication)</option>
                          <option value="ip_pulldown">Immunoprecipitation Pull-down</option>
                          <option value="cell_lysates">Cell Lysates</option>
                          <option value="contaminants_strap">Contaminants/Detergents/Salt (S-trap)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700">Gradient Type *</label>
                        <select
                          value={gradientType}
                          onChange={(e) => setGradientType(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        >
                          <option value="">Select gradient type</option>
                          <option value="dda_lfq">DDA LFQ (Long Gradient)</option>
                          <option value="dia">DIA (Medium Gradient)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">TiO2 Phospho Enrichment *</label>
                      <select
                        value={PhosEnrich}
                        onChange={(e) => setPhosEnrich(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="Yes">Yes</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                  </>
                )}

                <button
                  onClick={generateAutoQuote}
                  disabled={!sampleType || !quantity || (sampleType === 'solution' && (!solutionType || !gradientType))}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Generate Auto Quote
                </button>
              </>
            )}

            {/* Manual Mode Fields */}
            {mode === 'manual' && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Line Items</h2>
                    <button
                      onClick={addItem}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                    >
                      ➕ Add Item
                    </button>
                  </div>

                  <div className="space-y-3">
                    {items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <select
                            value={item.service}
                            onChange={(e) => updateItem(index, 'service', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Select Service</option>
                            {Object.keys(PRICE_DATA).map(service => (
                              <option key={service} value={service}>{service}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-32">
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="Qty"
                          />
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateManualQuote}
                  className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-lg"
                >
                  Generate Manual Quote
                </button>
              </>
            )}
          </div>
        ) : (
          <div>
            {/* Edit Mode in Quote Display */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Edit Quote Items</h2>
                <button
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                  ➕ Add Item
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {items.map((item, index) => (
                  <div key={index} className="flex gap-3 items-start bg-gray-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <select
                        value={item.service}
                        onChange={(e) => updateItem(index, 'service', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">Select Service</option>
                        {Object.keys(PRICE_DATA).map(service => (
                          <option key={service} value={service}>{service}</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-32">
                      <input
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        placeholder="Qty"
                      />
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div id="quote-display">
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">{clientName}</h2>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-indigo-600 text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left">Service</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Unit Cost</th>
                      <th className="border border-gray-300 px-4 py-3 text-center">Quantity</th>
                      <th className="border border-gray-300 px-4 py-3 text-right">Subtotal</th>
                      {splitType === 'split' && (
                        <>
                          <th className="border border-gray-300 px-4 py-3 text-right">{nidaPercent}% NIDA</th>
                          <th className="border border-gray-300 px-4 py-3 text-right">{coaPercent}% COA</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => {
                      const subtotal = calculateSubtotal(item);
                      const priceKey = priceType === 'internal' ? 'internal' : 
                                     priceType === 'nonprofit' ? 'nonprofit' : 'forprofit';
                      const unitPrice = PRICE_DATA[item.service][priceKey];
                      
                      return (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2">{item.service}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">${unitPrice.toFixed(2)}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{item.quantity}</td>
                          <td className="border border-gray-300 px-4 py-2 text-right">${subtotal.toFixed(2)}</td>
                          {splitType === 'split' && (
                            <>
                              <td className="border border-gray-300 px-4 py-2 text-right">
                                ${(subtotal * (nidaPercent / 100)).toFixed(2)}
                              </td>
                              <td className="border border-gray-300 px-4 py-2 text-right">
                                ${(subtotal * (coaPercent / 100)).toFixed(2)}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan="3" className="border border-gray-300 px-4 py-3 text-right">TOTAL</td>
                      <td className="border border-gray-300 px-4 py-3 text-right">${calculateTotal().toFixed(2)}</td>
                      {splitType === 'split' && (
                        <>
                          <td className="border border-gray-300 px-4 py-3 text-right">
                            ${calculateNidaTotal().toFixed(2)}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-right">
                            ${calculateCoaTotal().toFixed(2)}
                          </td>
                        </>
                      )}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
              >
                New Quote
              </button>
              <button
                onClick={() => setShowQuote(false)}
                className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Edit Quote
              </button>
              <button
                onClick={exportToExcel}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                📊 Export to Excel
              </button>
              <button
                onClick={printQuote}
                className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                🖨️ Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ReactDOM.render(<QuoteGenerator />, document.getElementById('root'));
