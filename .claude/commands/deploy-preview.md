# /deploy-preview — Build and Preview Production Bundle

Build the app for production and start the Vite preview server.

## Steps

1. Run `npm run build`. If it fails, show errors and stop.
2. Report the bundle sizes from the build output (HTML, CSS, JS) and flag any chunks over 500 KB.
3. Run `npm run preview` in the background.
4. Tell the user the preview URL (typically `http://localhost:4173/`).
5. Remind the user to press Ctrl+C to stop the preview server when done.
