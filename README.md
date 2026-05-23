# Cairo Cargo

Cairo Cargo is a web application built with React, TypeScript, and Vite. It utilizes Tailwind CSS with the shadcn theme for a modern and responsive user interface. The application includes various UI components for a rich user experience.

## Technologies Used

*   **Frontend Framework**: React
*   **Language**: TypeScript
*   **Build Tool**: Vite
*   **Styling**: Tailwind CSS (with shadcn theme)
*   **Node.js Version**: 20

## Project Structure

The project follows a standard React application structure:

*   `src/sections/`: Contains different page sections.
*   `src/hooks/`: Custom React hooks.
*   `src/types/`: TypeScript type definitions.
*   `src/App.css`: Styles specific to the web application.
*   `src/App.tsx`: The root React component.
*   `src/index.css`: Global styles.
*   `src/main.tsx`: Entry point for rendering the web application.
*   `index.html`: The main HTML file for the web application.
*   `tailwind.config.js`: Tailwind CSS configuration.
*   `vite.config.ts`: Vite build and development server settings.
*   `postcss.config.js`: PostCSS configuration for CSS processing.

## Available UI Components

The application leverages a comprehensive set of UI components, including:

accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb, button-group, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, empty, field, form, hover-card, input-group, input-otp, input, item, kbd, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip.

## Setup and Installation

To set up the project locally, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd cairo-cargo
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    ```

3.  **Run the development server**:

    ```bash
    npm run dev
    ```

    The application will be accessible at `http://localhost:5173` (or another port if 5173 is in use).

## Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

This will generate a `dist` directory containing the production-ready assets.
