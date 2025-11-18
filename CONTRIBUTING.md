# Contributing to No-Code Admin Panel Builder

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/no-code-admin-panel-builder.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes
6. Commit with clear messages
7. Push to your fork
8. Open a Pull Request

## Development Setup

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL

# Set up database
npm run prisma:generate
npm run prisma:push

# Start development server
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow the existing code structure
- Use meaningful variable names
- Add comments for complex logic
- Use ESLint and Prettier (run `npm run lint`)

## Commit Messages

Use clear, descriptive commit messages:

- `feat: Add MySQL support for introspection`
- `fix: Resolve pagination bug in list view`
- `docs: Update README with deployment instructions`
- `refactor: Simplify permission checking logic`
- `test: Add unit tests for introspection service`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers

## Areas for Contribution

### High Priority

- [ ] MySQL database support
- [ ] Authentication implementation
- [ ] Credential encryption
- [ ] Advanced filtering in list views
- [ ] Bulk operations
- [ ] Data export (CSV, Excel)

### Medium Priority

- [ ] MongoDB support
- [ ] Relationship visualization
- [ ] Custom field renderers
- [ ] Theme customization
- [ ] Multi-language support
- [ ] API documentation

### Nice to Have

- [ ] File upload support
- [ ] Rich text editor integration
- [ ] Charts and analytics
- [ ] Webhooks
- [ ] Backup/restore functionality
- [ ] CLI for management

## Testing

```bash
# Run tests (when available)
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add JSDoc comments to functions
- Include examples in documentation

## Questions?

Open an issue for:
- Bug reports
- Feature requests
- Questions about architecture
- Clarifications on documentation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
