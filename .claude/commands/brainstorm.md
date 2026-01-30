---
description: Interactive brainstorming to refine vague ideas into clear, research-backed task descriptions
argument-hint: [idea or feature concept]
allowed-tools: Read, Glob, Grep, AskUserQuestion, Task, WebSearch, WebFetch, TodoWrite
---

# Interactive Brainstorming Session

Brainstorm: **$ARGUMENTS**

## Purpose

Lead the user through a structured discovery process to transform a vague idea into a well-defined, research-backed task description with no open questions.

**Key Principle**: Never speculate. Always ground decisions in research and facts.

---

## Phase 1: Discovery - Understand the Raw Idea

Start by understanding what the user is trying to accomplish at a high level.

### Step 1: Acknowledge and Clarify

If `$ARGUMENTS` is provided, acknowledge the idea. If empty, ask what they want to brainstorm.

### Step 2: Ask Discovery Questions

Use AskUserQuestion to understand the core intent:

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'What problem are you trying to solve with this feature?',
      header: 'Problem',
      options: [
        { label: 'User pain point', description: 'Something frustrating for end users' },
        { label: 'Missing capability', description: 'Feature that should exist but doesnt' },
        { label: 'Workflow improvement', description: 'Make an existing flow faster/better' },
        {
          label: 'Technical need',
          description: 'Developer experience or architecture improvement',
        },
      ],
      multiSelect: false,
    },
  ],
})
```

### Step 3: Capture the "Why"

Ask follow-up questions to understand:

- What triggered this idea?
- What would success look like?
- Who benefits from this?

**Output**: A clear problem statement in 1-2 sentences.

---

## Phase 2: Research - Gather Facts Before Requirements

**CRITICAL**: Do NOT proceed to requirements without research. Use the `technical-researcher` agent to gather facts.

### Step 1: Identify Research Topics

Based on the discovery, identify what needs to be researched:

- **UX patterns**: How do other feedback tools handle this interaction?
- **Industry standards**: How do leading feedback boards (Canny, UserVoice, Nolt, Fider) implement this?
- **Best practices**: What do UX experts recommend for this type of feature?
- **Accessibility**: What considerations exist for this feature type?
- **Common pitfalls**: What mistakes do other implementations make?

### Step 2: Launch Research Agent

```typescript
Task({
  subagent_type: 'technical-researcher',
  prompt: `Research the following topics for a feedback board feature: [FEATURE DESCRIPTION]

  MANDATORY research areas:
  1. **Industry Leaders**: How do Canny, UserVoice, Nolt, Fider, and similar tools handle this?
     - Interaction patterns
     - Feature scope and limitations
     - What works well vs common complaints

  2. **UX Best Practices**: What do UX guidelines say about this type of interaction?
     - Nielsen Norman Group guidelines
     - Material Design / Apple HIG patterns
     - Community/feedback tool specific UX patterns

  3. **Accessibility**: What accessibility considerations apply?
     - Screen reader compatibility
     - Keyboard navigation
     - Color contrast and visual indicators

  4. **Common Pitfalls**: What mistakes do implementations commonly make?
     - User complaints about similar features
     - Performance issues
     - Confusing interactions

  5. **Technical Considerations**: Any HTMX/Cloudflare Workers specific requirements?
     - HTMX interaction patterns for this feature
     - D1/SQLite constraints or opportunities
     - Progressive enhancement approach
     - Edge computing performance implications

  Return findings in a structured format with sources.`,
})
```

### Step 3: Present Research Findings

Summarize the research to the user:

```markdown
## Research Findings

### How Industry Leaders Handle This

- **Canny**: [Approach + why it works]
- **UserVoice**: [Approach + differences]
- **Nolt**: [Approach]
- **Fider**: [Approach - especially relevant as open-source]

### UX Best Practices

- [Practice 1 with source]
- [Practice 2 with source]

### Accessibility Requirements

- [Requirement 1]
- [Requirement 2]

### Pitfalls to Avoid

- [Pitfall 1 and how to avoid]
- [Pitfall 2 and how to avoid]

### Recommended Approach (Research-Based)

Based on the research, the recommended approach is: [summary]
```

### Step 4: Validate Direction with User

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'Based on this research, which approach resonates most with your vision?',
      header: 'Direction',
      options: [
        { label: 'Approach A', description: '[Brief description from research]' },
        { label: 'Approach B', description: '[Brief description from research]' },
        { label: 'Hybrid', description: 'Combine elements from multiple approaches' },
      ],
      multiSelect: false,
    },
  ],
})
```

---

## Phase 3: Context Gathering - Explore Codebase

### Step 1: Find Relevant Existing Code

Use the Explore agent to find related patterns in the codebase:

```typescript
Task({
  subagent_type: 'Explore',
  prompt: `Find code related to: [FEATURE AREA]

  Looking for:
  - Similar features already implemented
  - Patterns we should follow
  - Components we can reuse
  - Integration points for this feature
  - Relevant routes, DB queries, and JSX components`,
})
```

### Step 2: Identify Technical Constraints

- What existing architecture must we work within?
- What patterns does the codebase already use for similar features?
- What Hono routes, D1 queries, or HTMX patterns are relevant?

### Step 3: Present Codebase Context

```markdown
## Codebase Context

### Existing Similar Features

- [Feature]: implemented in [path] using [pattern]

### Patterns to Follow

- [Pattern from CLAUDE.md]
- [Pattern observed in codebase]

### Integration Points

- [Route/Component] would need to connect with this
- [DB table/query] would be affected

### Technical Constraints

- [Constraint 1]
- [Constraint 2]
```

---

## Phase 4: Requirements Elicitation - Now Informed by Research

With research and codebase context in hand, drill into specific requirements.

### Step 1: Functional Requirements

Ask targeted questions based on research findings:

```typescript
AskUserQuestion({
  questions: [
    {
      question: '[Specific question based on research findings]',
      header: '[Category]',
      options: [
        // Options derived from research, not speculation
      ],
      multiSelect: false,
    },
  ],
})
```

**Areas to cover**:

- Core functionality (what it must do)
- Edge cases (informed by research on common pitfalls)
- Error states (informed by UX best practices)
- HTMX interaction model (progressive enhancement)

### Step 2: Scope Definition

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'What scope feels right for the initial implementation?',
      header: 'Scope',
      options: [
        { label: 'MVP', description: 'Core functionality only, can enhance later' },
        { label: 'Standard', description: 'Match industry standard feature set' },
        { label: 'Full', description: 'Comprehensive implementation with all bells and whistles' },
      ],
      multiSelect: false,
    },
  ],
})
```

### Step 3: UX Decisions

Based on research, present specific UX decisions:

- Interaction model (HTMX swap, full page, modal, etc.)
- Visual feedback (loading states, success/error indicators)
- Error handling (informed by UX best practices)
- Progressive enhancement (no-JS fallback behavior)

---

## Phase 5: Clarification & Prioritization

### Step 1: Identify Remaining Ambiguities

List any open questions that weren't resolved.

### Step 2: Prioritize Features

```markdown
### Must Have (MVP)

- [Requirement] - Reason: [Why essential, backed by research]

### Should Have (Standard)

- [Requirement] - Reason: [Why important]

### Could Have (Nice to Have)

- [Requirement] - Reason: [Why valuable but deferrable]

### Won't Have (Explicitly Out of Scope)

- [Feature] - Reason: [Why excluded]
```

### Step 3: Confirm Prioritization

Ask user to confirm or adjust the prioritization.

---

## Phase 6: Output - Structured Task Description

Generate a complete task description ready for implementation.

### Output Format

```markdown
# Task: [Clear, Actionable Title]

## Problem Statement

[1-2 sentences describing what problem this solves and for whom]

## Research Summary

### Industry Reference

- [How leaders handle this, with specific examples]

### Best Practices Applied

- [Practice 1]: [How we're applying it]
- [Practice 2]: [How we're applying it]

### Pitfalls Avoided

- [Pitfall 1]: [How we're avoiding it]

## Requirements

### Functional Requirements

1. [Requirement with acceptance criteria]
2. [Requirement with acceptance criteria]

### UX Requirements

1. [UX requirement based on research]
2. [Accessibility requirement]

### Technical Requirements

1. [Technical constraint or pattern to follow]
2. [Integration requirement]

## Scope

**In Scope (MVP)**:

- [Item]
- [Item]

**Out of Scope (Deferred)**:

- [Item] - [Why deferred]

## Acceptance Criteria

- [ ] [Testable criterion 1]
- [ ] [Testable criterion 2]
- [ ] [Testable criterion 3]

## Technical Notes

- Integrate with: [existing component/service]
- Follow pattern from: [reference in codebase]
- Consider: [technical consideration from research]

## References

- [Link to industry example]
- [Link to UX guideline]
- [Path to similar feature in codebase]
```

### Final Confirmation

```typescript
AskUserQuestion({
  questions: [
    {
      question: 'This task description is ready. What would you like to do?',
      header: 'Next step',
      options: [
        { label: 'Create GitHub issue', description: 'Save as a GitHub issue for later' },
        { label: 'Start implementation', description: 'Proceed with /implement' },
        { label: 'Refine further', description: 'I have more questions or changes' },
        { label: 'Save as draft', description: 'Save to .claude/drafts/ for later' },
      ],
      multiSelect: false,
    },
  ],
})
```

---

## Key Principles

1. **Never speculate** - Every recommendation must be backed by research
2. **Research before requirements** - Gather facts before making decisions
3. **Present options, not opinions** - Let user choose from research-backed alternatives
4. **Ground in codebase** - Understand existing patterns before proposing new ones
5. **Complete task description** - End with something ready for implementation, no open questions

## Usage Examples

```bash
# Vague idea
/brainstorm I want better post filtering

# Specific but undefined
/brainstorm add status workflows for feedback posts

# Problem-focused
/brainstorm users can't find existing posts before submitting duplicates

# No argument - will ask
/brainstorm
```
