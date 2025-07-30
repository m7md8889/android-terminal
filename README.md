# Termux Web Terminal

A browser-based terminal emulator inspired by the popular Termux Android application. This web version provides a Linux-like command-line environment that runs entirely in your web browser.

## Features

- **Full Terminal Emulation**: Complete command-line interface with command history
- **Virtual File System**: Navigate directories, create files, and manage a virtual filesystem
- **Package Management**: Install and manage packages using `pkg` and `apt` commands
- **Multiple Sessions**: Support for multiple terminal sessions with tabs
- **Customizable Interface**: Dark/light themes, adjustable font sizes, and various settings
- **Responsive Design**: Works on both desktop and mobile devices
- **Command Auto-completion**: Tab completion for commands and file paths
- **Command History**: Navigate through previous commands using arrow keys

## Available Commands

### File System Operations
- `ls [path]` - List directory contents
- `cd [path]` - Change directory
- `pwd` - Print working directory
- `cat [file]` - Display file contents
- `mkdir [dir]` - Create directory
- `touch [file]` - Create empty file
- `rm [file/dir]` - Remove file or directory

### System Commands
- `echo [text]` - Display text
- `date` - Show current date and time
- `whoami` - Show current user
- `uname [-a]` - Show system information
- `clear` - Clear terminal
- `help` - Show all available commands

### Package Management
- `pkg install [package]` - Install package
- `pkg list` - List installed packages
- `pkg search [query]` - Search packages
- `apt update` - Update package lists

## Getting Started

1. Open `index.html` in your web browser
2. Type `help` to see all available commands
3. Use Tab for auto-completion
4. Use ↑/↓ arrows for command history
5. Navigate between sections using the top menu

## Technology Stack

- **HTML5** - Structure and semantics
- **CSS3** - Styling and responsive design
- **JavaScript** - Terminal functionality and interactivity
- **Web APIs** - Local storage and browser features

## Installation

Simply download the files and open `index.html` in any modern web browser. No server or additional dependencies required.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Contributing

This project is open source. Feel free to contribute by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests
- Improving documentation

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by [Termux](https://termux.com/) - The original Android terminal emulator
- Built with modern web technologies for cross-platform compatibility
- Designed to provide an educational and practical terminal experience in the browser

## Demo

Visit the live demo: [Termux Web Terminal](https://m7md8889.github.io/android-terminal/)

---

**Note**: This is a web-based simulation of a terminal environment. While it provides many common Unix-like commands, it operates within the browser's security constraints and does not have access to the actual operating system.

