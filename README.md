# 🎼 Music Scanner

A comprehensive music sheet scanning and processing application that combines modern web technologies with advanced computer vision for music notation analysis.

## 📋 Project Overview

Music Scanner is a full-stack application that provides:

- **Frontend**: Modern Next.js web application with TypeScript and Tailwind CSS
- **Processing Backend**: Python Flask server with OpenCV for music sheet analysis
- **Mobile App**: Expo/React Native mobile application (in development)
- **Computer Vision**: Advanced music notation detection and analysis using OpenCV

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Processing    │    │     Mobile      │
│   (Next.js)     │◄──►│   (Flask)       │    │   (React Native)│
│   Port: 3000    │    │   Port: 5001    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start with Docker

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (version 20.10+)
- [Docker Compose](https://docs.docker.com/compose/install/) (version 2.0+)

### Production Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd music-smanetting
   ```

2. **Build and start the application**
   ```bash
   # Make the script executable
   chmod +x docker-run.sh
   
   # Build all Docker images
   ./docker-run.sh build
   
   # Start the application in production mode
   ./docker-run.sh up
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Processing API: http://localhost:5001

### Development Setup

For development with hot reload and volume mounting:

```bash
# Start in development mode
./docker-run.sh dev
```

This will:
- Mount source code as volumes for hot reload
- Start frontend in development mode with `npm run dev`
- Enable debug logging for the processing backend

## 🛠️ Available Docker Commands

Use the `docker-run.sh` script to manage the application:

| Command | Description |
|---------|-------------|
| `./docker-run.sh build` | Build all Docker images |
| `./docker-run.sh up` | Start services in production mode |
| `./docker-run.sh dev` | Start services in development mode |
| `./docker-run.sh down` | Stop all services |
| `./docker-run.sh restart` | Restart all services |
| `./docker-run.sh logs` | View logs from all services |
| `./docker-run.sh logs-frontend` | View frontend logs only |
| `./docker-run.sh logs-processing` | View processing logs only |
| `./docker-run.sh status` | Show container status |

## 🔧 Manual Setup (without Docker)

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Processing Backend

```bash
cd processing
pip install -r requirements.txt
python server.py
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

## 📦 Project Structure

```
music-smanetting/
├── frontend/                 # Next.js frontend application
│   ├── app/                 # Next.js 13+ app directory
│   ├── components/          # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── types/              # TypeScript type definitions
├── processing/              # Python Flask processing backend
│   ├── cadenCV/            # Computer vision modules
│   ├── src/                # Source code
│   ├── templates/          # HTML templates
│   ├── uploads/            # Upload directory
│   └── output/             # Processing output
├── mobile/                  # React Native mobile app
│   ├── app/                # Expo app directory
│   ├── components/         # Mobile components
│   └── assets/             # Mobile assets
└── docker-compose*.yml      # Docker configuration files
```

## 🌟 Features

- **Sheet Music Scanning**: Upload and process music sheet images/PDFs
- **Computer Vision Analysis**: Advanced music notation detection using OpenCV
- **Real-time Processing**: Live preview and analysis of scanned music
- **Modern UI**: Responsive design with dark/light mode support
- **Cross-platform**: Web and mobile applications
- **Docker Support**: Easy deployment and development setup

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:5001

# Processing Backend
PROCESSING_PORT=5001
FLASK_ENV=production
```

### Development Configuration

For development, the application uses:
- Frontend: Next.js with hot reload on port 3000
- Backend: Flask with debug mode on port 5001
- Volumes: Source code mounted for live changes

## 📚 API Documentation

The processing backend provides a REST API for music analysis. See `processing/README_API.md` for detailed API documentation.

## 🧪 Testing

```bash
# Test the processing backend
cd processing
python test_server.py

# Test the frontend
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :5001
   
   # Stop the conflicting services or change ports in .env
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache and rebuild
   docker system prune
   ./docker-run.sh build --no-cache
   ```

3. **Permission issues with Docker volumes**
   ```bash
   # Fix permissions for uploads/output directories
   sudo chown -R $USER:$USER processing/uploads processing/output
   ```

### Logs and Debugging

```bash
# View all logs
./docker-run.sh logs

# View specific service logs
./docker-run.sh logs-frontend
./docker-run.sh logs-processing

# Follow logs in real-time
docker-compose logs -f
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🚧 Roadmap

- [ ] Enhanced mobile app features
- [ ] MIDI export functionality
- [ ] Improved music notation recognition
- [ ] Batch processing capabilities
- [ ] Cloud deployment options

---

For more detailed Docker configuration, see [DOCKER.md](./DOCKER.md)