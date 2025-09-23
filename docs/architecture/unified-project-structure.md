# Unified Project Structure

```plaintext
meetsolis/
├── .github/                          # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml                   # Automated testing and linting
│       └── deploy-production.yaml    # Production deployment
├── apps/
│   └── web/                          # Next.js application (frontend + API)
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   ├── components/          # React components
│       │   ├── hooks/               # Custom React hooks
│       │   ├── services/            # API client services
│       │   ├── lib/                 # Utility libraries
│       │   ├── styles/              # Global styles and themes
│       │   └── types/               # TypeScript type definitions
│       ├── public/                  # Static assets
│       ├── tests/                   # Frontend tests
│       ├── .env.example             # Environment variables template
│       ├── next.config.js           # Next.js configuration
│       ├── tailwind.config.js       # Tailwind CSS configuration
│       └── package.json             # Dependencies and scripts
├── packages/                        # Shared packages
│   ├── shared/                      # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/               # TypeScript interfaces
│   │   │   ├── constants/           # Shared constants
│   │   │   └── utils/               # Shared utility functions
│   │   └── package.json
│   └── config/                      # Shared configuration
│       ├── eslint/                  # ESLint configurations
│       ├── typescript/              # TypeScript configurations
│       └── jest/                    # Jest test configurations
├── scripts/                        # Build and deployment scripts
│   ├── build.sh                   # Build all packages
│   ├── test.sh                    # Run all tests
│   └── analyze-bundle.js          # Bundle size analysis
├── docs/                          # Documentation
│   ├── prd/                       # Sharded PRD documents
│   ├── architecture/              # Architecture documents
│   └── api/                       # API documentation
├── .env.example                   # Environment template
├── package.json                   # Root package.json with workspaces
├── tsconfig.json                  # Root TypeScript configuration
└── README.md                      # Project documentation
```
