import { Button } from "@/shared/components/ui/Button";
import { Input } from "@/shared/components/ui/Input";

export const ShiftForm = () => {
  return (
    <form className="grid gap-4">
      <Input label="Shift name" name="name" placeholder="Morning shift" />
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Start time" name="startTime" type="time" />
        <Input label="End time" name="endTime" type="time" />
      </div>
      <Input label="Break minutes" min={0} name="breakMinutes" type="number" />
      <Button type="submit">Save shift</Button>
    </form>
  );
};
