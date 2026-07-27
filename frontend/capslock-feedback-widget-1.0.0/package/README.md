# feedback-widget

A reusable feedback form widget for React apps.

## Building the package

```bash
npm install
npm run build
npm pack
# Generates capslock-feedback-widget-1.0.0.tgz file
```

## Installing in a consuming app

Copy the `.tgz` file into the consuming app's root, then:

```bash
npm install ./capslock-feedback-widget-1.0.0.tgz
```

## Updating tgz in consuming app
Copy the new `.tgz` file into the consuming app's root, then:

```bash
docker compose down
cd frontend
del package-lock.json
cd ..
docker compose build --no-cache
docker compose up
```

## Usage

```tsx
import { FeedbackWidget } from "@capslock/feedback-widget";

const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);

//in trigger: setIsFeedbackOpen(true);

function App() {
  return (
    <>
      {/* Your app content */}

      {isFeedbackOpen && (
      <FeedbackWidget
        formId={1}
        apiUrl="http://backend:3000"
      />)}
    </>
  );
}
```

The widget will automatically:
1. Fetch the form from the backend on mount
2. Show a prompt asking the user if they want to give feedback
3. If yes, open the feedback form modal
4. Submit answers back to the backend

## Props

| Prop | Type | Description |
|------|------|-------------|
| `formId` | `number` | The ID of the form to render |
| `apiUrl` | `string` | Base URL of the feedback backend |

## CORS

Make sure the backend's `express.ts` allows the consuming app's origin:

```ts
const allowedOrigins = [
  "http://localhost:5173", // the dashboard
  "http://consuming-app:PORT", // add this
];
```
