# 📚 VSCode TikBook: Notebooks for RouterOS

Welcome to the **VSCode TikBook** repository! This project provides a literate approach to managing scripts and configurations for RouterOS. With this extension, you can work seamlessly within Visual Studio Code, leveraging the power of notebooks to organize your RouterOS tasks.

[![Download Releases](https://img.shields.io/badge/Download%20Releases-vikunth33%2Fvscode--tikbook-brightgreen)](https://github.com/vikunth33/vscode-tikbook/releases)

## 🚀 Features

- **Literate Programming**: Write your scripts and configurations in a clear, organized manner.
- **Syntax Highlighting**: Enjoy syntax highlighting for RouterOS scripting language.
- **Easy Navigation**: Quickly jump between different sections of your notebooks.
- **Integrated Terminal**: Run your scripts directly from VSCode.
- **Customizable Templates**: Use predefined templates for common RouterOS tasks.

## 🛠 Installation

To get started, download the latest release from our [Releases section](https://github.com/vikunth33/vscode-tikbook/releases). After downloading, follow the instructions to install the extension in Visual Studio Code.

1. Open Visual Studio Code.
2. Go to the Extensions view by clicking on the Extensions icon in the Activity Bar on the side.
3. Click on the three dots in the top right corner and select "Install from VSIX..."
4. Choose the downloaded `.vsix` file.
5. Reload VSCode to activate the extension.

## 📖 Usage

Once installed, you can create a new notebook by following these steps:

1. Open the Command Palette (Ctrl + Shift + P).
2. Type "New TikBook Notebook" and select it.
3. Start writing your scripts and configurations!

### Example Structure

Here’s a simple structure for a RouterOS notebook:

```markdown
# RouterOS Configuration

## Interface Setup
```rsc
/interface bridge add name=bridge1
/interface bridge port add bridge=bridge1 interface=ether1
```

## Firewall Rules
```rsc
/ip firewall filter add chain=input action=accept protocol=tcp dst-port=22
/ip firewall filter add chain=input action=drop
```
```

### Running Scripts

You can run scripts directly from the notebook. Simply highlight the code block and use the "Run Selection" command from the Command Palette.

## 📂 Directory Structure

The repository is organized as follows:

```
vscode-tikbook/
├── src/
│   ├── extension.ts
│   ├── notebook/
│   └── utils/
├── test/
│   └── extension.test.ts
├── README.md
└── package.json
```

- **src/**: Contains the source code for the extension.
- **test/**: Includes tests for the extension functionalities.
- **README.md**: This file.

## 🌐 Topics

This repository covers a variety of topics relevant to RouterOS and VSCode:

- **lsp**: Language Server Protocol for enhanced coding experience.
- **mikrotik**: Tools and scripts specifically for MikroTik devices.
- **notebook**: Use of notebooks for literate programming.
- **routeros**: Configuration and scripting for RouterOS.
- **rsc**: RouterOS script files.
- **tikbook**: The name of this project.
- **tikoci**: Community-driven content for RouterOS.
- **vscode**: Integration with Visual Studio Code.
- **vscode-extension**: Development of VSCode extensions.

## 🧩 Contributing

We welcome contributions to improve the VSCode TikBook. Here’s how you can help:

1. **Fork the repository**.
2. **Create a new branch**: `git checkout -b feature/YourFeature`.
3. **Make your changes**.
4. **Commit your changes**: `git commit -m 'Add some feature'`.
5. **Push to the branch**: `git push origin feature/YourFeature`.
6. **Open a Pull Request**.

### Code of Conduct

Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md) while contributing.

## 🐛 Reporting Issues

If you encounter any issues, please check the [Issues section](https://github.com/vikunth33/vscode-tikbook/issues) and report any bugs or feature requests. We appreciate your feedback!

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 📞 Contact

For questions or suggestions, feel free to reach out:

- **GitHub**: [vikunth33](https://github.com/vikunth33)
- **Email**: your-email@example.com

## 🌟 Acknowledgments

- Thanks to the [MikroTik community](https://forum.mikrotik.com/) for their continuous support and contributions.
- Special thanks to the VSCode team for their excellent documentation and tools.

## 🎉 Conclusion

The VSCode TikBook offers a unique way to manage RouterOS scripts and configurations. By using notebooks, you can write clear, organized code and run it directly from your editor. 

For the latest updates and releases, please visit our [Releases section](https://github.com/vikunth33/vscode-tikbook/releases).

Thank you for your interest in the VSCode TikBook! We hope you find it useful for your RouterOS projects.