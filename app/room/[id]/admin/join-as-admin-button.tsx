import Link from "next/link";

interface JoinAsAdminButtonProps {
  inviteUrl: string;
}

export function JoinAsAdminButton({ inviteUrl }: JoinAsAdminButtonProps) {
  return (
    <Link
      href={inviteUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 font-medium text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40"
    >
      🎅 Принять участие
    </Link>
  );
}
