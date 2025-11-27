import React, { Suspense, Fragment, use } from "react";

interface SuspenderProps {
  freeze: boolean;
  children: React.ReactNode;
}

function Suspender({ freeze, children }: SuspenderProps) {
  const resolverRef = React.useRef<(() => void) | undefined>(undefined);
  const promiseRef = React.useRef<Promise<void> | null>(null);

  if (promiseRef.current === null && freeze) {
    promiseRef.current = new Promise<void>((resolve) => {
      resolverRef.current = resolve;
    });
  }

  if (!freeze && resolverRef.current != null) {
    resolverRef.current();
  }

  if (promiseRef.current !== null) {
    use(promiseRef.current);
  }

  if (!freeze) {
    // Only reset promise here, as when un-freezing we want to "ping the attached listeners" that the promise is resolved.
    // Thats why we call the resolver above when !freeze.
    promiseRef.current = null;
    resolverRef.current = undefined;
  }

  return <Fragment>{children}</Fragment>;
}

interface FreezeProps extends SuspenderProps {
  placeholder?: React.ReactNode;
}

export function Freeze({ freeze, children, placeholder = null }: FreezeProps) {
  return (
    <Suspense fallback={placeholder}>
      <Suspender freeze={freeze}>{children}</Suspender>
    </Suspense>
  );
}
