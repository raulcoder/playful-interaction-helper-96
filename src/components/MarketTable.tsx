import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { MarketData } from '../types/binance';
import { MarketRow } from './market/MarketRow';

const DELISTED_TOKENS = [
  "DGBUSDT", "WAVESUSDT", "MDTUSDT", "RADUSDT", "STRAXUSDT", 
  "SLPUSDT", "IDEXUSDT", "CVXUSDT", "SNTUSDT", "STPTUSDT", 
  "CTKUSDT", "GLMRUSDT", "AGIXUSDT", "OCEANUSDT", "MATICUSDT"
];

interface MarketTableProps {
  data: MarketData[];
}

export const formatNumber = (value: number) => {
  if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(2)}K`;
  }
  return value.toFixed(2);
};

export function MarketTable({ data }: MarketTableProps) {
  const [sortField, setSortField] = useState<'priceChangePercent' | 'lastPrice' | 'volume' | 'longShortRatio' | 'volatility' | 'rsi' | 'iaSignal' | 'macd' | 'emas' | 'topTrade'>('priceChangePercent');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSort = (field: 'priceChangePercent' | 'lastPrice' | 'volume' | 'longShortRatio' | 'volatility' | 'rsi' | 'iaSignal' | 'macd' | 'emas' | 'topTrade') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: 'priceChangePercent' | 'lastPrice' | 'volume' | 'longShortRatio' | 'volatility' | 'rsi' | 'iaSignal' | 'macd' | 'emas' | 'topTrade') => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const getBTCStatus = () => {
    const btcData = data.find(item => item.symbol === 'BTCUSDT');
    if (!btcData) return { price: '0', status: 'neutral', change24h: '0' };
    
    const price = parseFloat(btcData.lastPrice);
    const ema12_5m = btcData.technicalIndicators?.ema12_5m || 0;
    const ema26_5m = btcData.technicalIndicators?.ema26_5m || 0;
    const ema12_15m = btcData.technicalIndicators?.ema12_15m || 0;
    const ema26_15m = btcData.technicalIndicators?.ema26_15m || 0;
    const ema12_1h = btcData.technicalIndicators?.ema12_1h || 0;
    const ema26_1h = btcData.technicalIndicators?.ema26_1h || 0;
    const change24h = parseFloat(btcData.priceChangePercent);
    
    const above5m = price > ema12_5m && price > ema26_5m;
    const above15m = price > ema12_15m && price > ema26_15m;
    const above1h = price > ema12_1h && price > ema26_1h;
    
    const below5m = price < ema12_5m && price < ema26_5m;
    const below15m = price < ema12_15m && price < ema26_15m;
    const below1h = price < ema12_1h && price < ema26_1h;
    
    const status = above5m && above15m && above1h ? 'bullish' : 
                  below5m && below15m && below1h ? 'bearish' : 
                  'neutral';
    
    return {
      price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status,
      change24h: change24h.toFixed(2)
    };
  };

  const getBTCDominance = () => {
    const btcDomData = data.find(item => item.symbol === 'BTCDOMUSDT');
    if (!btcDomData) return { price: '0', status: 'neutral', change24h: '0' };
    
    const price = parseFloat(btcDomData.lastPrice);
    const ema12_5m = btcDomData.technicalIndicators?.ema12_5m || 0;
    const ema26_5m = btcDomData.technicalIndicators?.ema26_5m || 0;
    const ema12_15m = btcDomData.technicalIndicators?.ema12_15m || 0;
    const ema26_15m = btcDomData.technicalIndicators?.ema26_15m || 0;
    const ema12_1h = btcDomData.technicalIndicators?.ema12_1h || 0;
    const ema26_1h = btcDomData.technicalIndicators?.ema26_1h || 0;
    const change24h = parseFloat(btcDomData.priceChangePercent);
    
    const above5m = price > ema12_5m && price > ema26_5m;
    const above15m = price > ema12_15m && price > ema26_15m;
    const above1h = price > ema12_1h && price > ema26_1h;
    
    const below5m = price < ema12_5m && price < ema26_5m;
    const below15m = price < ema12_15m && price < ema26_15m;
    const below1h = price < ema12_1h && price < ema26_1h;
    
    return {
      price: price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      status: above5m && above15m && above1h ? 'bullish' : below5m && below15m && below1h ? 'bearish' : 'neutral',
      change24h: change24h.toFixed(2)
    };
  };

  const filteredData = data
    .filter(item => item.symbol.endsWith('USDT'))
    .filter(item => !DELISTED_TOKENS.includes(item.symbol))
    .filter(item => item.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(item => {
      const rsi = item.technicalIndicators?.rsi || 0;
      return rsi > 0;
    })
    .sort((a, b) => {
      let aValue: number | string = 0;
      let bValue: number | string = 0;

      switch (sortField) {
        case 'priceChangePercent':
          aValue = parseFloat(a.priceChangePercent);
          bValue = parseFloat(b.priceChangePercent);
          break;
        case 'lastPrice':
          aValue = parseFloat(a.lastPrice);
          bValue = parseFloat(b.lastPrice);
          break;
        case 'volume':
          aValue = parseFloat(a.volume);
          bValue = parseFloat(b.volume);
          break;
        case 'longShortRatio':
          aValue = parseFloat(a.longShortRatio || '1.0');
          bValue = parseFloat(b.longShortRatio || '1.0');
          break;
        case 'rsi':
          aValue = a.technicalIndicators?.rsi || 0;
          bValue = b.technicalIndicators?.rsi || 0;
          break;
        case 'iaSignal':
          aValue = a.technicalIndicators?.iaSignal || '';
          bValue = b.technicalIndicators?.iaSignal || '';
          break;
        case 'macd':
          aValue = a.technicalIndicators?.macd || '';
          bValue = b.technicalIndicators?.macd || '';
          break;
        default:
          aValue = 0;
          bValue = 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return sortDirection === 'asc' 
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });

  const topTrades = filteredData
    .sort((a, b) => (parseInt(b.count || '0') - parseInt(a.count || '0')))
    .slice(0, 5);

  const btcStatus = getBTCStatus();
  const btcDominance = getBTCDominance();

  const formatPriceChange = (change: number) => {
    const absChange = Math.abs(change);
    return change >= 0 ? `+${absChange.toFixed(2)}%` : `-${absChange.toFixed(2)}%`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-br from-primary-100/50 to-primary-200/50 dark:from-gray-800/50 dark:to-gray-700/50 p-6 rounded-2xl shadow-xl backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="stats-card hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">Bitcoin</h3>
                <div className={`text-3xl font-bold ${btcStatus.status === 'bullish' ? 'text-green-500' : btcStatus.status === 'bearish' ? 'text-red-500' : 'text-gray-500'} mb-2`}>
                  ${btcStatus.price}
                </div>
                <div className={`text-sm ${parseFloat(btcStatus.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  24h: {formatPriceChange(parseFloat(btcStatus.change24h))}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                btcStatus.status === 'bullish' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : btcStatus.status === 'bearish' 
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
              }`}>
                <span className="font-medium">
                  {btcStatus.status === 'bullish' ? 'BULLISH' : btcStatus.status === 'bearish' ? 'BEARISH' : 'NEUTRAL'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="stats-card hover:scale-105 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-1">BTC Dominance</h3>
                <div className={`text-3xl font-bold ${btcDominance.status === 'bullish' ? 'text-green-500' : btcDominance.status === 'bearish' ? 'text-red-500' : 'text-gray-500'} mb-2`}>
                  ${btcDominance.price}
                </div>
                <div className={`text-sm ${parseFloat(btcDominance.change24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  24h: {formatPriceChange(parseFloat(btcDominance.change24h))}
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                btcDominance.status === 'bullish'
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                  : btcDominance.status === 'bearish'
                  ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                  : 'bg-gray-100 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400'
              }`}>
                <span className="font-medium">
                  {btcDominance.status === 'bullish' ? 'BULLISH' : btcDominance.status === 'bearish' ? 'BEARISH' : 'NEUTRAL'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Pesquisar moeda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-300"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        <h3 className="text-xl font-bold mb-4 text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
          Top Trades
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {topTrades.map((trade) => {
            const lsRatio = parseFloat(trade.longShortRatio || '1.0');
            const isLongDominant = lsRatio > 1.0;
            const tradeCount = parseInt(trade.count || '0');
            
            return (
              <div key={trade.symbol} 
                className="glass-effect p-4 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-fade-in">
                <div className="font-medium text-gray-700 dark:text-gray-200 mb-2">{trade.symbol.replace('USDT', '')}</div>
                <div className={`text-lg font-bold ${parseFloat(trade.priceChangePercent) > 0 ? 'text-green-500' : 'text-red-500'} mb-2`}>
                  {formatPriceChange(parseFloat(trade.priceChangePercent))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Trades: {formatNumber(tradeCount)}
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  {isLongDominant ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={isLongDominant ? 'text-green-500' : 'text-red-500'}>
                    L/S: {lsRatio.toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800 glass-effect">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Par
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('iaSignal')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  Sinal IA
                  {getSortIcon('iaSignal')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('priceChangePercent')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  24h %
                  {getSortIcon('priceChangePercent')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('lastPrice')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  Preço
                  {getSortIcon('lastPrice')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('volume')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  Volume
                  {getSortIcon('volume')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('rsi')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  RSI
                  {getSortIcon('rsi')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('macd')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  MACD
                  {getSortIcon('macd')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('emas')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  EMAs
                  {getSortIcon('emas')}
                </div>
              </th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('longShortRatio')}>
                <div className="flex items-center gap-1 sm:gap-2">
                  L/S Ratio
                  {getSortIcon('longShortRatio')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.map((item) => (
              <MarketRow key={item.symbol} item={{
                ...item,
                priceChangePercent: formatPriceChange(parseFloat(item.priceChangePercent))
              }} />
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Mostrando {filteredData.length} de {data.length} pares
      </div>
    </div>
  );
}
