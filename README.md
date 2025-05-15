# OTP Generator - Chrome Extension

A secure and user-friendly Chrome extension for managing One-Time Passwords (OTP) with advanced features.

## Features

- 🔐 Secure master password protection
- 🔄 TOTP and HOTP support
- 🎨 Dark mode support
- 📱 Responsive design
- 📋 Copy to clipboard functionality
- 🔄 Auto-refresh OTP codes
- 📤 Import/Export functionality
- 🏷️ Category management
- 🔄 Drag and drop reordering
- 🔐 Optional two-factor authentication
- 🎨 Customizable categories
- 🔄 Automatic session management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/otp-generator.git
```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right

4. Click "Load unpacked" and select the extension directory

## Usage

1. Set your master password on first launch
2. Add OTP entries with:
   - Service name
   - Secret key
   - Algorithm (TOTP/HOTP)
   - Category (optional)
3. Click on OTP codes to copy them
4. Use the category filter to organize your OTPs
5. Drag and drop to reorder OTPs
6. Import/Export your OTPs for backup

## Development

### Project Structure
```
otp-generator/
├── manifest.json
├── popup.html
├── popup.js
├── styles.css
└── icons/
    └── logo.png
```

### Dependencies
- CryptoJS for encryption
- OTPLib for OTP generation

### Building
No build step required. The extension runs directly from source.

### Git Commands

```bash
# Add all changes
git add .

# Commit changes
git commit -m "feat: add category management and drag-drop"

# Push to GitHub
git push origin main
```

## Security Features

- AES encryption for stored data
- Master password protection
- Optional 2FA support
- Secure session management
- Encrypted import/export

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OTPLib for OTP generation
- CryptoJS for encryption
- Chrome Extension API

## Author

Dorian Delsarte ([@DelsarteDorian](https://github.com/DelsarteDorian)) 