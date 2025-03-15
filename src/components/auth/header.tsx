import Image from "next/image";

interface HeaderProps {
  label: string;
}

export const Header = ({ label }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center">
      <h1 className="flex gap-2 items-center justify-center text-3xl font-semibold">
        <Image
          src="/ai-hub.svg"
          alt="App Logo"
          width={40}
          height={40}
          quality={100}
        />
        RepoMate
      </h1>
      <p className="text-muted-foreground text-sm">{label}</p>
    </div>
  );
};
