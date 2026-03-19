// Bare layout for prototype pages — no sidebar, header, or shell chrome.
// Prototypes render inside an iframe in the canvas; this keeps them clean.
export default function PrototypesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
