# Echoes of The Heart - Game Start Screen

A beautiful, interactive web-based game start screen created from a Figma design. This project recreates the original design with modern web technologies, animations, and responsive design.

## 🌟 Features

- **Pixel-perfect recreation** of the original Figma design
- **Smooth animations** and transitions
- **Responsive design** that works on all devices
- **Interactive menu system** with hover effects
- **Loading screen** with spinner animation
- **Modal dialogs** for Options and Credits
- **Keyboard navigation** support
- **Modern UI/UX** with glassmorphism effects
- **Sound system** ready (placeholder functions included)

## 🎮 Interactive Elements

### Menu Buttons
- **START JOURNEY**: Main action button with pulsing animation
- **OPTIONS**: Opens settings modal with game configuration
- **CREDITS**: Shows game credits and team information

### Keyboard Shortcuts
- `Enter` or `1`: Start Journey
- `2`: Open Options
- `3`: Show Credits
- `Escape`: Close any open modal

### Visual Effects
- Floating character animation
- Glowing title text
- Hover effects on buttons
- Smooth modal transitions
- Loading animations

## 📁 Project Structure

```
EchoFromTheHeart/
├── index.html          # Main HTML file
├── styles.css          # All CSS styles and animations
├── script.js           # JavaScript functionality
├── assets/
│   └── images/
│       ├── background.png  # Main background image
│       └── character.png   # Character illustration
└── README.md           # This file
```

## 🚀 How to Run

1. **Clone or download** this project
2. **Open** `index.html` in any modern web browser
3. **Enjoy** the interactive experience!

No build process or server required - it's a pure client-side application.

## 🎨 Design Specifications

The web app faithfully recreates the original Figma design:

- **Typography**: Inter font family
- **Layout**: Responsive flexbox layout
- **Colors**: 
  - Background: Custom image with overlay
  - Buttons: Light gray (#D9D9D9) with transparency
  - Primary button: Golden gradient
  - Text: White title, black button text
- **Animations**: Subtle floating and glow effects
- **Responsive breakpoints**: 1200px and 768px

## 🛠 Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: 
  - Flexbox layout
  - CSS Grid for options
  - Custom animations and keyframes
  - Backdrop filters and glassmorphism
  - CSS custom properties
- **JavaScript ES6+**:
  - Event handling
  - DOM manipulation
  - Animation timing
  - Modal management

## 🎯 Browser Compatibility

- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## 🔧 Customization

### Adding Sound Effects
Replace the placeholder `playSound()` function in `script.js`:

```javascript
function playSound(soundType) {
    const audio = new Audio(`sounds/${soundType}.mp3`);
    audio.play().catch(e => console.log('Audio play failed:', e));
}
```

### Modifying Animations
Adjust animation durations and effects in `styles.css`:

```css
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-20px); }
}
```

### Changing Colors
Update the CSS custom properties or color values in `styles.css`.

## 📱 Responsive Design

The application automatically adapts to different screen sizes:

- **Desktop (1200px+)**: Side-by-side character and menu layout
- **Tablet (768px-1200px)**: Stacked vertical layout
- **Mobile (<768px)**: Optimized for touch interactions

## 🎨 Visual Enhancements

- **Glassmorphism**: Translucent buttons with backdrop blur
- **Particle effects**: Optional floating particles (commented out)
- **Smooth transitions**: All interactions have smooth animations
- **Hover states**: Interactive feedback on all clickable elements

## 🔮 Future Enhancements

- Add background music and sound effects
- Implement actual game logic
- Add more animation options
- Create additional game screens
- Add save/load functionality
- Implement user profiles

## 📄 License

This project is open source and available under the MIT License.

---

**Based on Figma Design**: [Original Design Link](https://www.figma.com/design/na4uqtsNdUQ9GblCJkrPlo/Untitled?node-id=42-4&t=BXuPU79vcVbDXMZy-4)

Made with ❤️ using modern web technologies. 