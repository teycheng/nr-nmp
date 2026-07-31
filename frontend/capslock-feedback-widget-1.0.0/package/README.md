# CST feedback-widget

A reusable feedback form widget for React apps.

## Building the package

```bash
npm install
npm run build
npm pack
# Generates capslock-feedback-widget-1.0.0.tgz file
```

## Installing in a consuming app

Copy the `.tgz` file into the consuming app's frontend root (where the Dockerfile is) and extract it, then:

```bash
npm install ./capslock-feedback-widget-1.0.0.tgz
```

## Updating tgz in consuming app
replace the original with the new `.tgz` file into the consuming app's frontend root (where the Dockerfile is) and extract it, then:

### update Dockerfile:
```
# Copy the feedback widget package
COPY capslock-feedback-widget-1.0.0.tgz ./

# Remove lock file so it regenerates with correct checksum
RUN rm -f package-lock.json
```

### cmd:
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
        onClose={() => navigate(MANURE_IMPORTS)} 
        {/* onClose is optional */}
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
5. optionally preform functionality after flow is complete

## Props

| Prop | Type | Description |
|------|------|-------------|
| `formId` | `number` | The ID of the form to render |
| `apiUrl` | `string` | Base URL of the feedback backend |
| `onClose` | `() => void` | Optional functionality that runs after form flow is complete |

## CORS

Make sure the backend's `express.ts` allows the consuming app's origin:

```ts
const allowedOrigins = [
  "http://consuming-app:PORT", // add this
];
```
