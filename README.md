# 🎨 FileCraft Frontend - Modern File Processing UI

A modern, fast, and intuitive Next.js frontend for the FileCraft file processing API. Built with the latest technologies for the best user experience.

## ⚡ Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Modern utility-first CSS
- **React 18** - Latest React with concurrent features

### UI Components
- **Shadcn/ui** - Modern, accessible component library
- **Radix UI** - Unstyled, accessible components
- **Lucide React** - Beautiful, customizable icons
- **Framer Motion** - Smooth animations and transitions

### State & Data Management
- **TanStack Query** - Server state management
- **React Hook Form** - Performant form handling
- **Zustand** (ready to add) - Client state management

### File Handling
- **React Dropzone** - Drag & drop file uploads
- **Axios** - HTTP client with progress tracking

### Developer Experience
- **ESLint** - Code linting
- **Prettier** (ready to add) - Code formatting
- **TypeScript** - Static type checking

## 🚀 Features

### 📁 File Upload
- **Drag & Drop Interface** - Intuitive file selection
- **Multiple File Support** - Process multiple files at once
- **Progress Tracking** - Real-time upload progress
- **File Preview** - Image thumbnails and file info
- **Format Validation** - Smart file type detection

### 🔄 File Processing
- **Image Conversion** - 20+ image formats (JPEG, PNG, WebP, AVIF, HEIC, etc.)
- **Video Processing** - Convert between MP4, AVI, MOV, MKV, WebM
- **Audio Conversion** - MP3, WAV, FLAC, OGG, M4A support
- **Base64 Encoding** - Any file to Base64 with compression
- **Quality Control** - Adjustable compression and optimization

### 💻 User Interface
- **Modern Design** - Clean, professional interface
- **Dark/Light Mode** - Automatic theme detection
- **Responsive Layout** - Works on all device sizes
- **Real-time Feedback** - Toast notifications and progress bars
- **Accessibility** - WCAG compliant components

### 🛡️ Enterprise Features
- **Error Handling** - Comprehensive error management
- **Type Safety** - Full TypeScript coverage
- **Performance** - Optimized bundle and loading
- **SEO Optimized** - Meta tags and structured data

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- FileCraft Backend API running on port 8080

### Installation

1. **Clone and Navigate**
   ```bash
   cd /home/priya/ProjectsFastApi/FileCraftUi
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the environment file
   cp .env.local.example .env.local
   
   # Configure your API URL
   echo "NEXT_PUBLIC_API_URL=http://localhost:8080" > .env.local
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=FileCraft
NEXT_PUBLIC_APP_VERSION=2.0.0

# Optional: Analytics, monitoring, etc.
# NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

### API Integration

The frontend automatically connects to your FileCraft backend API. Ensure your backend is running and CORS is configured to allow your frontend domain.

## 🎯 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/               # Shadcn/ui components
│   ├── FileUpload.tsx    # File upload component
│   ├── ConversionPanel.tsx # Conversion interface
│   └── providers.tsx     # App providers
├── lib/                   # Utilities and config
│   ├── api.ts            # API client and endpoints
│   └── utils.ts          # Utility functions
└── hooks/                 # Custom React hooks (future)
```

## 🌟 Key Components

### FileUpload Component
- Drag & drop interface
- File validation and preview
- Progress tracking
- Multiple file support

### ConversionPanel Component
- Format selection
- Quality/compression options
- Batch processing
- Real-time progress updates

### API Integration
- Axios-based HTTP client
- Automatic error handling
- Progress tracking
- TypeScript types

## 🔗 Backend Integration

This frontend is designed to work with the FileCraft FastAPI backend:

- **Base URL**: `http://localhost:8080` (configurable)
- **API Version**: v1
- **Authentication**: Ready for future JWT integration
- **File Upload**: Multipart form data with progress
- **Error Handling**: Standardized error responses

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Future)
```dockerfile
# Dockerfile will be added for containerized deployment
```

### Vercel/Netlify
- Ready for deployment on modern platforms
- Environment variables configured
- Optimized build output

## 🛠️ Development Tips

1. **Backend First**: Ensure your FileCraft API is running
2. **Environment**: Set correct API URL in `.env.local`
3. **CORS**: Configure backend CORS for frontend domain
4. **Types**: API types are defined in `src/lib/api.ts`
5. **Components**: Extend Shadcn/ui components as needed

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🤝 Contributing

1. Follow the existing code style
2. Add TypeScript types for new features
3. Test with real backend API
4. Update documentation

## 📄 License

This project is part of the FileCraft ecosystem. See the main project license.

---

**Built with ❤️ using Next.js 15, TypeScript, and Tailwind CSS**
