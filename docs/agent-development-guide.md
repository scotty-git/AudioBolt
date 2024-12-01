# Agent-Driven Development Guide for Beginners

## Introduction
This guide outlines the structure and methodology for developing applications using AI agents, specifically designed for beginners who prefer an agent-driven approach to coding.

## Project Structure 

project/
├── docs/
│ ├── instructions/
│ │ ├── overview.md # Project scope, goals, tech stack
│ │ ├── architecture.md # Technical decisions and structure
│ │ └── requirements.md # Feature requirements
│ │
│ ├── prompts/
│ │ ├── module-1/ # Each module is a major project component
│ │ │ ├── README.md # Module overview
│ │ │ ├── steps.md # Detailed implementation steps
│ │ │ └── prompts.md # AI interaction prompts
│ │ ├── module-2/
│ │ └── module-3/
│ │
│ ├── verification/
│ │ ├── checklists/ # Quality assurance checks
│ │ └── testing/ # Testing procedures
│ │
│ └── context/
├── current-state.md # Project status
└── changes-log.md # Implementation history

## How to Use This Structure

### 1. Initial Setup
1. Create the folder structure above
2. Start with overview.md to define project scope
3. Break down project into logical modules
4. Create README for each module

### 2. Module Organization
- Each module represents a complete feature or system
- Modules should be independent where possible
- Number modules sequentially
- Include prerequisites and dependencies

### 3. Working with the Agent
1. Always start sessions with context
2. Reference specific files using /file command
3. Use /workspace for project-wide context
4. Verify implementations against checklists

### 4. Documentation Requirements

#### Project Overview
- Goals and objectives
- Technical requirements
- Architecture decisions
- Timeline expectations

#### Module Documentation
- Prerequisites
- Implementation steps
- Verification requirements
- Dependencies

#### Context Management
- Current project state
- Recent changes
- Known issues
- Next steps

### 5. Version Control
- Commit after each verified step
- Include context updates
- Reference module/step in commits
- Maintain changes-log.md

### 6. Quality Assurance
- Verify against checklists
- Test implementations
- Document edge cases
- Update context files

### 7. Progress Tracking
- Update current-state.md
- Mark completed steps
- Document blockers
- Plan next steps

## Best Practices

### Documentation
- Keep it current
- Be specific
- Include context
- Document decisions

### Agent Interaction
- Clear, specific prompts
- Reference documentation
- Verify understanding
- Request explanations

### Implementation
- Complete one module before starting next
- Verify each step
- Update documentation immediately
- Test thoroughly

### Context Management
- Regular updates
- Clear change logs
- Track dependencies
- Document decisions

## Troubleshooting

### Common Issues
- Lost context
- Incomplete implementations
- Missing dependencies
- Documentation gaps

### Solutions
- Reference documentation
- Break down steps
- Verify prerequisites
- Update context

## Maintenance

### Regular Tasks
- Update documentation
- Verify implementations
- Test functionality
- Review progress

### Long-term
- Refactor as needed
- Update dependencies
- Maintain context
- Review architecture

## Conclusion
Follow this structure for organized, documented, and verified agent-driven development. Maintain context and documentation for successful project completion.


