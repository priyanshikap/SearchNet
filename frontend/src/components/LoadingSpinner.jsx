// LoadingSpinner component placeholder.

export default function LoadingSpinner({
  message = "Loading...",
}) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <span className="loading-spinner" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
