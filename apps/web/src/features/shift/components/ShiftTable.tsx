import { tableCellClass, tableHeaderClass, Table } from "@/shared/components/ui/Table";
import type { ShiftTemplate } from "../shift.types";

type ShiftTableProps = {
  data: ShiftTemplate[];
};

export const ShiftTable = ({ data }: ShiftTableProps) => {
  return (
    <Table>
      <thead>
        <tr>
          <th className={tableHeaderClass}>Name</th>
          <th className={tableHeaderClass}>Time</th>
          <th className={tableHeaderClass}>Break</th>
          <th className={tableHeaderClass}>Trạng thái</th>
        </tr>
      </thead>
      <tbody>
        {data.map((shift) => (
          <tr key={shift.id}>
            <td className={tableCellClass}>{shift.name}</td>
            <td className={tableCellClass}>
              {shift.startTime} - {shift.endTime}
            </td>
            <td className={tableCellClass}>{shift.breakMinutes} min</td>
            <td className={tableCellClass}>{shift.status}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
