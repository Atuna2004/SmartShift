import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export const LoginPage = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold text-ink">Sign in to SmartShift</h1>
          <p className="mt-1 text-sm text-muted">Use your admin, owner, manager, or staff account.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <Input label="Email" name="email" placeholder="you@company.com" type="email" />
            <Input label="Password" name="password" placeholder="Password" type="password" />
            <Button type="submit">Sign in</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            New owner?{" "}
            <Link className="font-medium text-brand-700" to="/register">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
