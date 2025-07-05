# Contributing to Car Management System

First off, thank you for considering contributing to the Car Management System! It's people like you that make this project better for everyone.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and constructive in all interactions.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, please include as many details as possible:

- Use a clear and descriptive title
- Describe the exact steps to reproduce the problem
- Provide specific examples and screenshots if applicable
- Describe the behavior you observed and what you expected
- Include browser version and operating system information

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- A clear and descriptive title
- A detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any similar features in other applications

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Test your changes thoroughly
5. Commit your changes with a clear commit message
6. Push to your fork: `git push origin feature/your-feature-name`
7. Create a Pull Request

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable and function names

### JavaScript Guidelines

- Use ES6+ features when appropriate
- Follow modular design patterns
- Handle errors gracefully
- Use async/await for asynchronous operations

### HTML/CSS Guidelines

- Use semantic HTML elements
- Maintain responsive design principles
- Follow Bootstrap conventions when applicable
- Ensure accessibility standards (ARIA labels, alt text, etc.)

### Testing

- Test your changes in multiple browsers
- Verify responsive design on different screen sizes
- Test with both demo accounts
- Ensure Firebase integration works correctly

### Commit Messages

Use clear and meaningful commit messages:

```
feat: add vehicle sharing functionality
fix: resolve reminder notification bug
docs: update installation instructions
style: improve responsive design for mobile
```

### Firebase Considerations

- Be mindful of Firestore security rules
- Test authentication flows thoroughly
- Ensure data privacy and security
- Consider offline functionality where applicable

## Development Setup

### Local Development

1. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/Car-Management.git
   cd Car-Management
   ```

2. Start a local server:
   ```bash
   python3 -m http.server 8000
   ```

3. Open `http://localhost:8000` in your browser

### Firebase Configuration

For development with your own Firebase project:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Update `js/firebase.js` with your configuration
4. Set up Firestore security rules

### Testing Accounts

Use the provided demo accounts for testing:
- `testepartilha123@gmail.com` / `teste123`
- `defaultuser@email.com` / `password`

## Project Structure

### Key Files and Directories

- `index.html` - Main reminders page
- `garage.html` - Vehicle management
- `auth.html` - Authentication page
- `js/` - JavaScript modules
- `css/` - Stylesheets
- `images/` - Application assets

### Adding New Features

When adding new features:

1. Create necessary HTML pages
2. Add corresponding JavaScript modules
3. Update CSS for styling
4. Ensure mobile responsiveness
5. Update navigation if needed
6. Add appropriate Firebase integration

## Issues and Feature Requests

### Good First Issues

Look for issues labeled `good first issue` - these are perfect for newcomers!

### Feature Categories

- 🚗 Vehicle Management
- ⏰ Reminders and Notifications
- 🔧 Maintenance Scheduling
- 💬 Messaging System
- 🏪 Shop Integration
- 🔐 Authentication and Security
- 📱 Mobile Experience
- 🎨 UI/UX Improvements

## Questions?

If you have questions about contributing, feel free to:

- Open an issue with your question
- Review existing documentation
- Check out the demo application

Thank you for contributing to Car Management System! 🚗✨