# Health Management Mobile App - Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design Mobile + Healthcare Best Practices)

**Justification:** Healthcare applications prioritize clarity, trust, and accessibility over visual novelty. Drawing inspiration from successful health apps like MyChart, Zocdoc, and telemedicine platforms, we'll emphasize usability, information hierarchy, and rapid access to critical features.

**Core Principles:**
- **Trust through Clarity:** Clean layouts with obvious functionality
- **Safety First:** Emergency features prominently accessible
- **Efficient Workflows:** Minimize steps to critical actions
- **Calm Interface:** Reduce anxiety through thoughtful design

---

## Typography

**Font Family:** Inter (via Google Fonts CDN)

**Scale:**
- Headings: 24px (bold), 20px (semibold), 18px (semibold)
- Body: 16px (regular), 14px (regular for secondary text)
- Labels: 12px (medium, uppercase for tags/status)
- Buttons: 16px (semibold)

**Hierarchy:**
- Screen titles: 24px bold
- Section headers: 18px semibold
- Card titles: 16px semibold
- Body text: 16px regular with 1.5 line height
- Metadata/timestamps: 14px regular, reduced opacity

---

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, and 8 (px-4, py-6, gap-8, etc.)

**Container Structure:**
- Screen padding: px-4 (16px horizontal margin)
- Card padding: p-4 or p-6
- Section spacing: gap-6 between major sections
- Component spacing: gap-4 within sections
- Icon-to-text spacing: gap-2

**Grid System:**
- Dashboard cards: 2-column grid on larger phones (grid-cols-2 gap-4)
- Feature lists: Single column with full-width cards
- Emergency button: Fixed position, bottom-right with 4-unit margin

---

## Component Library

### Navigation
- **Bottom Tab Bar:** 5 tabs (Home, Chat, Appointments, History, Profile)
- **Top Bar:** Screen title (left), notification icon, profile avatar (right)
- Floating Emergency Button: Large circular red button (fixed bottom-right)

### Cards & Containers
- **Dashboard Action Cards:** Rounded corners (rounded-lg), subtle shadow, p-6, icon + title + brief description
- **Appointment Cards:** Full-width, p-4, left border accent, displays doctor, time, status badge
- **Emergency Card:** Prominent red treatment, full-width, bold text
- **Chat Bubbles:** User (right-aligned, rounded), AI (left-aligned, rounded), max-width 80%

### Forms & Inputs
- **Text Inputs:** Full-width, p-4, rounded-lg border, 16px text, floating labels
- **Dropdowns:** Native select styling with chevron icon
- **Buttons Primary:** Full-width or auto-width, py-4 px-6, rounded-lg, 16px semibold text
- **Buttons Secondary:** Outlined variant, same dimensions
- **Emergency CTA:** Extra large (py-6), red treatment, bold text

### Status Indicators
- **Badges:** Small rounded pills (px-3 py-1) with 12px text
  - Pending: neutral
  - Confirmed: success green
  - Completed: muted
  - Emergency Active: red with pulsing animation
- **Availability Dots:** 8px circular indicators (green=open, red=closed, amber=busy)

### Lists & Data Display
- **Medical History List:** Chronological, each item with date, type icon, title, collapsible details
- **Doctor List:** Avatar, name, specialty, availability
- **Facility Pins (Map):** Custom markers with facility type icon

### Chat Interface
- **Message Container:** Scrollable, inverted list (newest at bottom)
- **Input Area:** Fixed bottom, text input + mic icon, send button
- **Quick Actions:** Button row below AI responses (Book Appointment, Find Facility, etc.)
- **Typing Indicator:** Animated dots

### Onboarding
- **Slides:** Full-screen, centered illustration + headline + description, dot indicators
- **Progress:** Linear dots at bottom, "Skip" top-right, "Next/Get Started" bottom button

---

## Animations

**Minimal & Purposeful:**
- Loading states: Simple spinner or skeleton screens
- Emergency alert: Subtle pulsing red glow (1.5s cycle)
- Chat bubbles: Gentle fade-in on appearance
- Typing indicator: Bouncing dots
- Button press: Standard scale feedback (0.98 on press)
- NO scroll-driven animations or complex transitions

---

## Screen-Specific Layouts

### Dashboard (Home)
- Top greeting: "Good morning, [Name] 👋" with time-appropriate icon
- 2-column grid: Chat, Appointments, Map, History cards (each with icon + title + subtitle)
- Next appointment preview (if any): Full-width card above grid
- Fixed emergency button: Bottom-right corner

### Chatbot
- Top bar: "Health Assistant" title, close button
- Scrollable chat area
- Input bar: Fixed bottom, rounded text input + mic icon
- Quick reply buttons: Horizontal scroll below AI messages

### Book Appointment
- Form sections with clear headers
- Department dropdown → Doctor dropdown (filtered)
- Date picker (calendar view) → Time slots (grid)
- Summary card before confirmation
- "Book Appointment" full-width button at bottom

### Emergency
- Full-screen red alert background (translucent)
- Large "Emergency" heading
- Auto-filled info display (name, phone, location with GPS icon)
- Emergency type selector
- Huge "Send Help Now" button
- Countdown/status indicator after sending

### Map View
- Full-screen map component
- Facility markers with custom icons
- Bottom sheet for facility details (slides up on marker tap)
- Distance, availability status, contact buttons
- "My Location" button (top-right)

### Medical History
- Tabs: Appointments | Emergencies | Notes
- Chronological timeline view
- Each record: Date header + expandable card
- "Export Data" button at bottom

### Profile
- Avatar upload area at top
- Form sections: Personal Info, Medical Tags (chips for conditions/allergies)
- Action buttons: Export Data, Logout (destructive treatment)

---

## Images

**Onboarding Illustrations:** 
- Three custom illustrations showing: 1) AI chat interface, 2) Emergency response visualization, 3) Doctor appointment calendar
- Placement: Centered, occupying upper 40% of each onboarding slide
- Style: Simple, friendly line illustrations with accent color highlights

**Dashboard Card Icons:**
- Use Heroicons via CDN (outline style)
- Chat: ChatBubbleLeftRightIcon
- Appointments: CalendarIcon
- Emergency: ExclamationTriangleIcon
- History: ClipboardDocumentListIcon
- Map: MapPinIcon

**No large hero images** - This is a utility app prioritizing function over marketing visuals.

---

## Accessibility

- Minimum touch target: 44x44px for all interactive elements
- High contrast text (WCAG AA minimum)
- Clear focus indicators for keyboard navigation
- Screen reader labels for all icons and actions
- Emergency button meets enhanced contrast requirements
- Form validation with clear error messages adjacent to inputs