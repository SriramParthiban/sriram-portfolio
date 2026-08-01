import { profile } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-line border-t px-6 py-8 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <span className="label">
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="label">{profile.location}</span>
        <a href="#top" className="label link-underline w-fit">
          Back to top ↑
        </a>
      </div>
    </footer>
  );
}
