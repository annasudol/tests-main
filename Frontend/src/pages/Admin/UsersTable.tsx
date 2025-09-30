import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  TextField,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { deleteUser, getUsers, updateUser } from "src/api";
import { UserRole } from "src/constants/auth";

type UserItem = { id: number; username: string; email: string; name: string; phoneNumber?: string; roleId: number };

const roleOptions = [
  { id: UserRole.SuperAdmin, label: "Super Admin" },
  { id: UserRole.UniTrainingOfficer, label: "University Training Officer" },
  { id: UserRole.Trainer, label: "Trainer" },
  { id: UserRole.Student, label: "Student" },
  { id: UserRole.AdminAndRegistration, label: "Administration and Registration" },
  { id: UserRole.Company, label: "Company" },
];

const UsersTable: React.FC = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [search, setSearch] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<number | undefined>(undefined);

  const { data } = useQuery({
    queryKey: ["users", page, rowsPerPage, search, roleFilter],
    queryFn: async () => {
      const resp = await getUsers({ page: page + 1, limit: rowsPerPage, search, roleId: roleFilter });
      return resp.data as { items: UserItem[]; total: number; page: number; limit: number };
    },
    keepPreviousData: true,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UserItem> }) => updateUser(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });
  const deleteMutation = useMutation({
    mutationFn: (username: string) => deleteUser(username),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  return (
    <Paper sx={{ p: 2, width: { sm: "40rem", md: "60rem" } }}>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          size="small"
          label="Search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="role-filter-label">Role</InputLabel>
          <Select
            labelId="role-filter-label"
            label="Role"
            value={roleFilter ?? ""}
            onChange={(e) => {
              const value = e.target.value as number | "";
              setRoleFilter(value === "" ? undefined : Number(value));
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {roleOptions.map((r) => (
              <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    defaultValue={u.name}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value !== u.name) updateMutation.mutate({ id: u.id, payload: { name: value } });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    variant="standard"
                    defaultValue={u.email}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value !== u.email) updateMutation.mutate({ id: u.id, payload: { email: value } });
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Select
                    variant="standard"
                    defaultValue={u.roleId}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value !== u.roleId) updateMutation.mutate({ id: u.id, payload: { roleId: value } });
                    }}
                  >
                    {roleOptions.map((r) => (
                      <MenuItem key={r.id} value={r.id}>{r.label}</MenuItem>
                    ))}
                  </Select>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="error" onClick={() => deleteMutation.mutate(u.username)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default UsersTable;


