import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Server, KeyRound, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/")({
  component: Overview,
});

function Overview() {
  const { data: stats } = useQuery({
    queryKey: ["overview-stats"],
    queryFn: async () => {
      const [d, s, r, sec] = await Promise.all([
        supabase.from("domains").select("id, status", { count: "exact" }),
        supabase.from("servers").select("id, status", { count: "exact" }),
        supabase.from("dns_records").select("id, status", { count: "exact" }),
        supabase.from("user_secrets").select("cf_api_token").maybeSingle(),
      ]);
      return {
        domains: d.count ?? 0,
        servers: s.count ?? 0,
        records: r.count ?? 0,
        hasCfToken: Boolean(sec.data?.cf_api_token),
      };
    },
  });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="mt-1 text-muted-foreground">Provision Mailcow across multiple domains and VPS hosts.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Globe} label="Domains" value={stats?.domains ?? "—"} to="/domains" />
        <StatCard icon={Server} label="Servers" value={stats?.servers ?? "—"} to="/servers" />
        <StatCard icon={Mail} label="DNS records" value={stats?.records ?? "—"} to="/domains" />
        <StatCard icon={KeyRound} label="Cloudflare token" value={stats?.hasCfToken ? "Set" : "Missing"} to="/settings" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Get started</CardTitle>
          <CardDescription>Walk through the provisioning workflow.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Step n={1} title="Add your Cloudflare API token" href="/settings" desc="Stored server-side, scoped to your account, used to push DNS records." />
          <Step n={2} title="Add a VPS server" href="/servers" desc="Track each VPS host and step through Docker + Mailcow setup." />
          <Step n={3} title="Add a domain" href="/domains" desc="Auto-seeds the standard Mailcow DNS record set; review then push to Cloudflare." />
          <Step n={4} title="Run DNS bulk push & Mailcow provisioning" href="/domains" desc="Open a domain to push DNS, add it to Mailcow, and create mailboxes." />
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, to }: { icon: typeof Globe; label: string; value: number | string; to: string }) {
  return (
    <Link to={to as "/"} className="block">
      <Card className="transition-colors hover:bg-accent/30">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
            <div className="text-2xl font-semibold">{value}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function Step({ n, title, desc, href }: { n: number; title: string; desc: string; href: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{n}</div>
      <div className="flex-1">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Link to={href as "/"}>
        <Button size="sm" variant="ghost">Open</Button>
      </Link>
    </div>
  );
}
