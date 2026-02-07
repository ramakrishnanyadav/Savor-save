# 🍽️ Savor Save

**Savor Save** is a modern food recommendation and expense tracking application designed to help you discover delicious Indian cuisine while managing your food expenses efficiently.

## ✨ Features

### 🔍 Smart Discovery
- Browse curated Indian food recommendations
- Smart search functionality with voice input support
- Category-based food browser
- Restaurant discovery with detailed information
- Budget-aware recommendations

### 💰 Expense Tracking
- Track all your food-related expenses
- Voice-enabled expense input
- Categorize expenses by food type
- Visual analytics and spending charts
- Export expense data to CSV/PDF
- Real-time budget monitoring

### 📦 Order Tracking
- Live order tracking system
- Order status updates (Preparing → Out for Delivery → Delivered)
- Order history management
- Track multiple orders simultaneously

### 💳 Payments
- Integrated Razorpay payment gateway
- Secure payment processing
- Multiple payment methods support

### 👤 User Management
- User authentication with Supabase
- Personalized user profiles
- Onboarding flow for new users
- Profile customization

### 📊 Analytics & Insights
- Spending charts and trends
- Budget vs actual spending comparison
- Category-wise expense breakdown
- Monthly/weekly expense reports

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful UI components
- **React Query** - Data fetching and caching
- **React Router** - Navigation

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL Database
  - Authentication
  - Row Level Security (RLS)
  - Edge Functions
- **Razorpay** - Payment gateway integration
- **Google Places API** - Location services

### Database Schema
- Users & Profiles
- Expenses with categories
- Budget tracking
- Order management
- Restaurant data

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Razorpay account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ramakrishnanyadav/Savor-save.git
   cd Savor-save
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```
   
   Fill in your credentials:
   ```env
   # Supabase Configuration
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   VITE_SUPABASE_URL=https://your_project_id.supabase.co
   
   # Razorpay Configuration
   VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
   VITE_RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   ```

4. **Run database migrations**
   
   Apply the Supabase migrations located in `supabase/migrations/`:
   - Navigate to your Supabase project dashboard
   - Go to SQL Editor
   - Run the migration files in order

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
savor-save/
├── public/              # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── analytics/   # Analytics components
│   │   ├── dashboard/   # Dashboard widgets
│   │   ├── discover/    # Discovery features
│   │   ├── expenses/    # Expense tracking
│   │   ├── orders/      # Order management
│   │   ├── payments/    # Payment components
│   │   ├── ui/          # UI components (Shadcn)
│   │   └── views/       # Main view components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── integrations/    # Third-party integrations
│   │   └── supabase/    # Supabase client & types
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── data/            # Mock data and constants
├── supabase/
│   ├── functions/       # Edge functions
│   └── migrations/      # Database migrations
└── ...config files
```

---

## 🔑 Key Features Explained

### Budget Management
Set monthly budgets and track your spending against them. The app provides visual indicators when you're approaching or exceeding your budget.

### Voice Input
Use voice commands to quickly add expenses without typing. Powered by Web Speech API.

### Live Order Tracking
Real-time updates on your food orders with status transitions and estimated delivery times.

### Smart Recommendations
Get personalized food recommendations based on your budget, preferences, and spending history.

### Data Export
Export your expense data in multiple formats (CSV, PDF) for record-keeping or tax purposes.

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key | Yes |
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `VITE_RAZORPAY_KEY_SECRET` | Razorpay secret key | Yes |

⚠️ **Never commit your `.env` file to version control!**

---

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Ramakrishna Yadav**
- GitHub: [@ramakrishnanyadav](https://github.com/ramakrishnanyadav)

---

## 🙏 Acknowledgments

- Indian food data and recipes
- Shadcn/ui for beautiful components
- Supabase for the amazing backend platform
- Razorpay for payment integration

---

Made with ❤️ for food lovers and budget-conscious individuals 
