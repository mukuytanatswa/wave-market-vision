# 🚀 Market Prediction Dashboard

A real-time cryptocurrency market analysis platform with AI-powered predictions. Built with React, TypeScript, and modern fintech design principles.

![Market Prediction Dashboard](https://img.shields.io/badge/Status-Live-brightgreen) ![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue) ![React](https://img.shields.io/badge/React-18.3.1-61DAFB)

## ✨ Features

### 📊 Real-Time Market Data
- **Live cryptocurrency prices** from CoinGecko API
- **Market cap and volume tracking** across major cryptocurrencies
- **24-hour price change indicators** with visual trend arrows
- **Bitcoin dominance** percentage with animated progress bars

### 🤖 AI-Powered Predictions
- **Technical analysis algorithms** using moving averages
- **Bullish/Bearish/Neutral predictions** with confidence scores
- **Real-time sentiment analysis** based on price momentum
- **Predictive price charts** with dotted forecast lines

### 📈 Advanced Visualizations
- **Interactive price charts** with gradient fills
- **Technical indicators** overlaid on price data
- **Market overview cards** with key metrics
- **Responsive design** optimized for desktop and mobile

### 🎨 Modern Fintech Design
- **Dark theme** with neon blue/green accents
- **Gradient backgrounds** and glow effects
- **Professional typography** with smooth animations
- **Card-based layout** for optimal data organization

## 🛠️ Technology Stack

- **Frontend**: React 18.3.1 + TypeScript
- **Styling**: TailwindCSS + Custom Design System
- **Charts**: Recharts for data visualization
- **UI Components**: Shadcn/ui component library
- **API**: CoinGecko REST API (free tier)
- **Build Tool**: Vite
- **Deployment**: Lovable Platform

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:8080`

## 📊 API Integration

### CoinGecko API (Free Tier)
The dashboard uses CoinGecko's public API for real-time cryptocurrency data:

- **Market Data**: `/api/v3/coins/markets`
- **Price History**: `/api/v3/coins/{id}/market_chart`
- **Rate Limits**: 100 requests/minute (free tier)

### AlphaVantage Integration
API key support is included for premium data sources:
```typescript
// Add your API key in marketApi.ts
const ALPHA_VANTAGE_KEY = 'YOUR_API_KEY_HERE';
```

## 🧮 Prediction Algorithms

### Moving Average Analysis
```typescript
const generatePrediction = (prices: number[]) => {
  const recent = prices.slice(-5);
  const older = prices.slice(-10, -5);
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const change = ((recentAvg - olderAvg) / olderAvg) * 100;
  
  // Determine bullish/bearish sentiment
  return {
    direction: change > 2 ? 'bullish' : change < -2 ? 'bearish' : 'neutral',
    confidence: Math.min(90, Math.abs(change * 10) + 60)
  };
};
```

## 🎨 Design System

### Color Palette
```css
/* Primary Colors */
--primary: 217 91% 60%;        /* Neon Blue */
--success: 142 76% 36%;        /* Market Green */
--destructive: 0 84% 60%;      /* Market Red */

/* Gradients */
--gradient-primary: linear-gradient(135deg, hsl(217 91% 60%), hsl(224 76% 48%));
--gradient-success: linear-gradient(135deg, hsl(142 76% 36%), hsl(158 64% 52%));
```

### Component Variants
- **Hero buttons** with gradient backgrounds
- **Market cards** with hover glow effects
- **Success/danger** states for price movements
- **Animated progress bars** for market dominance

## 📱 Features Breakdown

### Market Overview Section
- Total market capitalization with 24h change
- Trading volume across all cryptocurrencies
- Bitcoin dominance percentage tracker
- AI prediction summary with confidence score

### Price Analysis Charts
- Interactive line/area charts with Recharts
- Real-time price data with prediction overlays
- Cryptocurrency selector for different assets
- Technical indicators and trend analysis

### Cryptocurrency Cards
- Individual coin performance metrics
- AI-generated predictions (Bullish/Bearish/Neutral)
- Confidence percentages based on technical analysis
- Volume and market cap information

## 🔮 Future Enhancements

### Advanced Predictions
- [ ] Machine learning models (LSTM, ARIMA)
- [ ] Social sentiment analysis from Twitter/Reddit
- [ ] On-chain metrics integration
- [ ] Portfolio optimization algorithms

### Additional Features
- [ ] User authentication and portfolios
- [ ] Price alerts and notifications
- [ ] Trading integration via APIs
- [ ] Historical backtesting of predictions

### Data Sources
- [ ] Multiple exchange integration
- [ ] DeFi protocol data
- [ ] NFT market analysis
- [ ] Traditional finance correlation

## 📄 License

This project is built on Lovable platform. See deployment settings for usage terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

- **Documentation**: [Lovable Docs](https://docs.lovable.dev)
- **Community**: [Discord](https://discord.com/channels/1119885301872070706/1280461670979993613)
- **Issues**: Create an issue in this repository

---

**Built with ❤️ using Lovable Platform**