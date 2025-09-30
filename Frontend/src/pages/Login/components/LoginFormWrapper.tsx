import React, { FC } from "react";
import Grid from "@mui/material/Grid";
import { Form, FormikProvider } from "formik";
import theme from "src/styling/customTheme";
import LoginForm from "./LoginForm";
import ForgetPasswordDialog from "../components/ForgetPasswordDialog";
import { useLoginContext } from "../context/LoginContext";
import useLoginForm from "../hooks/useLoginForm";
import WavyBackground from "./WavyBackground";

interface LoginFormWrapperProps {
  classes: { root: string };
}

const LoginFormWrapper: FC<LoginFormWrapperProps> = ({ classes }) => {
  const { rememberMe } = useLoginContext();
  const { formikProps, isLoading } = useLoginForm(rememberMe);

  return (
    <>
      <FormikProvider value={formikProps}>
        <Form autoComplete="off">
          <Grid container className={classes.root} sx={{ bgcolor: theme.palette.grey[100] }}>
            <Grid item xs={6} sx={{ display: { xs: "none", md: "flex" } }}>
              <WavyBackground />
            </Grid>
            <Grid item xs={12} md={6}>
              <LoginForm isLoggingIn={isLoading} />
            </Grid>
          </Grid>
        </Form>
        <ForgetPasswordDialog />
      </FormikProvider>
    </>
  );
};

export default LoginFormWrapper;
