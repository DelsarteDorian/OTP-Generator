# OTP Generator - Chrome Extension

A secure and user-friendly Chrome extension for generating and managing OTP (One-Time Password) codes. This extension provides a simple interface to store and generate TOTP and HOTP codes for various services.

## Features

- 🔐 Secure master password protection
- ⏱️ Session management (1-hour timeout)
- 🔄 Support for both TOTP and HOTP algorithms
- 🌓 Dark mode support
- 📋 Copy codes to clipboard
- 📤 Export/Import functionality
- 🔧 Easy OTP management (add, delete, repair)

## Installation

1. Clone this repository:
```bash
git clone https://github.com/DelsarteDorian/OTP-Generator.git
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Usage

1. Set up your master password on first launch
2. Add OTP entries by clicking "Add New OTP"
3. Enter the service name and secret key
4. Choose between TOTP (Time-based) or HOTP (Counter-based)
5. Your OTP codes will be automatically generated and updated

## Security

- All data is encrypted using AES encryption
- Master password is hashed using SHA-256
- Session timeout after 1 hour of inactivity
- No data is sent to external servers

## Development

Built with:
- JavaScript
- CryptoJS for encryption
- OTPLib for OTP generation
- Chrome Extension API

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Dorian Delsarte ([@DelsarteDorian](https://github.com/DelsarteDorian))

## Contributing

Feel free to open issues or submit pull requests for any improvements. 