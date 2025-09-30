import React, { FC } from "react";
import AppNavbar from "src/components/AppNavbar";
import AppSideDrawerMultiLevel from "src/components/AppSideDrawerMultiLevel";
import useAccountContext from "src/hooks/useAccountContext";
import { LoginProvider } from "./context/LoginContext";
import useStyles from "./styles";
import { Navigate } from "react-router-dom";
import { isEmptyToken } from "src/utils";
import LoginFormWrapper from "src/pages/Login/components/LoginFormWrapper";

const Login: FC = () => {
  const { isSidebarOpen } = useAccountContext();

  const classes = useStyles({
    isSidebarOpen,
  });

  // Check both localStorage and sessionStorage for access token
  const accessToken = localStorage.getItem("access-token") || sessionStorage.getItem("access-token");
  const isLoggedIn = !isEmptyToken(accessToken);

  if (isLoggedIn) return <Navigate to="/me" replace state={{ from: location.pathname }} />;

  return (
    <LoginProvider>
      <AppNavbar />
      <AppSideDrawerMultiLevel />
      <LoginFormWrapper classes={classes} />
    </LoginProvider>
  );
};

export default Login;
