# GuardPoint - Your Pocket Guide to Rights and Safety

A mobile-first web application providing clear, location-specific guides and scripts for interactions with law enforcement, and tools for documenting incidents, empowering individuals with knowledge and preparedness.

## 🚀 Features

### Core Features
- **State-Specific Rights Summaries**: Concise, mobile-optimized guides detailing user rights and relevant laws, tailored to the user's current location
- **Scenario-Based Scripts**: Pre-written, easy-to-follow scripts in English and Spanish for common police interactions
- **Instant Record & Share**: One-tap button to initiate audio/video recording and generate shareable summary cards with contextual information

### Premium Features
- **Advanced Documentation Tools**: Professional incident report templates and forms
- **Multi-language Support**: Scripts and content in 10+ languages
- **Offline Access**: All content available without internet connection
- **Priority AI-generated Content**: Custom rights guides and scripts powered by OpenAI
- **Extended Cloud Storage**: Secure IPFS storage via Pinata for incident recordings
- **Legal Resource Database**: Access to comprehensive legal resources and updates

## 🛠 Technology Stack

### Frontend
- **React 18.2.0** - Modern React with hooks and context
- **Vite 5.4.19** - Fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **React Hot Toast** - Elegant toast notifications
- **Framer Motion** - Smooth animations and transitions

### Backend & Services
- **Supabase** - Backend-as-a-service with PostgreSQL database
- **OpenAI GPT-4** - AI-powered content generation
- **Pinata IPFS** - Decentralized storage for incident recordings
- **Stripe** - Secure payment processing for premium features
- **GeoJS API** - Location detection and state identification

### Key Libraries
- **@supabase/supabase-js** - Supabase client
- **openai** - OpenAI API integration
- **@stripe/stripe-js** - Stripe payment integration
- **axios** - HTTP client for API requests
- **react-router-dom** - Client-side routing
- **js-cookie** - Cookie management
- **date-fns** - Date manipulation utilities

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── Header.jsx       # App header with location and user info
│   ├── TabNavigation.jsx # Bottom navigation tabs
│   ├── RightsGuide.jsx  # State-specific rights information
│   ├── ScenarioScripts.jsx # Interactive scenario scripts
│   ├── IncidentRecorder.jsx # Recording functionality
│   ├── IncidentHistory.jsx # Incident management
│   └── PremiumFeatures.jsx # Premium subscription management
├── context/
│   └── AppContext.jsx   # Global state management
├── services/            # API service layers
│   ├── authService.js   # Authentication with Supabase
│   ├── locationService.js # Location detection and geocoding
│   ├── aiService.js     # OpenAI integration for content generation
│   ├── storageService.js # IPFS storage via Pinata
│   └── paymentService.js # Stripe payment processing
├── config/
│   └── api.js          # API configuration and clients
├── styles/
│   └── index.css       # Global styles and Tailwind imports
└── App.jsx             # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- OpenAI API key
- Pinata account for IPFS storage
- Stripe account for payments

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-6300.git
   cd this-is-a-6300
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your API keys in `.env`:
   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_OPENAI_API_KEY=your-openai-api-key
   VITE_PINATA_API_KEY=your-pinata-api-key
   VITE_PINATA_SECRET_KEY=your-pinata-secret-key
   VITE_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
   ```

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to the SQL editor
   - Run the SQL script from `database/schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Build for production**
   ```bash
   npm run build
   ```

## 🏗 Architecture

### State Management
The app uses React Context API for global state management, providing:
- User authentication state
- Location data and current state
- Premium subscription status
- Incident recordings and history
- Offline mode handling

### Service Layer
All external API interactions are abstracted into service classes:
- **AuthService**: Handles user authentication, profiles, and sessions
- **LocationService**: Manages geolocation, state detection, and geocoding
- **AIService**: Integrates with OpenAI for dynamic content generation
- **StorageService**: Manages IPFS uploads and secure file storage
- **PaymentService**: Handles Stripe payments and subscription management

### Data Flow
1. **Location Detection**: App detects user location and determines state
2. **Content Generation**: AI generates state-specific rights guides and scripts
3. **Incident Recording**: Users can record incidents with automatic metadata
4. **Secure Storage**: Premium users get IPFS storage for incident recordings
5. **Offline Support**: Content is cached for offline access

## 🔐 Security Features

- **Row Level Security (RLS)** on all Supabase tables
- **IPFS Storage** for tamper-proof incident recordings
- **Secure Authentication** with Supabase Auth
- **Payment Security** with Stripe's secure payment processing
- **Data Encryption** for sensitive user information

## 💰 Business Model

### Freemium Model
- **Free Tier**: Basic rights guides, simple scripts, local storage
- **Premium Subscription**: 
  - Monthly: $9.99/month
  - Yearly: $99.99/year (save $20)
  - Lifetime: $199.99 one-time
- **Micro-transactions**: Individual language packs, templates, state guides

### Premium Features
- Advanced documentation tools
- Multi-language script support (10+ languages)
- Offline access to all content
- Priority AI-generated content
- Extended cloud storage (10GB)
- Legal resource database access
- Priority customer support

## 🌐 Deployment

### Recommended Platforms
- **Vercel** (recommended for React apps)
- **Netlify**
- **AWS Amplify**
- **Firebase Hosting**

### Environment Setup
Ensure all environment variables are configured in your deployment platform:
- Supabase credentials
- OpenAI API key
- Pinata IPFS credentials
- Stripe publishable key

## 🧪 Testing

### Manual Testing Checklist
- [ ] Location detection works correctly
- [ ] Rights guides load for different states
- [ ] Scenario scripts display properly
- [ ] Incident recording functionality
- [ ] Premium features are properly gated
- [ ] Offline mode works as expected
- [ ] Payment flow completes successfully

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📱 Mobile Optimization

The app is designed mobile-first with:
- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized for mobile browsers
- PWA capabilities for app-like experience
- Offline functionality for critical features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@guardpoint.app or create an issue in this repository.

## 🙏 Acknowledgments

- **ACLU** for legal rights information and resources
- **OpenAI** for AI-powered content generation
- **Supabase** for backend infrastructure
- **Pinata** for decentralized storage solutions
- **Stripe** for secure payment processing

---

**GuardPoint** - Empowering individuals with knowledge and preparedness for safer interactions with law enforcement.
