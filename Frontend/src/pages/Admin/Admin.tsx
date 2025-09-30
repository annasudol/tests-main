import * as React from "react";
import type { FC } from "react";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useStyles from "./styles";
import { useTranslation } from "react-i18next";
import UsersTable from "src/pages/Admin/UsersTable";

const Admin: FC = () => {
  const classes = useStyles();
  //@ts-ignore
  const { t } = useTranslation();
  return (
    <Stack gap={2} className={classes.root}>
      <Typography variant="h1">{t("Admin")}</Typography>
      <UsersTable />
    </Stack>
  );
};

export default Admin;
