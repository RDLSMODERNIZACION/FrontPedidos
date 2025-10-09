import { clsx } from "clsx";
export default function Badge({ tone = "warn", children }: { tone?: "ok" | "warn" | "bad"; children: React.ReactNode }) {
  return <span className="badge"><span className={clsx("dot", tone)} />{children}</span>;
}
