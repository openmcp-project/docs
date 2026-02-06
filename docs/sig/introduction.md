# Special Interest Groups (SIGs)

## Overview and Purpose

### Definition
Special Interest Groups (SIGs) are the core organizational units within OpenMCP. Comprised of members from diverse companies and organizations, each SIG concentrates on a specific project area, such as infrastructure, security, or user experience. Their collective goal is to drive progress, maintain quality standards, and foster innovation within their respective domains.

SIGs are designed to:
- Foster **distributed decision-making** and **code ownership**
- Provide **dedicated spaces** for collaborative work and strategic planning
- Facilitate the **integration of new contributors** and community members
- Ensure **accountability** and **transparency** across the project
- Enable **scalable governance** as the project grows

**Fundamental Principle**: Every component of the OpenMCP project is intended to be under the stewardship of a SIG.

## SIG Lifecycle and Management

### SIG Creation
A new SIG may be proposed when:
- A significant area of the project lacks dedicated ownership
- A new strategic initiative requires focused attention
- Community members demonstrate sustained interest in a specific domain

**Creation Process:**
1. Proposal submitted to Technical Steering Committee (TSC) with justification
2. Community feedback period (minimum 2 weeks)
3. TSC approval
4. Charter development and publication
5. Initial leadership team appointment

### SIG Dissolution
A SIG may be dissolved when its scope is no longer relevant, it has been inactive for X months, or its responsibilities are merged into another SIG. The dissolution process will be defined as the project evolves.

## SIG Charter Requirements

### Charter Mandate
SIGs **MUST** have a charter defining their scope, responsibilities, decision-making processes, and conflict resolution mechanisms.

**Charter Requirements:**
- **MUST** be publicly accessible in the OpenMCP repository
- **MUST** be reviewed and updated at least annually
- **MUST** be approved by TSC
- **MUST** be communicated to all SIG members and the broader community

### Minimum Charter Sections

#### Scope and Responsibilities
**2-3 sentences** defining the SIG's area of focus and primary responsibilities.

**In Scope:**
- Specific technical domains or components
- Feature areas and enhancements
- Documentation and best practices
- Testing and quality assurance for the domain
- Community engagement within the domain

**Out of Scope:**
- Areas explicitly owned by other SIGs
- Cross-cutting concerns (e.g., security, release management)
- Strategic decisions reserved for TSC
- Governance matters outside the SIG's purview

#### Roles and Responsibilities

SIGs operate with a **four-tier role structure**:

### SIG Owner (Organizer/Facilitator)
- **Minimum required:** At least 1 per SIG
- **Recommended:** 2-3 for larger SIGs
- **Responsibilities:**
    - Organize and facilitate SIG meetings
    - Maintain charter and documentation
    - Communicate with other SIGs and stakeholders
    - Ensure transparency and public accessibility of decisions
    - Manage SIG roadmap and priorities
    - Mentor and develop approvers and contributors
    - Ensure succession planning
    - Escalate conflicts and blockers
    - Report quarterly to TSC

- **Selection:** Appointed by TSC based on community nomination and demonstrated leadership
- **Term:** 1 year, renewable

### SIG Approver (Technical Authority)
- **Minimum required:** At least 2 per SIG
- **Responsibilities:**
    - Review and approve technical changes within SIG scope
    - Provide technical guidance and mentorship
    - Participate in design discussions and decisions
    - Ensure code quality and architectural consistency
    - Contribute to roadmap planning
    - Participate in SIG meetings (minimum 80% attendance)

- **Selection:** Nominated by SIG Owner, approved by TSC
- **Criteria:** Demonstrated expertise, consistent contributions, community respect
- **Term:** 1 year, renewable

### SIG Contributor (Active Participant)
- **Definition:** Individuals with demonstrated, ongoing contributions
- **Responsibilities:**
    - Contribute code, documentation, or testing
    - Participate in discussions and design reviews
    - Help review contributions from others
    - Attend SIG meetings when possible
    - Support community members

- **Selection:** Self-identified through consistent contributions
- **Recognition:** Listed in SIG documentation

### Community Member (Open Participation)
- **Definition:** Anyone interested in the SIG's work
- **Participation:**
    - Attend meetings and discussions
    - Ask questions and provide feedback
    - Contribute ideas and proposals

## Decision-Making Process
TBD
### Decision Types and Authority

| Decision Type | Authority | Process | Timeline |
|---|---|---|---|
| **Technical Changes** | Approvers | Code review, consensus-seeking | Per contribution |
| **Roadmap/Priorities** | Owner + Approvers | Discussion, documented decision | Quarterly |
| **Charter Updates** | Owner + TSC | Community feedback, formal approval | As needed |
| **Scope Changes** | Owner + TSC | SIG proposal, community input | 30 days |
| **Conflict Resolution** | Owner → TSC | Discussion, escalation if needed | 14 days |

### Consensus Model
- Decisions should aim for consensus among approvers
- If consensus cannot be reached, Owner makes final decision with documented rationale
- Decisions affecting other SIGs require cross-SIG consultation
- All decisions must be documented and publicly accessible

## Communication and Transparency

### Required Communication Channels
- **Public Meetings:** At least bi-weekly, with recorded notes
- **Async Communication:** Dedicated communication channel or mailing list
- **Documentation:** Public pages or repository for designs, decisions, roadmap
- **Meeting Notes:** Published within 48 hours, including decisions and action items
- **Roadmap:** Published and updated quarterly
- **Decision Log:** Maintained for all significant decisions

### Escalation Path
1. SIG Owner attempts resolution
2. Cross-SIG discussion if multiple SIGs affected
3. TSC mediation if unresolved
4. Final decision by TSC

## Conflict Resolution
TBD
### Internal Conflicts (within SIG)
- Discussed in SIG meetings
- Owner facilitates resolution
- Documented and escalated if unresolved after 2 weeks

### External Conflicts (between SIGs)
- SIG Owners meet to discuss
- Escalated to TSC if unresolved
- TSC make binding decision
- Decision documented and communicated

### Escalation Timeline
- Initial discussion: 1 week
- Escalation: 2 weeks
- Final resolution: 30 days maximum

## Subprojects and Work Organization

### Subproject Definition
Subprojects are focused work efforts within a SIG, each with designated ownership and clear deliverables.

### Subproject Requirements
- Each subproject must have at least one designated owner
- Owners are responsible for technical vision and direction
- Subproject scope must align with parent SIG charter
- Subproject roadmap must be public and updated quarterly
- All code and documentation must be owned by a subproject

### Subproject Lifecycle
- **Creation:** Proposed by SIG Owner or Approvers
- **Active:** Ongoing development and maintenance
- **Maintenance:** Stable, minimal changes
- **Archived:** No longer actively developed

## Templates

### Charter Template

```mdxjs
# [SIG Name] Charter

## Scope

[2-3 sentences describing the SIG's area of focus and primary responsibilities.]

### In Scope
- [Topic/Component 1]
- [Topic/Component 2]
- [Topic/Component 3]
- [Feature area or responsibility]

### Out of Scope
- [Topic/Component explicitly excluded]
- [Area owned by another SIG]
- [Cross-cutting concern]

## Roles and Responsibilities

### SIG Owner
- **Name(s):** [Owner name(s)]
- **Contact:** [Email/Slack handle]
- **Responsibilities:** Organize meetings, maintain charter, communicate with other SIGs, manage roadmap, mentor team members, report to managers

### SIG Approvers
- **Name(s):** [Approver name(s)]
- **Contact:** [Email/Slack handle]
- **Responsibilities:** Review and approve technical changes, provide mentorship, participate in design discussions, maintain code quality

### SIG Contributors
- **Active Contributors:** [List of contributors]
- **How to join:** Demonstrate consistent contributions to the SIG's areas

## Subprojects

| Subproject | Owner | Description |
|---|---|---|
| [Subproject 1] | [Owner name] | [Brief description] |
| [Subproject 2] | [Owner name] | [Brief description] |
| [Subproject 3] | [Owner name] | [Brief description] |

## Communication

- **Meetings:** [Frequency and schedule, e.g., "Bi-weekly on Tuesdays at 10:00 UTC"]
- **Meeting Link:** [Link to meeting]
- **Slack Channel:** [#channel-name]
- **Mailing List:** [mailing-list@example.com]
- **Documentation:** [Link to wiki/repository]

## Decision-Making

### Decision Process
[Describe how the SIG makes decisions. Example: "Decisions are made through consensus among approvers. If consensus cannot be reached, the SIG Owner makes the final decision with documented rationale."]

### Escalation
[Describe escalation path. Example: "Conflicts are first discussed within the SIG. If unresolved after 2 weeks, they are escalated to TSC."]

## Roadmap

[Link to public roadmap or brief description of current priorities]

### Current Priorities
- [Priority 1]
- [Priority 2]
- [Priority 3]

### Next Quarter Goals
- [Goal 1]
- [Goal 2]

## Meeting Schedule

- **Regular Meetings:** [Day, time, frequency]
- **Meeting Notes:** [Link to meeting notes repository]
- **Calendar:** [Link to calendar or iCal]

## How to Contribute

1. [Step 1 - e.g., "Join the Slack channel"]
2. [Step 2 - e.g., "Attend a meeting or review the roadmap"]
3. [Step 3 - e.g., "Pick an issue or propose a contribution"]
4. [Step 4 - e.g., "Submit a pull request for review"]

## Charter Review

- **Last Updated:** [Date]
- **Next Review:** [Date]
- **Review Frequency:** Annually
```

## References and Inspiration

- [Kubernetes SIG Governance](https://github.com/kubernetes/community/blob/master/governance.md#sigs)
- [Kubernetes SIG Charter Template](https://github.com/kubernetes/community/blob/master/committee-steering/governance/sig-charter-template.md)
- [CNCF Project Governance](https://contribute.cncf.io/projects/best-practices/governance/)