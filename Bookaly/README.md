# Bookaly

Bookaly is a modern service booking platform that connects customers with reliable service providers in real-time. Built with React Native and a robust Node.js backend, Bookaly delivers a seamless booking experience across iOS and Android.

---

## Quick Links

- **Website**: [bookaly.app](https://bookaly.app)
- **iOS App**: [Download on App Store](https://apps.apple.com/app/bookaly)
- **Android App**: [Get it on Google Play](https://play.google.com/store/apps/details?id=com.bookaly)

---

## About

Bookaly streamlines the service booking process, allowing customers to:
- Browse and book services instantly
- Track provider location in real-time
- Manage subscriptions efficiently
- Rate and review service providers
- Secure payment processing

---

## Project Structure

This repository contains the React Native mobile application for Bookaly, built with TypeScript and modern development practices.

```
Bookaly/
├── src/
│   ├── features/           # Feature modules (auth, customer, provider)
│   ├── navigation/         # Navigation configuration
│   ├── service/            # API services and interceptors
│   ├── state/              # State management (Zustand stores)
│   ├── components/         # Reusable UI components
│   ├── utils/              # Utility functions and constants
│   └── assets/             # Images, fonts, and animations
├── android/                # Android native code
├── ios/                    # iOS native code
└── __tests__/              # Test suites
```

---

## Prerequisites

Before setting up the development environment, ensure you have installed:

- **Node.js** (14.x or higher)
- **npm** or **yarn**
- **React Native CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development on macOS)
- **CocoaPods** (for iOS dependencies)

For detailed setup instructions, refer to the [React Native Documentation](https://reactnative.dev/docs/set-up-your-environment).

---

## Installation & Setup

### 1. Clone the Repository

```sh
git clone https://github.com/your-org/bookaly.git
cd bookaly
```

### 2. Install Dependencies

```sh
npm install
# OR
yarn install
```

### 3. Start Metro Bundler

```sh
npm start
# OR
yarn start
```

### 4. Run on Android

```sh
npm run android
# OR
yarn android
```

### 5. Run on iOS

First, install CocoaPods dependencies:

```sh
bundle install
bundle exec pod install
```

Then run the app:

```sh
npm run ios
# OR
yarn ios
```

---

## Development

### Code Style & Linting

The project follows TypeScript best practices and ESLint configuration. Before committing, ensure your code passes:

```sh
npm run lint
```

### Hot Reload

Hot reload is enabled via Fast Refresh. Simply save your changes in the editor, and the app will automatically update.

For a full rebuild or state reset:
- **Android**: Press `R` twice or use `Ctrl + M` to access the Dev Menu
- **iOS**: Press `R` in the iOS Simulator

### Testing

```sh
npm test
# OR
yarn test
```

---

## Backend Integration

The mobile app communicates with the Bookaly backend API. Ensure the backend is running and properly configured before testing locally.

For backend setup, refer to the [Backend Documentation](../backend/README.md).

---

## Features

- **Authentication**: Secure login and registration for users and providers
- **Real-time Tracking**: Live GPS tracking of service providers
- **Subscription Management**: Flexible service subscription plans
- **QR Code Integration**: Quick booking via QR scanning
- **Payment Processing**: Secure payment gateway integration
- **Notifications**: Push notifications for bookings and updates

---

## Troubleshooting

### Common Issues

1. **Metro Bundler Issues**
   ```sh
   npm start -- --reset-cache
   ```

2. **Dependency Issues**
   ```sh
   rm -rf node_modules
   npm install
   ```

3. **iOS Build Failures**
   ```sh
   bundle exec pod repo update
   bundle exec pod install
   ```

For more detailed troubleshooting, see the [React Native Troubleshooting Guide](https://reactnative.dev/docs/troubleshooting).

---

## Contributing

We welcome contributions! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Commit your changes (`git commit -am 'Add a new feature'`)
3. Push to the branch (`git push origin feature/your-feature`)
4. Open a Pull Request

---

## License

Bookaly is proprietary software. All rights reserved.

---

## Support

For support and inquiries, visit [bookaly.app](https://bookaly.app) or contact our support team.

---

## Technology Stack

- **Frontend**: React Native, TypeScript, Zustand
- **Backend**: Node.js, Express.js
- **Database**: Firebase/Cloud Firestore
- **Authentication**: JWT & OAuth
- **Maps & Location**: Google Maps API
- **Payment**: Stripe/Payment Gateway Integration
