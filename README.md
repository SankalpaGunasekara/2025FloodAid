# SL Flood Relief 2025 🇱🇰

A real-time, map-based humanitarian aid coordination platform designed for the 2025 Sri Lanka floods. This application connects people in need of rescue, food, or medical assistance with rescue teams and volunteers.

## 🚨 Core Features

- **Real-time Map Interface**: Interactive map showing all active requests with severity color-coding.
- **GPS Location Pinning**: Users can use their device GPS or drag a pin to mark their exact location (essential for rooftop rescues).
- **Live Status Updates**: Real-time sync using Supabase to show new requests instantly without refreshing.
- **Bilingual Support**: Full support for **English** and **Sinhala** (switchable).
- **Offline-First Design**: Optimized for low-bandwidth mobile networks in disaster zones.
- **Smart Filters**: Filter requests by category:
  - 🔴 **Medical**: Critical injuries, medicine needs.
  - 🔵 **Rescue**: Trapped individuals, boat requirements.
  - 🟠 **Food/Water**: Essential supplies.

## 🛠️ Tech Stack

This project was built with performance and reliability in mind.

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR & optimized build)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Mobile-first, utility-first design)
- **Maps**: [React Leaflet](https://react-leaflet.js.org/) & [OpenStreetMap](https://www.openstreetmap.org/)
- **Backend & Realtime**: [Supabase](https://supabase.com/) (PostgreSQL database with realtime subscriptions)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/sl-flood-aid.git
   cd sl-flood-aid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.

## 📖 How to Use

### For Victims (Requesting Help)
1. **Tap "Request Help"**: Click the red button in the top right.
2. **Set Location**: Tap "Use My GPS" or drag the map pin to your exact location.
3. **Fill Details**: Select severity (Critical/Moderate/Low), check needs (Rescue/Medical/Food), and enter contact info.
4. **Submit**: Your request will instantly appear on the map for rescuers.

### For Rescuers (Providing Aid)
1. **View Map**: Browse the map to see colored markers indicating different needs.
2. **Filter**: Use the right-side buttons to filter by **Medical**, **Food**, or **Rescue** needs.
3. **View Details**: Tap any marker to see the person's name, needs, and contact number.
4. **Navigate**: Click "Map" to open Google Maps directions to their location.
5. **Mark as Saved**: Once helped, click "Mark as Helped" and enter the code `SAVED` to close the request.

## 🤝 Contributing

This is an open-source humanitarian project. Contributions are welcome!

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Built with ❤️ for Sri Lanka.*
