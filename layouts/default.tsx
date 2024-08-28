import { Link } from "@nextui-org/link";

import { Head } from "./head";
import { Navbar } from "@/components/navbar";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen px-6"> {/* Adicione padding horizontal */}
      <Head />
      <Navbar />
      <main className="flex flex-col flex-grow justify-between pt-16">
        {children}
        <footer className="w-full flex items-center justify-center py-3 mt-4">
          <Link
            isExternal
            className="flex items-center gap-1 text-current"
            href="https://nextui-docs-v2.vercel.app?utm_source=next-pages-template"
            title="nextui.org homepage"
          >
            <span className="text-default-600">Blitz</span>
            <p className="text-primary">Videoke</p>
          </Link>
        </footer>
      </main>
    </div>
  );
}
