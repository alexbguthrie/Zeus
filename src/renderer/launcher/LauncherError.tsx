type Props = {
  message: string;
  onRetry(): void;
  onDismiss?(): void;
};

export default function LauncherError({ message, onRetry, onDismiss }: Props) {
  return (
    <div className="launcher-error" role="alert">
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss error">
          ×
        </button>
      )}
    </div>
  );
}
