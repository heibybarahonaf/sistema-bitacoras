    // layouts/MainLayout.tsx
import { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-light text-dark">
      <header className="bg-primary text-white p-4">POS de Honduras</header>
      <main className="p-6">{children}</main>
    </div>
  );
}
