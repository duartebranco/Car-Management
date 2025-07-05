# 🚗 Car Management System

A comprehensive web application for managing your vehicles, maintenance schedules, reminders, and communication with mechanics. Built with modern web technologies and Firebase for real-time data synchronization.

![Car Management Home](https://github.com/user-attachments/assets/f726dd3d-e563-4698-a419-16b61882780f)

## ✨ Features

### 🔐 User Authentication
- Secure login and registration system
- Firebase Authentication integration
- Password reset functionality

![Authentication](https://github.com/user-attachments/assets/9d094936-ce56-4727-971d-914b00901104)

### 🏠 Vehicle Garage
- Add, edit, and manage your vehicles
- Support for cars, motorcycles, and trucks
- Vehicle sharing with other users
- Detailed vehicle information storage

### ⏰ Smart Reminders
- Set maintenance reminders
- Filter reminders by vehicle
- Visual reminder management
- Automatic notifications

### 🔧 Maintenance Scheduling
- Schedule maintenance appointments
- Connect with local mechanics
- Track maintenance history
- Appointment confirmation system

### 💬 Messaging System
- Communication with mechanics
- Real-time messaging
- Message history and threads

### 🏪 Shop Selection
- Find nearby mechanics and shops
- Shop ratings and information
- Direct communication with service providers

### ⚙️ Settings & Profile
- User account management
- Password change functionality
- Personal preferences

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.3
- **Icons**: Font Awesome 6.7.2
- **Backend**: Firebase
  - Authentication: Firebase Auth
  - Database: Cloud Firestore
  - Analytics: Firebase Analytics
- **Deployment**: Static web hosting compatible

## 🚀 Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for Firebase services
- Local web server (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/duartebranco/Car-Management.git
   cd Car-Management
   ```

2. **Serve the application locally**
   
   Using Python:
   ```bash
   python3 -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx serve .
   ```
   
   Using PHP:
   ```bash
   php -S localhost:8000
   ```

3. **Open your browser**
   Navigate to `http://localhost:8000`

### Firebase Configuration

The application uses Firebase for backend services. The configuration is already set up in `js/firebase.js`. For production deployment, you may want to:

1. Create your own Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Update the configuration in `js/firebase.js`

## 🎯 Demo Credentials

You can test the application with these demo accounts:

**Account 1:**
- Email: `testepartilha123@gmail.com`
- Password: `teste123`

**Account 2:**
- Email: `defaultuser@email.com`
- Password: `password`

## 📁 Project Structure

```
Car-Management/
├── 📄 index.html              # Home page (Reminders)
├── 🔐 auth.html               # Authentication page
├── 🚗 garage.html             # Vehicle garage
├── ➕ addcar.html             # Add new vehicle
├── ✏️ editcar.html            # Edit vehicle details
├── 💬 messages.html           # Messaging system
├── 📅 scheduleMaintenance.html # Schedule appointments
├── 🏪 selectShop.html         # Shop selection
├── 🏪 shops.html              # Shop listings
├── ⏰ setReminder.html        # Set reminders
├── ✅ confirmSchedule.html    # Confirm appointments
├── ⚙️ definitions.html        # Settings page
├── 📁 css/
│   ├── myCSS.css              # Main stylesheet
│   ├── garage.css             # Garage-specific styles
│   └── editcar.css            # Car edit styles
├── 📁 js/
│   ├── firebase.js            # Firebase configuration
│   ├── auth.js                # Authentication logic
│   ├── garage.js              # Garage management
│   ├── reminders.js           # Reminders system
│   ├── addcar.js              # Add car functionality
│   ├── editcar.js             # Edit car functionality
│   ├── setReminder.js         # Set reminder logic
│   ├── definitions.js         # Settings management
│   ├── checkAuth.js           # Authentication checker
│   └── plusbtn.js             # Plus button functionality
├── 📁 images/
│   ├── logo.png               # Application logo
│   ├── logo2.png              # Alternative logo
│   ├── car.png                # Car icon
│   ├── motorbike.png          # Motorcycle icon
│   ├── truck.png              # Truck icon
│   └── wheel.png              # Wheel icon
└── 📁 data/
    └── vehicles.json          # Vehicle data reference
```

## 🎮 Usage Guide

### Getting Started
1. **Register/Login**: Start by creating an account or logging in with demo credentials
2. **Add Vehicles**: Go to the Garage section and add your vehicles
3. **Set Reminders**: Create maintenance reminders for your vehicles
4. **Schedule Maintenance**: Book appointments with local mechanics
5. **Communicate**: Use the messaging system to communicate with service providers

### Key Workflows

**Adding a Vehicle:**
1. Navigate to Garage → Add Vehicle
2. Fill in vehicle details (make, model, year, etc.)
3. Upload vehicle photo (optional)
4. Save the vehicle

**Setting Reminders:**
1. Go to Reminders → Add Reminder
2. Select vehicle and reminder type
3. Set date and description
4. Save reminder

**Scheduling Maintenance:**
1. Select a vehicle from your garage
2. Choose "Schedule Maintenance"
3. Select a shop from the list
4. Pick date and time
5. Confirm appointment

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. **Code Style**: Follow existing code formatting and structure
2. **Testing**: Test your changes across different browsers
3. **Documentation**: Update documentation for new features
4. **Responsive Design**: Ensure mobile compatibility

### Setting up Development Environment

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
6. Push to the branch (`git push origin feature/AmazingFeature`)
7. Open a Pull Request

## 📱 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security

- All authentication is handled by Firebase Auth
- Data is stored securely in Firestore with proper security rules
- HTTPS is recommended for production deployment

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Firebase](https://firebase.google.com/) for backend services
- UI components from [Bootstrap](https://getbootstrap.com/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Vehicle data from EPA fuel economy dataset

---

**Made with ❤️ for car enthusiasts everywhere**
