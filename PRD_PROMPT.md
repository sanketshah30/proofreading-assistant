# Prompt for Claude to Write PRD: Copilot Assistant for Researchers

You are a product manager tasked with writing a comprehensive Product Requirements Document (PRD) for a Copilot Assistant feature designed specifically for researchers who need to review and improve their documentation.

## Context and Background

I have built a working prototype of a Copilot Assistant integrated into a document editing interface. The system includes:

### Current Implementation Overview:

1. **Document Editor**
   - Rich text editor with formatting toolbar (bold, italic, underline, headings, lists, alignment, links, images)
   - Real-time word count tracking
   - ContentEditable-based editor with selection management

2. **Copilot Assistant Sidebar**
   - Collapsible sidebar panel (420px width, can collapse to 32px)
   - Chat-based interface for AI interaction
   - Quick action buttons: "Check Grammar", "Paraphrase", "Consistency Check"
   - Message history with suggestions display
   - Input field for user queries

3. **Text Selection Menu (AI Toolbar)**
   - Appears when text is selected in the document
   - Small purple icon appears at bottom-left of selection
   - Clicking icon opens full menu with options:
     - **"Ask Trinka what to do next"** - Opens chat with selected text
     - **Rewrite section** with options:
       - Improve Fluency
       - Improve Clarity
       - Make it Longer
       - Make it Shorter
       - Adjust Tone (submenu: Persuasive, Authoritative, Neutral, Formal)
       - Change Voice (submenu: Active, Passive)
       - Paraphrase (submenu: Standard, Academic, Formal, Casual, Simple)
     - **Translate section** (submenu: English US, English UK)

4. **Key Behaviors**
   - All AI actions draft prompts to chat input (user can modify before submitting)
   - Suggestions are displayed as cards with original text, suggested text, reason, and apply/reject buttons
   - Total alerts count tracked and displayed
   - Selection is preserved when interacting with AI tools

5. **Technical Stack**
   - React + TypeScript
   - Vite build system
   - Framer Motion for animations
   - React Icons for UI elements
   - Designed for LLM integration (Claude/OpenAI)

### Target Users:
- Researchers writing academic papers, research documents, grant proposals
- Users who need grammar checking, style improvement, and consistency verification
- Non-native English speakers who need writing assistance
- Users who want AI-powered suggestions without losing control over their content

## Your Task:

Write a comprehensive PRD that includes:

1. **Executive Summary**
   - Purpose and goals of the Copilot Assistant
   - Target audience and use cases
   - Success metrics

2. **Problem Statement**
   - Pain points researchers face when writing documentation
   - Why current solutions are insufficient
   - Market opportunity

3. **User Personas**
   - Primary persona: Academic researcher
   - Secondary personas: Graduate student, Research administrator
   - User needs and goals

4. **User Stories and Use Cases**
   - Detailed user flows for key features:
     - Grammar checking workflow
     - Paraphrasing workflow
     - Consistency checking workflow
     - Text selection and AI assistance workflow
     - Suggestion review and application workflow

5. **Feature Requirements**
   - Detailed specifications for each feature:
     - Chat-based AI interaction
     - Quick action buttons
     - Text selection menu with context-aware options
     - Suggestion system (grammar, paraphrasing, consistency)
     - Document integration and editing capabilities
   - Priority levels (Must Have, Should Have, Nice to Have)

6. **Functional Requirements**
   - Input/output specifications
   - User interactions and behaviors
   - Error handling
   - Edge cases

7. **Non-Functional Requirements**
   - Performance requirements (response time, latency)
   - Accessibility requirements
   - Browser compatibility
   - Responsive design considerations

8. **Technical Architecture (High-Level)**
   - LLM integration approach
   - API design considerations
   - Data flow and state management
   - Security and privacy considerations

9. **UI/UX Requirements**
   - Design principles
   - Component specifications
   - Interaction patterns
   - Visual hierarchy and information architecture

10. **Success Metrics and KPIs**
    - User engagement metrics
    - Feature adoption rates
    - Quality improvement metrics
    - User satisfaction scores

11. **Future Enhancements (Roadmap)**
    - Citation checking
    - Plagiarism detection
    - Journal finder integration
    - Multi-language support
    - Advanced formatting suggestions

12. **Risks and Mitigation**
    - Technical risks
    - User adoption risks
    - Quality assurance risks

## Guidelines:

- Write in a professional, clear, and structured manner
- Use specific examples and scenarios
- Include acceptance criteria for each feature
- Consider both technical and non-technical stakeholders
- Make it actionable for development teams
- Reference the current prototype features but expand on them
- Consider scalability and future growth
- Include privacy and data handling considerations
- Address accessibility and internationalization

## Output Format:

Provide the PRD in a well-structured markdown format with clear sections, subsections, and formatting. Use tables, lists, and diagrams descriptions where appropriate.

Begin writing the PRD now.

