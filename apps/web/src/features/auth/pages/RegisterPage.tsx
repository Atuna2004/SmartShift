import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/Card";
import { Input } from "@/shared/components/ui/Input";

export const RegisterPage = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-xl font-semibold text-ink">Create owner account</h1>
          <p className="mt-1 text-sm text-muted">Start a SmartShift workspace.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <Input label="Full name" name="fullName" placeholder="Nguyen Van A" />
            <Input label="Email" name="email" placeholder="owner@company.com" type="email" />
            <Input label="Phone" name="phone" placeholder="0900000000" />
            <Input label="Password" name="password" placeholder="Password" type="password" />
            <Button type="submit">Create account</Button>
          </form>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link className="font-medium text-brand-700" to="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
